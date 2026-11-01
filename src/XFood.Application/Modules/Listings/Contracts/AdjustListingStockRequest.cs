using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings.Contracts;

public sealed class AdjustListingStockRequest
{
    public StockAdjustmentKind Kind { get; set; }
    public int Quantity { get; set; }
    public string Reason { get; set; } = null!;
}
