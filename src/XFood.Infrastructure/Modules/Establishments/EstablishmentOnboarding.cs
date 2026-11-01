using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Establishments;
using XFood.Domain.Modules.Establishments;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Establishments;

/// <summary>Creates an active establishment, its primary owner and the initial status event in the caller's unit of work.</summary>
internal sealed class EstablishmentOnboarding(XFoodDbContext db) : IEstablishmentOnboarding
{
    public EstablishmentMembershipSummary StageEstablishment(NewEstablishmentProfile data)
    {
        var establishment = new Establishment
        {
            Id = Guid.CreateVersion7(),
            Name = data.Name,
            ContactName = data.ContactName,
            ContactEmail = data.ContactEmail,
            ContactPhone = data.ContactPhone,
            Address = data.Address,
            Latitude = data.Latitude,
            Longitude = data.Longitude,
            TimeZoneId = data.TimeZoneId,
            Status = EstablishmentStatus.Active,
            CreatedByUserId = data.OwnerUserId,
            CreatedAtUtc = data.CreatedAtUtc,
        };
        var owner = new EstablishmentMember
        {
            Id = Guid.CreateVersion7(),
            EstablishmentId = establishment.Id,
            UserId = data.OwnerUserId,
            Role = EstablishmentMemberRole.Owner,
            IsPrimary = true,
            JoinedAtUtc = data.CreatedAtUtc,
            GrantedByUserId = data.OwnerUserId,
        };
        db.Add(establishment);
        db.Add(owner);
        db.Add(new EstablishmentStatusChange
        {
            Id = Guid.CreateVersion7(),
            EstablishmentId = establishment.Id,
            FromStatus = null,
            ToStatus = EstablishmentStatus.Active,
            ActorUserId = data.OwnerUserId,
            Reason = "Registro público del establecimiento.",
            OccurredAtUtc = data.CreatedAtUtc,
        });
        return new EstablishmentMembershipSummary(establishment.Id, establishment.Name, establishment.Status, owner.Role, owner.IsPrimary);
    }

    public async Task<IReadOnlyList<EstablishmentMembershipSummary>> ListActiveMembershipsAsync(Guid userId, CancellationToken cancellationToken) =>
        await (from member in db.Set<EstablishmentMember>()
               join establishment in db.Set<Establishment>() on member.EstablishmentId equals establishment.Id
               where member.UserId == userId && member.RevokedAtUtc == null
               orderby member.IsPrimary descending, establishment.Name
               select new EstablishmentMembershipSummary(establishment.Id, establishment.Name, establishment.Status, member.Role, member.IsPrimary))
            .ToListAsync(cancellationToken);

    public Task<EstablishmentMembershipSummary?> FindActiveMembershipAsync(Guid userId, Guid establishmentId, CancellationToken cancellationToken) =>
        (from member in db.Set<EstablishmentMember>()
         join establishment in db.Set<Establishment>() on member.EstablishmentId equals establishment.Id
         where member.UserId == userId && member.RevokedAtUtc == null && establishment.Id == establishmentId
         select new EstablishmentMembershipSummary(establishment.Id, establishment.Name, establishment.Status, member.Role, member.IsPrimary))
        .FirstOrDefaultAsync(cancellationToken);
}
