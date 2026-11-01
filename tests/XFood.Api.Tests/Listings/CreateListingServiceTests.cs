using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Listings;

public sealed class CreateListingServiceTests
{
    [Fact]
    public async Task CreateAsync_persists_sale_and_initial_status_event()
    {
        var establishmentId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext();
        db.Add(new Category { Id = categoryId, Name = "Alimentos", IsActive = true });
        await db.SaveChangesAsync();
        var service = new CreateListingService(db, new FakeEstablishmentOnboarding(establishmentId, EstablishmentStatus.Active), new FixedTimeProvider());

        var result = await service.CreateAsync(Request(establishmentId, categoryId), userId);
        var listing = await db.Set<Listing>().SingleAsync();
        var statusChange = await db.Set<ListingStatusChange>().SingleAsync();

        Assert.Equal(ListingMode.Sale, listing.Mode);
        Assert.Equal(120m, listing.OriginalUnitPrice);
        Assert.Equal(70m, listing.DiscountedUnitPrice);
        Assert.Equal(5, listing.InitialQuantity);
        Assert.Equal(5, listing.AvailableQuantity);
        Assert.Equal(ListingStatus.Active, statusChange.ToStatus);
        Assert.Null(statusChange.FromStatus);
        Assert.Equal(userId, statusChange.ActorUserId);
        Assert.Equal(result.Id, listing.Id);
    }

    [Fact]
    public async Task CreateAsync_rejects_inactive_category_without_writing()
    {
        var establishmentId = Guid.NewGuid();
        var categoryId = Guid.NewGuid();
        await using var db = CreateDbContext();
        db.Add(new Category { Id = categoryId, Name = "Inactiva", IsActive = false });
        await db.SaveChangesAsync();
        var service = new CreateListingService(db, new FakeEstablishmentOnboarding(establishmentId, EstablishmentStatus.Active), new FixedTimeProvider());

        await Assert.ThrowsAsync<ListingNotFoundException>(() => service.CreateAsync(Request(establishmentId, categoryId), Guid.NewGuid()));

        Assert.Empty(await db.Set<Listing>().ToListAsync());
    }

    private static CreateListingRequest Request(Guid establishmentId, Guid categoryId) => new()
    {
        EstablishmentId = establishmentId,
        CategoryId = categoryId,
        Title = "Venta de excedentes",
        Description = "Lote de alimentos del día.",
        InitialQuantity = 5,
        PickupInstructions = "Retirar en caja.",
        PickupStartsAtUtc = new DateTimeOffset(2026, 11, 1, 11, 0, 0, TimeSpan.Zero),
        PickupDeadlineUtc = new DateTimeOffset(2026, 11, 1, 14, 0, 0, TimeSpan.Zero),
        OriginalUnitPrice = 120m,
        DiscountedUnitPrice = 70m,
        PaymentInstructions = "Pagar al retirar.",
        FoodSafetyDeclared = true,
    };

    private static XFoodDbContext CreateDbContext() => new(new DbContextOptionsBuilder<XFoodDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
}
