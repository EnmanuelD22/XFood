using Microsoft.EntityFrameworkCore;
using XFood.Application.Modules.Donations;
using XFood.Domain.Modules.Donations;
using XFood.Infrastructure.Persistence;

namespace XFood.Infrastructure.Modules.Donations;

/// <summary>Creates a pending organization and its primary administrator member in the caller's unit of work.</summary>
internal sealed class OrganizationOnboarding(XFoodDbContext db) : IOrganizationOnboarding
{
    public OrganizationMembershipSummary StagePendingOrganization(PendingOrganization data)
    {
        var organization = new Organization
        {
            Id = Guid.CreateVersion7(),
            Name = data.Name,
            ContactName = data.ContactName,
            ContactEmail = data.ContactEmail,
            ContactPhone = data.ContactPhone,
            Address = data.Address,
            VerificationInformation = data.VerificationInformation,
            VerificationStatus = VerificationStatus.Pending,
            CreatedByUserId = data.OwnerUserId,
            CreatedAtUtc = data.CreatedAtUtc,
        };
        db.Add(organization);
        db.Add(new OrganizationMember
        {
            Id = Guid.CreateVersion7(),
            OrganizationId = organization.Id,
            UserId = data.OwnerUserId,
            Role = OrganizationMemberRole.Administrator,
            IsPrimary = true,
            JoinedAtUtc = data.CreatedAtUtc,
            GrantedByUserId = data.OwnerUserId,
        });
        return new OrganizationMembershipSummary(organization.Id, organization.Name, organization.VerificationStatus);
    }

    public Task<OrganizationMembershipSummary?> FindActiveMembershipAsync(Guid userId, CancellationToken cancellationToken) =>
        (from member in db.Set<OrganizationMember>()
         join organization in db.Set<Organization>() on member.OrganizationId equals organization.Id
         where member.UserId == userId && member.RevokedAtUtc == null
         orderby member.IsPrimary descending, member.JoinedAtUtc
         select new OrganizationMembershipSummary(organization.Id, organization.Name, organization.VerificationStatus))
        .FirstOrDefaultAsync(cancellationToken);
}
