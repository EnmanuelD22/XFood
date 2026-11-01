using System.ComponentModel;
using System.Security.Claims;
using System.Text.Json.Nodes;
using Microsoft.AspNetCore.OpenApi;
using Microsoft.Extensions.Options;
using Microsoft.OpenApi;
using XFood.Api.Http;
using XFood.Application.Common;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Application.Modules.Donations;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Listings;
using XFood.Api.Modules.Identity;
using XFood.Infrastructure.Modules.Listings;

namespace XFood.Api.Modules.Listings;

public static class ListingEndpoints
{
    public static IEndpointRouteBuilder MapListingEndpoints(this IEndpointRouteBuilder api)
    {
        api.MapGet("/listings", GetActiveAsync)
            .WithName("GetActiveListings")
            .WithTags("Listings")
            .WithSummary("Busca ventas disponibles, opcionalmente cerca de un punto.")
            .WithDescription(
                "Público. Devuelve ventas activas, aptas, con unidades, con fecha límite posterior al reloj del servidor " +
                "y de establecimientos habilitados. Sin latitude/longitude: orden por fecha límite. Con ellas: solo " +
                "resultados dentro de radiusKm (distancia geográfica en línea recta calculada por el servidor; si se omite, " +
                "el radio por defecto) ordenados por distancia, fecha límite e id. page inicia en 1; pageSize " +
                "tiene un valor por defecto y un máximo configurables. La respuesta conserva el arreglo JSON y " +
                "expone X-Page, X-Page-Size y X-Has-Next-Page. Consulte GET /api/v1/listings/search-options.")
            .Produces<IReadOnlyList<ListingSummaryResponse>>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest);

        api.MapGet("/listings/search-options", GetSearchOptions)
            .WithName("GetListingSearchOptions")
            .WithTags("Listings")
            .WithSummary("Radios y límites de paginación configurados para la búsqueda.")
            .Produces<ListingSearchOptionsResponse>();

        api.MapGet("/listings/{listingId:guid}", GetAvailableAsync)
            .WithName("GetAvailableListing")
            .WithTags("Listings")
            .WithSummary("Detalle público de una venta disponible.")
            .WithDescription(
                "Público. Aplica las mismas reglas de disponibilidad que la búsqueda en el momento de la consulta; si la " +
                "venta no está disponible (agotada, desactivada, vencida, no apta, donación o establecimiento no habilitado) " +
                "responde 404. Con latitude/longitude opcionales incluye distanceKm.")
            .Produces<ListingSummaryResponse>()
            .Produces<ApiError>(StatusCodes.Status400BadRequest)
            .Produces<ApiError>(StatusCodes.Status404NotFound);

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
        [Description("Instante UTC de evaluación; nunca anterior al reloj del servidor.")] DateTimeOffset? asOfUtc,
        [Description("Latitud del punto de búsqueda (-90 a 90). Debe enviarse con longitude.")] decimal? latitude,
        [Description("Longitud del punto de búsqueda (-180 a 180). Debe enviarse con latitude.")] decimal? longitude,
        [Description("Radio en km, solo con latitude/longitude. Valores admitidos y defecto: GET /api/v1/listings/search-options.")] decimal? radiusKm,
        [Description("Número de página, desde 1. Por defecto 1.")] int? page,
        [Description("Resultados por página. Por defecto y máximo: GET /api/v1/listings/search-options.")] int? pageSize,
        TimeProvider timeProvider,
        IListingSearchService listings,
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

        try
        {
            var result = await listings.SearchAsync(
                new ListingSearchCriteria(latitude, longitude, radiusKm, evaluationTime, page, pageSize), cancellationToken);
            http.Response.Headers["X-Page"] = result.Page.ToString(System.Globalization.CultureInfo.InvariantCulture);
            http.Response.Headers["X-Page-Size"] = result.PageSize.ToString(System.Globalization.CultureInfo.InvariantCulture);
            http.Response.Headers["X-Has-Next-Page"] = result.HasNextPage ? "true" : "false";
            return Results.Ok(result.Items);
        }
        catch (ListingValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
    }

    private static IResult GetSearchOptions(IListingSearchService listings) => Results.Ok(listings.GetOptions());

    private static async Task<IResult> GetAvailableAsync(
        Guid listingId,
        [Description("Latitud opcional para calcular distanceKm. Debe enviarse con longitude.")] decimal? latitude,
        [Description("Longitud opcional para calcular distanceKm. Debe enviarse con latitude.")] decimal? longitude,
        TimeProvider timeProvider,
        IListingSearchService listings,
        HttpContext http,
        CancellationToken cancellationToken)
    {
        try
        {
            var listing = await listings.FindAvailableAsync(
                listingId, latitude, longitude, timeProvider.GetUtcNow(), cancellationToken);
            return listing is null
                ? Results.Json(new ApiError(ErrorCodes.NotFound, "La publicación no existe o ya no está disponible.", http.TraceIdentifier), statusCode: StatusCodes.Status404NotFound)
                : Results.Ok(listing);
        }
        catch (ListingValidationException exception)
        {
            return AppError.Validation(exception.Errors).ToResult(http);
        }
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

    /// <summary>Publishes the configured radii as the enum and default of radiusKm, so OpenAPI matches server validation.</summary>
    public static OpenApiOptions AddListingSearchDocumentation(this OpenApiOptions options) =>
        options.AddOperationTransformer((operation, context, _) =>
        {
            if (context.Description.ActionDescriptor.EndpointMetadata.OfType<IEndpointNameMetadata>()
                    .FirstOrDefault()?.EndpointName != "GetActiveListings")
                return Task.CompletedTask;

            var search = context.ApplicationServices.GetRequiredService<IOptions<ListingSearchOptions>>().Value;
            var radius = operation.Parameters?.FirstOrDefault(parameter => parameter.Name == "radiusKm");
            if (radius?.Schema is OpenApiSchema schema)
            {
                schema.Enum = [.. search.AllowedRadiiKm.Select(value => JsonValue.Create(value))];
                schema.Default = JsonValue.Create(search.DefaultRadiusKm);
            }

            var page = operation.Parameters?.FirstOrDefault(parameter => parameter.Name == "page");
            if (page?.Schema is OpenApiSchema pageSchema)
            {
                pageSchema.Minimum = "1";
                pageSchema.Default = JsonValue.Create(1);
            }

            var pageSize = operation.Parameters?.FirstOrDefault(parameter => parameter.Name == "pageSize");
            if (pageSize?.Schema is OpenApiSchema pageSizeSchema)
            {
                pageSizeSchema.Minimum = "1";
                pageSizeSchema.Maximum = search.MaxResults.ToString(System.Globalization.CultureInfo.InvariantCulture);
                pageSizeSchema.Default = JsonValue.Create(search.DefaultPageSize);
            }

            return Task.CompletedTask;
        });
}
