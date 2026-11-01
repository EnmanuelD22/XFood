using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings.Services;

public interface IActiveListingsQueryService
{
    Task<IReadOnlyList<ListingResponse>> GetActiveAsync(
        ListingMode mode,
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default);
}
