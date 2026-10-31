namespace XFood.Application.Common;

/// <summary>Stable error codes shared with clients; HTTP status mapping lives in the API.</summary>
public static class ErrorCodes
{
    public const string ValidationError = "VALIDATION_ERROR";
    public const string Unauthenticated = "UNAUTHENTICATED";
    public const string InvalidCredentials = "INVALID_CREDENTIALS";
    public const string AccountSuspended = "ACCOUNT_SUSPENDED";
    public const string Forbidden = "FORBIDDEN";
    public const string NotFound = "NOT_FOUND";
}

public sealed record AppError(string Code, string Message, IReadOnlyDictionary<string, string[]>? Errors = null)
{
    public static AppError Validation(IReadOnlyDictionary<string, string[]> errors) =>
        new(ErrorCodes.ValidationError, "La solicitud contiene datos inválidos.", errors);
}

public sealed class Result<T>
{
    private Result(T? value, AppError? error) => (Value, Error) = (value, error);

    public T? Value { get; }
    public AppError? Error { get; }
    public bool IsSuccess => Error is null;

    public static Result<T> Success(T value) => new(value, null);
    public static Result<T> Failure(AppError error) => new(default, error);

    public static implicit operator Result<T>(AppError error) => Failure(error);
}
