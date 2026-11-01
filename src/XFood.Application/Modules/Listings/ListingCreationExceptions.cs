namespace XFood.Application.Modules.Listings;

public sealed class ListingValidationException(IReadOnlyDictionary<string, string[]> errors) : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; } = errors;
}

public sealed class ListingForbiddenException : Exception;

public sealed class ListingNotFoundException(string message) : Exception(message);