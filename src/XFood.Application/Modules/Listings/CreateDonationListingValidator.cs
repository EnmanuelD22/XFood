using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings;

public static class CreateDonationListingValidator
{
    public static IReadOnlyDictionary<string, string[]> Validate(
        CreateDonationListingRequest request,
        DateTimeOffset createdAtUtc)
    {
        var errors = new Dictionary<string, List<string>>();

        void Add(string field, string message)
        {
            if (!errors.TryGetValue(field, out var messages))
                errors[field] = messages = [];

            messages.Add(message);
        }

        if (request.EstablishmentId == Guid.Empty)
            Add(nameof(request.EstablishmentId), "El establecimiento es obligatorio.");
        if (request.CategoryId == Guid.Empty)
            Add(nameof(request.CategoryId), "La categoría es obligatoria.");

        ValidateRequiredText(request.Title, nameof(request.Title), 200, "El título", Add);
        ValidateRequiredText(request.Description, nameof(request.Description), 4000, "La descripción", Add);
        ValidateRequiredText(request.PickupInstructions, nameof(request.PickupInstructions), 2000, "Las instrucciones de recogida", Add);

        if (request.InitialQuantity <= 0)
            Add(nameof(request.InitialQuantity), "La cantidad inicial debe ser mayor que cero.");
        if (!request.FoodSafetyDeclared)
            Add(nameof(request.FoodSafetyDeclared), "La declaración de seguridad alimentaria es obligatoria.");

        if (request.PickupStartsAtUtc.Offset != TimeSpan.Zero)
            Add(nameof(request.PickupStartsAtUtc), "La fecha debe expresarse en UTC.");
        if (request.PickupDeadlineUtc.Offset != TimeSpan.Zero)
            Add(nameof(request.PickupDeadlineUtc), "La fecha debe expresarse en UTC.");
        if (createdAtUtc.Offset != TimeSpan.Zero)
            Add(nameof(createdAtUtc), "La fecha debe expresarse en UTC.");
        if (request.PickupStartsAtUtc >= request.PickupDeadlineUtc)
            Add(nameof(request.PickupDeadlineUtc), "El inicio de recogida debe ser anterior al límite de recogida.");
        if (createdAtUtc >= request.PickupDeadlineUtc)
            Add(nameof(request.PickupDeadlineUtc), "La creación debe ser anterior al límite de recogida.");

        return errors.ToDictionary(entry => entry.Key, entry => entry.Value.ToArray());
    }

    private static void ValidateRequiredText(
        string? value,
        string field,
        int maxLength,
        string label,
        Action<string, string> add)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length == 0)
            add(field, $"{label} es obligatoria.");
        else if (normalized.Length > maxLength)
            add(field, $"{label} no puede superar {maxLength} caracteres.");
    }
}
