namespace XFood.Application.Modules.Listings.Contracts;

public sealed class DeactivateListingRequest
{
    public string Reason { get; set; } = string.Empty;
}
