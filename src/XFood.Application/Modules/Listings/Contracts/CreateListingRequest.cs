using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings.Contracts;

public sealed class CreateListingRequest
{
    public Guid EstablishmentId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int InitialQuantity { get; set; }
    public string PickupInstructions { get; set; } = string.Empty;
    public DateTimeOffset PickupStartsAtUtc { get; set; }
    public DateTimeOffset PickupDeadlineUtc { get; set; }
    public decimal OriginalUnitPrice { get; set; }
    public decimal DiscountedUnitPrice { get; set; }
    public string PaymentInstructions { get; set; } = string.Empty;
    public bool FoodSafetyDeclared { get; set; } = true;
}
