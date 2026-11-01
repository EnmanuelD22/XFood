namespace XFood.Domain.Modules.Listings;

public enum ListingMode { Sale = 1, Donation = 2 }
public enum ListingStatus { Active = 1, Exhausted = 2, Deactivated = 3, Expired = 4 }
public enum StockAdjustmentKind { Increase = 1, Withdrawal = 2, Expiry = 3 }

public sealed class Listing
{
    public Guid Id { get; set; }
    public Guid EstablishmentId { get; set; }
    public Guid CreatedByUserId { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public Guid CategoryId { get; set; }
    public ListingMode Mode { get; set; }
    public ListingStatus Status { get; set; } = ListingStatus.Active;
    public int InitialQuantity { get; set; }
    public int AddedQuantity { get; set; }
    public int TransferredInQuantity { get; set; }
    public int TransferredOutQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public int AssignedQuantity { get; set; }
    public int FulfilledQuantity { get; set; }
    public int WrittenOffQuantity { get; set; }
    public decimal? OriginalUnitPrice { get; set; }
    public decimal? DiscountedUnitPrice { get; set; }
    public string Currency { get; set; } = "DOP";
    public string PickupInstructions { get; set; } = null!;
    public string? PaymentInstructions { get; set; }
    public bool FoodSafetyDeclared { get; set; }
    public bool IsFoodFit { get; set; } = true;
    public DateTimeOffset PickupStartsAtUtc { get; set; }
    public DateTimeOffset PickupDeadlineUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

/// <summary>
/// Increases and written-off units. Withdrawal/Expiry rows are the sole source of lost-unit reports.
/// Allocation, release and fulfillment are recorded by operations and their status history.
/// </summary>
public sealed class StockAdjustment
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public StockAdjustmentKind Kind { get; set; }
    public int Quantity { get; set; }
    public Guid? ReservationId { get; set; }
    public Guid? DonationAcceptanceId { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}

public sealed class ListingStatusChange
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public ListingStatus? FromStatus { get; set; }
    public ListingStatus ToStatus { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}

/// <summary>Immutable before/after snapshot of editable listing details.</summary>
public sealed class ListingRevision
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public Guid ActorUserId { get; set; }
    public DateTimeOffset OccurredAtUtc { get; set; }
    public string BeforeJson { get; set; } = null!;
    public string AfterJson { get; set; } = null!;
}

public sealed class Category
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public bool IsActive { get; set; } = true;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

/// <summary>Movement of uncommitted units between two listings; never a waste/loss adjustment.</summary>
public sealed class StockTransfer
{
    public Guid Id { get; set; }
    public Guid EstablishmentId { get; set; }
    public Guid SourceListingId { get; set; }
    public ListingMode SourceMode { get; set; }
    public Guid DestinationListingId { get; set; }
    public ListingMode DestinationMode { get; set; }
    public int Quantity { get; set; }
    public Guid ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}

public sealed class ListingFitnessChange
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public bool FromIsFoodFit { get; set; }
    public bool ToIsFoodFit { get; set; }
    public Guid ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}
