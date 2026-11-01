namespace XFood.Application.Modules.Listings;

public sealed class ListingInventoryValidationException(IReadOnlyDictionary<string, string[]> errors) : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; } = errors;
}

public sealed class ListingInventoryConflictException(string message) : Exception(message);
