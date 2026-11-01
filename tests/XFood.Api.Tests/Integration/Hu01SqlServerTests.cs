using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using XFood.Application.Modules.Establishments.Contracts;
using XFood.Api.Modules.Identity;
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

    [SqlServerFact]
    public async Task Web_flow_lists_own_sale_after_creation_and_deactivation()
    {
        using var client = fixture.Factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"), HandleCookies = false,
        });
        var email = $"panel-{Guid.NewGuid():N}@xfood.test";
        var registration = await client.PostAsJsonAsync("/api/v1/auth/register", new
        {
            email, password = "Clave#2026", displayName = "Panel", role = "Establishment",
            establishment = new { name = "Panadería", contactPhone = "809-555-0101", address = "Calle 1", latitude = 18.5, longitude = -69.9 },
        });
        Assert.Equal(HttpStatusCode.Created, registration.StatusCode);
        var establishmentId = Assert.Single((await registration.Content.ReadFromJsonAsync<AccountResponse>())!.Establishments!).Id;
        var login = await client.PostAsJsonAsync("/api/v1/auth/login", new { email, password = "Clave#2026" });
        Assert.Equal(HttpStatusCode.OK, login.StatusCode);
        var cookie = login.Headers.GetValues("Set-Cookie").Single(x => x.StartsWith("XFood.Session=", StringComparison.Ordinal)).Split(';')[0];

        var categoryId = Guid.NewGuid();
        using (var scope = fixture.Factory.Services.CreateScope())
        {
            var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
            db.Add(new Category { Id = categoryId, Name = "Categoría de prueba", IsActive = true, CreatedAtUtc = DateTimeOffset.UtcNow });
            await db.SaveChangesAsync();
        }
        var categories = await client.GetFromJsonAsync<List<CategoryResponse>>("/api/v1/categories");
        Assert.Contains(categories!, x => x.Id == categoryId);

        var now = DateTimeOffset.UtcNow;
        using var createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/v1/listings")
        {
            Content = JsonContent.Create(new
            {
                establishmentId, categoryId, title = "Venta", description = "Apto", initialQuantity = 2,
                pickupInstructions = "Recoger", pickupStartsAtUtc = now.AddHours(1), pickupDeadlineUtc = now.AddHours(3),
                originalUnitPrice = 100, discountedUnitPrice = 60, paymentInstructions = "Pago en caja", foodSafetyDeclared = true,
            }),
        };
        createRequest.Headers.Add("Cookie", cookie);
        createRequest.Headers.Add("Origin", SqlServerApiFixture.PanelOrigin);
        var created = await client.SendAsync(createRequest);
        Assert.Equal(HttpStatusCode.Created, created.StatusCode);
        var listingId = (await created.Content.ReadFromJsonAsync<ListingResponse>())!.Id;

        async Task<HttpResponseMessage> OwnList(Guid id)
        {
            using var request = new HttpRequestMessage(HttpMethod.Get, $"/api/v1/establishments/{id}/listings");
            request.Headers.Add("Cookie", cookie);
            return await client.SendAsync(request);
        }
        using var own = await OwnList(establishmentId);
        Assert.Equal(HttpStatusCode.OK, own.StatusCode);
        Assert.Contains((await own.Content.ReadFromJsonAsync<List<ListingResponse>>())!, x => x.Id == listingId && x.Status == ListingStatus.Active);
        using var foreign = await OwnList(Guid.NewGuid());
        Assert.Equal(HttpStatusCode.Forbidden, foreign.StatusCode);

        using var deactivateRequest = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/listings/{listingId}/deactivate")
        {
            Content = JsonContent.Create(new { reason = "Retirado" }),
        };
        deactivateRequest.Headers.Add("Cookie", cookie);
        deactivateRequest.Headers.Add("Origin", SqlServerApiFixture.PanelOrigin);
        Assert.Equal(HttpStatusCode.OK, (await client.SendAsync(deactivateRequest)).StatusCode);
        using var after = await OwnList(establishmentId);
        Assert.Contains((await after.Content.ReadFromJsonAsync<List<ListingResponse>>())!, x => x.Id == listingId && x.Status == ListingStatus.Deactivated);
    }

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
    public async Task Establishment_read_includes_all_statuses_and_categories_are_active_only()
    {
        var seed = await SeedAsync(destination: true);
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
        var other = await db.Set<Listing>().SingleAsync(x => x.Id == seed.DestinationId);
        other.Status = ListingStatus.Deactivated;
        db.Add(new Category { Id = Guid.NewGuid(), Name = "Inactiva", IsActive = false, CreatedAtUtc = DateTimeOffset.UtcNow });
        await db.SaveChangesAsync();

        var reads = scope.ServiceProvider.GetRequiredService<IListingReadService>();
        var own = await reads.GetForEstablishmentAsync(seed.EstablishmentId, seed.UserId);
        Assert.Equal(2, own.Count);
        Assert.Contains(own, x => x.Id == seed.ListingId && x.Status == ListingStatus.Active);
        Assert.Contains(own, x => x.Id == seed.DestinationId && x.Status == ListingStatus.Deactivated);
        await Assert.ThrowsAsync<ListingForbiddenException>(() =>
            reads.GetForEstablishmentAsync(seed.EstablishmentId, Guid.NewGuid()));

        var categories = await reads.GetActiveCategoriesAsync();
        Assert.Contains(categories, x => x.Id == seed.CategoryId);
        Assert.DoesNotContain(categories, x => x.Name == "Inactiva");
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
