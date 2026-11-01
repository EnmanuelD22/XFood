using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

public interface ICreateListingService
{
    Task<ListingResponse> CreateAsync(
        CreateListingRequest request,
        Guid createdByUserId,
        CancellationToken cancellationToken = default);
}
