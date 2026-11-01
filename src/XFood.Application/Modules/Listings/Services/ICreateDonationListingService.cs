using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

public interface ICreateDonationListingService
{
    Task<ListingResponse> CreateAsync(
        CreateDonationListingRequest request,
        Guid createdByUserId,
        CancellationToken cancellationToken = default);
}
