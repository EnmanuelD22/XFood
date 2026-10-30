namespace XFood.Domain.Modules.Donations;

public enum VerificationStatus { Pending = 1, Approved = 2, Rejected = 3, Suspended = 4 }
public enum OrganizationMemberRole { Administrator = 1, Operator = 2 }
public enum DonationAcceptanceStatus { Accepted = 1, Received = 2, Cancelled = 3, Expired = 4 }

public sealed class Organization
{
    public Guid Id { get; set; }
    public string Name { get; set; } = null!;
    public string ContactName { get; set; } = null!;
    public string ContactEmail { get; set; } = null!;
    public string ContactPhone { get; set; } = null!;
    public string Address { get; set; } = null!;
    public string? VerificationInformation { get; set; }
    public VerificationStatus VerificationStatus { get; set; } = VerificationStatus.Pending;
    public Guid CreatedByUserId { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class OrganizationMember
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid UserId { get; set; }
    public OrganizationMemberRole Role { get; set; }
    public bool IsPrimary { get; set; }
    public DateTimeOffset JoinedAtUtc { get; set; }
    public DateTimeOffset? RevokedAtUtc { get; set; }
    public Guid GrantedByUserId { get; set; }
    public Guid? RevokedByUserId { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class OrganizationReview
{
    public Guid Id { get; set; }
    public Guid OrganizationId { get; set; }
    public VerificationStatus FromStatus { get; set; }
    public VerificationStatus ToStatus { get; set; }
    public Guid ReviewerUserId { get; set; }
    public string Reason { get; set; } = null!;
    public string NameSnapshot { get; set; } = null!;
    public string ContactNameSnapshot { get; set; } = null!;
    public string ContactEmailSnapshot { get; set; } = null!;
    public string ContactPhoneSnapshot { get; set; } = null!;
    public string AddressSnapshot { get; set; } = null!;
    public string? VerificationInformationSnapshot { get; set; }
    public DateTimeOffset ReviewedAtUtc { get; set; }
}

public sealed class DonationAcceptance
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public Guid OrganizationId { get; set; }
    public Guid AcceptedByUserId { get; set; }
    public int Quantity { get; set; }
    public string ListingTitleSnapshot { get; set; } = null!;
    public string PickupAddressSnapshot { get; set; } = null!;
    public string PickupInstructionsSnapshot { get; set; } = null!;
    public string TimeZoneIdSnapshot { get; set; } = null!;
    public DateTimeOffset PickupStartsAtUtc { get; set; }
    public DateTimeOffset PickupDeadlineUtc { get; set; }
    public string IdempotencyKey { get; set; } = null!;
    public string RequestHash { get; set; } = null!;
    public DonationAcceptanceStatus Status { get; set; } = DonationAcceptanceStatus.Accepted;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? ClosedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class DonationAcceptanceStatusChange
{
    public Guid Id { get; set; }
    public Guid DonationAcceptanceId { get; set; }
    public DonationAcceptanceStatus? FromStatus { get; set; }
    public DonationAcceptanceStatus ToStatus { get; set; }
    public Guid? ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}

/// <summary>Optional establishment confirmation; it does not count as receipt by the organization.</summary>
public sealed class DonationHandover
{
    public Guid DonationAcceptanceId { get; set; }
    public Guid ConfirmedByUserId { get; set; }
    public DateTimeOffset HandedOverAtUtc { get; set; }
    public string? Notes { get; set; }
}

public sealed class DonationReceipt
{
    public Guid DonationAcceptanceId { get; set; }
    public Guid ReceivedByUserId { get; set; }
    public DateTimeOffset ReceivedAtUtc { get; set; }
    public string? Notes { get; set; }
}
