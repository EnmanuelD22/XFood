using System.Security.Claims;
using XFood.Api.Http;
using XFood.Application.Modules.Identity;

namespace XFood.Api.Modules.Identity;

public sealed record AccountResponse(
    Guid Id,
    string Email,
    string DisplayName,
    string Role,
    string Status,
    OrganizationResponse? Organization,
    IReadOnlyList<EstablishmentResponse>? Establishments)
{
    public static AccountResponse From(AccountSummary account) => new(
        account.UserId,
        account.Email,
        account.DisplayName,
        account.Role,
        account.Status.ToString(),
        account.Organization is { } organization
            ? new OrganizationResponse(organization.Id, organization.Name, organization.VerificationStatus.ToString())
            : null,
        account.Establishments?
            .Select(e => new EstablishmentResponse(e.Id, e.Name, e.Status.ToString(), e.MemberRole.ToString(), e.IsPrimary))
            .ToList());
}

public sealed record OrganizationResponse(Guid Id, string Name, string VerificationStatus);

public sealed record EstablishmentResponse(Guid Id, string Name, string Status, string MemberRole, bool IsPrimary);

public static class IdentityEndpoints
{
    public static IEndpointRouteBuilder MapIdentityEndpoints(this IEndpointRouteBuilder api)
    {
        var auth = api.MapGroup("/auth").WithTags("Identity");

        auth.MapPost("/register", RegisterAsync)
            .AllowAnonymous()
            .WithName("RegisterAccount")
            .Produces<AccountResponse>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest);

        auth.MapPost("/login", LoginAsync)
            .AllowAnonymous()
            .WithName("Login")
            .Produces<AccountResponse>()
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status403Forbidden);

        auth.MapPost("/logout", LogoutAsync)
            .RequireAuthorization()
            .WithName("Logout")
            .Produces(StatusCodes.Status204NoContent)
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status403Forbidden);

        api.MapGet("/me", GetCurrentAccountAsync)
            .WithName("GetCurrentAccount")
            .WithTags("Identity")
            .RequireAuthorization()
            .Produces<AccountResponse>()
            .Produces<ApiError>(StatusCodes.Status401Unauthorized);

        return api;
    }

    private static async Task<IResult> RegisterAsync(
        RegisterAccountCommand command, AccountUseCases accounts, HttpContext http, CancellationToken cancellationToken)
    {
        var result = await accounts.RegisterAsync(command, cancellationToken);
        return result.IsSuccess
            ? Results.Created("/api/v1/me", AccountResponse.From(result.Value!))
            : result.Error!.ToResult(http);
    }

    private static async Task<IResult> LoginAsync(
        LoginCommand command, AccountUseCases accounts, HttpContext http, CancellationToken cancellationToken)
    {
        var result = await accounts.LoginAsync(command, cancellationToken);
        return result.IsSuccess ? Results.Ok(AccountResponse.From(result.Value!)) : result.Error!.ToResult(http);
    }

    private static async Task<IResult> LogoutAsync(AccountUseCases accounts, CancellationToken cancellationToken)
    {
        await accounts.LogoutAsync(cancellationToken);
        return Results.NoContent();
    }

    private static async Task<IResult> GetCurrentAccountAsync(
        ClaimsPrincipal user, AccountUseCases accounts, HttpContext http, CancellationToken cancellationToken)
    {
        var userId = Guid.Parse(user.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await accounts.GetCurrentAsync(userId, cancellationToken);
        return result.IsSuccess ? Results.Ok(AccountResponse.From(result.Value!)) : result.Error!.ToResult(http);
    }
}
