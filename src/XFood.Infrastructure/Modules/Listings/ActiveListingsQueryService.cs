using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ActiveListingsQueryService(XFoodDbContext db) : IActiveListingsQueryService
{
    public async Task<IReadOnlyList<ListingResponse>> GetActiveAsync(
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default)
    {
        return await db.Set<Listing>()
            .AsNoTracking()
            .Where(listing => listing.Status == ListingStatus.Active
                && listing.AvailableQuantity > 0
                && listing.IsFoodFit
                && listing.PickupDeadlineUtc > asOfUtc)
            .OrderBy(listing => listing.PickupDeadlineUtc)
            .ThenBy(listing => listing.Id)
            .Select(listing => new ListingResponse
            {
                Id = listing.Id,
                EstablishmentId = listing.EstablishmentId,
                CategoryId = listing.CategoryId,
                Title = listing.Title,
                Description = listing.Description,
                Mode = listing.Mode,
                Status = listing.Status,
                InitialQuantity = listing.InitialQuantity,
                AvailableQuantity = listing.AvailableQuantity,
                OriginalUnitPrice = listing.OriginalUnitPrice,
                DiscountedUnitPrice = listing.DiscountedUnitPrice,
                Currency = listing.Currency,
                PickupInstructions = listing.PickupInstructions,
                PaymentInstructions = listing.PaymentInstructions,
                FoodSafetyDeclared = listing.FoodSafetyDeclared,
                IsFoodFit = listing.IsFoodFit,
                PickupStartsAtUtc = listing.PickupStartsAtUtc,
                PickupDeadlineUtc = listing.PickupDeadlineUtc,
                CreatedAtUtc = listing.CreatedAtUtc,
            })
            .ToListAsync(cancellationToken);
    }
}
