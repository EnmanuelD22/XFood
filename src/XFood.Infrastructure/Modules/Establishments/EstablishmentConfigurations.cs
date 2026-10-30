using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using XFood.Domain.Modules.Establishments;

namespace XFood.Infrastructure.Modules.Establishments;

public sealed class EstablishmentConfiguration : IEntityTypeConfiguration<Establishment>
{
    public void Configure(EntityTypeBuilder<Establishment> b)
    {
        b.ToTable("Establishments", "establishments", t =>
        {
            t.HasCheckConstraint("CK_Establishments_Status", "[Status] IN (1, 2, 3)");
            t.HasCheckConstraint("CK_Establishments_Coordinates", "[Latitude] BETWEEN -90 AND 90 AND [Longitude] BETWEEN -180 AND 180");
        });
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(Establishment.Name), 200);
        MappingRules.RequiredText(b, nameof(Establishment.ContactName), 200);
        MappingRules.RequiredText(b, nameof(Establishment.ContactEmail), 320);
        MappingRules.RequiredText(b, nameof(Establishment.ContactPhone), 32);
        MappingRules.RequiredText(b, nameof(Establishment.Address), 500);
        MappingRules.RequiredText(b, nameof(Establishment.TimeZoneId), 100);
        b.Property(x => x.Latitude).HasPrecision(9, 6);
        b.Property(x => x.Longitude).HasPrecision(9, 6);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.Status, x.Latitude, x.Longitude });
        MappingRules.Utc(b);
    }
}

public sealed class EstablishmentMemberConfiguration : IEntityTypeConfiguration<EstablishmentMember>
{
    public void Configure(EntityTypeBuilder<EstablishmentMember> b)
    {
        b.ToTable("EstablishmentMembers", "establishments", t =>
        {
            t.HasCheckConstraint("CK_EstablishmentMembers_Role", "[Role] IN (1, 2)");
            t.HasCheckConstraint("CK_EstablishmentMembers_Revocation", "([RevokedAtUtc] IS NULL AND [RevokedByUserId] IS NULL) OR ([RevokedAtUtc] IS NOT NULL AND [RevokedByUserId] IS NOT NULL AND [RevokedAtUtc] >= [JoinedAtUtc])");
        });
        MappingRules.GuidKey(b);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<Establishment>().WithMany().HasForeignKey(x => x.EstablishmentId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.GrantedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.RevokedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.EstablishmentId, x.UserId }).IsUnique().HasFilter("[RevokedAtUtc] IS NULL");
        b.HasIndex(x => x.EstablishmentId, "UX_EstablishmentMembers_ActivePrimary").IsUnique()
            .HasFilter("[RevokedAtUtc] IS NULL AND [IsPrimary] = 1");
        b.HasIndex(x => new { x.UserId, x.RevokedAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class EstablishmentStatusChangeConfiguration : IEntityTypeConfiguration<EstablishmentStatusChange>
{
    public void Configure(EntityTypeBuilder<EstablishmentStatusChange> b)
    {
        b.ToTable("EstablishmentStatusChanges", "establishments", t => t.HasCheckConstraint("CK_EstablishmentStatusChanges_Status",
            "[ToStatus] IN (1, 2, 3) AND ([FromStatus] IS NULL OR ([FromStatus] IN (1, 2, 3) AND [FromStatus] <> [ToStatus]))"));
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(EstablishmentStatusChange.Reason), 1000);
        b.HasOne<Establishment>().WithMany().HasForeignKey(x => x.EstablishmentId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.EstablishmentId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}
