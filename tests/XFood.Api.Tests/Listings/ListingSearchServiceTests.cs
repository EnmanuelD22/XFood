using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Modules.Listings;
using XFood.Infrastructure.Persistence;
using static XFood.Api.Tests.Listings.ListingSearchTestData;

namespace XFood.Api.Tests.Listings;

public sealed class ListingSearchServiceTests
{
    private const decimal OriginLat = 18.4861m, OriginLon = -69.9312m;
    private static readonly DateTimeOffset Now = new(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);
    private static readonly Guid OwnerId = Guid.NewGuid();

    private readonly XFoodDbContext db = new(new DbContextOptionsBuilder<XFoodDbContext>()
        .UseInMemoryDatabase(Guid.NewGuid().ToString()).Options);
    private readonly Category category = Category("Panadería");

    public ListingSearchServiceTests() => db.Add(category);

    [Fact]
    public async Task Point_search_keeps_only_listings_inside_the_default_radius_ordered_by_distance()
    {
        var far = await SeedSaleAtAsync(3.05m, "fuera");
        var edge = await SeedSaleAtAsync(2.95m, "borde");
        var near = await SeedSaleAtAsync(0.5m, "cerca");

        var result = await Service().SearchAsync(new ListingSearchCriteria(OriginLat, OriginLon, null, Now));

        Assert.Equal([near.Id, edge.Id], result.Select(listing => listing.Id));
        Assert.Equal([0.5m, 2.95m], result.Select(listing => listing.DistanceKm!.Value));
        Assert.DoesNotContain(result, listing => listing.Id == far.Id);
    }

    [Theory]
    [InlineData(1, 1)]
    [InlineData(3, 2)]
    [InlineData(5, 3)]
    [InlineData(10, 4)]
    public async Task Each_allowed_radius_returns_only_listings_within_it(int radiusKm, int expected)
    {
        foreach (var km in new[] { 0.9m, 2.9m, 4.9m, 9.9m, 10.1m })
            await SeedSaleAtAsync(km, $"a {km} km");

        var result = await Service().SearchAsync(new ListingSearchCriteria(OriginLat, OriginLon, radiusKm, Now));

        Assert.Equal(expected, result.Count);
        Assert.All(result, listing => Assert.True(listing.DistanceKm <= radiusKm));
    }

    [Fact]
    public async Task Search_and_detail_apply_the_same_availability_rules()
    {
        var establishment = Add(Establishment(OwnerId, NorthOf(OriginLat, OriginLon, 0.2m), "Abierto"));
        var suspended = Add(Establishment(OwnerId, NorthOf(OriginLat, OriginLon, 0.3m), "Suspendido", EstablishmentStatus.Suspended));
        var inactive = Add(Establishment(OwnerId, NorthOf(OriginLat, OriginLon, 0.4m), "Inactivo", EstablishmentStatus.Inactive));
        var available = Add(Sale(establishment, category.Id, "disponible", Now.AddHours(2)));
        Listing[] hidden =
        [
            Add(Donation(establishment, category.Id, "donación", Now.AddHours(2))),
            Add(Sale(establishment, category.Id, "no apta", Now.AddHours(2), isFoodFit: false)),
            Add(Sale(establishment, category.Id, "agotada", Now.AddHours(2), ListingStatus.Exhausted, available: 0)),
            Add(Sale(establishment, category.Id, "desactivada", Now.AddHours(2), ListingStatus.Deactivated)),
            Add(Sale(establishment, category.Id, "vencida con estado activo", Now.AddMinutes(-1))),
            Add(Sale(establishment, category.Id, "vence ahora", Now)),
            Add(Sale(suspended, category.Id, "local suspendido", Now.AddHours(2))),
            Add(Sale(inactive, category.Id, "local inactivo", Now.AddHours(2))),
        ];
        await db.SaveChangesAsync();
        var service = Service();

        var nearby = await service.SearchAsync(new ListingSearchCriteria(OriginLat, OriginLon, 1m, Now));
        var everywhere = await service.SearchAsync(new ListingSearchCriteria(null, null, null, Now));

        Assert.Equal(available.Id, Assert.Single(nearby).Id);
        Assert.Equal(available.Id, Assert.Single(everywhere).Id);
        Assert.NotNull(await service.FindAvailableAsync(available.Id, null, null, Now));
        foreach (var listing in hidden)
            Assert.Null(await service.FindAvailableAsync(listing.Id, null, null, Now));
    }

    [Fact]
    public async Task Results_carry_public_establishment_and_category_data()
    {
        var listing = await SeedSaleAtAsync(1.5m, "con datos");

        var result = Assert.Single(await Service().SearchAsync(new ListingSearchCriteria(null, null, null, Now)));

        Assert.Equal(listing.Id, result.Id);
        Assert.Equal("Panadería", result.CategoryName);
        Assert.Equal((200m, 120m, "DOP", 2), (result.OriginalUnitPrice, result.DiscountedUnitPrice, result.Currency, result.AvailableQuantity));
        Assert.Equal(listing.EstablishmentId, result.Establishment.Id);
        Assert.Equal("Dirección de con datos", result.Establishment.Address);
        Assert.Equal("America/Santo_Domingo", result.Establishment.TimeZoneId);
        Assert.Equal(NorthOf(OriginLat, OriginLon, 1.5m), (result.Establishment.Latitude, result.Establishment.Longitude));
        Assert.Null(result.DistanceKm);
    }

    [Fact]
    public async Task Search_without_a_point_keeps_the_current_deadline_order()
    {
        var later = Add(Sale(Add(Establishment(OwnerId, (18m, -70m), "B")), category.Id, "después", Now.AddHours(5)));
        var sooner = Add(Sale(Add(Establishment(OwnerId, (19m, -71m), "A")), category.Id, "antes", Now.AddHours(1)));
        await db.SaveChangesAsync();

        var result = await Service().SearchAsync(new ListingSearchCriteria(null, null, null, Now));

        Assert.Equal([sooner.Id, later.Id], result.Select(listing => listing.Id));
    }

    [Fact]
    public async Task Max_results_limits_both_search_modes()
    {
        for (var i = 1; i <= 3; i++)
            await SeedSaleAtAsync(0.1m * i, $"oferta {i}");
        var service = Service(maxResults: 2);

        Assert.Equal(2, (await service.SearchAsync(new ListingSearchCriteria(null, null, null, Now))).Count);
        var nearest = await service.SearchAsync(new ListingSearchCriteria(OriginLat, OriginLon, 1m, Now));
        Assert.Equal([0.1m, 0.2m], nearest.Select(listing => listing.DistanceKm!.Value));
    }

    [Fact]
    public async Task Detail_with_a_point_includes_the_distance()
    {
        var listing = await SeedSaleAtAsync(4.2m, "detalle");

        var result = await Service().FindAvailableAsync(listing.Id, OriginLat, OriginLon, Now);

        Assert.Equal(4.2m, result!.DistanceKm);
    }

    [Fact]
    public async Task Invalid_input_is_rejected_before_querying()
    {
        var service = Service();

        var search = await Assert.ThrowsAsync<ListingValidationException>(() =>
            service.SearchAsync(new ListingSearchCriteria(OriginLat, OriginLon, 2m, Now)));
        var detail = await Assert.ThrowsAsync<ListingValidationException>(() =>
            service.FindAvailableAsync(Guid.NewGuid(), OriginLat, null, Now));

        Assert.Contains("radiusKm", search.Errors.Keys);
        Assert.Contains("longitude", detail.Errors.Keys);
    }

    [Fact]
    public void Options_expose_the_configured_values()
    {
        var options = Service().GetOptions();

        Assert.Equal([1m, 3m, 5m, 10m], options.RadiiKm);
        Assert.Equal((3m, 100), (options.DefaultRadiusKm, options.MaxResults));
    }

    private ListingSearchService Service(int maxResults = 100) => new(db, Options.Create(new ListingSearchOptions
    {
        AllowedRadiiKm = [1m, 3m, 5m, 10m],
        DefaultRadiusKm = 3m,
        MaxResults = maxResults,
    }));

    private async Task<Listing> SeedSaleAtAsync(decimal km, string name)
    {
        var listing = Add(Sale(Add(Establishment(OwnerId, NorthOf(OriginLat, OriginLon, km), name)), category.Id, name, Now.AddHours(2)));
        await db.SaveChangesAsync();
        return listing;
    }

    private T Add<T>(T entity) where T : class
    {
        db.Add(entity);
        return entity;
    }
}
