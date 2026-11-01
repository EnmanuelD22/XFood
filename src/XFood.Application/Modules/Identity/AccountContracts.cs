using XFood.Application.Common;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Identity;

namespace XFood.Application.Modules.Identity;

public sealed record RegisterAccountCommand(
    string? Email,
    string? Password,
    string? DisplayName,
    string? Role,
    RegisterOrganizationData? Organization,
    RegisterEstablishmentData? Establishment = null);

public sealed record RegisterOrganizationData(
    string? Name,
    string? ContactPhone,
    string? Address,
    string? VerificationInformation);

/// <summary>Coordinates are nullable so that a missing value is reported instead of defaulting to 0.</summary>
public sealed record RegisterEstablishmentData(
    string? Name,
    string? ContactPhone,
    string? Address,
    decimal? Latitude,
    decimal? Longitude,
    string? TimeZoneId = null,
    string? ContactName = null,
    string? ContactEmail = null);

public sealed record LoginCommand(string? Email, string? Password);

/// <summary>Validated data handed to the account store; it never contains an administrator role.</summary>
public sealed record NewAccount(
    string Email,
    string Password,
    string DisplayName,
    string Role,
    NewOrganization? Organization,
    NewEstablishment? Establishment = null);

public sealed record NewOrganization(string Name, string ContactPhone, string Address, string? VerificationInformation);

/// <summary>Contact name and email are already resolved (defaulted from the account when omitted).</summary>
public sealed record NewEstablishment(
    string Name,
    string ContactName,
    string ContactEmail,
    string ContactPhone,
    string Address,
    decimal Latitude,
    decimal Longitude,
    string TimeZoneId);

public sealed record AccountSummary(
    Guid UserId,
    string Email,
    string DisplayName,
    string Role,
    AccountStatus Status,
    OrganizationSummary? Organization,
    IReadOnlyList<EstablishmentSummary>? Establishments = null);

public sealed record OrganizationSummary(Guid Id, string Name, VerificationStatus VerificationStatus);

public sealed record EstablishmentSummary(Guid Id, string Name, EstablishmentStatus Status, EstablishmentMemberRole MemberRole, bool IsPrimary);

public enum CredentialCheckOutcome { Valid = 1, Invalid = 2, LockedOut = 3 }

public sealed record CredentialCheck(CredentialCheckOutcome Outcome, AccountSummary? Account);

/// <summary>Persistence port for accounts, implemented with ASP.NET Core Identity.</summary>
public interface IAccountStore
{
    /// <summary>Creates user, role, profile and (for organizations) a pending organization atomically.</summary>
    Task<Result<AccountSummary>> CreateAsync(NewAccount account, CancellationToken cancellationToken);

    Task<CredentialCheck> CheckCredentialsAsync(string email, string password, CancellationToken cancellationToken);

    Task<AccountSummary?> FindAsync(Guid userId, CancellationToken cancellationToken);
}

/// <summary>Session port; the web implementation issues an HttpOnly cookie.</summary>
public interface ISessionManager
{
    Task SignInAsync(Guid userId, CancellationToken cancellationToken);

    /// <summary>Ends the current session and revokes every cookie already issued to the user.</summary>
    Task SignOutAsync(CancellationToken cancellationToken);
}
