using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Listings;

public sealed class CreateDonationListingServiceTests
{
    [Fact]
    public async Task CreateAsync_persists_donation_without_sale_fields_and_preserves_balance()
    {
        var userId = Guid.NewGuid();
        var establishmentId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        await using var db = CreateDbContext();
        db.Add(new Category { Id = categoryId, Name = "Alimentos" });
        await db.SaveChangesAsync();
        var onboarding = new FakeEstablishmentOnboarding(establishmentId, EstablishmentStatus.Active);
        var service = new CreateDonationListingService(db, onboarding, new FixedTimeProvider());

        var result = await service.CreateAsync(Request(establishmentId, categoryId), userId);
        var listing = await db.Set<Listing>().SingleAsync();

        Assert.Equal(result.Id, listing.Id);
        Assert.Equal(ListingMode.Donation, listing.Mode);
        Assert.Equal(ListingStatus.Active, listing.Status);
        Assert.Equal(7, listing.InitialQuantity);
        Assert.Equal(7, listing.AvailableQuantity);
        Assert.Equal(0, listing.AddedQuantity + listing.TransferredInQuantity + listing.TransferredOutQuantity + listing.AssignedQuantity + listing.FulfilledQuantity + listing.WrittenOffQuantity);
        Assert.Null(listing.OriginalUnitPrice);
        Assert.Null(listing.DiscountedUnitPrice);
        Assert.Null(listing.PaymentInstructions);
        var statusChange = await db.Set<ListingStatusChange>().SingleAsync();
        Assert.Null(statusChange.FromStatus);
        Assert.Equal(ListingStatus.Active, statusChange.ToStatus);
        Assert.Equal(userId, statusChange.ActorUserId);
        Assert.Equal(listing.CreatedAtUtc, statusChange.OccurredAtUtc);
    }

    [Fact]
    public async Task CreateAsync_rejects_missing_membership_without_persisting()
    {
        var establishmentId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        await using var db = CreateDbContext();
        db.Add(new Category { Id = categoryId, Name = "Alimentos" });
        await db.SaveChangesAsync();
        var service = new CreateDonationListingService(db, new FakeEstablishmentOnboarding(null, EstablishmentStatus.Active), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingForbiddenException>(() => service.CreateAsync(Request(establishmentId, categoryId), Guid.NewGuid()));
        Assert.Empty(await db.Set<Listing>().ToListAsync());
    }

    [Fact]
    public async Task CreateAsync_rejects_inactive_category_without_persisting()
    {
        var establishmentId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        await using var db = CreateDbContext();
        db.Add(new Category { Id = categoryId, Name = "Alimentos", IsActive = false });
        await db.SaveChangesAsync();
        var service = new CreateDonationListingService(db, new FakeEstablishmentOnboarding(establishmentId, EstablishmentStatus.Active), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingNotFoundException>(() => service.CreateAsync(Request(establishmentId, categoryId), Guid.NewGuid()));
        Assert.Empty(await db.Set<Listing>().ToListAsync());
    }

    [Fact]
    public async Task CreateAsync_rejects_missing_category_without_persisting()
    {
        var establishmentId = Guid.NewGuid();
        await using var db = CreateDbContext();
        var service = new CreateDonationListingService(db, new FakeEstablishmentOnboarding(establishmentId, EstablishmentStatus.Active), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingNotFoundException>(() => service.CreateAsync(Request(establishmentId, Guid.NewGuid()), Guid.NewGuid()));
        Assert.Empty(await db.Set<Listing>().ToListAsync());
    }

    private static CreateDonationListingRequest Request(Guid establishmentId, Guid categoryId) => new()
    {
        EstablishmentId = establishmentId,
        CategoryId = categoryId,
        Title = "Donación de alimentos",
        Description = "Lote para organización beneficiaria.",
        InitialQuantity = 7,
        PickupInstructions = "Recoger en recepción.",
        PickupStartsAtUtc = new DateTimeOffset(2026, 11, 1, 11, 0, 0, TimeSpan.Zero),
        PickupDeadlineUtc = new DateTimeOffset(2026, 11, 1, 14, 0, 0, TimeSpan.Zero),
        FoodSafetyDeclared = true,
    };

    private static XFoodDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<XFoodDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new XFoodDbContext(options);
    }
}

internal sealed class FakeEstablishmentOnboarding(Guid? establishmentId, EstablishmentStatus status) : IEstablishmentOnboarding
{
    public EstablishmentMembershipSummary StageEstablishment(NewEstablishmentProfile establishment) => throw new NotSupportedException();

    public Task<IReadOnlyList<EstablishmentMembershipSummary>> ListActiveMembershipsAsync(Guid userId, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<EstablishmentMembershipSummary>>([]);

    public Task<EstablishmentMembershipSummary?> FindActiveMembershipAsync(Guid userId, Guid requestedEstablishmentId, CancellationToken cancellationToken) =>
        Task.FromResult(establishmentId == requestedEstablishmentId
            ? new EstablishmentMembershipSummary(requestedEstablishmentId, "Establecimiento", status, EstablishmentMemberRole.Owner, true)
            : null);
}

internal sealed class FixedTimeProvider : TimeProvider
{
    private static readonly DateTimeOffset Now = new(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);

    public override DateTimeOffset GetUtcNow() => Now;
}
