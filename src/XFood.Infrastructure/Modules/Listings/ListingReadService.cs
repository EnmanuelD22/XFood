using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ListingReadService(XFoodDbContext db, IEstablishmentOnboarding establishments) : IListingReadService
{
    public async Task<IReadOnlyList<ListingResponse>> GetForEstablishmentAsync(
        Guid establishmentId, Guid userId, CancellationToken cancellationToken = default)
    {
        var membership = await establishments.FindActiveMembershipAsync(userId, establishmentId, cancellationToken);
        if (membership is null || membership.Status != EstablishmentStatus.Active)
            throw new ListingForbiddenException();

        return await db.Set<Listing>().AsNoTracking()
            .Where(item => item.EstablishmentId == establishmentId)
            .OrderByDescending(item => item.CreatedAtUtc).ThenBy(item => item.Id)
            .Select(item => new ListingResponse
            {
                Id = item.Id, EstablishmentId = item.EstablishmentId, CategoryId = item.CategoryId,
                Title = item.Title, Description = item.Description, Mode = item.Mode, Status = item.Status,
                InitialQuantity = item.InitialQuantity, AvailableQuantity = item.AvailableQuantity,
                OriginalUnitPrice = item.OriginalUnitPrice, DiscountedUnitPrice = item.DiscountedUnitPrice,
                Currency = item.Currency, PickupInstructions = item.PickupInstructions,
                PaymentInstructions = item.PaymentInstructions, FoodSafetyDeclared = item.FoodSafetyDeclared,
                IsFoodFit = item.IsFoodFit, PickupStartsAtUtc = item.PickupStartsAtUtc,
                PickupDeadlineUtc = item.PickupDeadlineUtc, CreatedAtUtc = item.CreatedAtUtc,
            }).ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<CategoryResponse>> GetActiveCategoriesAsync(CancellationToken cancellationToken = default) =>
        await db.Set<Category>().AsNoTracking().Where(item => item.IsActive)
            .OrderBy(item => item.Name).ThenBy(item => item.Id)
            .Select(item => new CategoryResponse(item.Id, item.Name))
            .ToListAsync(cancellationToken);
}
