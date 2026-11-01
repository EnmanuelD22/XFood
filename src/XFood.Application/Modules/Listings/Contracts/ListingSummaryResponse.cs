using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings.Contracts;

/// <summary>
/// Public view of an available sale listing, shared by the search list, the map and the detail.
/// Keeps every <see cref="ListingResponse"/> field so existing clients of GET /listings keep working.
/// </summary>
public sealed class ListingSummaryResponse
{
    public Guid Id { get; set; }
    public Guid EstablishmentId { get; set; }
    public Guid CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public ListingMode Mode { get; set; }
    public ListingStatus Status { get; set; }
    public int InitialQuantity { get; set; }
    public int AvailableQuantity { get; set; }
    public decimal? OriginalUnitPrice { get; set; }
    public decimal? DiscountedUnitPrice { get; set; }
    public string Currency { get; set; } = "DOP";
    public string PickupInstructions { get; set; } = string.Empty;
    public string? PaymentInstructions { get; set; }
    public bool FoodSafetyDeclared { get; set; }
    public bool IsFoodFit { get; set; }
    public DateTimeOffset PickupStartsAtUtc { get; set; }
    public DateTimeOffset PickupDeadlineUtc { get; set; }
    public DateTimeOffset CreatedAtUtc { get; set; }
    public ListingEstablishmentSummary Establishment { get; set; } = new();

    /// <summary>Straight-line distance in km from the requested point, rounded to 2 decimals; null without a point.</summary>
    public decimal? DistanceKm { get; set; }
}

/// <summary>Public establishment data needed for the map and the pickup window; no contact data.</summary>
public sealed class ListingEstablishmentSummary
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Address { get; set; } = string.Empty;
    public decimal Latitude { get; set; }
    public decimal Longitude { get; set; }
    public string TimeZoneId { get; set; } = string.Empty;
}
