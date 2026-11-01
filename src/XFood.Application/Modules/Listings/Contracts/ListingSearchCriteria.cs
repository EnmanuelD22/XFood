namespace XFood.Application.Modules.Listings.Contracts;

/// <summary>
/// Public sale search. Without a point it lists every available sale; with a point it keeps only
/// listings within <see cref="RadiusKm"/> (the configured default when omitted). Validated by the server.
/// </summary>
public sealed record ListingSearchCriteria(
    decimal? Latitude,
    decimal? Longitude,
    decimal? RadiusKm,
    DateTimeOffset AsOfUtc);

/// <summary>Configured search values the web client must offer instead of hard-coding them.</summary>
public sealed record ListingSearchOptionsResponse(
    IReadOnlyList<decimal> RadiiKm,
    decimal DefaultRadiusKm,
    int MaxResults);
