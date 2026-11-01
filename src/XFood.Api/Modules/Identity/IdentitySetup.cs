using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using XFood.Api.Http;
using XFood.Application.Common;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;

namespace XFood.Api.Modules.Identity;

/// <summary>Role policies for endpoints: <c>.RequireAuthorization(AuthorizationPolicies.Establishment)</c>.</summary>
public static class AuthorizationPolicies
{
    public const string Consumer = "RequireConsumer";
    public const string Establishment = "RequireEstablishment";
    public const string Organization = "RequireOrganization";
    public const string Administrator = "RequireAdministrator";
}

public static class IdentitySetup
{
    public const string PanelCorsPolicy = "Panel";

    public static IServiceCollection AddIdentityApi(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddScoped<AccountUseCases>();

        services.AddAuthorizationBuilder()
            .AddPolicy(AuthorizationPolicies.Consumer, policy => policy.RequireRole(AccountRoles.Consumer))
            .AddPolicy(AuthorizationPolicies.Establishment, policy => policy.RequireRole(AccountRoles.Establishment))
            .AddPolicy(AuthorizationPolicies.Organization, policy => policy.RequireRole(AccountRoles.Organization))
            .AddPolicy(AuthorizationPolicies.Administrator, policy => policy.RequireRole(AccountRoles.Administrator));

        // An API answers with 401/403 JSON instead of redirecting to a login page.
        services.PostConfigure<CookieAuthenticationOptions>(IdentityConstants.ApplicationScheme, options =>
        {
            options.Events.OnRedirectToLogin = context => ApiErrors.WriteAsync(
                context.HttpContext, StatusCodes.Status401Unauthorized, ErrorCodes.Unauthenticated, "Debe iniciar sesión.");
            options.Events.OnRedirectToAccessDenied = context => ApiErrors.WriteAsync(
                context.HttpContext, StatusCodes.Status403Forbidden, ErrorCodes.Forbidden, "No tiene permiso para realizar esta operación.");
        });

        // Only the panel origins may call the API with the session cookie from a browser.
        var panelOrigins = configuration.GetSection("Cors:PanelOrigins").Get<string[]>() ?? [];
        services.AddCors(options => options.AddPolicy(PanelCorsPolicy, policy => policy
            .WithOrigins(panelOrigins)
            .AllowCredentials()
            .AllowAnyHeader()
            .WithExposedHeaders("X-Page", "X-Page-Size", "X-Has-Next-Page")
            .WithMethods("GET", "POST", "PUT", "PATCH", "DELETE")));

        return services;
    }
}
