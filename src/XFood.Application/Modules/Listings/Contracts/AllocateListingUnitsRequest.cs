using XFood.Domain.Modules.Listings;

namespace XFood.Application.Modules.Listings.Contracts;

public sealed class AllocateListingUnitsRequest
{
    public Guid OperationId { get; set; }
    public ListingMode Mode { get; set; }
    public int Quantity { get; set; }
    public Guid ActorUserId { get; set; }
    public string Reason { get; set; } = null!;
}
