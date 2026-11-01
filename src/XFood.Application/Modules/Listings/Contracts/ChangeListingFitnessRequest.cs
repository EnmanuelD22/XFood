namespace XFood.Application.Modules.Listings.Contracts;

public sealed class ChangeListingFitnessRequest
{
    public bool IsFoodFit { get; set; }
    public string Reason { get; set; } = null!;
}
