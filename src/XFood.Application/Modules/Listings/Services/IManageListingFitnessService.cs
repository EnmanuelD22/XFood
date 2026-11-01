using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

public interface IManageListingFitnessService
{
    Task<ListingResponse> ChangeAsync(
        Guid listingId,
        ChangeListingFitnessRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default);
}
