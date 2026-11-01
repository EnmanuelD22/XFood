using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ManageListingFitnessService(
    XFoodDbContext db,
    IEstablishmentOnboarding establishments,
    TimeProvider clock) : IManageListingFitnessService
{
    public async Task<ListingResponse> ChangeAsync(
        Guid listingId,
        ChangeListingFitnessRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        var validationErrors = FitnessChangeValidator.Validate(request);
        if (validationErrors.Count > 0)
            throw new FitnessChangeValidationException(validationErrors);

        var listing = await db.Set<Listing>().SingleOrDefaultAsync(item => item.Id == listingId, cancellationToken)
            ?? throw new ListingNotFoundException("La publicación no existe.");
        var membership = await establishments.FindActiveMembershipAsync(actorUserId, listing.EstablishmentId, cancellationToken);
        if (membership is null || membership.Status != EstablishmentStatus.Active)
            throw new ListingForbiddenException();
        if (listing.Status == ListingStatus.Deactivated)
            throw new ListingInvalidOperationException("La publicación desactivada no admite cambios de aptitud.");
        if (listing.IsFoodFit == request.IsFoodFit)
            throw new ListingInvalidOperationException("La publicación ya tiene la aptitud indicada.");

        var occurredAtUtc = clock.GetUtcNow();
        var fromIsFoodFit = listing.IsFoodFit;
        listing.IsFoodFit = request.IsFoodFit;
        db.Add(new ListingFitnessChange
        {
            Id = Guid.CreateVersion7(),
            ListingId = listing.Id,
            FromIsFoodFit = fromIsFoodFit,
            ToIsFoodFit = request.IsFoodFit,
            ActorUserId = actorUserId,
            Reason = request.Reason.Trim(),
            OccurredAtUtc = occurredAtUtc,
        });

        await SaveWithTransactionAsync(cancellationToken);
        return ToResponse(listing);
    }

    private async Task SaveWithTransactionAsync(CancellationToken cancellationToken)
    {
        var transaction = db.Database.IsRelational()
            ? await db.Database.BeginTransactionAsync(cancellationToken)
            : null;
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            if (transaction is not null)
                await transaction.CommitAsync(cancellationToken);
        }
        catch (DbUpdateConcurrencyException)
        {
            throw new ListingConcurrencyException();
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
