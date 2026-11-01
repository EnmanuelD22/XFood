using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Modules.Listings;

namespace XFood.Api.Tests.Listings;

/// <summary>Builders for HU-02 search data: establishments placed at exact distances and listings in any state.</summary>
internal static class ListingSearchTestData
{
    private const decimal KmPerDegree = (decimal)(Math.PI * GeoDistance.EarthRadiusKm / 180);

    /// <summary>A point <paramref name="km"/> due north: along a meridian the distance is exact.</summary>
    public static (decimal Latitude, decimal Longitude) NorthOf(decimal latitude, decimal longitude, decimal km) =>
        (Math.Round(latitude + km / KmPerDegree, 6), longitude);

    public static Establishment Establishment(
        Guid ownerId,
        (decimal Latitude, decimal Longitude) point,
        string name,
        EstablishmentStatus status = EstablishmentStatus.Active) => new()
    {
        Id = Guid.NewGuid(),
        Name = name,
        ContactName = "Contacto privado",
        ContactEmail = "privado@xfood.test",
        ContactPhone = "809-555-0101",
        Address = $"Dirección de {name}",
        Latitude = point.Latitude,
        Longitude = point.Longitude,
        TimeZoneId = "America/Santo_Domingo",
        Status = status,
        CreatedByUserId = ownerId,
        CreatedAtUtc = DateTimeOffset.UtcNow.AddDays(-1),
    };

    public static Listing Sale(
        Establishment establishment,
        Guid categoryId,
        string title,
        DateTimeOffset deadlineUtc,
        ListingStatus status = ListingStatus.Active,
        int available = 2,
        bool isFoodFit = true) => new()
    {
        Id = Guid.NewGuid(),
        EstablishmentId = establishment.Id,
        CreatedByUserId = establishment.CreatedByUserId,
        CategoryId = categoryId,
        Title = title,
        Description = "Alimento apto",
        Mode = ListingMode.Sale,
        Status = status,
        InitialQuantity = 2,
        AvailableQuantity = available,
        WrittenOffQuantity = 2 - available,
        OriginalUnitPrice = 200m,
        DiscountedUnitPrice = 120m,
        Currency = "DOP",
        PickupInstructions = "Recoger en caja",
        PaymentInstructions = "Pago al recoger",
        FoodSafetyDeclared = true,
        IsFoodFit = isFoodFit,
        PickupStartsAtUtc = deadlineUtc.AddHours(-2),
        PickupDeadlineUtc = deadlineUtc,
        CreatedAtUtc = deadlineUtc.AddHours(-3),
    };

    public static Listing Donation(Establishment establishment, Guid categoryId, string title, DateTimeOffset deadlineUtc)
    {
        var listing = Sale(establishment, categoryId, title, deadlineUtc);
        listing.Mode = ListingMode.Donation;
        listing.OriginalUnitPrice = null;
        listing.DiscountedUnitPrice = null;
        listing.PaymentInstructions = null;
        return listing;
    }

    public static Category Category(string name) =>
        new() { Id = Guid.NewGuid(), Name = name, IsActive = true, CreatedAtUtc = DateTimeOffset.UtcNow.AddDays(-1) };
}
