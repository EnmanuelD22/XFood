using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings.Services;

/// <summary>
/// Public stock boundary for Reservations and Donations. Listings alone mutates listing quantities.
/// The caller must persist its operation in the same unit of work/transaction when available.
/// </summary>
public interface IListingInventoryService
{
    Task<ListingInventoryAllocationResult> AllocateAsync(
        Guid listingId,
        AllocateListingUnitsRequest request,
        CancellationToken cancellationToken = default);

    Task<ListingInventoryReleaseResult> ReleaseAsync(
        Guid listingId,
        ReleaseListingUnitsRequest request,
        CancellationToken cancellationToken = default);
}

public sealed record ListingInventoryAllocationResult(
    Guid ListingId,
    Guid OperationId,
    int Quantity,
    int AvailableQuantity,
    int AssignedQuantity);

public sealed record ListingInventoryReleaseResult(
    Guid ListingId,
    Guid OperationId,
    int Quantity,
    int AvailableQuantity,
    int AssignedQuantity,
    bool AlreadyReleased);
