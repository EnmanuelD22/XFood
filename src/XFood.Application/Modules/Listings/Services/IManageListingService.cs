using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

public interface IManageListingService
{
    Task<ListingResponse> UpdateAsync(
        Guid listingId,
        UpdateListingRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default);

    Task<ListingResponse> DeactivateAsync(
        Guid listingId,
        DeactivateListingRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default);
}
