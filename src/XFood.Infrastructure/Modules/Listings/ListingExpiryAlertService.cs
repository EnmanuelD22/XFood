using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Listings;
using XFood.Domain.Modules.Notifications;
using XFood.Infrastructure.Persistence;
using XFood.Infrastructure.Modules.Notifications;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ListingExpiryAlertService(
    XFoodDbContext db,
    IOptions<ExpiryAlertOptions> options) : IListingExpiryAlertService
{
    public async Task<IReadOnlyList<ListingExpiryAlert>> DetectAsync(
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default)
    {
        if (asOfUtc.Offset != TimeSpan.Zero)
            throw new ArgumentException("La fecha de evaluación debe expresarse en UTC.", nameof(asOfUtc));

        var thresholdMinutes = options.Value.ThresholdMinutes;
        if (thresholdMinutes <= 0)
            throw new InvalidOperationException("El umbral de alertas debe ser mayor que cero.");

        var thresholdEndUtc = asOfUtc.AddMinutes(thresholdMinutes);
        var candidates = await db.Set<Listing>()
            .AsNoTracking()
            .Where(listing => listing.Status == ListingStatus.Active
                && listing.AvailableQuantity > 0
                && listing.PickupDeadlineUtc > asOfUtc
                && listing.PickupDeadlineUtc <= thresholdEndUtc)
            .Select(listing => new
            {
                listing.Id,
                listing.AvailableQuantity,
                listing.PickupDeadlineUtc,
            })
            .ToListAsync(cancellationToken);

        var existingListingIds = await db.Set<ListingExpiryAlert>()
            .Where(alert => alert.ThresholdMinutes == thresholdMinutes
                && candidates.Select(candidate => candidate.Id).Contains(alert.ListingId))
            .Select(alert => alert.ListingId)
            .ToHashSetAsync(cancellationToken);

        var created = new List<ListingExpiryAlert>();
        foreach (var candidate in candidates)
        {
            if (existingListingIds.Contains(candidate.Id))
                continue;

            var alert = new ListingExpiryAlert
            {
                Id = Guid.CreateVersion7(),
                ListingId = candidate.Id,
                ThresholdMinutes = thresholdMinutes,
                AvailableQuantitySnapshot = candidate.AvailableQuantity,
                DeadlineSnapshotUtc = candidate.PickupDeadlineUtc,
                CreatedAtUtc = asOfUtc,
            };

            db.Add(alert);
            if (await TrySaveAlertAsync(alert, cancellationToken))
            {
                existingListingIds.Add(candidate.Id);
                created.Add(alert);
            }
        }

        return created;
    }

    private async Task<bool> TrySaveAlertAsync(
        ListingExpiryAlert alert,
        CancellationToken cancellationToken)
    {
        var transaction = db.Database.IsRelational()
            ? await db.Database.BeginTransactionAsync(cancellationToken)
            : null;
        try
        {
            await db.SaveChangesAsync(cancellationToken);
            if (transaction is not null)
                await transaction.CommitAsync(cancellationToken);
            return true;
        }
        catch (DbUpdateException)
        {
            db.Entry(alert).State = EntityState.Detached;
            var alreadyExists = await db.Set<ListingExpiryAlert>().AnyAsync(existing =>
                existing.ListingId == alert.ListingId
                && existing.ThresholdMinutes == alert.ThresholdMinutes, cancellationToken);
            if (!alreadyExists)
                throw;
            return false;
        }
        finally
        {
            if (transaction is not null)
                await transaction.DisposeAsync();
        }
    }
}
