using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings.Contracts;

public sealed class ListingResponse
{
    public Guid Id { get; set; }
    public Guid EstablishmentId { get; set; }
    public Guid CategoryId { get; set; }
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
}
