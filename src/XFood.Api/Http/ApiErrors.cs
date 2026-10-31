using System.Diagnostics;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Diagnostics;
using XFood.Application.Common;

namespace XFood.Api.Http;

/// <summary>Uniform error body: { code, message, traceId, errors? }.</summary>
public sealed record ApiError(
    string Code,
    string Message,
    string TraceId,
    [property: JsonIgnore(Condition = JsonIgnoreCondition.WhenWritingNull)] IReadOnlyDictionary<string, string[]>? Errors = null);

public static class ApiErrors
{
    public static IResult ToResult(this AppError error, HttpContext http) =>
        Results.Json(Create(http, error.Code, error.Message, error.Errors), statusCode: StatusFor(error.Code));

    public static Task WriteAsync(HttpContext http, int status, string code, string message)
    {
        http.Response.StatusCode = status;
        return http.Response.WriteAsJsonAsync(Create(http, code, message));
    }

    public static int StatusFor(string code) => code switch
    {
        ErrorCodes.ValidationError => StatusCodes.Status400BadRequest,
        ErrorCodes.Unauthenticated or ErrorCodes.InvalidCredentials => StatusCodes.Status401Unauthorized,
        ErrorCodes.Forbidden or ErrorCodes.AccountSuspended => StatusCodes.Status403Forbidden,
        ErrorCodes.NotFound => StatusCodes.Status404NotFound,
        _ => StatusCodes.Status500InternalServerError,
    };

    /// <summary>Gives framework-generated errors (bad JSON, 401/403/404, unhandled exceptions) the uniform body.</summary>
    public static IServiceCollection AddApiErrors(this IServiceCollection services) =>
        services.Configure<RouteHandlerOptions>(options => options.ThrowOnBadRequest = true);

    public static WebApplication UseApiErrors(this WebApplication app)
    {
        app.UseExceptionHandler(new ExceptionHandlerOptions
        {
            ExceptionHandler = http =>
            {
                var exception = http.Features.Get<IExceptionHandlerFeature>()?.Error;
                return exception is BadHttpRequestException badRequest
                    ? WriteAsync(http, badRequest.StatusCode, CodeFor(badRequest.StatusCode), "La solicitud no tiene un formato válido.")
                    : WriteAsync(http, StatusCodes.Status500InternalServerError, "INTERNAL_ERROR", "Ocurrió un error inesperado.");
            },
        });
        app.UseStatusCodePages(context =>
            WriteAsync(context.HttpContext, context.HttpContext.Response.StatusCode,
                CodeFor(context.HttpContext.Response.StatusCode), MessageFor(context.HttpContext.Response.StatusCode)));
        return app;
    }

    private static ApiError Create(HttpContext http, string code, string message, IReadOnlyDictionary<string, string[]>? errors = null) =>
        new(code, message, Activity.Current?.Id ?? http.TraceIdentifier, errors);

    private static string CodeFor(int status) => status switch
    {
        400 => ErrorCodes.ValidationError,
        401 => ErrorCodes.Unauthenticated,
        403 => ErrorCodes.Forbidden,
        404 => ErrorCodes.NotFound,
        405 => "METHOD_NOT_ALLOWED",
        415 => "UNSUPPORTED_MEDIA_TYPE",
        429 => "RATE_LIMITED",
        _ => "INTERNAL_ERROR",
    };

    private static string MessageFor(int status) => status switch
    {
        401 => "Debe iniciar sesión.",
        403 => "No tiene permiso para realizar esta operación.",
        404 => "El recurso no existe.",
        405 => "Método HTTP no permitido.",
        415 => "El cuerpo debe enviarse como application/json.",
        429 => "Demasiadas solicitudes. Intente más tarde.",
        < 500 => "La solicitud no es válida.",
        _ => "Ocurrió un error inesperado.",
    };
}
