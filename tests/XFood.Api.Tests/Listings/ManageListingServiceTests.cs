using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Listings;

public sealed class ManageListingServiceTests
{
    [Fact]
    public async Task UpdateAsync_changes_sale_fields_and_preserves_committed_units()
    {
        var listing = CreateListing(ListingMode.Sale);
        listing.AssignedQuantity = 2;
        listing.AvailableQuantity = 8;
        await using var db = CreateDbContext(listing, ActiveCategory());
        var service = new ManageListingService(db, new ListingOnboarding(listing.EstablishmentId), new FixedTimeProvider());
        var actor = Guid.NewGuid();

        var result = await service.UpdateAsync(listing.Id, new UpdateListingRequest
        {
            CategoryId = listing.CategoryId,
            Title = "Venta editada",
            Description = "Descripción editada",
            InitialQuantity = 6,
            PickupInstructions = "Nueva recogida",
            PickupStartsAtUtc = Utc(11),
            PickupDeadlineUtc = Utc(15),
            OriginalUnitPrice = 150,
            DiscountedUnitPrice = 90,
            PaymentInstructions = "Pago en caja",
        }, actor);

        var stored = await db.Set<Listing>().SingleAsync();
        Assert.Equal("Venta editada", result.Title);
        Assert.Equal(6, stored.InitialQuantity);
        Assert.Equal(4, stored.AvailableQuantity);
        Assert.Equal(2, stored.AssignedQuantity);
        Assert.Equal(ListingMode.Sale, stored.Mode);
        var revision = await db.Set<ListingRevision>().SingleAsync();
        Assert.Equal(actor, revision.ActorUserId);
        Assert.Equal("Original", JsonDocument.Parse(revision.BeforeJson).RootElement.GetProperty("Title").GetString());
        Assert.Equal("Venta editada", JsonDocument.Parse(revision.AfterJson).RootElement.GetProperty("Title").GetString());
    }

    [Fact]
    public async Task UpdateAsync_rejects_quantity_below_committed_units()
    {
        var listing = CreateListing(ListingMode.Sale);
        listing.AssignedQuantity = 4;
        listing.AvailableQuantity = 1;
        await using var db = CreateDbContext(listing, ActiveCategory());
        var service = new ManageListingService(db, new ListingOnboarding(listing.EstablishmentId), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingValidationException>(() => service.UpdateAsync(listing.Id, SaleRequest(listing, 3), Guid.NewGuid()));
        Assert.Equal(10, (await db.Set<Listing>().SingleAsync()).InitialQuantity);
    }

    [Fact]
    public async Task DeactivateAsync_preserves_listing_and_adds_status_history()
    {
        var listing = CreateListing(ListingMode.Donation);
        await using var db = CreateDbContext(listing, ActiveCategory());
        var actor = Guid.NewGuid();
        var service = new ManageListingService(db, new ListingOnboarding(listing.EstablishmentId), new FixedTimeProvider());

        var result = await service.DeactivateAsync(listing.Id, new DeactivateListingRequest { Reason = "No disponible" }, actor);

        var stored = await db.Set<Listing>().SingleAsync();
        var change = await db.Set<ListingStatusChange>().SingleAsync();
        Assert.Equal(ListingStatus.Deactivated, result.Status);
        Assert.Equal(ListingStatus.Deactivated, stored.Status);
        Assert.Equal(ListingStatus.Active, change.FromStatus);
        Assert.Equal(actor, change.ActorUserId);
        Assert.Equal("No disponible", change.Reason);
        Assert.Equal(10, stored.AvailableQuantity);
    }

    [Fact]
    public async Task UpdateAsync_rejects_user_without_membership()
    {
        var listing = CreateListing(ListingMode.Donation);
        await using var db = CreateDbContext(listing, ActiveCategory());
        var service = new ManageListingService(db, new ListingOnboarding(null), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingForbiddenException>(() => service.UpdateAsync(listing.Id, DonationRequest(listing), Guid.NewGuid()));
    }

    [Fact]
    public async Task AdjustAsync_increases_available_stock_and_records_history()
    {
        var listing = CreateListing(ListingMode.Sale);
        await using var db = CreateDbContext(listing, ActiveCategory());
        var actor = Guid.NewGuid();
        var service = new ManageListingStockService(db, new ListingOnboarding(listing.EstablishmentId), new FixedTimeProvider());

        await service.AdjustAsync(listing.Id, new AdjustListingStockRequest
        {
            Kind = StockAdjustmentKind.Increase,
            Quantity = 3,
            Reason = "Reposición",
        }, actor);

        var stored = await db.Set<Listing>().SingleAsync();
        var adjustment = await db.Set<StockAdjustment>().SingleAsync();
        Assert.Equal(13, stored.AvailableQuantity);
        Assert.Equal(3, stored.AddedQuantity);
        Assert.Equal(actor, adjustment.ActorUserId);
        Assert.Equal(StockAdjustmentKind.Increase, adjustment.Kind);
    }

    [Fact]
    public async Task AdjustAsync_rejects_withdrawal_above_available_quantity()
    {
        var listing = CreateListing(ListingMode.Donation);
        listing.AssignedQuantity = 4;
        listing.AvailableQuantity = 6;
        await using var db = CreateDbContext(listing, ActiveCategory());
        var service = new ManageListingStockService(db, new ListingOnboarding(listing.EstablishmentId), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingInvalidOperationException>(() => service.AdjustAsync(listing.Id, new AdjustListingStockRequest
        {
            Kind = StockAdjustmentKind.Withdrawal,
            Quantity = 7,
            Reason = "Merma",
        }, Guid.NewGuid()));
    }

    [Fact]
    public async Task AdjustAsync_records_expiry_loss_for_an_expired_listing()
    {
        var listing = CreateListing(ListingMode.Donation);
        listing.Status = ListingStatus.Expired;
        await using var db = CreateDbContext(listing, ActiveCategory());
        var service = new ManageListingStockService(db, new ListingOnboarding(listing.EstablishmentId), new FixedTimeProvider());

        await service.AdjustAsync(listing.Id, new AdjustListingStockRequest
        {
            Kind = StockAdjustmentKind.Expiry,
            Quantity = 2,
            Reason = "Vencimiento",
        }, Guid.NewGuid());

        var stored = await db.Set<Listing>().SingleAsync();
        Assert.Equal(8, stored.AvailableQuantity);
        Assert.Equal(2, stored.WrittenOffQuantity);
        Assert.Equal(StockAdjustmentKind.Expiry, (await db.Set<StockAdjustment>().SingleAsync()).Kind);
    }

    [Fact]
    public async Task TransferAsync_moves_stock_between_different_modes_without_loss()
    {
        var source = CreateListing(ListingMode.Sale);
        var destination = CreateListing(ListingMode.Donation);
        destination.EstablishmentId = source.EstablishmentId;
        await using var db = CreateDbContext(source, ActiveCategory());
        db.Add(destination);
        await db.SaveChangesAsync();
        var service = new ManageListingStockService(db, new ListingOnboarding(source.EstablishmentId), new FixedTimeProvider());

        await service.TransferAsync(source.Id, new TransferListingStockRequest
        {
            DestinationListingId = destination.Id,
            Quantity = 3,
            Reason = "Cambio de modalidad",
        }, Guid.NewGuid());

        var storedSource = await db.Set<Listing>().SingleAsync(item => item.Id == source.Id);
        var storedDestination = await db.Set<Listing>().SingleAsync(item => item.Id == destination.Id);
        var transfer = await db.Set<StockTransfer>().SingleAsync();
        Assert.Equal(7, storedSource.AvailableQuantity);
        Assert.Equal(3, storedSource.TransferredOutQuantity);
        Assert.Equal(13, storedDestination.AvailableQuantity);
        Assert.Equal(3, storedDestination.TransferredInQuantity);
        Assert.Equal(ListingMode.Sale, transfer.SourceMode);
        Assert.Equal(ListingMode.Donation, transfer.DestinationMode);
    }

    [Fact]
    public async Task TransferAsync_rejects_expired_destination()
    {
        var source = CreateListing(ListingMode.Sale);
        var destination = CreateListing(ListingMode.Donation);
        destination.EstablishmentId = source.EstablishmentId;
        destination.PickupDeadlineUtc = Utc(9);
        await using var db = CreateDbContext(source, ActiveCategory());
        db.Add(destination);
        await db.SaveChangesAsync();
        var service = new ManageListingStockService(db, new ListingOnboarding(source.EstablishmentId), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingInvalidOperationException>(() => service.TransferAsync(source.Id, new TransferListingStockRequest
        {
            DestinationListingId = destination.Id, Quantity = 1, Reason = "Traslado",
        }, Guid.NewGuid()));
    }

    [Fact]
    public async Task TransferAsync_rejects_listings_from_different_establishments_without_writing()
    {
        var source = CreateListing(ListingMode.Sale);
        var destination = CreateListing(ListingMode.Donation);
        await using var db = CreateDbContext(source, ActiveCategory());
        db.Add(destination);
        await db.SaveChangesAsync();
        var service = new ManageListingStockService(db, new ListingOnboarding(source.EstablishmentId), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingInvalidOperationException>(() => service.TransferAsync(source.Id, new TransferListingStockRequest
        {
            DestinationListingId = destination.Id,
            Quantity = 3,
            Reason = "Traslado no permitido",
        }, Guid.NewGuid()));

        var storedSource = await db.Set<Listing>().SingleAsync(item => item.Id == source.Id);
        var storedDestination = await db.Set<Listing>().SingleAsync(item => item.Id == destination.Id);
        Assert.Equal(10, storedSource.AvailableQuantity);
        Assert.Equal(0, storedSource.TransferredOutQuantity);
        Assert.Equal(10, storedDestination.AvailableQuantity);
        Assert.Equal(0, storedDestination.TransferredInQuantity);
        Assert.Empty(await db.Set<StockTransfer>().ToListAsync());
    }

    [Fact]
    public async Task ChangeFitnessAsync_updates_fitness_preserves_inventory_and_records_history()
    {
        var listing = CreateListing(ListingMode.Donation);
        listing.AssignedQuantity = 2;
        listing.AvailableQuantity = 8;
        await using var db = CreateDbContext(listing, ActiveCategory());
        var actor = Guid.NewGuid();
        var service = new ManageListingFitnessService(db, new ListingOnboarding(listing.EstablishmentId), new FixedTimeProvider());

        var result = await service.ChangeAsync(listing.Id, new ChangeListingFitnessRequest
        {
            IsFoodFit = false,
            Reason = "Producto deteriorado",
        }, actor);

        var stored = await db.Set<Listing>().SingleAsync();
        var change = await db.Set<ListingFitnessChange>().SingleAsync();
        Assert.False(result.IsFoodFit);
        Assert.False(stored.IsFoodFit);
        Assert.Equal(8, stored.AvailableQuantity);
        Assert.Equal(2, stored.AssignedQuantity);
        Assert.True(change.FromIsFoodFit);
        Assert.False(change.ToIsFoodFit);
        Assert.Equal(actor, change.ActorUserId);
        Assert.Equal("Producto deteriorado", change.Reason);
    }

    [Fact]
    public async Task ChangeFitnessAsync_rejects_without_membership_without_writing()
    {
        var listing = CreateListing(ListingMode.Sale);
        await using var db = CreateDbContext(listing, ActiveCategory());
        var service = new ManageListingFitnessService(db, new ListingOnboarding(null), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingForbiddenException>(() => service.ChangeAsync(listing.Id, new ChangeListingFitnessRequest
        {
            IsFoodFit = false,
            Reason = "No apto",
        }, Guid.NewGuid()));

        Assert.True((await db.Set<Listing>().SingleAsync()).IsFoodFit);
        Assert.Empty(await db.Set<ListingFitnessChange>().ToListAsync());
    }

    private static UpdateListingRequest SaleRequest(Listing listing, int quantity) => new()
    {
        CategoryId = listing.CategoryId, Title = "Venta", Description = "Descripción", InitialQuantity = quantity,
        PickupInstructions = "Recoger", PickupStartsAtUtc = Utc(11), PickupDeadlineUtc = Utc(15),
        OriginalUnitPrice = 100, DiscountedUnitPrice = 60, PaymentInstructions = "Pago",
    };

    private static UpdateListingRequest DonationRequest(Listing listing) => new()
    {
        CategoryId = listing.CategoryId, Title = "Donación", Description = "Descripción", InitialQuantity = 10,
        PickupInstructions = "Recoger", PickupStartsAtUtc = Utc(11), PickupDeadlineUtc = Utc(15),
    };

    private static Listing CreateListing(ListingMode mode) => new()
    {
        Id = Guid.NewGuid(), EstablishmentId = Guid.NewGuid(), CreatedByUserId = Guid.NewGuid(), CategoryId = Guid.NewGuid(),
        Title = "Original", Description = "Descripción", Mode = mode, Status = ListingStatus.Active, InitialQuantity = 10,
        AvailableQuantity = 10, OriginalUnitPrice = mode == ListingMode.Sale ? 100 : null,
        DiscountedUnitPrice = mode == ListingMode.Sale ? 60 : null, Currency = "DOP", PickupInstructions = "Recoger",
        PaymentInstructions = mode == ListingMode.Sale ? "Pago" : null, FoodSafetyDeclared = true,
        PickupStartsAtUtc = Utc(11), PickupDeadlineUtc = Utc(15), CreatedAtUtc = Utc(10),
    };

    private static Category ActiveCategory() => new() { Id = Guid.NewGuid(), Name = "Categoría", IsActive = true };

    private static XFoodDbContext CreateDbContext(Listing listing, Category category)
    {
        listing.CategoryId = category.Id;
        var db = new XFoodDbContext(new DbContextOptionsBuilder<XFoodDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
        db.AddRange(listing, category);
        db.SaveChanges();
        return db;
    }

    private static DateTimeOffset Utc(int hour) => new(2026, 11, 1, hour, 0, 0, TimeSpan.Zero);
}

internal sealed class ListingOnboarding(Guid? establishmentId) : IEstablishmentOnboarding
{
    public EstablishmentMembershipSummary StageEstablishment(NewEstablishmentProfile establishment) => throw new NotSupportedException();
    public Task<IReadOnlyList<EstablishmentMembershipSummary>> ListActiveMembershipsAsync(Guid userId, CancellationToken cancellationToken) => Task.FromResult<IReadOnlyList<EstablishmentMembershipSummary>>([]);
    public Task<EstablishmentMembershipSummary?> FindActiveMembershipAsync(Guid userId, Guid requestedEstablishmentId, CancellationToken cancellationToken) =>
        Task.FromResult(establishmentId == requestedEstablishmentId ? new EstablishmentMembershipSummary(requestedEstablishmentId, "Local", EstablishmentStatus.Active, EstablishmentMemberRole.Owner, true) : null);
}
