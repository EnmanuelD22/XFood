using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;

namespace XFood.Api.Tests.Listings;

public sealed class CreateListingValidatorTests
{
    [Fact]
    public void Validate_valid_sale_request_returns_no_errors()
    {
        var request = ValidRequest();
        var createdAtUtc = new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero);

        var errors = CreateListingValidator.Validate(request, createdAtUtc);

        Assert.Empty(errors);
    }

    [Fact]
    public void Validate_rejects_omitted_food_safety_declaration()
    {
        var request = ValidRequest();
        request.FoodSafetyDeclared = null;

        var errors = CreateListingValidator.Validate(request, DateTimeOffset.UtcNow);

        Assert.Contains(nameof(request.FoodSafetyDeclared), errors.Keys);
    }

    [Fact]
    public void Validate_rejects_invalid_sale_values()
    {
        var request = ValidRequest();
        request.InitialQuantity = 0;
        request.OriginalUnitPrice = 10m;
        request.DiscountedUnitPrice = 10m;
        request.PaymentInstructions = " ";
        request.FoodSafetyDeclared = false;
        request.PickupStartsAtUtc = request.PickupDeadlineUtc;

        var errors = CreateListingValidator.Validate(
            request,
            new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.Zero));

        Assert.Contains(nameof(request.InitialQuantity), errors.Keys);
        Assert.Contains(nameof(request.DiscountedUnitPrice), errors.Keys);
        Assert.Contains(nameof(request.PaymentInstructions), errors.Keys);
        Assert.Contains(nameof(request.FoodSafetyDeclared), errors.Keys);
        Assert.Contains(nameof(request.PickupDeadlineUtc), errors.Keys);
    }

    [Fact]
    public void Validate_rejects_non_utc_dates()
    {
        var request = ValidRequest();
        request.PickupStartsAtUtc = new DateTimeOffset(2026, 11, 1, 10, 0, 0, TimeSpan.FromHours(-4));
        request.PickupDeadlineUtc = new DateTimeOffset(2026, 11, 1, 12, 0, 0, TimeSpan.FromHours(-4));

        var errors = CreateListingValidator.Validate(
            request,
            new DateTimeOffset(2026, 11, 1, 9, 0, 0, TimeSpan.FromHours(-4)));

        Assert.Contains(nameof(request.PickupStartsAtUtc), errors.Keys);
        Assert.Contains(nameof(request.PickupDeadlineUtc), errors.Keys);
        Assert.Contains("createdAtUtc", errors.Keys);
    }

    private static CreateListingRequest ValidRequest() => new()
    {
        EstablishmentId = Guid.NewGuid(),
        CategoryId = Guid.NewGuid(),
        Title = "Excedente de panadería",
        Description = "Productos del día disponibles para venta.",
        InitialQuantity = 10,
        PickupInstructions = "Recoger en el establecimiento.",
        PickupStartsAtUtc = new DateTimeOffset(2026, 11, 1, 11, 0, 0, TimeSpan.Zero),
        PickupDeadlineUtc = new DateTimeOffset(2026, 11, 1, 13, 0, 0, TimeSpan.Zero),
        OriginalUnitPrice = 100m,
        DiscountedUnitPrice = 60m,
        PaymentInstructions = "Pagar en el establecimiento.",
        FoodSafetyDeclared = true,
    };
}
