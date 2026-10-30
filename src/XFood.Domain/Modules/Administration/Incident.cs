namespace XFood.Domain.Modules.Administration;

public enum IncidentStatus { Open = 1, InReview = 2, Resolved = 3, Dismissed = 4 }
public enum IncidentKind { General = 1, PartialPickup = 2, LatePickup = 3 }

public sealed class Incident
{
    public Guid Id { get; set; }
    public Guid ReporterUserId { get; set; }
    public Guid? AssignedToUserId { get; set; }
    public Guid? ListingId { get; set; }
    public Guid? ReservationId { get; set; }
    public Guid? DonationAcceptanceId { get; set; }
    public IncidentKind Kind { get; set; } = IncidentKind.General;
    public int? ActualQuantity { get; set; }
    public DateTimeOffset? ObservedAtUtc { get; set; }
    public string Title { get; set; } = null!;
    public string Description { get; set; } = null!;
    public IncidentStatus Status { get; set; } = IncidentStatus.Open;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? ClosedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class IncidentStatusChange
{
    public Guid Id { get; set; }
    public Guid IncidentId { get; set; }
    public IncidentStatus? FromStatus { get; set; }
    public IncidentStatus ToStatus { get; set; }
    public Guid ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}
