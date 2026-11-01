using System.Text.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using XFood.Application.Modules.Establishments.Contracts;
using XFood.Application.Modules.Establishments.Services;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Integration;

/// <summary>HU-01 persistence checks on a migrated, disposable SQL Server database.</summary>
public sealed class Hu01SqlServerTests(SqlServerApiFixture fixture) : IClassFixture<SqlServerApiFixture>
{
    private sealed record Seed(Guid UserId, Guid EstablishmentId, Guid CategoryId, Guid ListingId, Guid? DestinationId);

    private async Task<Seed> SeedAsync(int available = 2, bool destination = false)
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
        var now = DateTimeOffset.UtcNow;
        var userId = Guid.NewGuid();
        var establishmentId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var listingId = Guid.NewGuid();
        Guid? destinationId = destination ? Guid.NewGuid() : null;
        db.Users.Add(new IdentityUser<Guid> { Id = userId, UserName = userId.ToString(), NormalizedUserName = userId.ToString().ToUpperInvariant(), Email = $"{userId:N}@xfood.test", NormalizedEmail = $"{userId:N}@XFOOD.TEST" });
        db.Add(new Establishment { Id = establishmentId, Name = "Original", ContactName = "Contacto", ContactEmail = "contacto@xfood.test", ContactPhone = "809-555-0101", Address = "Calle 1", Latitude = 18.5m, Longitude = -69.9m, TimeZoneId = "America/Santo_Domingo", Status = EstablishmentStatus.Active, CreatedByUserId = userId, CreatedAtUtc = now });
        db.Add(new EstablishmentMember { Id = Guid.NewGuid(), EstablishmentId = establishmentId, UserId = userId, Role = EstablishmentMemberRole.Owner, IsPrimary = true, JoinedAtUtc = now, GrantedByUserId = userId });
        db.Add(new Category { Id = categoryId, Name = $"Prueba-{Guid.NewGuid():N}", IsActive = true, CreatedAtUtc = now });
        db.Add(NewListing(listingId));
        if (destinationId is { } otherId)
            db.Add(NewListing(otherId));
        await db.SaveChangesAsync();
        return new Seed(userId, establishmentId, categoryId, listingId, destinationId);

        Listing NewListing(Guid id) => new()
        {
            Id = id, EstablishmentId = establishmentId, CreatedByUserId = userId,
            CategoryId = categoryId, Title = "Original", Description = "Alimento apto",
            Mode = ListingMode.Sale, Status = ListingStatus.Active, InitialQuantity = available,
            AvailableQuantity = available, OriginalUnitPrice = 100, DiscountedUnitPrice = 50,
            PickupInstructions = "Recoger", PaymentInstructions = "Pago en caja",
            FoodSafetyDeclared = true, IsFoodFit = true, PickupStartsAtUtc = now.AddHours(1),
            PickupDeadlineUtc = now.AddHours(3), CreatedAtUtc = now,
        };
    }

    [SqlServerFact]
    public async Task Edits_commit_profile_and_listing_revisions_with_actor_and_snapshots()
    {
        var seed = await SeedAsync();
        using var scope = fixture.Factory.Services.CreateScope();
        var profiles = scope.ServiceProvider.GetRequiredService<IEstablishmentProfileService>();
        var listings = scope.ServiceProvider.GetRequiredService<IManageListingService>();
        var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
        var listing = await db.Set<Listing>().SingleAsync(x => x.Id == seed.ListingId);

        await profiles.UpdateAsync(seed.EstablishmentId, seed.UserId, new UpdateEstablishmentProfileRequest
        {
            Name = "Nuevo", ContactName = "Contacto", ContactEmail = "contacto@xfood.test",
            ContactPhone = "809-555-0101", Address = "Calle 2", Latitude = 18.5m, Longitude = -69.9m,
        });
        await listings.UpdateAsync(seed.ListingId, new UpdateListingRequest
        {
            CategoryId = seed.CategoryId, Title = "Nuevo", Description = "Alimento apto",
            InitialQuantity = 2, PickupInstructions = "Recoger", PickupStartsAtUtc = listing.PickupStartsAtUtc,
            PickupDeadlineUtc = listing.PickupDeadlineUtc, OriginalUnitPrice = 100,
            DiscountedUnitPrice = 50, PaymentInstructions = "Pago en caja",
        }, seed.UserId);

        var profileRevision = await db.Set<EstablishmentProfileRevision>().SingleAsync(x => x.EstablishmentId == seed.EstablishmentId);
        var listingRevision = await db.Set<ListingRevision>().SingleAsync(x => x.ListingId == seed.ListingId);
        Assert.Equal(seed.UserId, profileRevision.ActorUserId);
        Assert.Equal(seed.UserId, listingRevision.ActorUserId);
        Assert.Equal("Original", JsonDocument.Parse(profileRevision.BeforeJson).RootElement.GetProperty("Name").GetString());
        Assert.Equal("Nuevo", JsonDocument.Parse(profileRevision.AfterJson).RootElement.GetProperty("Name").GetString());
        Assert.Equal("Original", JsonDocument.Parse(listingRevision.BeforeJson).RootElement.GetProperty("Title").GetString());
        Assert.Equal("Nuevo", JsonDocument.Parse(listingRevision.AfterJson).RootElement.GetProperty("Title").GetString());
    }

    [SqlServerFact]
    public async Task Two_stale_withdrawals_cannot_both_take_the_last_unit()
    {
        var seed = await SeedAsync(available: 1);
        using var first = fixture.Factory.Services.CreateScope();
        using var second = fixture.Factory.Services.CreateScope();
        var firstDb = first.ServiceProvider.GetRequiredService<XFoodDbContext>();
        var secondDb = second.ServiceProvider.GetRequiredService<XFoodDbContext>();
        await firstDb.Set<Listing>().SingleAsync(x => x.Id == seed.ListingId);
        await secondDb.Set<Listing>().SingleAsync(x => x.Id == seed.ListingId);
        var request = new AdjustListingStockRequest { Kind = StockAdjustmentKind.Withdrawal, Quantity = 1, Reason = "Prueba de concurrencia" };
        var firstService = first.ServiceProvider.GetRequiredService<IManageListingStockService>();
        var secondService = second.ServiceProvider.GetRequiredService<IManageListingStockService>();

        async Task<Exception?> Attempt(IManageListingStockService service)
        {
            try { await service.AdjustAsync(seed.ListingId, request, seed.UserId); return null; }
            catch (Exception error) { return error; }
        }

        var results = await Task.WhenAll(Attempt(firstService), Attempt(secondService));
        Assert.Single(results, error => error is null);
        Assert.Single(results, error => error is ListingConcurrencyException or ListingInvalidOperationException);
        using var checkScope = fixture.Factory.Services.CreateScope();
        var check = checkScope.ServiceProvider.GetRequiredService<XFoodDbContext>();
        var stored = await check.Set<Listing>().SingleAsync(x => x.Id == seed.ListingId);
        Assert.Equal(0, stored.AvailableQuantity);
        Assert.Equal(ListingStatus.Exhausted, stored.Status);
        Assert.Single(await check.Set<StockAdjustment>().Where(x => x.ListingId == seed.ListingId).ToListAsync());
    }

    [SqlServerFact]
    public async Task Transfer_updates_both_balances_and_persists_one_movement()
    {
        var seed = await SeedAsync(available: 2, destination: true);
        using var scope = fixture.Factory.Services.CreateScope();
        var service = scope.ServiceProvider.GetRequiredService<IManageListingStockService>();
        var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();

        await service.TransferAsync(seed.ListingId, new TransferListingStockRequest
        {
            DestinationListingId = seed.DestinationId!.Value, Quantity = 2, Reason = "Reasignación",
        }, seed.UserId);

        var source = await db.Set<Listing>().SingleAsync(x => x.Id == seed.ListingId);
        var destination = await db.Set<Listing>().SingleAsync(x => x.Id == seed.DestinationId);
        Assert.Equal((0, 2, ListingStatus.Exhausted), (source.AvailableQuantity, source.TransferredOutQuantity, source.Status));
        Assert.Equal((4, 2), (destination.AvailableQuantity, destination.TransferredInQuantity));
        Assert.Single(await db.Set<StockTransfer>().Where(x => x.SourceListingId == source.Id).ToListAsync());
    }
}
