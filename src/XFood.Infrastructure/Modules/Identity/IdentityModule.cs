using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.DependencyInjection.Extensions;
using XFood.Application.Modules.Identity;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Identity;

internal static class IdentityModule
{
    public const string SessionCookieName = "XFood.Session";

    public static IServiceCollection AddIdentityModule(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddIdentityCore<IdentityUser<Guid>>(options => options.User.RequireUniqueEmail = true)
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<XFoodDbContext>()
            .AddErrorDescriber<SpanishIdentityErrorDescriber>();

        // Password and lockout policy come from the "Identity" section (Identity defaults when absent).
        services.Configure<IdentityOptions>(configuration.GetSection("Identity"));

        // Cookie session for the Next.js panel: not readable by scripts, HTTPS only, not sent on cross-site POSTs.
        services.AddAuthentication(IdentityConstants.ApplicationScheme)
            .AddCookie(IdentityConstants.ApplicationScheme, options =>
            {
                options.Cookie.Name = SessionCookieName;
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Lax;
                options.ExpireTimeSpan = TimeSpan.FromHours(8);
                options.SlidingExpiration = true;
                options.Events.OnValidatePrincipal = SessionValidation.ValidateAsync;
            });

        services.AddHttpContextAccessor();
        services.TryAddSingleton(TimeProvider.System);
        services.AddScoped<IAccountStore, AccountStore>();
        services.AddScoped<ISessionManager, CookieSessionManager>();
        return services;
    }
}
