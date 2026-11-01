using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings;

public static class StockManagementValidator
{
    public static IReadOnlyDictionary<string, string[]> ValidateAdjustment(AdjustListingStockRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (!Enum.IsDefined(request.Kind) || request.Kind == StockAdjustmentKind.Expiry && request.Quantity <= 0)
            errors[nameof(request.Kind)] = ["El tipo de ajuste no es válido."];
        if (request.Quantity <= 0)
            errors[nameof(request.Quantity)] = ["La cantidad debe ser mayor que cero."];
        ValidateReason(request.Reason, errors);
        return errors;
    }

    public static IReadOnlyDictionary<string, string[]> ValidateTransfer(TransferListingStockRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (request.DestinationListingId == Guid.Empty)
            errors[nameof(request.DestinationListingId)] = ["La publicación destino es obligatoria."];
        if (request.Quantity <= 0)
            errors[nameof(request.Quantity)] = ["La cantidad debe ser mayor que cero."];
        ValidateReason(request.Reason, errors);
        return errors;
    }

    private static void ValidateReason(string? reason, Dictionary<string, string[]> errors)
    {
        if (string.IsNullOrWhiteSpace(reason))
            errors[nameof(AdjustListingStockRequest.Reason)] = ["El motivo es obligatorio."];
        else if (reason.Trim().Length > 1000)
            errors[nameof(AdjustListingStockRequest.Reason)] = ["El motivo no puede superar 1000 caracteres."];
    }
}
