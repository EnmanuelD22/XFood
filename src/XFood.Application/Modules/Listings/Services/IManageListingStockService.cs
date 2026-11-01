using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings.Services;

public interface IManageListingStockService
{
    Task<ListingResponse> AdjustAsync(
        Guid listingId,
        AdjustListingStockRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default);

    Task<(ListingResponse Source, ListingResponse Destination)> TransferAsync(
        Guid sourceListingId,
        TransferListingStockRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default);
}
