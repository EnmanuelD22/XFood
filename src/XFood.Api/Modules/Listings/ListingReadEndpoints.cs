using System.Security.Claims;
using XFood.Api.Http;
using XFood.Api.Modules.Identity;
using XFood.Application.Common;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;

namespace XFood.Api.Modules.Listings;

public static class ListingReadEndpoints
{
    public static IEndpointRouteBuilder MapListingReadEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/establishments/{establishmentId:guid}/listings", GetOwnAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("GetEstablishmentListings").WithTags("Listings")
            .Produces<IReadOnlyList<ListingResponse>>()
            .Produces<ApiError>(StatusCodes.Status401Unauthorized)
            .Produces<ApiError>(StatusCodes.Status403Forbidden);

        api.MapGet("/categories", GetCategoriesAsync)
            .WithName("GetActiveCategories").WithTags("Listings")
            .Produces<IReadOnlyList<CategoryResponse>>();
        return api;
    }

    private static async Task<IResult> GetOwnAsync(
        Guid establishmentId, ClaimsPrincipal user, IListingReadService listings,
        HttpContext http, CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return AppError.Validation(new Dictionary<string, string[]>
            {
                ["user"] = ["La sesión no contiene un identificador válido."],
            }).ToResult(http);
        try
        {
            return Results.Ok(await listings.GetForEstablishmentAsync(establishmentId, userId, cancellationToken));
        }
        catch (ListingForbiddenException)
        {
            return Results.Json(new ApiError(ErrorCodes.Forbidden, "No tiene permiso para consultar este establecimiento.", http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }
    }

    private static async Task<IResult> GetCategoriesAsync(IListingReadService listings, CancellationToken cancellationToken) =>
        Results.Ok(await listings.GetActiveCategoriesAsync(cancellationToken));
}
