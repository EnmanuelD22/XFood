namespace XFood.Domain.Modules.Notifications;

public enum NotificationKind
{
    ReservationCreated = 1, ReservationCancelled = 2, ReservationExpired = 3, ReservationDelivered = 4,
    DonationAccepted = 5, DonationCancelled = 6, DonationExpired = 7, DonationReceived = 8,
    OrganizationReviewed = 9, ListingExpiring = 10
}
public enum DeliveryChannel { Email = 1, Push = 2 }
public enum OutboxStatus { Pending = 1, Processing = 2, Sent = 3, Failed = 4 }
public enum DeliveryAttemptOutcome { Started = 1, Succeeded = 2, Failed = 3 }
public enum MobilePlatform { Android = 1, Ios = 2 }

public sealed class Notification
{
    public Guid Id { get; set; }
    public Guid RecipientUserId { get; set; }
    public NotificationKind Kind { get; set; }
    public string EventKey { get; set; } = null!;
    public string Subject { get; set; } = null!;
    public string Body { get; set; } = null!;
    public Guid? ReservationId { get; set; }
    public Guid? DonationAcceptanceId { get; set; }
    public Guid? OrganizationReviewId { get; set; }
    public Guid? ListingExpiryAlertId { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset? ReadAtUtc { get; set; }
}

/// <summary>A durable delivery job created with the business transaction; dispatch is implemented later.</summary>
public sealed class NotificationOutboxMessage
{
    public Guid Id { get; set; }
    public Guid NotificationId { get; set; }
    public Guid RecipientUserId { get; set; }
    public Guid? DeviceRegistrationId { get; set; }
    public DeliveryChannel Channel { get; set; }
    public string? Destination { get; set; }
    public OutboxStatus Status { get; set; } = OutboxStatus.Pending;
    public int AttemptCount { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public DateTimeOffset AvailableAtUtc { get; set; }
    public Guid? LeaseId { get; set; }
    public DateTimeOffset? LeaseExpiresAtUtc { get; set; }
    public DateTimeOffset? SentAtUtc { get; set; }
    public string? LastError { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class NotificationDeliveryAttempt
{
    public Guid Id { get; set; }
    public Guid OutboxMessageId { get; set; }
    public int AttemptNumber { get; set; }
    public DeliveryAttemptOutcome Outcome { get; set; } = DeliveryAttemptOutcome.Started;
    public DateTimeOffset StartedAtUtc { get; set; }
    public DateTimeOffset? FinishedAtUtc { get; set; }
    public string? Error { get; set; }
    public string? ProviderMessageId { get; set; }
}

public sealed class ListingExpiryAlert
{
    public Guid Id { get; set; }
    public Guid ListingId { get; set; }
    public int ThresholdMinutes { get; set; }
    public int AvailableQuantitySnapshot { get; set; }
    public DateTimeOffset DeadlineSnapshotUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
}

/// <summary>One registration period. Revocation preserves history; account/token changes create a new row.</summary>
public sealed class DeviceRegistration
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public Guid InstallationId { get; set; }
    public MobilePlatform Platform { get; set; }
    public string Provider { get; set; } = null!;
    // The future push adapter must encrypt the token before persistence; encryption is not implemented here.
    public string ProtectedPushToken { get; set; } = null!;
    public string TokenHash { get; set; } = null!;
    public DateTimeOffset RegisteredAtUtc { get; set; }
    public DateTimeOffset RefreshedAtUtc { get; set; }
    public DateTimeOffset? RevokedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}
