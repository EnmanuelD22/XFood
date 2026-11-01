using System.Net;
using static System.FormattableString;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using XFood.Api.Http;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;
using static XFood.Api.Tests.Listings.ListingSearchTestData;

namespace XFood.Api.Tests.Integration;

/// <summary>
/// HU-02 search over HTTP against a migrated, disposable SQL Server database. Each test works around its own
/// origin, far enough from the others (&gt; 30 km) that point searches never see another test's data.
/// </summary>
public sealed class Hu02SqlServerTests(SqlServerApiFixture fixture) : IClassFixture<SqlServerApiFixture>
{
    private HttpClient Client => fixture.Factory.CreateClient(new WebApplicationFactoryClientOptions
    {
        BaseAddress = new Uri("https://localhost"),
        HandleCookies = false,
    });

    [SqlServerFact]
    public async Task Each_radius_returns_exactly_the_enabled_establishments_inside_it_by_distance()
    {
        const decimal lat = 18.4861m, lon = -69.9312m; // Santo Domingo
        var owner = await SeedOwnerAsync();
        var category = await AddAsync(Category($"HU02-{Guid.NewGuid():N}"));
        var distances = new[] { 0.5m, 0.95m, 1.05m, 2.95m, 3.05m, 4.95m, 5.05m, 9.95m, 10.05m };
        var expected = new List<(decimal Km, Guid Id)>();
        foreach (var km in distances)
        {
            var establishment = await AddAsync(Establishment(owner, NorthOf(lat, lon, km), $"Local {km}"));
            expected.Add((km, (await AddAsync(Sale(establishment, category.Id, $"A {km} km", DateTimeOffset.UtcNow.AddHours(4)))).Id));
        }
        var suspended = await AddAsync(Establishment(owner, NorthOf(lat, lon, 0.3m), "Suspendido", EstablishmentStatus.Suspended));
        var inactive = await AddAsync(Establishment(owner, NorthOf(lat, lon, 0.4m), "Inactivo", EstablishmentStatus.Inactive));
        await AddAsync(Sale(suspended, category.Id, "Local suspendido", DateTimeOffset.UtcNow.AddHours(4)));
        await AddAsync(Sale(inactive, category.Id, "Local inactivo", DateTimeOffset.UtcNow.AddHours(4)));

        foreach (var radius in new[] { 1m, 3m, 5m, 10m })
        {
            var result = await SearchAsync(Invariant($"latitude={lat}&longitude={lon}&radiusKm={radius}"));

            Assert.Equal(expected.Where(x => x.Km <= radius).Select(x => x.Id), result.Select(x => x.Id));
            Assert.Equal(expected.Where(x => x.Km <= radius).Select(x => x.Km), result.Select(x => x.DistanceKm!.Value));
        }

        var byDefault = await SearchAsync(Invariant($"latitude={lat}&longitude={lon}"));
        Assert.Equal(expected.Where(x => x.Km <= 3m).Select(x => x.Id), byDefault.Select(x => x.Id));
    }

    [SqlServerFact]
    public async Task List_and_detail_hide_unavailable_sales_using_the_server_clock()
    {
        const decimal lat = 19.4517m, lon = -70.6970m; // Santiago
        var owner = await SeedOwnerAsync();
        var category = await AddAsync(Category($"HU02-{Guid.NewGuid():N}"));
        var open = await AddAsync(Establishment(owner, NorthOf(lat, lon, 0.2m), "Colmado Abierto"));
        var suspended = await AddAsync(Establishment(owner, NorthOf(lat, lon, 0.3m), "Suspendido", EstablishmentStatus.Suspended));
        var now = DateTimeOffset.UtcNow;
        var available = await AddAsync(Sale(open, category.Id, "Disponible", now.AddHours(3)));
        var hidden = new[]
        {
            await AddAsync(Donation(open, category.Id, "Donación", now.AddHours(3))),
            await AddAsync(Sale(open, category.Id, "No apta", now.AddHours(3), isFoodFit: false)),
            await AddAsync(Sale(open, category.Id, "Agotada", now.AddHours(3), ListingStatus.Exhausted, available: 0)),
            await AddAsync(Sale(open, category.Id, "Desactivada", now.AddHours(3), ListingStatus.Deactivated)),
            // Deadline passed but nothing has updated the stored status yet.
            await AddAsync(Sale(open, category.Id, "Vencida aún Active", now.AddSeconds(-30))),
            await AddAsync(Sale(suspended, category.Id, "De local suspendido", now.AddHours(3))),
        };

        var nearby = await SearchAsync(Invariant($"latitude={lat}&longitude={lon}&radiusKm=1"));
        var everywhere = await SearchAsync(string.Empty);

        Assert.Equal(available.Id, Assert.Single(nearby).Id);
        Assert.Contains(everywhere, listing => listing.Id == available.Id);
        Assert.DoesNotContain(everywhere, listing => hidden.Any(h => h.Id == listing.Id));

        var detail = await Client.GetFromJsonAsync<ListingSummaryResponse>(Invariant($"/api/v1/listings/{available.Id}?latitude={lat}&longitude={lon}"));
        Assert.Equal(("Colmado Abierto", "Dirección de Colmado Abierto", "America/Santo_Domingo"),
            (detail!.Establishment.Name, detail.Establishment.Address, detail.Establishment.TimeZoneId));
        Assert.Equal((200m, 120m, 2, 0.2m), (detail.OriginalUnitPrice, detail.DiscountedUnitPrice, detail.AvailableQuantity, detail.DistanceKm));
        Assert.Equal(available.PickupDeadlineUtc, detail.PickupDeadlineUtc, TimeSpan.FromMilliseconds(1));
        Assert.Equal(category.Name, detail.CategoryName);
        foreach (var listing in hidden)
            Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/api/v1/listings/{listing.Id}")).StatusCode);
    }

    [SqlServerFact]
    public async Task Sale_created_with_HU01_appears_nearby_and_disappears_when_exhausted_deactivated_expired_or_suspended()
    {
        const decimal lat = 18.4273m, lon = -68.9728m; // La Romana
        var owner = await SeedOwnerAsync();
        var category = await AddAsync(Category($"HU02-{Guid.NewGuid():N}"));
        var establishment = await AddAsync(Establishment(owner, NorthOf(lat, lon, 0.8m), "Supermercado HU01"));
        await AddAsync(new EstablishmentMember
        {
            Id = Guid.NewGuid(), EstablishmentId = establishment.Id, UserId = owner, Role = EstablishmentMemberRole.Owner,
            IsPrimary = true, JoinedAtUtc = DateTimeOffset.UtcNow.AddDays(-1), GrantedByUserId = owner,
        });
        var nearby = Invariant($"latitude={lat}&longitude={lon}&radiusKm=1");

        var exhausted = await CreateSaleAsync(establishment.Id, category.Id, owner);
        Assert.Contains(await SearchAsync(nearby), listing => listing.Id == exhausted.Id);
        var far = NorthOf(lat, lon, 20m);
        Assert.DoesNotContain(await SearchAsync(Invariant($"latitude={far.Latitude}&longitude={far.Longitude}&radiusKm=10")), listing => listing.Id == exhausted.Id);
        var expiredAt = Uri.EscapeDataString(exhausted.PickupDeadlineUtc.AddMinutes(1).ToString("O"));
        Assert.DoesNotContain(await SearchAsync($"{nearby}&asOfUtc={expiredAt}"), listing => listing.Id == exhausted.Id);

        await UseAsync<IManageListingStockService>(service => service.AdjustAsync(exhausted.Id, new AdjustListingStockRequest
        {
            Kind = StockAdjustmentKind.Withdrawal, Quantity = exhausted.AvailableQuantity, Reason = "Se agotó",
        }, owner));
        await AssertHiddenAsync(exhausted.Id, nearby);

        var deactivated = await CreateSaleAsync(establishment.Id, category.Id, owner);
        await UseAsync<IManageListingService>(service => service.DeactivateAsync(deactivated.Id, new DeactivateListingRequest { Reason = "Retirada" }, owner));
        await AssertHiddenAsync(deactivated.Id, nearby);

        var ofSuspended = await CreateSaleAsync(establishment.Id, category.Id, owner);
        Assert.Contains(await SearchAsync(nearby), listing => listing.Id == ofSuspended.Id);
        using (var scope = fixture.Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
            await db.Set<Establishment>().Where(x => x.Id == establishment.Id)
                .ExecuteUpdateAsync(setters => setters.SetProperty(x => x.Status, EstablishmentStatus.Suspended));
        }
        await AssertHiddenAsync(ofSuspended.Id, nearby);
    }

    [SqlServerFact]
    public async Task Invalid_search_input_returns_400_with_the_offending_field()
    {
        async Task AssertInvalidAsync(string query, string field)
        {
            var response = await Client.GetAsync($"/api/v1/listings?{query}");
            Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
            Assert.Contains(field, (await response.Content.ReadFromJsonAsync<ApiError>())!.Errors!.Keys);
        }

        await AssertInvalidAsync("latitude=18.5", "longitude");
        await AssertInvalidAsync("longitude=-69.9", "latitude");
        await AssertInvalidAsync("latitude=91&longitude=-69.9", "latitude");
        await AssertInvalidAsync("latitude=18.5&longitude=-181", "longitude");
        await AssertInvalidAsync("latitude=18.5&longitude=-69.9&radiusKm=2", "radiusKm");
        await AssertInvalidAsync("radiusKm=3", "radiusKm");
        Assert.Equal(HttpStatusCode.BadRequest, (await Client.GetAsync($"/api/v1/listings/{Guid.NewGuid()}?latitude=18.5")).StatusCode);

        var options = await Client.GetFromJsonAsync<ListingSearchOptionsResponse>("/api/v1/listings/search-options");
        Assert.Equal([1m, 3m, 5m, 10m], options!.RadiiKm);
        Assert.Equal((3m, 100), (options.DefaultRadiusKm, options.MaxResults));
    }

    private async Task AssertHiddenAsync(Guid listingId, string query)
    {
        Assert.DoesNotContain(await SearchAsync(query), listing => listing.Id == listingId);
        Assert.Equal(HttpStatusCode.NotFound, (await Client.GetAsync($"/api/v1/listings/{listingId}")).StatusCode);
    }

    private Task<ListingResponse> CreateSaleAsync(Guid establishmentId, Guid categoryId, Guid owner)
    {
        var now = DateTimeOffset.UtcNow;
        return UseAsync<ICreateListingService, ListingResponse>(service => service.CreateAsync(new CreateListingRequest
        {
            EstablishmentId = establishmentId, CategoryId = categoryId, Title = "Venta HU-01",
            Description = "Alimento apto", InitialQuantity = 3, PickupInstructions = "Recoger en caja",
            PickupStartsAtUtc = now.AddMinutes(30), PickupDeadlineUtc = now.AddHours(3),
            OriginalUnitPrice = 300m, DiscountedUnitPrice = 150m, PaymentInstructions = "Pago al recoger",
            FoodSafetyDeclared = true,
        }, owner));
    }

    private async Task<List<ListingSummaryResponse>> SearchAsync(string query) =>
        (await Client.GetFromJsonAsync<List<ListingSummaryResponse>>($"/api/v1/listings?{query}"))!;

    private async Task<Guid> SeedOwnerAsync()
    {
        var id = Guid.NewGuid();
        await AddAsync(new IdentityUser<Guid>
        {
            Id = id, UserName = id.ToString(), NormalizedUserName = id.ToString().ToUpperInvariant(),
            Email = $"{id:N}@xfood.test", NormalizedEmail = $"{id:N}@XFOOD.TEST",
        });
        return id;
    }

    private async Task<T> AddAsync<T>(T entity) where T : class
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
        db.Add(entity);
        await db.SaveChangesAsync();
        return entity;
    }

    private Task UseAsync<TService>(Func<TService, Task> action) where TService : notnull =>
        UseAsync<TService, bool>(async service => { await action(service); return true; });

    private async Task<TResult> UseAsync<TService, TResult>(Func<TService, Task<TResult>> action) where TService : notnull
    {
        using var scope = fixture.Factory.Services.CreateScope();
        return await action(scope.ServiceProvider.GetRequiredService<TService>());
    }
}
