using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Identity;

/// <summary>Issues and clears the web panel's HttpOnly session cookie.</summary>
internal sealed class CookieSessionManager(
    IHttpContextAccessor httpContextAccessor,
    UserManager<IdentityUser<Guid>> users,
    IUserClaimsPrincipalFactory<IdentityUser<Guid>> principals) : ISessionManager
{
    private HttpContext Http => httpContextAccessor.HttpContext
        ?? throw new InvalidOperationException("A session requires an HTTP request.");

    public async Task SignInAsync(Guid userId, CancellationToken cancellationToken)
    {
        var user = await users.FindByIdAsync(userId.ToString())
            ?? throw new InvalidOperationException($"User {userId} does not exist.");
        // The principal carries user id, email, roles and the security stamp checked on every request.
        var principal = await principals.CreateAsync(user);
        await Http.SignInAsync(IdentityConstants.ApplicationScheme, principal, new AuthenticationProperties { IsPersistent = false });
    }

    public async Task SignOutAsync(CancellationToken cancellationToken)
    {
        // Rotating the security stamp makes SessionValidation reject any copy of the cookie,
        // not only the one this browser deletes. It also ends the user's sessions on other browsers.
        if (await users.GetUserAsync(Http.User) is { } user)
            await users.UpdateSecurityStampAsync(user);
        await Http.SignOutAsync(IdentityConstants.ApplicationScheme);
    }
}

/// <summary>
/// Rejects a session cookie when the account no longer exists, its security stamp changed
/// (password change, forced logout) or it was suspended.
/// </summary>
internal static class SessionValidation
{
    public static async Task ValidateAsync(CookieValidatePrincipalContext context)
    {
        var services = context.HttpContext.RequestServices;
        var stampClaim = services.GetRequiredService<IOptions<IdentityOptions>>().Value.ClaimsIdentity.SecurityStampClaimType;
        var stamp = context.Principal?.FindFirstValue(stampClaim);

        var isValid = Guid.TryParse(context.Principal?.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            && stamp is not null
            && await IsActiveSessionAsync(services.GetRequiredService<XFoodDbContext>(), userId, stamp, context.HttpContext.RequestAborted);

        if (!isValid)
        {
            context.RejectPrincipal();
            await context.HttpContext.SignOutAsync(IdentityConstants.ApplicationScheme);
        }
    }

    private static Task<bool> IsActiveSessionAsync(XFoodDbContext db, Guid userId, string stamp, CancellationToken cancellationToken) =>
        (from user in db.Users
         join profile in db.Set<AccountProfile>() on user.Id equals profile.UserId
         where user.Id == userId && user.SecurityStamp == stamp && profile.Status == AccountStatus.Active
         select user.Id)
        .AnyAsync(cancellationToken);
}
