using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Establishments.Contracts;
using XFood.Application.Modules.Establishments.Services;
using XFood.Domain.Modules.Establishments;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Establishments;

public sealed class EstablishmentProfileService(
    XFoodDbContext db,
    IEstablishmentOnboarding onboarding) : IEstablishmentProfileService
{
    public async Task<EstablishmentProfileResponse> GetAsync(
        Guid establishmentId,
        Guid userId,
        CancellationToken cancellationToken = default)
    {
        await EnsureMembershipAsync(userId, establishmentId, cancellationToken);
        var establishment = await db.Set<Establishment>()
            .AsNoTracking()
            .SingleOrDefaultAsync(item => item.Id == establishmentId, cancellationToken)
            ?? throw new EstablishmentProfileNotFoundException();

        return ToResponse(establishment);
    }

    public async Task<EstablishmentProfileResponse> UpdateAsync(
        Guid establishmentId,
        Guid userId,
        UpdateEstablishmentProfileRequest request,
        CancellationToken cancellationToken = default)
    {
        var validationErrors = EstablishmentProfileValidator.Validate(request);
        if (validationErrors.Count > 0)
            throw new EstablishmentProfileValidationException(validationErrors);

        await EnsureMembershipAsync(userId, establishmentId, cancellationToken);
        var establishment = await db.Set<Establishment>()
            .SingleOrDefaultAsync(item => item.Id == establishmentId, cancellationToken)
            ?? throw new EstablishmentProfileNotFoundException();

        establishment.Name = request.Name.Trim();
        establishment.ContactName = request.ContactName.Trim();
        establishment.ContactEmail = request.ContactEmail.Trim();
        establishment.ContactPhone = request.ContactPhone.Trim();
        establishment.Address = request.Address.Trim();
        establishment.Latitude = request.Latitude;
        establishment.Longitude = request.Longitude;

        await db.SaveChangesAsync(cancellationToken);
        return ToResponse(establishment);
    }

    private async Task EnsureMembershipAsync(Guid userId, Guid establishmentId, CancellationToken cancellationToken)
    {
        var membership = await onboarding.FindActiveMembershipAsync(userId, establishmentId, cancellationToken);
        if (membership is null || membership.Status != EstablishmentStatus.Active)
            throw new EstablishmentProfileForbiddenException();
    }

    private static EstablishmentProfileResponse ToResponse(Establishment establishment) => new()
    {
        Id = establishment.Id,
        Name = establishment.Name,
        ContactName = establishment.ContactName,
        ContactEmail = establishment.ContactEmail,
        ContactPhone = establishment.ContactPhone,
        Address = establishment.Address,
        Latitude = establishment.Latitude,
        Longitude = establishment.Longitude,
        TimeZoneId = establishment.TimeZoneId,
    };
}

