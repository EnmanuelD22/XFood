using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Listings;

namespace XFood.Api.Tests.Listings;

public sealed class ListingApiTests : IClassFixture<ListingApiTests.Factory>
{
    public sealed class Factory : WebApplicationFactory<Program>
    {
        internal FakeActiveListingsQueryService Query { get; } = new();
        internal FakeListingSearchService Search { get; } = new();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:XFood", "Server=unused.invalid;Database=Unused");
            builder.UseSetting("Cors:PanelOrigins:0", "https://panel.xfood.test");
            builder.UseSetting("Security:ApiOrigins:0", "https://api.xfood.test");
            builder.ConfigureTestServices(services =>
            {
                services.AddSingleton<IActiveListingsQueryService>(Query);
                services.AddSingleton<IListingSearchService>(Search);
            });
        }
    }

    private readonly Factory factory;
    private readonly HttpClient client;

    public ListingApiTests(Factory factory)
    {
        this.factory = factory;
        client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = false,
        });
    }

    [Fact]
    public async Task Get_active_listings_returns_service_response_and_passes_as_of_utc()
    {
        var asOfUtc = new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);
        var expected = new ListingSummaryResponse
        {
            Id = Guid.NewGuid(),
            EstablishmentId = Guid.NewGuid(),
            CategoryId = Guid.NewGuid(),
            Title = "Publicación vigente",
            Description = "Descripción",
            Mode = ListingMode.Sale,
            Status = ListingStatus.Active,
            InitialQuantity = 4,
            AvailableQuantity = 4,
            OriginalUnitPrice = 100m,
            DiscountedUnitPrice = 60m,
            Currency = "DOP",
            PickupInstructions = "Recoger aquí",
            PaymentInstructions = "Pagar aquí",
            FoodSafetyDeclared = true,
            IsFoodFit = true,
            PickupStartsAtUtc = asOfUtc.AddHours(1),
            PickupDeadlineUtc = asOfUtc.AddHours(3),
            CreatedAtUtc = asOfUtc.AddMinutes(-10),
        };
        factory.Search.SetListings([expected]);

        var response = await client.GetAsync($"/api/v1/listings?asOfUtc={Uri.EscapeDataString(asOfUtc.ToString("O"))}");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var listings = await response.Content.ReadFromJsonAsync<List<ListingResponse>>();
        var listing = Assert.Single(listings!);
        Assert.Equal(expected.Id, listing.Id);
        Assert.Equal(expected.Title, listing.Title);
        Assert.True(factory.Search.LastCriteria!.AsOfUtc >= asOfUtc);
        Assert.Null(factory.Search.LastCriteria.Latitude);
    }

    [Fact]
    public async Task Get_active_listings_without_as_of_uses_utc_time_provider()
    {
        factory.Search.SetListings([]);

        var response = await client.GetAsync("/api/v1/listings");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.NotEqual(default, factory.Search.LastCriteria!.AsOfUtc);
        Assert.Equal(TimeSpan.Zero, factory.Search.LastCriteria.AsOfUtc.Offset);
    }

    [Fact]
    public async Task Get_active_listings_rejects_non_utc_as_of()
    {
        factory.Search.SetListings([]);

        var response = await client.GetAsync("/api/v1/listings?asOfUtc=2026-11-01T10:00:00-04:00");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>();
        Assert.Equal("VALIDATION_ERROR", error!.Code);
        Assert.Contains("asOfUtc", error.Errors!.Keys);
        Assert.Null(factory.Search.LastCriteria);
    }

    [Fact]
    public async Task Create_donation_without_a_session_returns_401()
    {
        var response = await client.PostAsJsonAsync("/api/v1/listings/donations", new { });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Establishment_list_without_a_session_returns_401()
    {
        var response = await client.GetAsync($"/api/v1/establishments/{Guid.NewGuid()}/listings");
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Create_sale_without_a_session_returns_401()
    {
        var response = await client.PostAsJsonAsync("/api/v1/listings", new { });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Update_listing_without_a_session_returns_401()
    {
        var response = await client.PatchAsJsonAsync($"/api/v1/listings/{Guid.NewGuid()}", new { });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Deactivate_listing_without_a_session_returns_401()
    {
        var response = await client.PostAsJsonAsync($"/api/v1/listings/{Guid.NewGuid()}/deactivate", new { reason = "Motivo" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Adjust_listing_without_a_session_returns_401()
    {
        var response = await client.PostAsJsonAsync($"/api/v1/listings/{Guid.NewGuid()}/stock-adjustments", new { kind = 1, quantity = 1, reason = "Reposición" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Transfer_listing_without_a_session_returns_401()
    {
        var response = await client.PostAsJsonAsync($"/api/v1/listings/{Guid.NewGuid()}/stock-transfers", new { destinationListingId = Guid.NewGuid(), quantity = 1, reason = "Traslado" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Change_listing_fitness_without_a_session_returns_401()
    {
        var response = await client.PostAsJsonAsync($"/api/v1/listings/{Guid.NewGuid()}/fitness", new { isFoodFit = false, reason = "No apto" });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }
}

internal sealed class FakeActiveListingsQueryService : IActiveListingsQueryService
{
    private IReadOnlyList<ListingResponse> listings = [];

    public DateTimeOffset? LastAsOfUtc { get; private set; }
    public ListingMode? LastMode { get; private set; }

    public void SetListings(IReadOnlyList<ListingResponse> values)
    {
        listings = values;
        LastAsOfUtc = null;
        LastMode = null;
    }

    public Task<IReadOnlyList<ListingResponse>> GetActiveAsync(
        ListingMode mode,
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default)
    {
        LastAsOfUtc = asOfUtc;
        LastMode = mode;
        return Task.FromResult(listings);
    }
}

internal sealed class FakeListingSearchService : IListingSearchService
{
    private IReadOnlyList<ListingSummaryResponse> listings = [];

    public ListingSearchCriteria? LastCriteria { get; private set; }
    public (Guid ListingId, decimal? Latitude, decimal? Longitude, DateTimeOffset AsOfUtc)? LastDetail { get; private set; }

    public void SetListings(IReadOnlyList<ListingSummaryResponse> values)
    {
        listings = values;
        LastCriteria = null;
        LastDetail = null;
    }

    public Task<ListingSearchPage> SearchAsync(
        ListingSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        LastCriteria = criteria;
        return Task.FromResult(new ListingSearchPage(listings, criteria.Page ?? 1, criteria.PageSize ?? 20, false));
    }

    public Task<ListingSummaryResponse?> FindAvailableAsync(
        Guid listingId,
        decimal? latitude,
        decimal? longitude,
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default)
    {
        LastDetail = (listingId, latitude, longitude, asOfUtc);
        return Task.FromResult(listings.FirstOrDefault(listing => listing.Id == listingId));
    }

    public ListingSearchOptionsResponse GetOptions() => new([1m, 3m, 5m, 10m], 3m, 100, 20);
}
