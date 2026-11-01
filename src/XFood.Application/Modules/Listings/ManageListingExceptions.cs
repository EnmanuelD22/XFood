namespace XFood.Application.Modules.Listings;

public sealed class ListingConcurrencyException : Exception;

public sealed class ListingInvalidOperationException(string message) : Exception(message);
