namespace XFood.Application.Modules.Listings.Contracts;

public sealed class TransferListingStockRequest
{
    public Guid DestinationListingId { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = null!;
}
