using System.Net;
using System.Net.Http.Json;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using XFood.Api.Http;
using XFood.Api.Modules.Identity;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;

namespace XFood.Api.Tests.Identity;

/// <summary>
/// Runs the real HTTP pipeline (routing, error format, authorization) with the account store
/// replaced, so no SQL Server is needed. Requests here never reach the database.
/// </summary>
public sealed class IdentityApiTests : IClassFixture<IdentityApiTests.Factory>
{
    public sealed class Factory : WebApplicationFactory<Program>
    {
        internal FakeAccountStore Store { get; } = new FakeAccountStore()
            .WithAccount("ana@xfood.test", "Clave#2026", AccountRoles.Consumer)
            .WithAccount("suspendida@xfood.test", "Clave#2026", AccountRoles.Consumer, AccountStatus.Suspended);

        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:XFood", "Server=unused.invalid;Database=Unused");
            builder.ConfigureTestServices(services =>
            {
                services.AddSingleton<IAccountStore>(Store);
                services.AddSingleton<ISessionManager, FakeSessionManager>();
            });
        }
    }

    private readonly Factory factory;
    private readonly HttpClient client;

    public IdentityApiTests(Factory factory)
    {
        this.factory = factory;
        client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });
    }

    [Fact]
    public async Task Me_without_a_session_returns_401_with_the_uniform_error_body()
    {
        var response = await client.GetAsync("/api/v1/me");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ApiError>();
        Assert.Equal("UNAUTHENTICATED", error!.Code);
        Assert.False(string.IsNullOrWhiteSpace(error.TraceId));
    }

    [Fact]
    public async Task Unknown_email_and_wrong_password_get_identical_responses()
    {
        var unknown = await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "nadie@xfood.test", password = "Clave#2026" });
        var wrongPassword = await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "ana@xfood.test", password = "Otra#2026" });

        Assert.Equal(HttpStatusCode.Unauthorized, unknown.StatusCode);
        Assert.Equal(HttpStatusCode.Unauthorized, wrongPassword.StatusCode);
        var first = await unknown.Content.ReadFromJsonAsync<ApiError>();
        var second = await wrongPassword.Content.ReadFromJsonAsync<ApiError>();
        Assert.Equal("INVALID_CREDENTIALS", first!.Code);
        Assert.Equal((first.Code, first.Message), (second!.Code, second.Message));
    }

    [Fact]
    public async Task Suspended_account_gets_403()
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "suspendida@xfood.test", password = "Clave#2026" });

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
        Assert.Equal("ACCOUNT_SUSPENDED", (await response.Content.ReadFromJsonAsync<ApiError>())!.Code);
    }

    [Fact]
    public async Task Valid_login_returns_the_account()
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new { email = "ana@xfood.test", password = "Clave#2026" });

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var account = await response.Content.ReadFromJsonAsync<AccountResponse>();
        Assert.Equal(("ana@xfood.test", "Consumer", "Active"), (account!.Email, account.Role, account.Status));
    }

    [Fact]
    public async Task Registering_an_administrator_returns_400_with_field_errors()
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/register",
            new { email = "admin@xfood.test", password = "Clave#2026", displayName = "Admin", role = "Administrator" });

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var error = await response.Content.ReadFromJsonAsync<ApiError>();
        Assert.Equal("VALIDATION_ERROR", error!.Code);
        Assert.Equal(["role"], error.Errors!.Keys);
        Assert.DoesNotContain(factory.Store.Created, account => account.Email == "admin@xfood.test");
    }

    [Fact]
    public async Task Valid_registration_returns_201()
    {
        var response = await client.PostAsJsonAsync("/api/v1/auth/register",
            new { email = "nuevo@xfood.test", password = "Clave#2026", displayName = "Nuevo", role = "Establishment" });

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("/api/v1/me", response.Headers.Location?.OriginalString);
        Assert.Equal("Establishment", (await response.Content.ReadFromJsonAsync<AccountResponse>())!.Role);
    }

    [Fact]
    public async Task Malformed_json_returns_400_validation_error()
    {
        var response = await client.PostAsync("/api/v1/auth/login",
            new StringContent("{\"email\":", System.Text.Encoding.UTF8, "application/json"));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        Assert.Equal("VALIDATION_ERROR", (await response.Content.ReadFromJsonAsync<ApiError>())!.Code);
    }

    [Fact]
    public async Task Logout_returns_204()
    {
        var response = await client.PostAsync("/api/v1/auth/logout", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    public static TheoryData<string, string, bool> RolePolicyCases => new()
    {
        { AccountRoles.Establishment, AuthorizationPolicies.Establishment, true },
        { AccountRoles.Consumer, AuthorizationPolicies.Establishment, false },
        { AccountRoles.Organization, AuthorizationPolicies.Establishment, false },
        { AccountRoles.Consumer, AuthorizationPolicies.Consumer, true },
        { AccountRoles.Establishment, AuthorizationPolicies.Consumer, false },
        { AccountRoles.Organization, AuthorizationPolicies.Organization, true },
        { AccountRoles.Consumer, AuthorizationPolicies.Organization, false },
        { AccountRoles.Administrator, AuthorizationPolicies.Administrator, true },
        { AccountRoles.Establishment, AuthorizationPolicies.Administrator, false },
        { AccountRoles.Organization, AuthorizationPolicies.Administrator, false },
    };

    [Theory]
    [MemberData(nameof(RolePolicyCases))]
    public async Task Role_policies_only_admit_their_role(string role, string policy, bool allowed)
    {
        var principal = new ClaimsPrincipal(new ClaimsIdentity(
            [new Claim(ClaimTypes.NameIdentifier, Guid.NewGuid().ToString()), new Claim(ClaimTypes.Role, role)], "Test"));
        var authorization = factory.Services.GetRequiredService<IAuthorizationService>();

        var result = await authorization.AuthorizeAsync(principal, policy);

        Assert.Equal(allowed, result.Succeeded);
    }

    [Theory]
    [InlineData(AuthorizationPolicies.Consumer)]
    [InlineData(AuthorizationPolicies.Establishment)]
    [InlineData(AuthorizationPolicies.Organization)]
    [InlineData(AuthorizationPolicies.Administrator)]
    public async Task Role_policies_reject_anonymous_users(string policy)
    {
        var authorization = factory.Services.GetRequiredService<IAuthorizationService>();

        var result = await authorization.AuthorizeAsync(new ClaimsPrincipal(new ClaimsIdentity()), policy);

        Assert.False(result.Succeeded);
    }
}
