using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ManageListingService(
    XFoodDbContext db,
    IEstablishmentOnboarding establishments,
    TimeProvider clock) : IManageListingService
{
    public async Task<ListingResponse> UpdateAsync(
        Guid listingId,
        UpdateListingRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        var listing = await LoadAuthorizedListingAsync(listingId, actorUserId, cancellationToken);
        var nowUtc = clock.GetUtcNow();
        var validationErrors = ManageListingValidator.ValidateUpdate(listing, request, nowUtc);
        if (validationErrors.Count > 0)
            throw new ListingValidationException(validationErrors);

        if (!await db.Set<Category>().AnyAsync(category => category.Id == request.CategoryId && category.IsActive, cancellationToken))
            throw new ListingNotFoundException("La categoría no existe.");

        var committed = listing.AssignedQuantity + listing.FulfilledQuantity + listing.WrittenOffQuantity + listing.TransferredOutQuantity;
        var availableDelta = request.InitialQuantity - listing.InitialQuantity;
        if (listing.AvailableQuantity + availableDelta < 0 || request.InitialQuantity < committed)
            throw new ListingInvalidOperationException("La cantidad no puede reducir las unidades comprometidas o entregadas.");

        var before = ListingSnapshot(listing);

        listing.CategoryId = request.CategoryId;
        listing.Title = request.Title.Trim();
        listing.Description = request.Description.Trim();
        listing.InitialQuantity = request.InitialQuantity;
        listing.AvailableQuantity += availableDelta;
        listing.PickupInstructions = request.PickupInstructions.Trim();
        listing.PickupStartsAtUtc = request.PickupStartsAtUtc;
        listing.PickupDeadlineUtc = request.PickupDeadlineUtc;
        listing.OriginalUnitPrice = request.OriginalUnitPrice;
        listing.DiscountedUnitPrice = request.DiscountedUnitPrice;
        listing.PaymentInstructions = string.IsNullOrWhiteSpace(request.PaymentInstructions) ? null : request.PaymentInstructions.Trim();

        db.Add(new ListingRevision
        {
            Id = Guid.CreateVersion7(),
            ListingId = listingId,
            ActorUserId = actorUserId,
            OccurredAtUtc = nowUtc,
            BeforeJson = before,
            AfterJson = ListingSnapshot(listing),
        });

        await SaveWithTransactionAsync(cancellationToken);
        return ToResponse(listing);
    }

    public async Task<ListingResponse> DeactivateAsync(
        Guid listingId,
        DeactivateListingRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        var validationErrors = ManageListingValidator.ValidateDeactivation(request);
        if (validationErrors.Count > 0)
            throw new ListingValidationException(validationErrors);

        var listing = await LoadAuthorizedListingAsync(listingId, actorUserId, cancellationToken);
        if (listing.Status is not (ListingStatus.Active or ListingStatus.Exhausted))
            throw new ListingInvalidOperationException("La publicación no puede desactivarse desde su estado actual.");

        var fromStatus = listing.Status;
        var occurredAtUtc = clock.GetUtcNow();
        listing.Status = ListingStatus.Deactivated;
        db.Add(new ListingStatusChange
        {
            Id = Guid.CreateVersion7(),
            ListingId = listing.Id,
            FromStatus = fromStatus,
            ToStatus = ListingStatus.Deactivated,
            ActorUserId = actorUserId,
            Reason = request.Reason.Trim(),
            OccurredAtUtc = occurredAtUtc,
        });

        await SaveWithTransactionAsync(cancellationToken);
        return ToResponse(listing);
    }

    private async Task<Listing> LoadAuthorizedListingAsync(Guid listingId, Guid actorUserId, CancellationToken cancellationToken)
    {
        var listing = await db.Set<Listing>().SingleOrDefaultAsync(item => item.Id == listingId, cancellationToken)
            ?? throw new ListingNotFoundException("La publicación no existe.");
        var membership = await establishments.FindActiveMembershipAsync(actorUserId, listing.EstablishmentId, cancellationToken);
        if (membership is null || membership.Status != EstablishmentStatus.Active)
            throw new ListingForbiddenException();
        return listing;
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

    private static string ListingSnapshot(Listing value) => JsonSerializer.Serialize(new
    {
        value.CategoryId, value.Title, value.Description, value.InitialQuantity,
        value.AvailableQuantity, value.PickupInstructions, value.PickupStartsAtUtc,
        value.PickupDeadlineUtc, value.OriginalUnitPrice, value.DiscountedUnitPrice,
        value.PaymentInstructions,
    });
}
