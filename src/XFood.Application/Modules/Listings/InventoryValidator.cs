using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings;

public static class InventoryValidator
{
    public static IReadOnlyDictionary<string, string[]> Validate(AllocateListingUnitsRequest request)
        => Validate(request.OperationId, request.Mode, request.Quantity, request.ActorUserId, request.Reason);

    public static IReadOnlyDictionary<string, string[]> Validate(ReleaseListingUnitsRequest request)
        => Validate(request.OperationId, request.Mode, request.Quantity, request.ActorUserId, request.Reason);

    private static IReadOnlyDictionary<string, string[]> Validate(
        Guid operationId, ListingMode mode, int quantity, Guid actorUserId, string? reason)
    {
        var errors = new Dictionary<string, string[]>();
        if (operationId == Guid.Empty)
            errors["operationId"] = ["La operación es obligatoria."];
        if (!Enum.IsDefined(mode))
            errors["mode"] = ["La modalidad no es válida."];
        if (quantity <= 0)
            errors["quantity"] = ["La cantidad debe ser mayor que cero."];
        if (actorUserId == Guid.Empty)
            errors["actorUserId"] = ["El actor es obligatorio."];
        if (string.IsNullOrWhiteSpace(reason))
            errors["reason"] = ["El motivo es obligatorio."];
        else if (reason.Trim().Length > 1000)
            errors["reason"] = ["El motivo no puede superar 1000 caracteres."];
        return errors;
    }
}
