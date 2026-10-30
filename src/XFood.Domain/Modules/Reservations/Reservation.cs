namespace XFood.Domain.Modules.Reservations;

public enum ReservationStatus { Reserved = 1, Delivered = 2, Cancelled = 3, Expired = 4 }

public sealed class Reservation
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public Guid ConsumerUserId { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public string Currency { get; set; } = "DOP";
    public string ListingTitleSnapshot { get; set; } = null!;
    public string PickupAddressSnapshot { get; set; } = null!;
    public string PickupInstructionsSnapshot { get; set; } = null!;
    public string PaymentInstructionsSnapshot { get; set; } = null!;
    public string TimeZoneIdSnapshot { get; set; } = null!;
    public DateTimeOffset PickupStartsAtUtc { get; set; }
    public DateTimeOffset PickupDeadlineUtc { get; set; }
    public string PickupReference { get; set; } = null!;
    public string IdempotencyKey { get; set; } = null!;
    public string RequestHash { get; set; } = null!;
    public ReservationStatus Status { get; set; } = ReservationStatus.Reserved;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? ClosedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class ReservationStatusChange
{
    public Guid Id { get; set; }
    public Guid ReservationId { get; set; }
    public ReservationStatus? FromStatus { get; set; }
    public ReservationStatus ToStatus { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}

/// <summary>Full pickup of one reservation. Partial fulfillment is not part of the v1 model.</summary>
public sealed class ReservationDelivery
{
    public Guid ReservationId { get; set; }
    public Guid ConfirmedByUserId { get; set; }
    public DateTimeOffset DeliveredAtUtc { get; set; }
    public string? Notes { get; set; }
}
