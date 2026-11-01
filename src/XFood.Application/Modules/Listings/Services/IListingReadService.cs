using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

public interface IListingReadService
{
    Task<IReadOnlyList<ListingResponse>> GetForEstablishmentAsync(
        Guid establishmentId, Guid userId, CancellationToken cancellationToken = default);

    Task<IReadOnlyList<CategoryResponse>> GetActiveCategoriesAsync(CancellationToken cancellationToken = default);
}
