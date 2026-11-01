using Microsoft.EntityFrameworkCore;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Listings;

public sealed class ActiveListingsQueryServiceTests
{
    [Fact]
    public async Task GetActiveAsync_returns_only_active_listings_with_future_deadline()
    {
        var asOfUtc = new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);
        await using var db = CreateDbContext();
        db.AddRange(
            CreateListing(ListingStatus.Active, asOfUtc.AddHours(2), "future"),
            CreateListing(ListingStatus.Exhausted, asOfUtc.AddHours(3), "exhausted"),
            CreateListing(ListingStatus.Deactivated, asOfUtc.AddHours(4), "deactivated"),
            CreateListing(ListingStatus.Expired, asOfUtc.AddHours(5), "expired-status"),
            CreateListing(ListingStatus.Active, asOfUtc, "deadline"),
            CreateListing(ListingStatus.Active, asOfUtc.AddHours(-1), "past"));
        await db.SaveChangesAsync();

        var service = new ActiveListingsQueryService(db);
        var result = await service.GetActiveAsync(ListingMode.Sale, asOfUtc);

        var listing = Assert.Single(result);
        Assert.Equal("future", listing.Title);
        Assert.Equal(ListingStatus.Active, listing.Status);
    }

    [Fact]
    public async Task GetActiveAsync_excludes_unfit_listings()
    {
        var asOfUtc = new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);
        await using var db = CreateDbContext();
        db.AddRange(
            CreateListing(ListingStatus.Active, asOfUtc.AddHours(1), "fit"),
            CreateListing(ListingStatus.Active, asOfUtc.AddHours(2), "unfit", isFoodFit: false));
        await db.SaveChangesAsync();

        var result = await new ActiveListingsQueryService(db).GetActiveAsync(ListingMode.Sale, asOfUtc);

        Assert.Equal("fit", Assert.Single(result).Title);
    }

    [Fact]
    public async Task GetActiveAsync_orders_by_deadline_then_id()
    {
        var asOfUtc = new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);
        await using var db = CreateDbContext();
        var later = CreateListing(ListingStatus.Active, asOfUtc.AddHours(3), "later");
        var earlier = CreateListing(ListingStatus.Active, asOfUtc.AddHours(1), "earlier");
        db.AddRange(later, earlier);
        await db.SaveChangesAsync();

        var service = new ActiveListingsQueryService(db);
        var result = await service.GetActiveAsync(ListingMode.Sale, asOfUtc);

        Assert.Equal(["earlier", "later"], result.Select(listing => listing.Title));
    }

    private static XFoodDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<XFoodDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new XFoodDbContext(options);
    }

    private static Listing CreateListing(
        ListingStatus status,
        DateTimeOffset deadline,
        string title,
        int available = 1,
        bool isFoodFit = true,
        ListingMode mode = ListingMode.Sale) => new()
    {
        Id = Guid.NewGuid(),
        EstablishmentId = Guid.NewGuid(),
        CreatedByUserId = Guid.NewGuid(),
        CategoryId = Guid.NewGuid(),
        Title = title,
        Description = "Descripción",
        Mode = mode,
        Status = status,
        InitialQuantity = available,
        AvailableQuantity = status == ListingStatus.Exhausted ? 0 : available,
        OriginalUnitPrice = 100m,
        DiscountedUnitPrice = 50m,
        Currency = "DOP",
        PickupInstructions = "Recoger aquí",
        PaymentInstructions = mode == ListingMode.Sale ? "Pagar aquí" : null,
        FoodSafetyDeclared = true,
        IsFoodFit = isFoodFit,
        PickupStartsAtUtc = deadline.AddHours(-1),
        PickupDeadlineUtc = deadline,
        CreatedAtUtc = deadline.AddHours(-2),
    };
}
