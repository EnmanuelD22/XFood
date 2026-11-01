using System.Net.Mail;
using XFood.Application.Modules.Establishments.Contracts;

namespace XFood.Application.Modules.Establishments;

public static class EstablishmentProfileValidator
{
    public static IReadOnlyDictionary<string, string[]> Validate(UpdateEstablishmentProfileRequest request)
    {
        var errors = new Dictionary<string, List<string>>();

        void Add(string field, string message)
        {
            if (!errors.TryGetValue(field, out var messages))
                errors[field] = messages = [];
            messages.Add(message);
        }

        Required(request.Name, nameof(request.Name), 200, "El nombre", Add);
        Required(request.ContactName, nameof(request.ContactName), 200, "El nombre de contacto", Add);
        Required(request.ContactEmail, nameof(request.ContactEmail), 320, "El correo de contacto", Add);
        Required(request.ContactPhone, nameof(request.ContactPhone), 32, "El teléfono de contacto", Add);
        Required(request.Address, nameof(request.Address), 500, "La dirección", Add);

        if (!string.IsNullOrWhiteSpace(request.ContactEmail) && !IsValidEmail(request.ContactEmail))
            Add(nameof(request.ContactEmail), "El correo de contacto no tiene un formato válido.");
        if (request.Latitude is < -90 or > 90)
            Add(nameof(request.Latitude), "La latitud debe estar entre -90 y 90.");
        if (request.Longitude is < -180 or > 180)
            Add(nameof(request.Longitude), "La longitud debe estar entre -180 y 180.");

        return errors.ToDictionary(entry => entry.Key, entry => entry.Value.ToArray());
    }

    private static void Required(string? value, string field, int maxLength, string label, Action<string, string> add)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length == 0)
            add(field, $"{label} es obligatorio.");
        else if (normalized.Length > maxLength)
            add(field, $"{label} no puede superar {maxLength} caracteres.");
    }

    private static bool IsValidEmail(string value)
    {
        try
        {
            var address = new MailAddress(value.Trim());
            return string.Equals(address.Address, value.Trim(), StringComparison.OrdinalIgnoreCase);
        }
        catch (FormatException)
        {
            return false;
        }
    }
}
