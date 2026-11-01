using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using XFood.Application.Modules.Listings;
using XFood.Application.Modules.Listings.Contracts;
using XFood.Application.Modules.Listings.Services;
using XFood.Domain.Modules.Listings;
using XFood.Infrastructure.Modules.Establishments;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ListingSearchService(XFoodDbContext db, IOptions<ListingSearchOptions> options) : IListingSearchService
{
    public async Task<IReadOnlyList<ListingSummaryResponse>> SearchAsync(
        ListingSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        var settings = options.Value;
        var errors = ListingSearchValidator.Validate(criteria.Latitude, criteria.Longitude, criteria.RadiusKm, settings.AllowedRadiiKm);
        if (errors.Count > 0)
            throw new ListingValidationException(errors);

        var establishments = PublicEstablishmentQueries.Enabled(db);

        if (criteria.Latitude is not { } latitude || criteria.Longitude is not { } longitude)
        {
            return await Project(Available(criteria.AsOfUtc), establishments)
                .OrderBy(listing => listing.PickupDeadlineUtc)
                .ThenBy(listing => listing.Id)
                .Take(settings.MaxResults)
                .ToListAsync(cancellationToken);
        }

        var radiusKm = criteria.RadiusKm ?? settings.DefaultRadiusKm;
        var box = GeoDistance.BoundingBox(latitude, longitude, radiusKm);
        var candidates = await Project(
                Available(criteria.AsOfUtc),
                establishments.Where(establishment =>
                    establishment.Latitude >= box.MinLatitude && establishment.Latitude <= box.MaxLatitude
                    && establishment.Longitude >= box.MinLongitude && establishment.Longitude <= box.MaxLongitude))
            .ToListAsync(cancellationToken);

        return candidates
            .Select(listing => (Listing: listing, Km: DistanceFrom(listing, latitude, longitude)))
            .Where(candidate => candidate.Km <= (double)radiusKm)
            .OrderBy(candidate => candidate.Km)
            .ThenBy(candidate => candidate.Listing.PickupDeadlineUtc)
            .ThenBy(candidate => candidate.Listing.Id)
            .Take(settings.MaxResults)
            .Select(candidate => WithDistance(candidate.Listing, candidate.Km))
            .ToList();
    }

    public async Task<ListingSummaryResponse?> FindAvailableAsync(
        Guid listingId,
        decimal? latitude,
        decimal? longitude,
        DateTimeOffset asOfUtc,
        CancellationToken cancellationToken = default)
    {
        var errors = ListingSearchValidator.ValidatePoint(latitude, longitude);
        if (errors.Count > 0)
            throw new ListingValidationException(errors);

        var listing = await Project(
                Available(asOfUtc).Where(listing => listing.Id == listingId),
                PublicEstablishmentQueries.Enabled(db))
            .SingleOrDefaultAsync(cancellationToken);

        return listing is not null && latitude is { } lat && longitude is { } lon
            ? WithDistance(listing, DistanceFrom(listing, lat, lon))
            : listing;
    }

    public ListingSearchOptionsResponse GetOptions()
    {
        var settings = options.Value;
        return new ListingSearchOptionsResponse(settings.AllowedRadiiKm, settings.DefaultRadiusKm, settings.MaxResults);
    }

    /// <summary>Same rules for list and detail; the deadline is compared with the evaluation instant, never with the stored status alone.</summary>
    private IQueryable<Listing> Available(DateTimeOffset asOfUtc) =>
        db.Set<Listing>()
            .AsNoTracking()
            .Where(listing => listing.Mode == ListingMode.Sale
                && listing.Status == ListingStatus.Active
                && listing.AvailableQuantity > 0
                && listing.IsFoodFit
                && listing.PickupDeadlineUtc > asOfUtc);

    private IQueryable<ListingSummaryResponse> Project(IQueryable<Listing> listings, IQueryable<PublicEstablishment> establishments) =>
        from listing in listings
        join establishment in establishments on listing.EstablishmentId equals establishment.Id
        join category in db.Set<Category>() on listing.CategoryId equals category.Id
        select new ListingSummaryResponse
        {
            Id = listing.Id,
            EstablishmentId = listing.EstablishmentId,
            CategoryId = listing.CategoryId,
            CategoryName = category.Name,
            Title = listing.Title,
            Description = listing.Description,
            Mode = listing.Mode,
            Status = listing.Status,
            InitialQuantity = listing.InitialQuantity,
            AvailableQuantity = listing.AvailableQuantity,
            OriginalUnitPrice = listing.OriginalUnitPrice,
            DiscountedUnitPrice = listing.DiscountedUnitPrice,
            Currency = listing.Currency,
            PickupInstructions = listing.PickupInstructions,
            PaymentInstructions = listing.PaymentInstructions,
            FoodSafetyDeclared = listing.FoodSafetyDeclared,
            IsFoodFit = listing.IsFoodFit,
            PickupStartsAtUtc = listing.PickupStartsAtUtc,
            PickupDeadlineUtc = listing.PickupDeadlineUtc,
            CreatedAtUtc = listing.CreatedAtUtc,
            Establishment = new ListingEstablishmentSummary
            {
                Id = establishment.Id,
                Name = establishment.Name,
                Address = establishment.Address,
                Latitude = establishment.Latitude,
                Longitude = establishment.Longitude,
                TimeZoneId = establishment.TimeZoneId,
            },
        };

    private static double DistanceFrom(ListingSummaryResponse listing, decimal latitude, decimal longitude) =>
        GeoDistance.Kilometers(latitude, longitude, listing.Establishment.Latitude, listing.Establishment.Longitude);

    private static ListingSummaryResponse WithDistance(ListingSummaryResponse listing, double kilometers)
    {
        listing.DistanceKm = Math.Round((decimal)kilometers, 2, MidpointRounding.AwayFromZero);
        return listing;
    }
}
