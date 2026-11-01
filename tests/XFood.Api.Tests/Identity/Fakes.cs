using XFood.Application.Common;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;

namespace XFood.Api.Tests.Identity;

/// <summary>In-memory account store: one known account per email, with its password and status.</summary>
internal sealed class FakeAccountStore : IAccountStore
{
    private readonly Dictionary<string, (string Password, AccountSummary Account)> accounts = new(StringComparer.OrdinalIgnoreCase);
    private readonly HashSet<string> lockedOut = new(StringComparer.OrdinalIgnoreCase);

    public List<NewAccount> Created { get; } = [];
    public int CredentialChecks { get; private set; }

    public FakeAccountStore WithAccount(string email, string password, string role, AccountStatus status = AccountStatus.Active)
    {
        accounts[email] = (password, new AccountSummary(Guid.NewGuid(), email, "Usuario de prueba", role, status, null));
        return this;
    }

    public FakeAccountStore LockedOut(string email)
    {
        lockedOut.Add(email);
        return this;
    }

    public Task<Result<AccountSummary>> CreateAsync(NewAccount account, CancellationToken cancellationToken)
    {
        Created.Add(account);
        var summary = new AccountSummary(Guid.NewGuid(), account.Email, account.DisplayName, account.Role, AccountStatus.Active, null);
        return Task.FromResult(Result<AccountSummary>.Success(summary));
    }

    public Task<CredentialCheck> CheckCredentialsAsync(string email, string password, CancellationToken cancellationToken)
    {
        CredentialChecks++;
        if (lockedOut.Contains(email))
            return Task.FromResult(new CredentialCheck(CredentialCheckOutcome.LockedOut, null));
        return Task.FromResult(accounts.TryGetValue(email, out var entry) && entry.Password == password
            ? new CredentialCheck(CredentialCheckOutcome.Valid, entry.Account)
            : new CredentialCheck(CredentialCheckOutcome.Invalid, null));
    }

    public Task<AccountSummary?> FindAsync(Guid userId, CancellationToken cancellationToken) =>
        Task.FromResult(accounts.Values.Select(entry => entry.Account).FirstOrDefault(account => account.UserId == userId));
}

internal sealed class FakeSessionManager : ISessionManager
{
    public List<Guid> SignedIn { get; } = [];
    public int SignOuts { get; private set; }

    public Task SignInAsync(Guid userId, CancellationToken cancellationToken)
    {
        SignedIn.Add(userId);
        return Task.CompletedTask;
    }

    public Task SignOutAsync(CancellationToken cancellationToken)
    {
        SignOuts++;
        return Task.CompletedTask;
    }
}
