using XFood.Application.Common;
using XFood.Application.Modules.Identity;
using XFood.Domain.Modules.Identity;

namespace XFood.Api.Tests.Identity;

public sealed class RegisterValidationTests
{
    private static readonly RegisterOrganizationData ValidOrganization =
        new("Banco de Alimentos", "+1 809-555-0101", "Calle 1, Santo Domingo", null);

    private static readonly RegisterEstablishmentData ValidEstablishment =
        new("Panadería Central", "809-555-0102", "Av. Duarte 10, Santo Domingo", 18.4861m, -69.9312m);

    private readonly FakeAccountStore store = new();

    private AccountUseCases UseCases => new(store, new FakeSessionManager());

    private static RegisterAccountCommand Valid(string role = AccountRoles.Consumer) =>
        new("ana@xfood.test", "Clave#2026", "Ana", role,
            role == AccountRoles.Organization ? ValidOrganization : null,
            role == AccountRoles.Establishment ? ValidEstablishment : null);

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

    [Fact]
    public async Task Establishment_role_requires_establishment_data()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Establishment) with { Establishment = null });

        Assert.True(errors.ContainsKey("establishment"));
    }

    [Fact]
    public async Task Establishment_coordinates_are_required_and_never_default_to_zero()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Establishment) with
        {
            Establishment = ValidEstablishment with { Latitude = null, Longitude = null },
        });

        Assert.Equal(["establishment.latitude", "establishment.longitude"], errors.Keys.Order());
    }

    [Theory]
    [InlineData(90.000001, 0)]
    [InlineData(-90.5, 0)]
    [InlineData(0, 180.1)]
    [InlineData(0, -181)]
    public async Task Establishment_coordinates_must_be_in_range(double latitude, double longitude)
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Establishment) with
        {
            Establishment = ValidEstablishment with { Latitude = (decimal)latitude, Longitude = (decimal)longitude },
        });

        Assert.Single(errors);
    }

    [Fact]
    public async Task Establishment_required_fields_are_validated()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Establishment) with
        {
            Establishment = new RegisterEstablishmentData("", "12", " ", 18.5m, -69.9m),
        });

        Assert.Equal(["establishment.address", "establishment.contactPhone", "establishment.name"], errors.Keys.Order());
    }

    [Theory]
    [InlineData("Mars/Olympus_Mons")]
    [InlineData("SA Western Standard Time")]   // Windows id, not IANA
    [InlineData("GMT-4")]
    public async Task Invalid_time_zone_is_rejected(string timeZoneId)
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Establishment) with
        {
            Establishment = ValidEstablishment with { TimeZoneId = timeZoneId },
        });

        Assert.Equal(["establishment.timeZoneId"], errors.Keys);
    }

    [Fact]
    public async Task Invalid_contact_email_is_rejected()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Establishment) with
        {
            Establishment = ValidEstablishment with { ContactEmail = "no-es-correo" },
        });

        Assert.Equal(["establishment.contactEmail"], errors.Keys);
    }

    [Fact]
    public async Task Establishment_defaults_contact_to_the_account_and_time_zone_to_the_pilot_assumption()
    {
        var result = await UseCases.RegisterAsync(Valid(AccountRoles.Establishment), CancellationToken.None);

        Assert.True(result.IsSuccess);
        var establishment = Assert.Single(store.Created).Establishment!;
        Assert.Equal(("Ana", "ana@xfood.test"), (establishment.ContactName, establishment.ContactEmail));
        Assert.Equal(RegisterAccountValidator.DefaultTimeZoneId, establishment.TimeZoneId);
        Assert.Equal((18.4861m, -69.9312m), (establishment.Latitude, establishment.Longitude));
    }

    [Fact]
    public async Task Explicit_establishment_contact_and_time_zone_are_kept()
    {
        var result = await UseCases.RegisterAsync(Valid(AccountRoles.Establishment) with
        {
            Establishment = ValidEstablishment with
            {
                ContactName = " Gerente ", ContactEmail = "gerente@panaderia.test", TimeZoneId = "America/New_York",
            },
        }, CancellationToken.None);

        Assert.True(result.IsSuccess);
        var establishment = Assert.Single(store.Created).Establishment!;
        Assert.Equal(("Gerente", "gerente@panaderia.test", "America/New_York"),
            (establishment.ContactName, establishment.ContactEmail, establishment.TimeZoneId));
    }

    [Fact]
    public async Task Establishment_data_is_rejected_for_other_roles()
    {
        var errors = await RejectedFieldsAsync(Valid(AccountRoles.Consumer) with { Establishment = ValidEstablishment });

        Assert.Equal(["establishment"], errors.Keys);
    }
}
