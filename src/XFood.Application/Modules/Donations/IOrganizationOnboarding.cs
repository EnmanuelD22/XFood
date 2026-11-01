using XFood.Domain.Modules.Donations;

namespace XFood.Application.Modules.Donations;

/// <summary>
/// Public Donations contract used by account registration. Staged changes are committed by the
/// caller's unit of work, so the organization and its primary member are saved with the account.
/// </summary>
public interface IOrganizationOnboarding
{
    OrganizationMembershipSummary StagePendingOrganization(PendingOrganization organization);

    Task<OrganizationMembershipSummary?> FindActiveMembershipAsync(Guid userId, CancellationToken cancellationToken);
}

public sealed record PendingOrganization(
    Guid OwnerUserId,
    string Name,
    string ContactName,
    string ContactEmail,
    string ContactPhone,
    string Address,
    string? VerificationInformation,
    DateTimeOffset CreatedAtUtc);

public sealed record OrganizationMembershipSummary(Guid OrganizationId, string Name, VerificationStatus VerificationStatus);
