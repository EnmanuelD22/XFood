namespace XFood.Application.Modules.Listings.Contracts;

public sealed class CreateDonationListingRequest
{
    public Guid EstablishmentId { get; set; }
    public Guid CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public int InitialQuantity { get; set; }
    public string PickupInstructions { get; set; } = string.Empty;
    public DateTimeOffset PickupStartsAtUtc { get; set; }
    public DateTimeOffset PickupDeadlineUtc { get; set; }
    public bool? FoodSafetyDeclared { get; set; }
}
