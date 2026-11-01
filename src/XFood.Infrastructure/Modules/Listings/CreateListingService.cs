using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class CreateListingService(
    XFoodDbContext db,
    IEstablishmentOnboarding establishments,
    TimeProvider clock) : ICreateListingService
{
    public async Task<ListingResponse> CreateAsync(
        CreateListingRequest request,
        Guid createdByUserId,
        CancellationToken cancellationToken = default)
    {
        var createdAtUtc = clock.GetUtcNow();
        var validationErrors = CreateListingValidator.Validate(request, createdAtUtc);
        if (validationErrors.Count > 0)
            throw new ListingValidationException(validationErrors);

        var membership = await establishments.FindActiveMembershipAsync(
            createdByUserId, request.EstablishmentId, cancellationToken);
        if (membership is null || membership.Status != EstablishmentStatus.Active)
            throw new ListingForbiddenException();

        if (!await db.Set<Category>().AnyAsync(category => category.Id == request.CategoryId && category.IsActive, cancellationToken))
            throw new ListingNotFoundException("La categoría no existe.");

        var transaction = db.Database.IsRelational()
            ? await db.Database.BeginTransactionAsync(cancellationToken)
            : null;
        try
        {
            var listing = new Listing
            {
                Id = Guid.CreateVersion7(),
                EstablishmentId = request.EstablishmentId,
                CreatedByUserId = createdByUserId,
                CategoryId = request.CategoryId,
                Title = request.Title.Trim(),
                Description = request.Description.Trim(),
                Mode = ListingMode.Sale,
                Status = ListingStatus.Active,
                InitialQuantity = request.InitialQuantity,
                AvailableQuantity = request.InitialQuantity,
                OriginalUnitPrice = request.OriginalUnitPrice,
                DiscountedUnitPrice = request.DiscountedUnitPrice,
                Currency = "DOP",
                PickupInstructions = request.PickupInstructions.Trim(),
                PaymentInstructions = request.PaymentInstructions.Trim(),
                FoodSafetyDeclared = request.FoodSafetyDeclared!.Value,
                IsFoodFit = true,
                PickupStartsAtUtc = request.PickupStartsAtUtc,
                PickupDeadlineUtc = request.PickupDeadlineUtc,
                CreatedAtUtc = createdAtUtc,
            };

            db.Add(listing);
            db.Add(new ListingStatusChange
            {
                Id = Guid.CreateVersion7(),
                ListingId = listing.Id,
                FromStatus = null,
                ToStatus = ListingStatus.Active,
                ActorUserId = createdByUserId,
                Reason = "Creación de la publicación.",
                OccurredAtUtc = createdAtUtc,
            });

            await db.SaveChangesAsync(cancellationToken);
            if (transaction is not null)
                await transaction.CommitAsync(cancellationToken);

            return ToResponse(listing);
        }
        finally
        {
            if (transaction is not null)
                await transaction.DisposeAsync();
        }
    }

    private static ListingResponse ToResponse(Listing listing) => new()
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
    };
}
