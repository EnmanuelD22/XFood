using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ManageListingStockService(
    XFoodDbContext db,
    IEstablishmentOnboarding establishments,
    TimeProvider clock) : IManageListingStockService
{
    public async Task<ListingResponse> AdjustAsync(
        Guid listingId,
        AdjustListingStockRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        var validationErrors = StockManagementValidator.ValidateAdjustment(request);
        if (validationErrors.Count > 0)
            throw new StockManagementValidationException(validationErrors);

        var listing = await LoadAuthorizedListingAsync(listingId, actorUserId, cancellationToken);
        var nowUtc = clock.GetUtcNow();
        if (listing.Status == ListingStatus.Deactivated
            || listing.Status == ListingStatus.Expired && request.Kind != StockAdjustmentKind.Expiry)
            throw new ListingInvalidOperationException("La publicación no admite ajustes desde su estado actual.");

        if (request.Kind == StockAdjustmentKind.Increase)
        {
            if (listing.Status is not (ListingStatus.Active or ListingStatus.Exhausted) || listing.PickupDeadlineUtc <= nowUtc)
                throw new ListingInvalidOperationException("Solo se puede aumentar una publicación activa y vigente.");

            listing.AddedQuantity = checked(listing.AddedQuantity + request.Quantity);
            listing.AvailableQuantity = checked(listing.AvailableQuantity + request.Quantity);
            if (listing.AvailableQuantity > 0 && listing.Status == ListingStatus.Exhausted)
                AddStatusChange(listing, ListingStatus.Active, actorUserId, nowUtc, "Reactivación por ajuste de inventario.");
        }
        else
        {
            if (listing.AvailableQuantity < request.Quantity)
                throw new ListingInvalidOperationException("El ajuste no puede retirar unidades comprometidas o no disponibles.");

            listing.AvailableQuantity -= request.Quantity;
            listing.WrittenOffQuantity = checked(listing.WrittenOffQuantity + request.Quantity);
            if (listing.AvailableQuantity == 0 && listing.Status == ListingStatus.Active)
                AddStatusChange(listing, ListingStatus.Exhausted, actorUserId, nowUtc, request.Reason);
        }

        db.Add(new StockAdjustment
        {
            Id = Guid.CreateVersion7(),
            ListingId = listing.Id,
            Kind = request.Kind,
            Quantity = request.Quantity,
            ActorUserId = actorUserId,
            Reason = request.Reason.Trim(),
            OccurredAtUtc = nowUtc,
        });

        await SaveWithTransactionAsync(cancellationToken);
        return ToResponse(listing);
    }

    public async Task<(ListingResponse Source, ListingResponse Destination)> TransferAsync(
        Guid sourceListingId,
        TransferListingStockRequest request,
        Guid actorUserId,
        CancellationToken cancellationToken = default)
    {
        var validationErrors = StockManagementValidator.ValidateTransfer(request);
        if (validationErrors.Count > 0)
            throw new StockManagementValidationException(validationErrors);

        if (sourceListingId == request.DestinationListingId)
            throw new ListingInvalidOperationException("La publicación origen y destino deben ser diferentes.");

        var listings = await db.Set<Listing>()
            .Where(item => item.Id == sourceListingId || item.Id == request.DestinationListingId)
            .ToListAsync(cancellationToken);
        var source = listings.SingleOrDefault(item => item.Id == sourceListingId)
            ?? throw new ListingNotFoundException("La publicación origen no existe.");
        var destination = listings.SingleOrDefault(item => item.Id == request.DestinationListingId)
            ?? throw new ListingNotFoundException("La publicación destino no existe.");

        var membership = await establishments.FindActiveMembershipAsync(actorUserId, source.EstablishmentId, cancellationToken);
        if (membership is null || membership.Status != EstablishmentStatus.Active)
            throw new ListingForbiddenException();

        var nowUtc = clock.GetUtcNow();
        if (source.EstablishmentId != destination.EstablishmentId)
            throw new ListingInvalidOperationException("Las publicaciones deben pertenecer al mismo establecimiento.");
        if (source.Status != ListingStatus.Active || destination.Status != ListingStatus.Active
            || source.PickupDeadlineUtc <= nowUtc || destination.PickupDeadlineUtc <= nowUtc)
            throw new ListingInvalidOperationException("Las publicaciones deben estar activas y vigentes.");
        if (!source.IsFoodFit || !destination.IsFoodFit)
            throw new ListingInvalidOperationException("Las publicaciones deben contener unidades aptas.");
        if (source.AvailableQuantity < request.Quantity)
            throw new ListingInvalidOperationException("No se pueden transferir unidades comprometidas o no disponibles.");

        source.AvailableQuantity -= request.Quantity;
        source.TransferredOutQuantity = checked(source.TransferredOutQuantity + request.Quantity);
        destination.AvailableQuantity = checked(destination.AvailableQuantity + request.Quantity);
        destination.TransferredInQuantity = checked(destination.TransferredInQuantity + request.Quantity);
        if (source.AvailableQuantity == 0)
            AddStatusChange(source, ListingStatus.Exhausted, actorUserId, nowUtc, request.Reason);

        db.Add(new StockTransfer
        {
            Id = Guid.CreateVersion7(),
            EstablishmentId = source.EstablishmentId,
            SourceListingId = source.Id,
            SourceMode = source.Mode,
            DestinationListingId = destination.Id,
            DestinationMode = destination.Mode,
            Quantity = request.Quantity,
            ActorUserId = actorUserId,
            Reason = request.Reason.Trim(),
            OccurredAtUtc = nowUtc,
        });

        await SaveWithTransactionAsync(cancellationToken);
        return (ToResponse(source), ToResponse(destination));
    }

    private void AddStatusChange(Listing listing, ListingStatus toStatus, Guid actorUserId, DateTimeOffset occurredAtUtc, string reason)
    {
        var fromStatus = listing.Status;
        listing.Status = toStatus;
        db.Add(new ListingStatusChange
        {
            Id = Guid.CreateVersion7(),
            ListingId = listing.Id,
            FromStatus = fromStatus,
            ToStatus = toStatus,
            ActorUserId = actorUserId,
            Reason = reason.Trim(),
            OccurredAtUtc = occurredAtUtc,
        });
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
}
