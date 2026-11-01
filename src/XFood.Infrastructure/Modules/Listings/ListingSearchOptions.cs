namespace XFood.Infrastructure.Modules.Listings;

/// <summary>Consumer search limits approved for HU-02; values come from configuration, not code.</summary>
public sealed class ListingSearchOptions
{
    public const string SectionName = "Listings:Search";

    /// <summary>Allowed radii in km. Left empty here so configuration does not append to a default list.</summary>
    public decimal[] AllowedRadiiKm { get; set; } = [];

    public decimal DefaultRadiusKm { get; set; } = 3;

    public int MaxResults { get; set; } = 100;

    public int DefaultPageSize { get; set; } = 20;

    internal bool IsValid() =>
        AllowedRadiiKm.Length > 0
        && AllowedRadiiKm.All(radius => radius > 0)
        && AllowedRadiiKm.Distinct().Count() == AllowedRadiiKm.Length
        && AllowedRadiiKm.Contains(DefaultRadiusKm)
        && MaxResults is > 0 and < int.MaxValue
        && DefaultPageSize > 0 && DefaultPageSize <= MaxResults;
}
