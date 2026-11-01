using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings;

public static class ManageListingValidator
{
    public static IReadOnlyDictionary<string, string[]> ValidateUpdate(
        Listing listing,
        UpdateListingRequest request,
        DateTimeOffset nowUtc)
    {
        var errors = new Dictionary<string, List<string>>();
        void Add(string field, string message)
        {
            if (!errors.TryGetValue(field, out var messages))
                errors[field] = messages = [];
            messages.Add(message);
        }

        if (request.CategoryId == Guid.Empty)
            Add(nameof(request.CategoryId), "La categoría es obligatoria.");
        Required(request.Title, nameof(request.Title), 200, "El título", Add);
        Required(request.Description, nameof(request.Description), 4000, "La descripción", Add);
        Required(request.PickupInstructions, nameof(request.PickupInstructions), 2000, "Las instrucciones de recogida", Add);

        if (request.InitialQuantity <= 0)
            Add(nameof(request.InitialQuantity), "La cantidad inicial debe ser mayor que cero.");
        var committed = listing.AssignedQuantity + listing.FulfilledQuantity + listing.WrittenOffQuantity + listing.TransferredOutQuantity;
        if (request.InitialQuantity < committed)
            Add(nameof(request.InitialQuantity), "La cantidad no puede ser inferior a las unidades comprometidas o entregadas.");

        if (request.PickupStartsAtUtc.Offset != TimeSpan.Zero)
            Add(nameof(request.PickupStartsAtUtc), "La fecha debe expresarse en UTC.");
        if (request.PickupDeadlineUtc.Offset != TimeSpan.Zero)
            Add(nameof(request.PickupDeadlineUtc), "La fecha debe expresarse en UTC.");
        if (request.PickupStartsAtUtc >= request.PickupDeadlineUtc)
            Add(nameof(request.PickupDeadlineUtc), "El inicio de recogida debe ser anterior al límite de recogida.");
        if (request.PickupDeadlineUtc <= nowUtc)
            Add(nameof(request.PickupDeadlineUtc), "El límite de recogida debe ser futuro.");

        if (listing.Mode == ListingMode.Sale)
        {
            if (request.OriginalUnitPrice is not > 0)
                Add(nameof(request.OriginalUnitPrice), "El precio original debe ser mayor que cero.");
            if (request.DiscountedUnitPrice is not > 0)
                Add(nameof(request.DiscountedUnitPrice), "El precio descontado debe ser mayor que cero.");
            else if (request.OriginalUnitPrice is not null && request.DiscountedUnitPrice >= request.OriginalUnitPrice)
                Add(nameof(request.DiscountedUnitPrice), "El precio descontado debe ser menor que el precio original.");
            Required(request.PaymentInstructions, nameof(request.PaymentInstructions), 1000, "Las instrucciones de pago", Add);
        }
        else
        {
            if (request.OriginalUnitPrice is not null)
                Add(nameof(request.OriginalUnitPrice), "Las donaciones no admiten precio original.");
            if (request.DiscountedUnitPrice is not null)
                Add(nameof(request.DiscountedUnitPrice), "Las donaciones no admiten precio descontado.");
            if (!string.IsNullOrWhiteSpace(request.PaymentInstructions))
                Add(nameof(request.PaymentInstructions), "Las donaciones no admiten instrucciones de pago.");
        }

        return errors.ToDictionary(entry => entry.Key, entry => entry.Value.ToArray());
    }

    public static IReadOnlyDictionary<string, string[]> ValidateDeactivation(DeactivateListingRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.Reason))
            errors[nameof(request.Reason)] = ["El motivo es obligatorio."];
        else if (request.Reason.Trim().Length > 1000)
            errors[nameof(request.Reason)] = ["El motivo no puede superar 1000 caracteres."];
        return errors;
    }

    private static void Required(string? value, string field, int maxLength, string label, Action<string, string> add)
    {
        var normalized = value?.Trim() ?? string.Empty;
        if (normalized.Length == 0)
            add(field, $"{label} es obligatorio.");
        else if (normalized.Length > maxLength)
            add(field, $"{label} no puede superar {maxLength} caracteres.");
    }
}
