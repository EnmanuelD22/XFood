using Microsoft.EntityFrameworkCore;
using XFood.Domain.Modules.Establishments;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Establishments;

/// <summary>
/// Read-only projection owned by Establishments for other modules' queries (e.g. Listings search).
/// Only enabled establishments and only public fields: no contact data, no tracking, no writes.
/// </summary>
public static class PublicEstablishmentQueries
{
    public static IQueryable<PublicEstablishment> Enabled(XFoodDbContext db) =>
        db.Set<Establishment>()
            .AsNoTracking()
            .Where(establishment => establishment.Status == EstablishmentStatus.Active)
            .Select(establishment => new PublicEstablishment
            {
                Id = establishment.Id,
                Name = establishment.Name,
                Address = establishment.Address,
                Latitude = establishment.Latitude,
                Longitude = establishment.Longitude,
                TimeZoneId = establishment.TimeZoneId,
            });
}

public sealed class PublicEstablishment
{
    public Guid Id { get; init; }
    public string Name { get; init; } = null!;
    public string Address { get; init; } = null!;
    public decimal Latitude { get; init; }
    public decimal Longitude { get; init; }
    public string TimeZoneId { get; init; } = null!;
}
