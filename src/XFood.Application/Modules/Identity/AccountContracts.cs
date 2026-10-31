using XFood.Application.Common;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Identity;

namespace XFood.Application.Modules.Identity;

public sealed record RegisterAccountCommand(
    string? Email,
    string? Password,
    string? DisplayName,
    string? Role,
    RegisterOrganizationData? Organization);

public sealed record RegisterOrganizationData(
    string? Name,
    string? ContactPhone,
    string? Address,
    string? VerificationInformation);

public sealed record LoginCommand(string? Email, string? Password);

/// <summary>Validated data handed to the account store; it never contains an administrator role.</summary>
public sealed record NewAccount(
    string Email,
    string Password,
    string DisplayName,
    string Role,
    NewOrganization? Organization);

public sealed record NewOrganization(string Name, string ContactPhone, string Address, string? VerificationInformation);

public sealed record AccountSummary(
    Guid UserId,
    string Email,
    string DisplayName,
    string Role,
    AccountStatus Status,
    OrganizationSummary? Organization);

public sealed record OrganizationSummary(Guid Id, string Name, VerificationStatus VerificationStatus);

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

    Task SignOutAsync(CancellationToken cancellationToken);
}
