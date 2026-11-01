using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using XFood.Application.Common;

namespace XFood.Api.Http;

/// <summary>
/// CSRF protection for state-changing requests (POST, PUT, PATCH, DELETE), checked before authentication:
/// <list type="bullet">
/// <item>With <c>Origin</c> (or, without it, <c>Referer</c>): it must be a trusted origin; <c>Origin: null</c> is rejected.</item>
/// <item>Without both headers but carrying the session cookie: rejected. Browsers always send <c>Origin</c> on these
/// methods, so such a request comes from a non-browser client, which must then send a trusted <c>Origin</c>.</item>
/// <item>Without both headers and without the session cookie: allowed (curl, server-to-server, future mobile tokens),
/// because there is no browser session to abuse; each endpoint still applies its own authorization.</item>
/// </list>
/// Trusted origins come only from configuration (<c>Cors:PanelOrigins</c> and <c>Security:ApiOrigins</c>), never from
/// the <c>Host</c> header, so the rule stays correct behind a reverse proxy.
/// </summary>
public sealed class OriginValidationMiddleware(
    RequestDelegate next,
    IConfiguration configuration,
    IOptionsMonitor<CookieAuthenticationOptions> cookieOptions)
{
    private readonly HashSet<string> trustedOrigins = configuration.GetSection("Cors:PanelOrigins").Get<string[]>().OrEmpty()
        .Concat(configuration.GetSection("Security:ApiOrigins").Get<string[]>().OrEmpty())
        .Select(Normalize).OfType<string>()
        .ToHashSet(StringComparer.Ordinal);

    public Task InvokeAsync(HttpContext http)
    {
        var request = http.Request;
        if (HttpMethods.IsGet(request.Method) || HttpMethods.IsHead(request.Method)
            || HttpMethods.IsOptions(request.Method) || HttpMethods.IsTrace(request.Method))
        {
            return next(http);
        }

        string? source = request.Headers.Origin.Count > 0 ? request.Headers.Origin.ToString()
            : request.Headers.Referer.Count > 0 ? request.Headers.Referer.ToString()
            : null;

        if (source is null)
        {
            var sessionCookie = cookieOptions.Get(IdentityConstants.ApplicationScheme).Cookie.Name!;
            return request.Cookies.ContainsKey(sessionCookie)
                ? Reject(http, "Las solicitudes con sesión deben indicar su origen.")
                : next(http);
        }

        return Normalize(source) is { } origin && trustedOrigins.Contains(origin)
            ? next(http)
            : Reject(http, "El origen de la solicitud no está permitido.");
    }

    /// <summary>scheme://host:port in lower case; null for "null", relative or non-HTTP values.</summary>
    internal static string? Normalize(string value) =>
        Uri.TryCreate(value.Trim(), UriKind.Absolute, out var uri) && (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp)
            ? $"{uri.Scheme}://{uri.Host}:{uri.Port}".ToLowerInvariant()
            : null;

    private static Task Reject(HttpContext http, string message) =>
        ApiErrors.WriteAsync(http, StatusCodes.Status403Forbidden, ErrorCodes.Forbidden, message);
}

public static class OriginValidation
{
    public static WebApplication UseOriginValidation(this WebApplication app)
    {
        app.UseMiddleware<OriginValidationMiddleware>();
        return app;
    }

    internal static IEnumerable<string> OrEmpty(this string[]? values) => values ?? [];
}
