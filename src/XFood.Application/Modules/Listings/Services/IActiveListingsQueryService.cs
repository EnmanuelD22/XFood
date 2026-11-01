using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

public interface IActiveListingsQueryService
{
    Task<IReadOnlyList<ListingResponse>> GetActiveAsync(
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default);
}
