namespace XFood.Domain.Modules.Establishments;

public enum EstablishmentStatus { Active = 1, Inactive = 2, Suspended = 3 }
public enum EstablishmentMemberRole { Owner = 1, Operator = 2 }

public sealed class Establishment
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string ContactName { get; set; } = null!;
    public string ContactEmail { get; set; } = null!;
    public string ContactPhone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string TimeZoneId { get; set; } = null!;
    public EstablishmentStatus Status { get; set; } = EstablishmentStatus.Active;
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class EstablishmentMember
{
    public Guid Id { get; set; }
    public Guid EstablishmentId { get; set; }
    public Guid UserId { get; set; }
    public EstablishmentMemberRole Role { get; set; }
    public bool IsPrimary { get; set; }
    public DateTimeOffset JoinedAtUtc { get; set; }
    public DateTimeOffset? RevokedAtUtc { get; set; }
    public Guid GrantedByUserId { get; set; }
    public Guid? RevokedByUserId { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class EstablishmentStatusChange
{
    public Guid Id { get; set; }
    public Guid EstablishmentId { get; set; }
    public EstablishmentStatus? FromStatus { get; set; }
    public EstablishmentStatus ToStatus { get; set; }
    public Guid ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}

/// <summary>Immutable before/after profile snapshot, committed with the profile edit.</summary>
public sealed class EstablishmentProfileRevision
{
    public Guid Id { get; set; }
    public Guid EstablishmentId { get; set; }
    public Guid ActorUserId { get; set; }
    public DateTimeOffset OccurredAtUtc { get; set; }
    public string BeforeJson { get; set; } = null!;
    public string AfterJson { get; set; } = null!;
}
