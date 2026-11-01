using System.Security.Claims;
using XFood.Api.Http;
using XFood.Application.Common;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Application.Modules.Donations;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Listings;
using XFood.Api.Modules.Identity;

namespace XFood.Api.Modules.Listings;

public static class ListingEndpoints
{
    public static IEndpointRouteBuilder MapListingEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/listings", GetActiveAsync)
            .WithName("GetActiveListings")
            .WithTags("Listings")
            .Produces<IReadOnlyList<ListingResponse>>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest);

        api.MapGet("/listings/donations", GetDonationsAsync)
            .RequireAuthorization(AuthorizationPolicies.Organization)
            .WithName("GetActiveDonationListings")
            .WithTags("Listings")
            .Produces<IReadOnlyList<ListingResponse>>()
            .Produces<ApiError>(StatusCodes.Status403Forbidden);

        api.MapPost("/listings/donations", CreateDonationAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("CreateDonationListing")
            .WithTags("Listings")
            .Produces<ListingResponse>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound);

        api.MapPatch("/listings/{listingId:guid}", UpdateAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("UpdateListing")
            .WithTags("Listings")
            .Produces<ListingResponse>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict);

        api.MapPost("/listings/{listingId:guid}/fitness", ChangeFitnessAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("ChangeListingFitness")
            .WithTags("Listings")
            .Produces<ListingResponse>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict);

        api.MapPost("/listings/{listingId:guid}/stock-adjustments", AdjustStockAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("AdjustListingStock")
            .WithTags("Listings")
            .Produces<ListingResponse>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict);

        api.MapPost("/listings/{listingId:guid}/stock-transfers", TransferStockAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("TransferListingStock")
            .WithTags("Listings")
            .Produces<StockTransferResponse>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict);

        api.MapPost("/listings/{listingId:guid}/deactivate", DeactivateAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("DeactivateListing")
            .WithTags("Listings")
            .Produces<ListingResponse>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound)
            .Produces<ApiError>(StatusCodes.Status409Conflict);

        api.MapPost("/listings", CreateSaleAsync)
            .RequireAuthorization(AuthorizationPolicies.Establishment)
            .WithName("CreateSaleListing")
            .WithTags("Listings")
            .Produces<ListingResponse>(StatusCodes.Status201Created)
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status403Forbidden)
            .Produces<ApiError>(StatusCodes.Status404NotFound);

        return api;
    }

    private static Task<IResult> ChangeFitnessAsync(
        Guid listingId,
        ChangeListingFitnessRequest request,
        ClaimsPrincipal user,
        IManageListingFitnessService listings,
        HttpContext http,
        CancellationToken cancellationToken) =>
        ExecuteFitnessMutationAsync(user, http, cancellationToken, userId => listings.ChangeAsync(listingId, request, userId, cancellationToken));

    private static async Task<IResult> ExecuteFitnessMutationAsync(
        ClaimsPrincipal user,
        HttpContext http,
        CancellationToken cancellationToken,
        Func<Guid, Task<ListingResponse>> operation)
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
        catch (FitnessChangeValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
        catch (ListingForbiddenException)
        {
            return Results.Json(new ApiError(ErrorCodes.Forbidden, "No tiene permiso para realizar esta operación.", http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }
        catch (ListingNotFoundException exception)
        {
            return Results.Json(new ApiError(ErrorCodes.NotFound, exception.Message, http.TraceIdentifier), statusCode: StatusCodes.Status404NotFound);
        }
        catch (ListingConcurrencyException)
        {
            return Results.Json(new ApiError("CONCURRENCY_CONFLICT", "La publicación cambió mientras se procesaba la solicitud.", http.TraceIdentifier), statusCode: StatusCodes.Status409Conflict);
        }
        catch (ListingInvalidOperationException exception)
        {
            return Results.Json(new ApiError(ErrorCodes.ValidationError, exception.Message, http.TraceIdentifier), statusCode: StatusCodes.Status400BadRequest);
        }
    }

    private static async Task<IResult> CreateSaleAsync(
        CreateListingRequest request,
        ClaimsPrincipal user,
        ICreateListingService listings,
        HttpContext http,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return AppError.Validation(new Dictionary<string, string[]>
            {
                ["user"] = ["La sesión no contiene un identificador válido."],
            }).ToResult(http);

        try
        {
            var listing = await listings.CreateAsync(request, userId, cancellationToken);
            return Results.Created($"/api/v1/listings/{listing.Id}", listing);
        }
        catch (ListingValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
        catch (ListingForbiddenException)
        {
            return Results.Json(new ApiError(ErrorCodes.Forbidden, "No tiene permiso para realizar esta operación.", http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }
        catch (ListingNotFoundException exception)
        {
            return Results.Json(new ApiError(ErrorCodes.NotFound, exception.Message, http.TraceIdentifier), statusCode: StatusCodes.Status404NotFound);
        }
    }

    private static async Task<IResult> CreateDonationAsync(
        CreateDonationListingRequest request,
        ClaimsPrincipal user,
        ICreateDonationListingService listings,
        HttpContext http,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return AppError.Validation(new Dictionary<string, string[]>
            {
                ["user"] = ["La sesión no contiene un identificador válido."],
            }).ToResult(http);

        try
        {
            var listing = await listings.CreateAsync(request, userId, cancellationToken);
            return Results.Created($"/api/v1/listings/{listing.Id}", listing);
        }
        catch (ListingValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
        catch (ListingForbiddenException)
        {
            return Results.Json(new ApiError(
                ErrorCodes.Forbidden,
                "No tiene permiso para realizar esta operación.",
                http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }
        catch (ListingNotFoundException exception)
        {
            return Results.Json(new ApiError(
                ErrorCodes.NotFound,
                exception.Message,
                http.TraceIdentifier), statusCode: StatusCodes.Status404NotFound);
        }
    }

    private static async Task<IResult> GetActiveAsync(
        DateTimeOffset? asOfUtc,
        TimeProvider timeProvider,
        IActiveListingsQueryService listings,
        HttpContext http,
        CancellationToken cancellationToken)
    {
        if (asOfUtc.HasValue && asOfUtc.Value.Offset != TimeSpan.Zero)
        {
            return AppError.Validation(new Dictionary<string, string[]>
            {
                ["asOfUtc"] = ["La fecha de evaluación debe expresarse en UTC."],
            }).ToResult(http);
        }

        var evaluationTime = asOfUtc.HasValue
            ? MaxUtc(asOfUtc.Value, timeProvider.GetUtcNow())
            : timeProvider.GetUtcNow();
        var result = await listings.GetActiveAsync(ListingMode.Sale, evaluationTime, cancellationToken);
        return Results.Ok(result);
    }

    private static async Task<IResult> GetDonationsAsync(
        DateTimeOffset? asOfUtc,
        TimeProvider timeProvider,
        IOrganizationOnboarding organizations,
        ClaimsPrincipal user,
        IActiveListingsQueryService listings,
        HttpContext http,
        CancellationToken cancellationToken)
    {
        if (asOfUtc.HasValue && asOfUtc.Value.Offset != TimeSpan.Zero)
            return AppError.Validation(new Dictionary<string, string[]>
            {
                ["asOfUtc"] = ["La fecha de evaluación debe expresarse en UTC."],
            }).ToResult(http);

        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId)
            || await organizations.FindActiveMembershipAsync(userId, cancellationToken) is not { VerificationStatus: VerificationStatus.Approved })
        {
            return Results.Json(new ApiError(
                ErrorCodes.Forbidden,
                "La organización debe estar verificada.",
                http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }

        var nowUtc = timeProvider.GetUtcNow();
        var evaluationTime = asOfUtc.HasValue ? MaxUtc(asOfUtc.Value, nowUtc) : nowUtc;
        var result = await listings.GetActiveAsync(ListingMode.Donation, evaluationTime, cancellationToken);
        return Results.Ok(result);
    }

    private static DateTimeOffset MaxUtc(DateTimeOffset requested, DateTimeOffset now) =>
        requested >= now ? requested : now;

    private static Task<IResult> UpdateAsync(
        Guid listingId,
        UpdateListingRequest request,
        ClaimsPrincipal user,
        IManageListingService listings,
        HttpContext http,
        CancellationToken cancellationToken) =>
        ExecuteMutationAsync(user, http, cancellationToken, userId => listings.UpdateAsync(listingId, request, userId, cancellationToken));

    private static Task<IResult> DeactivateAsync(
        Guid listingId,
        DeactivateListingRequest request,
        ClaimsPrincipal user,
        IManageListingService listings,
        HttpContext http,
        CancellationToken cancellationToken) =>
        ExecuteMutationAsync(user, http, cancellationToken, userId => listings.DeactivateAsync(listingId, request, userId, cancellationToken));

    private static Task<IResult> AdjustStockAsync(
        Guid listingId,
        AdjustListingStockRequest request,
        ClaimsPrincipal user,
        IManageListingStockService listings,
        HttpContext http,
        CancellationToken cancellationToken) =>
        ExecuteMutationAsync(user, http, cancellationToken, userId => listings.AdjustAsync(listingId, request, userId, cancellationToken));

    private static async Task<IResult> TransferStockAsync(
        Guid listingId,
        TransferListingStockRequest request,
        ClaimsPrincipal user,
        IManageListingStockService listings,
        HttpContext http,
        CancellationToken cancellationToken)
    {
        if (!Guid.TryParse(user.FindFirstValue(ClaimTypes.NameIdentifier), out var userId))
            return AppError.Validation(new Dictionary<string, string[]>
            {
                ["user"] = ["La sesión no contiene un identificador válido."],
            }).ToResult(http);

        try
        {
            var result = await listings.TransferAsync(listingId, request, userId, cancellationToken);
            return Results.Ok(new StockTransferResponse(result.Source, result.Destination));
        }
        catch (StockManagementValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
        catch (ListingForbiddenException)
        {
            return Results.Json(new ApiError(ErrorCodes.Forbidden, "No tiene permiso para realizar esta operación.", http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }
        catch (ListingNotFoundException exception)
        {
            return Results.Json(new ApiError(ErrorCodes.NotFound, exception.Message, http.TraceIdentifier), statusCode: StatusCodes.Status404NotFound);
        }
        catch (ListingConcurrencyException)
        {
            return Results.Json(new ApiError("CONCURRENCY_CONFLICT", "La publicación cambió mientras se procesaba la solicitud.", http.TraceIdentifier), statusCode: StatusCodes.Status409Conflict);
        }
        catch (ListingInvalidOperationException exception)
        {
            return Results.Json(new ApiError(ErrorCodes.ValidationError, exception.Message, http.TraceIdentifier), statusCode: StatusCodes.Status400BadRequest);
        }
    }

    private static async Task<IResult> ExecuteMutationAsync(
        ClaimsPrincipal user,
        HttpContext http,
        CancellationToken cancellationToken,
        Func<Guid, Task<ListingResponse>> operation)
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
        catch (ListingValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
        catch (ListingForbiddenException)
        {
            return Results.Json(new ApiError(ErrorCodes.Forbidden, "No tiene permiso para realizar esta operación.", http.TraceIdentifier), statusCode: StatusCodes.Status403Forbidden);
        }
        catch (ListingNotFoundException exception)
        {
            return Results.Json(new ApiError(ErrorCodes.NotFound, exception.Message, http.TraceIdentifier), statusCode: StatusCodes.Status404NotFound);
        }
        catch (ListingConcurrencyException)
        {
            return Results.Json(new ApiError("CONCURRENCY_CONFLICT", "La publicación cambió mientras se procesaba la solicitud.", http.TraceIdentifier), statusCode: StatusCodes.Status409Conflict);
        }
        catch (ListingInvalidOperationException exception)
        {
            return Results.Json(new ApiError(ErrorCodes.ValidationError, exception.Message, http.TraceIdentifier), statusCode: StatusCodes.Status400BadRequest);
        }
        catch (StockManagementValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
    }

    public sealed record StockTransferResponse(ListingResponse Source, ListingResponse Destination);
}
