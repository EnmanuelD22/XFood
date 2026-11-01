using System.Security.Claims;
using XFood.Api.Http;
using XFood.Api.Modules.Identity;
using XFood.Application.Common;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Establishments.Contracts;
using XFood.Application.Modules.Establishments.Services;

namespace XFood.Api.Modules.Establishments;

public static class EstablishmentProfileEndpoints
{
    public static IEndpointRouteBuilder MapEstablishmentProfileEndpoints(this IEndpointRouteBuilder api)
    {
        var group = api.MapGroup("/establishments/{establishmentId:guid}")
            .WithTags("Establishments")
            .RequireAuthorization(AuthorizationPolicies.Establishment);

        group.MapGet("", GetAsync)
            .WithName("GetEstablishmentProfile")
            .Produces<EstablishmentProfileResponse>()
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound);

        group.MapPut("", UpdateAsync)
            .WithName("UpdateEstablishmentProfile")
            .Produces<EstablishmentProfileResponse>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict);

        return api;
    }

    private static Task<IResult> GetAsync(
        Guid establishmentId,
        ClaimsPrincipal user,
        IEstablishmentProfileService profiles,
        HttpContext http,
        CancellationToken cancellationToken) =>
        ExecuteAsync(user, http, cancellationToken, userId => profiles.GetAsync(establishmentId, userId, cancellationToken));

    private static Task<IResult> UpdateAsync(
        Guid establishmentId,
        UpdateEstablishmentProfileRequest request,
        ClaimsPrincipal user,
        IEstablishmentProfileService profiles,
        HttpContext http,
        CancellationToken cancellationToken) =>
        ExecuteAsync(user, http, cancellationToken, userId => profiles.UpdateAsync(establishmentId, userId, request, cancellationToken));

    private static async Task<IResult> ExecuteAsync(
        ClaimsPrincipal user,
        HttpContext http,
        CancellationToken cancellationToken,
        Func<Guid, Task<EstablishmentProfileResponse>> operation)
    {
        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return AppError.Validation(new Dictionary<string, string[]>
            {
                ["user"] = ["La sesión no contiene un identificador válido."],
            }).ToResult(http);

        try
        {
            return Results.Ok(await operation(userId));
        }
        catch (EstablishmentProfileValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
        catch (EstablishmentProfileForbiddenException)
        {
            return Results.Json(new ApiError(ErrorCodes.Forbidden, "No tiene permiso para realizar esta operación.", http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }
        catch (EstablishmentProfileNotFoundException)
        {
            return Results.Json(new ApiError(ErrorCodes.NotFound, "El establecimiento no existe.", http.TraceIdentifier), statusCode: StatusCodes.Status404NotFound);
        }
        catch (EstablishmentProfileConcurrencyException)
        {
            return Results.Json(new ApiError("CONCURRENCY_CONFLICT", "El establecimiento cambió mientras se procesaba la solicitud.", http.TraceIdentifier), statusCode: StatusCodes.Status409Conflict);
        }
    }
}
