using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using XFood.Domain.Modules.Listings;
using XFood.Domain.Modules.Notifications;
using XFood.Infrastructure.Modules.Listings;
using XFood.Infrastructure.Modules.Notifications;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Listings;

public sealed class ListingExpiryAlertServiceTests
{
    private static readonly DateTimeOffset AsOfUtc = new(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);

    [Fact]
    public async Task DetectAsync_persists_only_active_available_listings_inside_threshold()
    {
        await using var db = CreateDbContext();
        db.AddRange(
            CreateListing(ListingStatus.Active, 60, 2, "inside"),
            CreateListing(ListingStatus.Active, 121, 2, "outside"),
            CreateListing(ListingStatus.Active, -1, 2, "expired"),
            CreateListing(ListingStatus.Active, 60, 0, "empty"),
            CreateListing(ListingStatus.Deactivated, 60, 2, "deactivated"));
        await db.SaveChangesAsync();

        var result = await Service(db).DetectAsync(AsOfUtc);

        var alert = Assert.Single(result);
        Assert.Equal("inside", (await db.Set<Listing>().SingleAsync(item => item.Id == alert.ListingId)).Title);
        Assert.Equal(2, alert.AvailableQuantitySnapshot);
        Assert.Equal(AsOfUtc.AddMinutes(60), alert.DeadlineSnapshotUtc);
    }

    [Fact]
    public async Task DetectAsync_is_idempotent_for_repeated_runs()
    {
        await using var db = CreateDbContext();
        db.Add(CreateListing(ListingStatus.Active, 60, 3, "inside"));
        await db.SaveChangesAsync();
        var service = Service(db);

        var first = await service.DetectAsync(AsOfUtc);
        var second = await service.DetectAsync(AsOfUtc.AddMinutes(10));

        Assert.Single(first);
        Assert.Empty(second);
        Assert.Single(await db.Set<ListingExpiryAlert>().ToListAsync());
    }

    [Fact]
    public async Task DetectAsync_deduplicates_by_listing_and_threshold()
    {
        await using var db = CreateDbContext();
        var listing = CreateListing(ListingStatus.Active, 60, 3, "inside");
        db.Add(listing);
        db.Add(new ListingExpiryAlert
        {
            Id = Guid.NewGuid(), ListingId = listing.Id, ThresholdMinutes = 120,
            AvailableQuantitySnapshot = 3, DeadlineSnapshotUtc = listing.PickupDeadlineUtc,
            CreatedAtUtc = AsOfUtc.AddMinutes(-1),
        });
        await db.SaveChangesAsync();

        var result = await Service(db).DetectAsync(AsOfUtc);

        Assert.Empty(result);
        Assert.Single(await db.Set<ListingExpiryAlert>().ToListAsync());
    }

    private static ListingExpiryAlertService Service(XFoodDbContext db) =>
        new(db, Options.Create(new ExpiryAlertOptions { ThresholdMinutes = 120 }));

    private static XFoodDbContext CreateDbContext() => new(new DbContextOptionsBuilder<XFoodDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);

    private static Listing CreateListing(ListingStatus status, int minutes, int available, string title)
    {
        var deadline = AsOfUtc.AddMinutes(minutes);
        return new Listing
        {
            Id = Guid.NewGuid(), EstablishmentId = Guid.NewGuid(), CreatedByUserId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(), Title = title, Description = "Descripción", Mode = ListingMode.Sale,
            Status = status, InitialQuantity = available, AvailableQuantity = available,
            OriginalUnitPrice = 100, DiscountedUnitPrice = 50, Currency = "DOP", PickupInstructions = "Recoger",
            PaymentInstructions = "Pago", FoodSafetyDeclared = true, PickupStartsAtUtc = deadline.AddHours(-1),
            PickupDeadlineUtc = deadline, CreatedAtUtc = deadline.AddHours(-2),
        };
    }
}
