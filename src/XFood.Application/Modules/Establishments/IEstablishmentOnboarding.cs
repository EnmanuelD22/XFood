using XFood.Domain.Modules.Establishments;

namespace XFood.Application.Modules.Establishments;

/// <summary>
/// Public Establishments contract. Registration stages an establishment with its primary owner in the
/// caller's unit of work; other modules use the membership queries to check ownership and permissions.
/// </summary>
public interface IEstablishmentOnboarding
{
    EstablishmentMembershipSummary StageEstablishment(NewEstablishmentProfile establishment);

    /// <summary>Active (non-revoked) memberships of a user; a user may operate several establishments.</summary>
    Task<IReadOnlyList<EstablishmentMembershipSummary>> ListActiveMembershipsAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>The user's active membership in a specific establishment, or null when the user may not act on it.</summary>
    Task<EstablishmentMembershipSummary?> FindActiveMembershipAsync(Guid userId, Guid establishmentId, CancellationToken cancellationToken);
}

public sealed record NewEstablishmentProfile(
    Guid OwnerUserId,
    string Name,
    string ContactName,
    string ContactEmail,
    string ContactPhone,
    string Address,
    decimal Latitude,
    decimal Longitude,
    string TimeZoneId,
    DateTimeOffset CreatedAtUtc);

public sealed record EstablishmentMembershipSummary(
    Guid EstablishmentId,
    string Name,
    EstablishmentStatus Status,
    EstablishmentMemberRole MemberRole,
    bool IsPrimary);
