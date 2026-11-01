using System.Net.Mail;
using System.Text.RegularExpressions;
using XFood.Domain.Modules.Identity;

namespace XFood.Application.Modules.Identity;

/// <summary>
/// Server-side format rules for public registration. Lengths follow the persisted model;
/// the password policy itself is enforced by Identity options.
/// </summary>
public static partial class RegisterAccountValidator
{
    internal const int EmailMaxLength = 256;
    internal const int DisplayNameMaxLength = 200;
    internal const int OrganizationNameMaxLength = 200;
    internal const int ContactPhoneMaxLength = 32;
    internal const int AddressMaxLength = 500;
    internal const int VerificationInformationMaxLength = 4000;
    internal const int EstablishmentNameMaxLength = 200;
    internal const int ContactNameMaxLength = 200;
    internal const int ContactEmailMaxLength = 320;
    internal const int CoordinateScale = 6;

    /// <summary>Assumption for the Dominican pilot (not an approved rule); clients may send any IANA zone.</summary>
    public const string DefaultTimeZoneId = "America/Santo_Domingo";

    public static (NewAccount? Account, IReadOnlyDictionary<string, string[]> Errors) Validate(RegisterAccountCommand command)
    {
        var errors = new Dictionary<string, List<string>>();
        void Add(string field, string message)
        {
            if (!errors.TryGetValue(field, out var list))
                errors[field] = list = [];
            list.Add(message);
        }

        var email = command.Email?.Trim() ?? "";
        if (email.Length == 0)
            Add("email", "El correo es obligatorio.");
        else if (email.Length > EmailMaxLength)
            Add("email", $"El correo no puede superar {EmailMaxLength} caracteres.");
        else if (!IsValidEmail(email))
            Add("email", "El correo no tiene un formato válido.");

        if (string.IsNullOrEmpty(command.Password))
            Add("password", "La contraseña es obligatoria.");

        var displayName = command.DisplayName?.Trim() ?? "";
        if (displayName.Length == 0)
            Add("displayName", "El nombre es obligatorio.");
        else if (displayName.Length > DisplayNameMaxLength)
            Add("displayName", $"El nombre no puede superar {DisplayNameMaxLength} caracteres.");

        var role = NormalizeRole(command.Role);
        if (string.IsNullOrWhiteSpace(command.Role))
            Add("role", "El rol es obligatorio.");
        else if (string.Equals(command.Role.Trim(), AccountRoles.Administrator, StringComparison.OrdinalIgnoreCase))
            Add("role", "Las cuentas de administrador no se crean mediante registro público.");
        else if (role is null)
            Add("role", $"El rol debe ser {string.Join(", ", AccountRoles.PubliclyRegistrable)}.");

        NewOrganization? organization = null;
        if (role == AccountRoles.Organization)
            organization = ValidateOrganization(command.Organization, Add);
        else if (command.Organization is not null && role is not null)
            Add("organization", "Los datos de organización solo aplican al rol Organization.");

        NewEstablishment? establishment = null;
        if (role == AccountRoles.Establishment)
            establishment = ValidateEstablishment(command.Establishment, displayName, email, Add);
        else if (command.Establishment is not null && role is not null)
            Add("establishment", "Los datos de establecimiento solo aplican al rol Establishment.");

        if (errors.Count > 0)
            return (null, errors.ToDictionary(e => e.Key, e => e.Value.ToArray()));

        return (new NewAccount(email, command.Password!, displayName, role!, organization, establishment), new Dictionary<string, string[]>());
    }

    private static NewEstablishment? ValidateEstablishment(
        RegisterEstablishmentData? data, string accountName, string accountEmail, Action<string, string> add)
    {
        if (data is null)
        {
            add("establishment", "Los datos del establecimiento son obligatorios para el rol Establishment.");
            return null;
        }

        var name = Required(data.Name, "establishment.name", "El nombre del establecimiento", EstablishmentNameMaxLength, add);
        var phone = ValidPhone(Required(data.ContactPhone, "establishment.contactPhone", "El teléfono de contacto", ContactPhoneMaxLength, add),
            "establishment.contactPhone", add);
        var address = Required(data.Address, "establishment.address", "La dirección", AddressMaxLength, add);
        var latitude = Coordinate(data.Latitude, 90, "establishment.latitude", "La latitud", add);
        var longitude = Coordinate(data.Longitude, 180, "establishment.longitude", "La longitud", add);

        // Supuesto del piloto dominicano, no regla aprobada: zona por defecto cuando el cliente no la envía.
        var timeZoneId = string.IsNullOrWhiteSpace(data.TimeZoneId) ? DefaultTimeZoneId : data.TimeZoneId.Trim();
        if (!IsIanaTimeZone(timeZoneId))
        {
            add("establishment.timeZoneId", "La zona horaria debe ser un identificador IANA válido, por ejemplo America/Santo_Domingo.");
            timeZoneId = null;
        }

        // Contacto opcional: si no se envía, se usan el nombre y el correo de la cuenta.
        var contactName = string.IsNullOrWhiteSpace(data.ContactName) ? accountName : data.ContactName.Trim();
        if (contactName.Length > ContactNameMaxLength)
        {
            add("establishment.contactName", $"El nombre de contacto no puede superar {ContactNameMaxLength} caracteres.");
            contactName = "";
        }
        var contactEmail = string.IsNullOrWhiteSpace(data.ContactEmail) ? accountEmail : data.ContactEmail.Trim();
        if (contactEmail.Length > ContactEmailMaxLength || !IsValidEmail(contactEmail))
        {
            if (!string.IsNullOrWhiteSpace(data.ContactEmail))
                add("establishment.contactEmail", "El correo de contacto no tiene un formato válido.");
            contactEmail = "";
        }

        return name is null || phone is null || address is null || latitude is null || longitude is null
            || timeZoneId is null || contactName.Length == 0 || contactEmail.Length == 0
            ? null
            : new NewEstablishment(name, contactName, contactEmail, phone, address, latitude.Value, longitude.Value, timeZoneId);
    }

    private static decimal? Coordinate(decimal? value, int limit, string field, string label, Action<string, string> add)
    {
        if (value is null)
        {
            add(field, $"{label} es obligatoria.");
            return null;
        }
        if (value < -limit || value > limit)
        {
            add(field, $"{label} debe estar entre -{limit} y {limit}.");
            return null;
        }
        return Math.Round(value.Value, CoordinateScale);
    }

    private static string? ValidPhone(string? phone, string field, Action<string, string> add)
    {
        if (phone is null || PhonePattern().IsMatch(phone))
            return phone;
        add(field, "El teléfono solo admite dígitos, espacios, +, -, ( y ), con al menos 7 caracteres.");
        return null;
    }

    private static bool IsIanaTimeZone(string id) =>
        TimeZoneInfo.TryConvertIanaIdToWindowsId(id, out _) && TimeZoneInfo.TryFindSystemTimeZoneById(id, out _);

    private static NewOrganization? ValidateOrganization(RegisterOrganizationData? data, Action<string, string> add)
    {
        if (data is null)
        {
            add("organization", "Los datos de la organización son obligatorios para el rol Organization.");
            return null;
        }

        var name = Required(data.Name, "organization.name", "El nombre de la organización", OrganizationNameMaxLength, add);
        var phone = ValidPhone(Required(data.ContactPhone, "organization.contactPhone", "El teléfono de contacto", ContactPhoneMaxLength, add),
            "organization.contactPhone", add);
        var address = Required(data.Address, "organization.address", "La dirección", AddressMaxLength, add);

        var information = string.IsNullOrWhiteSpace(data.VerificationInformation) ? null : data.VerificationInformation.Trim();
        if (information?.Length > VerificationInformationMaxLength)
        {
            add("organization.verificationInformation", $"La información de verificación no puede superar {VerificationInformationMaxLength} caracteres.");
            return null;
        }

        return name is null || phone is null || address is null
            ? null
            : new NewOrganization(name, phone, address, information);
    }

    private static string? Required(string? value, string field, string label, int maxLength, Action<string, string> add)
    {
        var trimmed = value?.Trim() ?? "";
        if (trimmed.Length == 0)
        {
            add(field, $"{label} es obligatorio.");
            return null;
        }
        if (trimmed.Length > maxLength)
        {
            add(field, $"{label} no puede superar {maxLength} caracteres.");
            return null;
        }
        return trimmed;
    }

    private static string? NormalizeRole(string? role) =>
        AccountRoles.PubliclyRegistrable.FirstOrDefault(r => string.Equals(r, role?.Trim(), StringComparison.OrdinalIgnoreCase));

    private static bool IsValidEmail(string email) =>
        MailAddress.TryCreate(email, out var parsed)
        && parsed.Address == email
        && parsed.Host.Contains('.')
        && !parsed.Host.EndsWith('.');

    [GeneratedRegex(@"^[0-9+()\-\s]{7,32}$")]
    private static partial Regex PhonePattern();
}
