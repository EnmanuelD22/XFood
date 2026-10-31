using XFood.Application.Common;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;

namespace XFood.Api.Tests.Identity;

public sealed class RegisterValidationTests
{
    private static readonly RegisterOrganizationData ValidOrganization =
        new("Banco de Alimentos", "+1 809-555-0101", "Calle 1, Santo Domingo", null);

    private readonly FakeAccountStore store = new();

    private AccountUseCases UseCases => new(store, new FakeSessionManager());

    private static RegisterAccountCommand Valid(string role = AccountRoles.Consumer) =>
        new("ana@xfood.test", "Clave#2026", "Ana", role, role == AccountRoles.Organization ? ValidOrganization : null);

    private async Task<IReadOnlyDictionary<string, string[]>> RejectedFieldsAsync(RegisterAccountCommand command)
    {
        var result = await UseCases.RegisterAsync(command, CancellationToken.None);
        Assert.False(result.IsSuccess);
        Assert.Equal(ErrorCodes.ValidationError, result.Error!.Code);
        Assert.Empty(store.Created);
        return result.Error.Errors!;
    }

    [Theory]
    [InlineData(AccountRoles.Consumer)]
    [InlineData(AccountRoles.Establishment)]
    [InlineData(AccountRoles.Organization)]
    public async Task Public_roles_can_register(string role)
    {
        var result = await UseCases.RegisterAsync(Valid(role), CancellationToken.None);

        Assert.True(result.IsSuccess);
        Assert.Equal(role, Assert.Single(store.Created).Role);
    }

    [Theory]
    [InlineData("Administrator")]
    [InlineData("administrator")]
    [InlineData(" ADMINISTRATOR ")]
    public async Task Administrator_accounts_cannot_be_created_by_public_registration(string role)
    {
        var errors = await RejectedFieldsAsync(Valid() with { Role = role });

        Assert.Contains("administrador", Assert.Single(errors["role"]));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("Superuser")]
    [InlineData("A")]
    public async Task Role_must_be_one_of_the_public_roles(string? role)
    {
        var errors = await RejectedFieldsAsync(Valid() with { Role = role });

        Assert.True(errors.ContainsKey("role"));
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("sin-arroba")]
    [InlineData("ana@")]
    [InlineData("ana@dominio")]
    [InlineData("Ana <ana@xfood.test>")]
    public async Task Email_is_required_and_must_have_a_valid_format(string? email)
    {
        var errors = await RejectedFieldsAsync(Valid() with { Email = email });

        Assert.True(errors.ContainsKey("email"));
    }

    [Fact]
    public async Task Password_and_display_name_are_required()
    {
        var errors = await RejectedFieldsAsync(Valid() with { Password = "", DisplayName = "   " });

        Assert.Equal(["displayName", "password"], errors.Keys.Order());
    }

    [Fact]
    public async Task Display_name_longer_than_the_stored_column_is_rejected()
    {
        var errors = await RejectedFieldsAsync(Valid() with { DisplayName = new string('a', 201) });

        Assert.True(errors.ContainsKey("displayName"));
    }

    [Fact]
    public async Task All_invalid_fields_are_reported_together()
    {
        var errors = await RejectedFieldsAsync(new RegisterAccountCommand("x", null, null, "Administrator", null));

        Assert.Equal(["displayName", "email", "password", "role"], errors.Keys.Order());
    }

    [Fact]
    public async Task Organization_role_requires_organization_data()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Organization) with { Organization = null });

        Assert.True(errors.ContainsKey("organization"));
    }

    [Fact]
    public async Task Organization_fields_are_validated()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Organization) with
        {
            Organization = new RegisterOrganizationData(" ", "abc", "", null),
        });

        Assert.Equal(["organization.address", "organization.contactPhone", "organization.name"], errors.Keys.Order());
    }

    [Fact]
    public async Task Organization_data_is_rejected_for_other_roles()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Consumer) with { Organization = ValidOrganization });

        Assert.True(errors.ContainsKey("organization"));
    }

    [Fact]
    public async Task Accepted_values_are_trimmed_and_role_is_normalized()
    {
        var command = new RegisterAccountCommand(" ana@xfood.test ", "Clave#2026", "  Ana  ", "organization",
            new RegisterOrganizationData(" Banco ", " 809-555-0101 ", " Calle 1 ", "  "));

        var result = await UseCases.RegisterAsync(command, CancellationToken.None);

        Assert.True(result.IsSuccess);
        var created = Assert.Single(store.Created);
        Assert.Equal(new NewAccount("ana@xfood.test", "Clave#2026", "Ana", AccountRoles.Organization,
            new NewOrganization("Banco", "809-555-0101", "Calle 1", null)), created);
    }
}
