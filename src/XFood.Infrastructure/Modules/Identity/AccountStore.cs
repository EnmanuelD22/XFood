using Microsoft.AspNetCore.Identity;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using XFood.Application.Common;
using XFood.Application.Modules.Donations;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Identity;

internal sealed class AccountStore(
    XFoodDbContext db,
    UserManager<IdentityUser<Guid>> users,
    RoleManager<IdentityRole<Guid>> roles,
    IOrganizationOnboarding organizations,
    TimeProvider clock) : IAccountStore
{
    private static readonly IdentityUser<Guid> TimingUser = new();
    private static string? timingHash;

    public async Task<Result<AccountSummary>> CreateAsync(NewAccount account, CancellationToken cancellationToken)
    {
        await EnsureRoleAsync(account.Role);

        // UserManager saves on each call; the explicit transaction makes user, role, profile and
        // organization a single commit, so a failure never leaves a half-registered account.
        await using var transaction = await db.Database.BeginTransactionAsync(cancellationToken);
        var now = clock.GetUtcNow();
        var user = new IdentityUser<Guid> { Id = Guid.CreateVersion7(), UserName = account.Email, Email = account.Email };

        IdentityResult created;
        try
        {
            created = await users.CreateAsync(user, account.Password);
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            // A concurrent registration with the same email won the race against the validator.
            return DuplicateEmail();
        }
        if (!created.Succeeded)
            return ToValidationError(created.Errors);

        var addedToRole = await users.AddToRoleAsync(user, account.Role);
        if (!addedToRole.Succeeded)
            throw new InvalidOperationException($"Could not assign role {account.Role}: {string.Join("; ", addedToRole.Errors.Select(e => e.Code))}");

        db.Add(new AccountProfile { UserId = user.Id, DisplayName = account.DisplayName, Status = AccountStatus.Active, CreatedAtUtc = now });
        db.Add(new AccountStatusChange
        {
            Id = Guid.CreateVersion7(),
            UserId = user.Id,
            FromStatus = null,
            ToStatus = AccountStatus.Active,
            ActorUserId = user.Id,
            Reason = "Registro público de cuenta.",
            OccurredAtUtc = now,
        });

        OrganizationSummary? organization = null;
        if (account.Organization is { } data)
        {
            var staged = organizations.StagePendingOrganization(new PendingOrganization(
                user.Id, data.Name, account.DisplayName, account.Email, data.ContactPhone, data.Address,
                data.VerificationInformation, now));
            organization = new OrganizationSummary(staged.OrganizationId, staged.Name, staged.VerificationStatus);
        }

        await db.SaveChangesAsync(cancellationToken);
        await transaction.CommitAsync(cancellationToken);

        return Result<AccountSummary>.Success(new AccountSummary(
            user.Id, account.Email, account.DisplayName, account.Role, AccountStatus.Active, organization));
    }

    public async Task<CredentialCheck> CheckCredentialsAsync(string email, string password, CancellationToken cancellationToken)
    {
        var user = await users.FindByEmailAsync(email);
        if (user is null)
        {
            // Spend the same hashing time as a real check so response timing does not reveal unknown emails.
            timingHash ??= users.PasswordHasher.HashPassword(TimingUser, Guid.NewGuid().ToString());
            users.PasswordHasher.VerifyHashedPassword(TimingUser, timingHash, password);
            return new CredentialCheck(CredentialCheckOutcome.Invalid, null);
        }

        if (await users.IsLockedOutAsync(user))
            return new CredentialCheck(CredentialCheckOutcome.LockedOut, null);

        if (!await users.CheckPasswordAsync(user, password))
        {
            await users.AccessFailedAsync(user);
            return new CredentialCheck(
                await users.IsLockedOutAsync(user) ? CredentialCheckOutcome.LockedOut : CredentialCheckOutcome.Invalid, null);
        }

        await users.ResetAccessFailedCountAsync(user);
        var account = await FindAsync(user.Id, cancellationToken);
        return account is null
            ? new CredentialCheck(CredentialCheckOutcome.Invalid, null)
            : new CredentialCheck(CredentialCheckOutcome.Valid, account);
    }

    public async Task<AccountSummary?> FindAsync(Guid userId, CancellationToken cancellationToken)
    {
        var account = await (
            from user in db.Users
            join profile in db.Set<AccountProfile>() on user.Id equals profile.UserId
            where user.Id == userId
            select new { user.Id, user.Email, profile.DisplayName, profile.Status })
            .AsNoTracking().SingleOrDefaultAsync(cancellationToken);
        if (account is null)
            return null;

        var role = await (
            from userRole in db.UserRoles
            join identityRole in db.Roles on userRole.RoleId equals identityRole.Id
            where userRole.UserId == userId
            orderby identityRole.Name
            select identityRole.Name)
            .FirstOrDefaultAsync(cancellationToken) ?? "";

        OrganizationSummary? organization = null;
        if (role == AccountRoles.Organization
            && await organizations.FindActiveMembershipAsync(userId, cancellationToken) is { } membership)
        {
            organization = new OrganizationSummary(membership.OrganizationId, membership.Name, membership.VerificationStatus);
        }

        return new AccountSummary(account.Id, account.Email!, account.DisplayName, role, account.Status, organization);
    }

    private async Task EnsureRoleAsync(string role)
    {
        // Roles are created on first use: no business roles are seeded by the migrations.
        if (await roles.RoleExistsAsync(role))
            return;
        try
        {
            await roles.CreateAsync(new IdentityRole<Guid>(role) { Id = Guid.CreateVersion7() });
        }
        catch (DbUpdateException exception) when (IsUniqueViolation(exception))
        {
            // Another registration created it concurrently; drop the failed insert from the tracker.
            db.ChangeTracker.Clear();
        }
    }

    private static Result<AccountSummary> ToValidationError(IEnumerable<IdentityError> identityErrors)
    {
        var errors = identityErrors.ToList();
        if (errors.Any(e => e.Code is nameof(IdentityErrorDescriber.DuplicateEmail) or nameof(IdentityErrorDescriber.DuplicateUserName)))
            return DuplicateEmail();

        return AppError.Validation(errors
            .GroupBy(e => e.Code.StartsWith("Password", StringComparison.Ordinal) ? "password" : "email")
            .ToDictionary(g => g.Key, g => g.Select(e => e.Description).Distinct().ToArray()));
    }

    private static Result<AccountSummary> DuplicateEmail() =>
        AppError.Validation(new Dictionary<string, string[]> { ["email"] = ["El correo ya está registrado."] });

    private static bool IsUniqueViolation(DbUpdateException exception) =>
        exception.InnerException is SqlException { Number: 2601 or 2627 };
}
