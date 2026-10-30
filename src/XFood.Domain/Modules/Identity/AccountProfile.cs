namespace XFood.Domain.Modules.Identity;

public enum AccountStatus { Active = 1, Suspended = 2 }

/// <summary>Application profile only; authentication credentials and roles remain in Identity.</summary>
public sealed class AccountProfile
{
    public Guid UserId { get; set; }
    public string DisplayName { get; set; } = null!;
    public AccountStatus Status { get; set; } = AccountStatus.Active;
    public DateTimeOffset CreatedAtUtc { get; set; }
    public byte[] RowVersion { get; set; } = [];
}

public sealed class AccountStatusChange
{
    public Guid Id { get; set; }
    public Guid UserId { get; set; }
    public AccountStatus? FromStatus { get; set; }
    public AccountStatus ToStatus { get; set; }
    public Guid ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
    public DateTimeOffset OccurredAtUtc { get; set; }
}
