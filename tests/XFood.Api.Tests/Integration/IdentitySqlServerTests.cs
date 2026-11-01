using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using XFood.Api.Http;
using XFood.Api.Modules.Identity;
using XFood.Application.Modules.Establishments;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Identity;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Integration;

/// <summary>Real registration transaction, lockout, cookie and session flow against an isolated SQL Server database.</summary>
public sealed class IdentitySqlServerTests(SqlServerApiFixture fixture) : IClassFixture<SqlServerApiFixture>
{
    private const string Password = "Clave#2026";
    private const string EvilOrigin = "https://evil.example";

    private HttpClient Client(WebApplicationFactory<Program>? factory = null) =>
        (factory ?? fixture.Factory).CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = false,
        });

    private static string NewEmail(string prefix) => $"{prefix}-{Guid.NewGuid():N}@xfood.test";

    private static object EstablishmentBody(string email) => new
    {
        email, password = Password, displayName = "Panadería Central", role = "Establishment",
        establishment = new { name = "Panadería Central", contactPhone = "809-555-0102", address = "Av. Duarte 10", latitude = 18.4861, longitude = -69.9312 },
    };

    private static async Task<HttpResponseMessage> SendAsync(
        HttpClient client, HttpMethod method, string path, object? body = null, string? cookie = null, params (string Name, string Value)[] headers)
    {
        var request = new HttpRequestMessage(method, path) { Content = body is null ? null : JsonContent.Create(body) };
        if (cookie is not null)
            request.Headers.Add("Cookie", cookie);
        foreach (var (name, value) in headers)
            request.Headers.TryAddWithoutValidation(name, value);
        return await client.SendAsync(request);
    }

    private async Task RegisterAsync(object body) =>
        Assert.Equal(HttpStatusCode.Created, (await SendAsync(Client(), HttpMethod.Post, "/api/v1/auth/register", body)).StatusCode);

    private static async Task<HttpResponseMessage> LoginAsync(HttpClient client, string email, string password = Password) =>
        await SendAsync(client, HttpMethod.Post, "/api/v1/auth/login", new { email, password });

    /// <summary>Logs in and returns the "XFood.Session=..." pair to send back in a Cookie header.</summary>
    private async Task<string> SessionCookieAsync(string email)
    {
        var response = await LoginAsync(Client(), email);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        return response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("XFood.Session=", StringComparison.Ordinal)).Split(';')[0];
    }

    private T WithDb<T>(Func<XFoodDbContext, T> query)
    {
        using var scope = fixture.Factory.Services.CreateScope();
        return query(scope.ServiceProvider.GetRequiredService<XFoodDbContext>());
    }

    private Guid UserId(string email) =>
        WithDb(db => db.Users.Where(u => u.NormalizedEmail == email.ToUpperInvariant()).Select(u => u.Id).Single());

    [SqlServerFact]
    public async Task Establishment_registration_creates_account_establishment_primary_owner_and_initial_event()
    {
        var email = NewEmail("est");
        await RegisterAsync(EstablishmentBody(email));

        var userId = UserId(email);
        WithDb(db =>
        {
            Assert.Equal(AccountStatus.Active, db.Set<AccountProfile>().Single(p => p.UserId == userId).Status);
            Assert.Single(db.Set<AccountStatusChange>().Where(c => c.UserId == userId));
            var member = Assert.Single(db.Set<EstablishmentMember>().Where(m => m.UserId == userId && m.RevokedAtUtc == null));
            Assert.Equal((EstablishmentMemberRole.Owner, true), (member.Role, member.IsPrimary));
            var establishment = db.Set<Establishment>().Single(e => e.Id == member.EstablishmentId);
            Assert.Equal((18.4861m, -69.9312m, "America/Santo_Domingo"), (establishment.Latitude, establishment.Longitude, establishment.TimeZoneId));
            Assert.Equal(("Panadería Central", email), (establishment.ContactName, establishment.ContactEmail));
            Assert.Equal(EstablishmentStatus.Active, establishment.Status);
            Assert.Single(db.Set<EstablishmentStatusChange>().Where(c => c.EstablishmentId == establishment.Id && c.FromStatus == null));
            Assert.Single(db.Set<EstablishmentMember>().Where(m => m.EstablishmentId == establishment.Id && m.IsPrimary && m.RevokedAtUtc == null));
            return true;
        });

        var me = await SendAsync(Client(), HttpMethod.Get, "/api/v1/me", cookie: await SessionCookieAsync(email));
        var account = await me.Content.ReadFromJsonAsync<AccountResponse>();
        var owned = Assert.Single(account!.Establishments!);
        Assert.Equal(("Owner", true, "Active"), (owned.MemberRole, owned.IsPrimary, owned.Status));
    }

    [SqlServerFact]
    public async Task Consumer_and_organization_registration_persist_their_rows()
    {
        var consumer = NewEmail("con");
        var organization = NewEmail("org");
        await RegisterAsync(new { email = consumer, password = Password, displayName = "Ana", role = "Consumer" });
        await RegisterAsync(new
        {
            email = organization, password = Password, displayName = "Luis", role = "Organization",
            organization = new { name = "Banco de Alimentos", contactPhone = "809-555-0101", address = "Calle 1" },
        });

        var consumerId = UserId(consumer);
        var organizationUserId = UserId(organization);
        WithDb(db =>
        {
            Assert.True(db.Set<AccountProfile>().Any(p => p.UserId == consumerId));
            Assert.False(db.Set<EstablishmentMember>().Any(m => m.UserId == consumerId));
            var member = Assert.Single(db.Set<OrganizationMember>().Where(m => m.UserId == organizationUserId));
            Assert.True(member.IsPrimary);
            Assert.Equal(VerificationStatus.Pending, db.Set<Organization>().Single(o => o.Id == member.OrganizationId).VerificationStatus);
            return true;
        });
    }

    private sealed class FailingEstablishmentOnboarding : IEstablishmentOnboarding
    {
        public EstablishmentMembershipSummary StageEstablishment(NewEstablishmentProfile establishment) =>
            throw new InvalidOperationException("Simulated failure after the user and role were saved.");
        public Task<IReadOnlyList<EstablishmentMembershipSummary>> ListActiveMembershipsAsync(Guid userId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
        public Task<EstablishmentMembershipSummary?> FindActiveMembershipAsync(Guid userId, Guid establishmentId, CancellationToken cancellationToken) =>
            throw new NotSupportedException();
    }

    [SqlServerFact]
    public async Task A_failure_while_creating_the_establishment_rolls_back_the_account()
    {
        var email = NewEmail("rollback");
        using var failing = fixture.Factory.WithWebHostBuilder(builder => builder.ConfigureTestServices(services =>
            services.AddScoped<IEstablishmentOnboarding, FailingEstablishmentOnboarding>()));

        var response = await SendAsync(Client(failing), HttpMethod.Post, "/api/v1/auth/register", EstablishmentBody(email));

        Assert.Equal(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal("INTERNAL_ERROR", (await response.Content.ReadFromJsonAsync<ApiError>())!.Code);
        Assert.False(WithDb(db => db.Users.Any(u => u.NormalizedEmail == email.ToUpperInvariant())));
    }

    [SqlServerFact]
    public async Task Duplicate_email_is_rejected_without_creating_a_second_account()
    {
        var email = NewEmail("dup");
        await RegisterAsync(new { email, password = Password, displayName = "Ana", role = "Consumer" });

        var again = await SendAsync(Client(), HttpMethod.Post, "/api/v1/auth/register",
            new { email = email.ToUpperInvariant(), password = Password, displayName = "Otra", role = "Consumer" });

        Assert.Equal(HttpStatusCode.BadRequest, again.StatusCode);
        Assert.Equal(["email"], (await again.Content.ReadFromJsonAsync<ApiError>())!.Errors!.Keys);
        Assert.Equal(1, WithDb(db => db.Users.Count(u => u.NormalizedEmail == email.ToUpperInvariant())));
    }

    [SqlServerFact]
    public async Task Five_failed_attempts_lock_the_account_with_the_same_generic_error()
    {
        var email = NewEmail("lock");
        await RegisterAsync(new { email, password = Password, displayName = "Ana", role = "Consumer" });
        var client = Client();

        for (var attempt = 1; attempt <= 5; attempt++)
            Assert.Equal(HttpStatusCode.Unauthorized, (await LoginAsync(client, email, "Incorrecta#1")).StatusCode);
        var withCorrectPassword = await LoginAsync(client, email);

        Assert.Equal(HttpStatusCode.Unauthorized, withCorrectPassword.StatusCode);
        Assert.Equal("INVALID_CREDENTIALS", (await withCorrectPassword.Content.ReadFromJsonAsync<ApiError>())!.Code);
        Assert.False(withCorrectPassword.Headers.Contains("Set-Cookie"));
        Assert.True(WithDb(db => db.Users.Single(u => u.NormalizedEmail == email.ToUpperInvariant()).LockoutEnd) > DateTimeOffset.UtcNow);
    }

    [SqlServerFact]
    public async Task Session_cookie_is_httponly_secure_samesite_lax_and_not_persistent()
    {
        var email = NewEmail("cookie");
        await RegisterAsync(new { email, password = Password, displayName = "Ana", role = "Consumer" });

        var response = await LoginAsync(Client(), email);

        var cookie = response.Headers.GetValues("Set-Cookie").Single(c => c.StartsWith("XFood.Session=", StringComparison.Ordinal)).ToLowerInvariant();
        Assert.Contains("httponly", cookie);
        Assert.Contains("secure", cookie);
        Assert.Contains("samesite=lax", cookie);
        Assert.Contains("path=/", cookie);
        Assert.DoesNotContain("expires=", cookie);
    }

    [SqlServerFact]
    public async Task Login_me_logout_flow_revokes_the_cookie()
    {
        var email = NewEmail("flow");
        await RegisterAsync(new { email, password = Password, displayName = "Ana", role = "Consumer" });
        var client = Client();
        var cookie = await SessionCookieAsync(email);

        var me = await SendAsync(client, HttpMethod.Get, "/api/v1/me", cookie: cookie);
        Assert.Equal(HttpStatusCode.OK, me.StatusCode);
        Assert.Equal(email, (await me.Content.ReadFromJsonAsync<AccountResponse>())!.Email);

        var logout = await SendAsync(client, HttpMethod.Post, "/api/v1/auth/logout", cookie: cookie, headers: ("Origin", SqlServerApiFixture.PanelOrigin));
        Assert.Equal(HttpStatusCode.NoContent, logout.StatusCode);

        // A copy of the old cookie no longer works: logout rotated the security stamp.
        Assert.Equal(HttpStatusCode.Unauthorized, (await SendAsync(client, HttpMethod.Get, "/api/v1/me", cookie: cookie)).StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized,
            (await SendAsync(client, HttpMethod.Post, "/api/v1/auth/logout", cookie: cookie, headers: ("Origin", SqlServerApiFixture.PanelOrigin))).StatusCode);
    }

    [SqlServerFact]
    public async Task Requests_not_authorized_by_origin_cannot_use_the_session()
    {
        var email = NewEmail("csrf");
        await RegisterAsync(new { email, password = Password, displayName = "Ana", role = "Consumer" });
        var client = Client();
        var cookie = await SessionCookieAsync(email);

        (string Name, string Value)[][] forged =
        [
            [("Origin", EvilOrigin)],
            [("Origin", "null")],
            [("Origin", "http://panel.xfood.test")],
            [("Referer", EvilOrigin + "/ataque")],
            [],   // cookie without Origin or Referer
        ];
        foreach (var headers in forged)
        {
            var response = await SendAsync(client, HttpMethod.Post, "/api/v1/auth/logout", cookie: cookie, headers: headers);
            Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
            Assert.Equal("FORBIDDEN", (await response.Content.ReadFromJsonAsync<ApiError>())!.Code);
        }

        // None of the forged requests reached logout: the session is still valid.
        Assert.Equal(HttpStatusCode.OK, (await SendAsync(client, HttpMethod.Get, "/api/v1/me", cookie: cookie)).StatusCode);
        Assert.Equal(HttpStatusCode.NoContent,
            (await SendAsync(client, HttpMethod.Post, "/api/v1/auth/logout", cookie: cookie, headers: ("Origin", SqlServerApiFixture.PanelOrigin))).StatusCode);
    }

    [SqlServerFact]
    public async Task Suspension_invalidates_the_session_and_blocks_login()
    {
        var email = NewEmail("susp");
        await RegisterAsync(new { email, password = Password, displayName = "Ana", role = "Consumer" });
        var client = Client();
        var cookie = await SessionCookieAsync(email);
        var userId = UserId(email);

        WithDb(db => db.Set<AccountProfile>().Where(p => p.UserId == userId)
            .ExecuteUpdate(p => p.SetProperty(x => x.Status, AccountStatus.Suspended)));

        Assert.Equal(HttpStatusCode.Unauthorized, (await SendAsync(client, HttpMethod.Get, "/api/v1/me", cookie: cookie)).StatusCode);
        var login = await LoginAsync(client, email);
        Assert.Equal(HttpStatusCode.Forbidden, login.StatusCode);
        Assert.Equal("ACCOUNT_SUSPENDED", (await login.Content.ReadFromJsonAsync<ApiError>())!.Code);
    }
}
