using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Domain.Modules.Listings;

namespace XFood.Api.Tests.Listings;

public sealed class ListingInventoryContractTests
{
    [Fact]
    public void Allocation_request_accepts_sale_mode_and_positive_quantity()
    {
        var errors = InventoryValidator.Validate(new AllocateListingUnitsRequest
        {
            OperationId = Guid.NewGuid(),
            Mode = ListingMode.Sale,
            Quantity = 1,
            ActorUserId = Guid.NewGuid(),
            Reason = "Reserva confirmada",
        });

        Assert.Empty(errors);
    }

    [Fact]
    public void Release_request_rejects_empty_operation_and_non_positive_quantity()
    {
        var errors = InventoryValidator.Validate(new ReleaseListingUnitsRequest
        {
            Mode = ListingMode.Donation,
            Quantity = 0,
            Reason = "Cancelación",
        });

        Assert.Contains("operationId", errors.Keys);
        Assert.Contains("quantity", errors.Keys);
        Assert.Contains("actorUserId", errors.Keys);
    }

    [Fact]
    public void Requests_preserve_operation_identity_for_idempotent_integration()
    {
        var operationId = Guid.NewGuid();
        var request = new AllocateListingUnitsRequest
        {
            OperationId = operationId,
            Mode = ListingMode.Donation,
            Quantity = 2,
            ActorUserId = Guid.NewGuid(),
            Reason = "Aceptación",
        };

        Assert.Equal(operationId, request.OperationId);
        Assert.Equal(ListingMode.Donation, request.Mode);
    }
}
