using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

/// <summary>
/// Public consumer search (HU-02). List and detail apply the same availability rules: Sale, Active,
/// units available, fit, deadline after the evaluation time and enabled establishment.
/// </summary>
public interface IListingSearchService
{
    /// <exception cref="ListingValidationException">Invalid point or radius.</exception>
    Task<IReadOnlyList<ListingSummaryResponse>> SearchAsync(
        ListingSearchCriteria criteria,
        CancellationToken cancellationToken = default);

    /// <summary>The listing if it is currently available to the public; otherwise null.</summary>
    /// <exception cref="ListingValidationException">Invalid point.</exception>
    Task<ListingSummaryResponse?> FindAvailableAsync(
        Guid listingId,
        decimal? latitude,
        decimal? longitude,
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default);

    ListingSearchOptionsResponse GetOptions();
}
