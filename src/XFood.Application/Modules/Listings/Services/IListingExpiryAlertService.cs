using XFood.Domain.Modules.Notifications;

namespace XFood.Application.Modules.Listings.Services;

public interface IListingExpiryAlertService
{
    /// <summary>
    /// Detects and persists one alert per listing and configured threshold.
    /// Notification creation, recipients and delivery remain owned by Notifications.
    /// </summary>
    Task<IReadOnlyList<ListingExpiryAlert>> DetectAsync(
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default);
}
