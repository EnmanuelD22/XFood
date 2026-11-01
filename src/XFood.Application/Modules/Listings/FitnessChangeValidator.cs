using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Application.Modules.Listings;

public static class FitnessChangeValidator
{
    public static IReadOnlyDictionary<string, string[]> Validate(ChangeListingFitnessRequest request)
    {
        var errors = new Dictionary<string, string[]>();
        if (string.IsNullOrWhiteSpace(request.Reason))
            errors[nameof(request.Reason)] = ["El motivo es obligatorio."];
        else if (request.Reason.Trim().Length > 1000)
            errors[nameof(request.Reason)] = ["El motivo no puede superar 1000 caracteres."];
        return errors;
    }
}
