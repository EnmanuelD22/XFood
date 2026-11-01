using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using XFood.Api.Http;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;

namespace XFood.Api.Tests.Listings;

/// <summary>HTTP contract of the HU-02 search: public routes, parameter binding, 404 detail and OpenAPI.</summary>
public sealed class ListingSearchApiTests : IClassFixture<ListingSearchApiTests.Factory>
{
    public sealed class Factory : WebApplicationFactory<Program>
    {
        internal FakeListingSearchService Search { get; } = new();

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            Configure(builder, "Testing");
            builder.ConfigureTestServices(services => services.AddSingleton<IListingSearchService>(Search));
        }
    }

    private readonly Factory factory;
    private readonly HttpClient client;

    public ListingSearchApiTests(Factory factory)
    {
        this.factory = factory;
        client = CreateClient(factory);
    }

    [Fact]
    public async Task Search_is_public_and_passes_point_and_radius_to_the_server_search()
    {
        factory.Search.SetListings([]);

        var response = await client.GetAsync("/api/v1/listings?latitude=18.4861&longitude=-69.9312&radiusKm=5");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var criteria = factory.Search.LastCriteria!;
        Assert.Equal((18.4861m, -69.9312m, 5m), (criteria.Latitude, criteria.Longitude, criteria.RadiusKm));
        Assert.Equal(TimeSpan.Zero, criteria.AsOfUtc.Offset);
    }

    [Fact]
    public async Task Search_rejects_non_numeric_coordinates()
    {
        factory.Search.SetListings([]);

        var response = await client.GetAsync("/api/v1/listings?latitude=norte&longitude=-69.9");

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Null(factory.Search.LastCriteria);
    }

    [Fact]
    public async Task Search_returns_establishment_and_distance_without_private_contact_data()
    {
        var listing = new ListingSummaryResponse
        {
            Id = Guid.NewGuid(),
            Title = "Pan del día",
            CategoryName = "Panadería",
            DistanceKm = 1.25m,
            Establishment = new ListingEstablishmentSummary { Id = Guid.NewGuid(), Name = "Panadería Sol", Address = "Calle 1", Latitude = 18.5m, Longitude = -69.9m, TimeZoneId = "America/Santo_Domingo" },
        };
        factory.Search.SetListings([listing]);

        var json = await client.GetStringAsync("/api/v1/listings?latitude=18.5&longitude=-69.9");

        var item = JsonDocument.Parse(json).RootElement[0];
        Assert.Equal(1.25m, item.GetProperty("distanceKm").GetDecimal());
        Assert.Equal("Panadería Sol", item.GetProperty("establishment").GetProperty("name").GetString());
        Assert.Equal("America/Santo_Domingo", item.GetProperty("establishment").GetProperty("timeZoneId").GetString());
        Assert.DoesNotContain("contactEmail", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("contactPhone", json, StringComparison.OrdinalIgnoreCase);
        Assert.DoesNotContain("createdByUserId", json, StringComparison.OrdinalIgnoreCase);
    }

    [Fact]
    public void Search_response_keeps_every_field_of_the_previous_listing_response()
    {
        var current = typeof(ListingSummaryResponse).GetProperties().Select(property => property.Name).ToHashSet();

        Assert.All(typeof(ListingResponse).GetProperties(), property => Assert.Contains(property.Name, current));
    }

    [Fact]
    public async Task Detail_is_public_and_evaluated_with_the_server_clock()
    {
        var listing = new ListingSummaryResponse { Id = Guid.NewGuid(), Title = "Detalle" };
        factory.Search.SetListings([listing]);
        var before = DateTimeOffset.UtcNow;

        var response = await client.GetAsync($"/api/v1/listings/{listing.Id}?latitude=18.5&longitude=-69.9");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("Detalle", (await response.Content.ReadFromJsonAsync<ListingSummaryResponse>())!.Title);
        var detail = factory.Search.LastDetail!.Value;
        Assert.Equal((listing.Id, 18.5m, -69.9m), (detail.ListingId, detail.Latitude, detail.Longitude));
        Assert.InRange(detail.AsOfUtc, before, DateTimeOffset.UtcNow);
    }

    [Fact]
    public async Task Detail_of_an_unavailable_listing_returns_404()
    {
        factory.Search.SetListings([]);

        var response = await client.GetAsync($"/api/v1/listings/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        Assert.Equal("NOT_FOUND", (await response.Content.ReadFromJsonAsync<ApiError>())!.Code);
    }

    [Fact]
    public async Task Search_options_come_from_configuration()
    {
        await using var real = new WebApplicationFactory<Program>().WithWebHostBuilder(builder => Configure(builder, "Testing"));

        var options = await CreateClient(real).GetFromJsonAsync<ListingSearchOptionsResponse>("/api/v1/listings/search-options");

        Assert.Equal([1m, 3m, 5m, 10m], options!.RadiiKm);
        Assert.Equal((3m, 100), (options.DefaultRadiusKm, options.MaxResults));
    }

    [Fact]
    public void Startup_fails_when_the_default_radius_is_not_allowed()
    {
        using var invalid = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            Configure(builder, "Testing");
            builder.UseSetting("Listings:Search:DefaultRadiusKm", "2");
        });

        Assert.Throws<OptionsValidationException>(() => invalid.CreateClient());
    }

    [Fact]
    public async Task OpenApi_documents_the_search_parameters_radii_and_detail_route()
    {
        await using var development = new WebApplicationFactory<Program>().WithWebHostBuilder(builder => Configure(builder, "Development"));

        var document = JsonDocument.Parse(await CreateClient(development).GetStringAsync("/openapi/v1.json")).RootElement;

        var paths = document.GetProperty("paths");
        var parameters = paths.GetProperty("/api/v1/listings").GetProperty("get").GetProperty("parameters").EnumerateArray()
            .ToDictionary(parameter => parameter.GetProperty("name").GetString()!);
        Assert.Contains("latitude", parameters.Keys);
        Assert.Contains("longitude", parameters.Keys);
        var radius = parameters["radiusKm"].GetProperty("schema");
        Assert.Equal([1m, 3m, 5m, 10m], radius.GetProperty("enum").EnumerateArray().Select(value => value.GetDecimal()));
        Assert.Equal(3m, radius.GetProperty("default").GetDecimal());
        Assert.True(paths.TryGetProperty("/api/v1/listings/{listingId}", out var detail));
        Assert.True(detail.TryGetProperty("get", out _));
        Assert.True(paths.TryGetProperty("/api/v1/listings/search-options", out _));
    }

    private static void Configure(IWebHostBuilder builder, string environment)
    {
        builder.UseEnvironment(environment);
        builder.UseSetting("ConnectionStrings:XFood", "Server=unused.invalid;Database=Unused");
        builder.UseSetting("Cors:PanelOrigins:0", "https://panel.xfood.test");
        builder.UseSetting("Security:ApiOrigins:0", "https://api.xfood.test");
    }

    private static HttpClient CreateClient(WebApplicationFactory<Program> factory) =>
        factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = false,
        });
}
