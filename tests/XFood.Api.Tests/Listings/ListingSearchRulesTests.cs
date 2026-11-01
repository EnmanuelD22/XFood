using XFood.Application.Modules.Listings;
using XFood.Infrastructure.Modules.Listings;

namespace XFood.Api.Tests.Listings;

public sealed class ListingSearchRulesTests
{
    private static readonly decimal[] Radii = [1m, 3m, 5m, 10m];

    [Fact]
    public void Distance_is_zero_for_the_same_point_and_symmetric()
    {
        Assert.Equal(0, GeoDistance.Kilometers(18.4861m, -69.9312m, 18.4861m, -69.9312m), 9);
        Assert.Equal(
            GeoDistance.Kilometers(18.4861m, -69.9312m, 19.4517m, -70.6970m),
            GeoDistance.Kilometers(19.4517m, -70.6970m, 18.4861m, -69.9312m),
            9);
    }

    [Fact]
    public void One_degree_along_a_meridian_or_the_equator_is_pi_r_over_180()
    {
        var expected = Math.PI * GeoDistance.EarthRadiusKm / 180;

        Assert.Equal(expected, GeoDistance.Kilometers(18m, -70m, 19m, -70m), 6);
        Assert.Equal(expected, GeoDistance.Kilometers(0m, 10m, 0m, 11m), 6);
    }

    [Fact]
    public void Santo_Domingo_to_Santiago_is_about_134_km()
    {
        var km = GeoDistance.Kilometers(18.4861m, -69.9312m, 19.4517m, -70.6970m);

        Assert.InRange(km, 133, 136);
    }

    [Theory]
    [InlineData(1)]
    [InlineData(3)]
    [InlineData(10)]
    public void Bounding_box_contains_every_point_on_the_circle(int radiusKm)
    {
        const decimal lat = 18.4861m, lon = -69.9312m;
        var box = GeoDistance.BoundingBox(lat, lon, radiusKm);

        for (var bearing = 0; bearing < 360; bearing += 15)
        {
            var (pointLat, pointLon) = Destination(lat, lon, radiusKm, bearing);
            Assert.InRange(pointLat, box.MinLatitude, box.MaxLatitude);
            Assert.InRange(pointLon, box.MinLongitude, box.MaxLongitude);
        }
    }

    [Fact]
    public void Bounding_box_uses_every_longitude_across_the_antimeridian_or_near_a_pole()
    {
        Assert.Equal((-180m, 180m), Longitudes(GeoDistance.BoundingBox(10m, 179.99m, 10m)));
        Assert.Equal((-180m, 180m), Longitudes(GeoDistance.BoundingBox(89.99m, 0m, 10m)));

        static (decimal, decimal) Longitudes(GeoBox box) => (box.MinLongitude, box.MaxLongitude);
    }

    [Fact]
    public void Validator_accepts_no_point_a_point_alone_or_a_point_with_an_allowed_radius()
    {
        Assert.Empty(ListingSearchValidator.Validate(null, null, null, Radii));
        Assert.Empty(ListingSearchValidator.Validate(18.48m, -69.93m, null, Radii));
        Assert.Empty(ListingSearchValidator.Validate(-90m, 180m, 10m, Radii));
    }

    [Theory]
    [InlineData(18.48, null, null, "longitude")]
    [InlineData(null, -69.93, null, "latitude")]
    [InlineData(90.000001, -69.93, null, "latitude")]
    [InlineData(-91.0, -69.93, null, "latitude")]
    [InlineData(18.48, 180.5, null, "longitude")]
    [InlineData(18.48, -69.93, 2.0, "radiusKm")]
    [InlineData(18.48, -69.93, 0.0, "radiusKm")]
    [InlineData(null, null, 3.0, "radiusKm")]
    public void Validator_rejects_incomplete_or_out_of_range_input(double? latitude, double? longitude, double? radiusKm, string field)
    {
        var errors = ListingSearchValidator.Validate(
            (decimal?)latitude, (decimal?)longitude, (decimal?)radiusKm, Radii);

        Assert.Contains(field, errors.Keys);
    }

    private static (decimal Latitude, decimal Longitude) Destination(decimal latitude, decimal longitude, double km, double bearingDegrees)
    {
        var angular = km / GeoDistance.EarthRadiusKm;
        var bearing = bearingDegrees * Math.PI / 180;
        var lat1 = (double)latitude * Math.PI / 180;
        var lon1 = (double)longitude * Math.PI / 180;
        var lat2 = Math.Asin(Math.Sin(lat1) * Math.Cos(angular) + Math.Cos(lat1) * Math.Sin(angular) * Math.Cos(bearing));
        var lon2 = lon1 + Math.Atan2(Math.Sin(bearing) * Math.Sin(angular) * Math.Cos(lat1), Math.Cos(angular) - Math.Sin(lat1) * Math.Sin(lat2));
        return ((decimal)(lat2 * 180 / Math.PI), (decimal)(lon2 * 180 / Math.PI));
    }
}
