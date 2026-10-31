using XFood.Application.Common;
using XFood.Domain.Modules.Identity;

namespace XFood.Application.Modules.Identity;

/// <summary>Registration, login, logout and current-account use cases (HU-04).</summary>
public sealed class AccountUseCases(IAccountStore accounts, ISessionManager sessions)
{
    /// <summary>Same message for unknown email, wrong password and lockout, so accounts cannot be enumerated.</summary>
    public static readonly AppError InvalidCredentials =
        new(ErrorCodes.InvalidCredentials, "Correo o contraseña incorrectos.");

    public static readonly AppError Suspended =
        new(ErrorCodes.AccountSuspended, "La cuenta está suspendida. Contacte al administrador.");

    public async Task<Result<AccountSummary>> RegisterAsync(RegisterAccountCommand command, CancellationToken cancellationToken)
    {
        var (account, errors) = RegisterAccountValidator.Validate(command);
        if (account is null)
            return AppError.Validation(errors);

        return await accounts.CreateAsync(account, cancellationToken);
    }

    public async Task<Result<AccountSummary>> LoginAsync(LoginCommand command, CancellationToken cancellationToken)
    {
        var email = command.Email?.Trim();
        if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(command.Password))
            return InvalidCredentials;

        var check = await accounts.CheckCredentialsAsync(email, command.Password, cancellationToken);
        if (check.Outcome != CredentialCheckOutcome.Valid || check.Account is null)
            return InvalidCredentials;

        if (check.Account.Status == AccountStatus.Suspended)
            return Suspended;

        await sessions.SignInAsync(check.Account.UserId, cancellationToken);
        return Result<AccountSummary>.Success(check.Account);
    }

    public Task LogoutAsync(CancellationToken cancellationToken) => sessions.SignOutAsync(cancellationToken);

    public async Task<Result<AccountSummary>> GetCurrentAsync(Guid userId, CancellationToken cancellationToken)
    {
        var account = await accounts.FindAsync(userId, cancellationToken);
        if (account is null)
            return new AppError(ErrorCodes.Unauthenticated, "La sesión no es válida. Inicie sesión de nuevo.");

        return account.Status == AccountStatus.Suspended ? Suspended : Result<AccountSummary>.Success(account);
    }
}
