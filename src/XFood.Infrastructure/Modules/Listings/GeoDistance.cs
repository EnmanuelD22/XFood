namespace XFood.Infrastructure.Modules.Listings;

/// <summary>
/// Straight-line (great-circle) distance on a spherical Earth. A bounding box narrows candidates in SQL
/// using the existing (Status, Latitude, Longitude) index; Haversine then decides the exact radius.
/// </summary>
public static class GeoDistance
{
    public const double EarthRadiusKm = 6371.0088;

    private const double KmPerDegree = Math.PI * EarthRadiusKm / 180;

    // Coordinates are stored as decimal(9,6) (~0.1 m); the margin keeps boundary points inside the box.
    private const double BoxMarginDegrees = 0.0001;

    public static double Kilometers(decimal latitude1, decimal longitude1, decimal latitude2, decimal longitude2)
    {
        var lat1 = ToRadians((double)latitude1);
        var lat2 = ToRadians((double)latitude2);
        var deltaLat = lat2 - lat1;
        var deltaLon = ToRadians((double)(longitude2 - longitude1));
        var h = Math.Pow(Math.Sin(deltaLat / 2), 2)
            + Math.Cos(lat1) * Math.Cos(lat2) * Math.Pow(Math.Sin(deltaLon / 2), 2);
        return 2 * EarthRadiusKm * Math.Asin(Math.Min(1, Math.Sqrt(h)));
    }

    /// <summary>
    /// Smallest latitude/longitude rectangle containing the circle. Near a pole or across the antimeridian
    /// it falls back to every longitude: less selective, never wrong.
    /// </summary>
    public static GeoBox BoundingBox(decimal latitude, decimal longitude, decimal radiusKm)
    {
        var lat = (double)latitude;
        var lon = (double)longitude;
        var deltaLat = (double)radiusKm / KmPerDegree + BoxMarginDegrees;
        var minLat = lat - deltaLat;
        var maxLat = lat + deltaLat;

        if (minLat <= -90 || maxLat >= 90)
            return new GeoBox(ToCoordinate(Math.Max(minLat, -90)), ToCoordinate(Math.Min(maxLat, 90)), -180m, 180m);

        var deltaLon = (double)radiusKm / (KmPerDegree * Math.Cos(ToRadians(Math.Max(Math.Abs(minLat), Math.Abs(maxLat)))))
            + BoxMarginDegrees;
        var minLon = lon - deltaLon;
        var maxLon = lon + deltaLon;

        return minLon < -180 || maxLon > 180
            ? new GeoBox(ToCoordinate(minLat), ToCoordinate(maxLat), -180m, 180m)
            : new GeoBox(ToCoordinate(minLat), ToCoordinate(maxLat), ToCoordinate(minLon), ToCoordinate(maxLon));
    }

    private static double ToRadians(double degrees) => degrees * Math.PI / 180;

    private static decimal ToCoordinate(double degrees) => Math.Round((decimal)degrees, 6);
}

public readonly record struct GeoBox(decimal MinLatitude, decimal MaxLatitude, decimal MinLongitude, decimal MaxLongitude);
