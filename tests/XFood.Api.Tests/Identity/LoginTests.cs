using XFood.Application.Common;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;

namespace XFood.Api.Tests.Identity;

public sealed class LoginTests
{
    private readonly FakeAccountStore store = new FakeAccountStore()
        .WithAccount("ana@xfood.test", "Clave#2026", AccountRoles.Consumer)
        .WithAccount("suspendida@xfood.test", "Clave#2026", AccountRoles.Establishment, AccountStatus.Suspended)
        .LockedOut("bloqueada@xfood.test");
    private readonly FakeSessionManager sessions = new();

    private AccountUseCases UseCases => new(store, sessions);

    [Theory]
    [InlineData("nadie@xfood.test", "Clave#2026")]        // unknown email
    [InlineData("ana@xfood.test", "Incorrecta#1")]        // wrong password
    [InlineData("bloqueada@xfood.test", "Clave#2026")]    // locked out after failed attempts
    public async Task Invalid_credentials_return_the_same_generic_error_and_do_not_start_a_session(string email, string password)
    {
        var result = await UseCases.LoginAsync(new LoginCommand(email, password), CancellationToken.None);

        Assert.False(result.IsSuccess);
        Assert.Equal(AccountUseCases.InvalidCredentials, result.Error);
        Assert.Equal(ErrorCodes.InvalidCredentials, result.Error!.Code);
        Assert.Empty(sessions.SignedIn);
    }

    [Theory]
    [InlineData(null, "Clave#2026")]
    [InlineData("ana@xfood.test", null)]
    [InlineData("   ", "")]
    public async Task Missing_credentials_are_rejected_without_querying_the_store(string? email, string? password)
    {
        var result = await UseCases.LoginAsync(new LoginCommand(email, password), CancellationToken.None);

        Assert.Equal(ErrorCodes.InvalidCredentials, result.Error?.Code);
        Assert.Equal(0, store.CredentialChecks);
        Assert.Empty(sessions.SignedIn);
    }

    [Fact]
    public async Task Suspended_account_with_correct_password_cannot_sign_in()
    {
        var result = await UseCases.LoginAsync(new LoginCommand("suspendida@xfood.test", "Clave#2026"), CancellationToken.None);

        Assert.Equal(ErrorCodes.AccountSuspended, result.Error?.Code);
        Assert.Empty(sessions.SignedIn);
    }

    [Fact]
    public async Task Valid_credentials_start_a_session_for_that_account()
    {
        var result = await UseCases.LoginAsync(new LoginCommand(" ana@xfood.test ", "Clave#2026"), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(AccountRoles.Consumer, result.Value!.Role);
        Assert.Equal([result.Value.UserId], sessions.SignedIn);
    }

    [Fact]
    public async Task Logout_clears_the_session()
    {
        await UseCases.LogoutAsync(CancellationToken.None);

        Assert.Equal(1, sessions.SignOuts);
    }
}
