namespace XFood.Application.Modules.Listings;

public static class ListingSearchValidator
{
    /// <summary>Validates a search point and radius; the radius is only accepted together with a point.</summary>
    public static IReadOnlyDictionary<string, string[]> Validate(
        decimal? latitude,
        decimal? longitude,
        decimal? radiusKm,
        IReadOnlyCollection<decimal> allowedRadiiKm)
    {
        var errors = ValidatePoint(latitude, longitude).ToDictionary();

        if (radiusKm is { } radius)
        {
            if (latitude is null || longitude is null)
                errors["radiusKm"] = ["El radio solo se admite junto con latitud y longitud."];
            else if (!allowedRadiiKm.Contains(radius))
                errors["radiusKm"] = [$"El radio debe ser uno de: {string.Join(", ", allowedRadiiKm)} km."];
        }

        return errors;
    }

    /// <summary>Validates an optional point: both coordinates or none, within geographic ranges.</summary>
    public static IReadOnlyDictionary<string, string[]> ValidatePoint(decimal? latitude, decimal? longitude)
    {
        var errors = new Dictionary<string, string[]>();

        if (latitude.HasValue != longitude.HasValue)
        {
            var missing = latitude.HasValue ? "longitude" : "latitude";
            errors[missing] = ["La latitud y la longitud deben enviarse juntas."];
            return errors;
        }

        if (latitude is < -90m or > 90m)
            errors["latitude"] = ["La latitud debe estar entre -90 y 90."];

        if (longitude is < -180m or > 180m)
            errors["longitude"] = ["La longitud debe estar entre -180 y 180."];

        return errors;
    }
}
