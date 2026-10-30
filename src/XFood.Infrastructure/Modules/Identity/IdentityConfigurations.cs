using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using XFood.Domain.Modules.Identity;

namespace XFood.Infrastructure.Modules.Identity;

public sealed class IdentityEmailConfiguration : IEntityTypeConfiguration<IdentityUser<Guid>>
{
    public void Configure(EntityTypeBuilder<IdentityUser<Guid>> b)
    {
        // Keep the original EmailIndex; this additional constraint may expose existing duplicates.
        b.HasIndex(x => x.NormalizedEmail, "UX_Users_NormalizedEmail")
            .IsUnique().HasFilter("[NormalizedEmail] IS NOT NULL");
    }
}

public sealed class AccountProfileConfiguration : IEntityTypeConfiguration<AccountProfile>
{
    public void Configure(EntityTypeBuilder<AccountProfile> b)
    {
        b.ToTable("AccountProfiles", "identity", t => t.HasCheckConstraint("CK_AccountProfiles_Status", "[Status] IN (1, 2)"));
        MappingRules.GuidKey(b, nameof(AccountProfile.UserId));
        MappingRules.RequiredText(b, nameof(AccountProfile.DisplayName), 200);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<IdentityUser<Guid>>().WithOne().HasForeignKey<AccountProfile>(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        MappingRules.Utc(b);
    }
}

public sealed class AccountStatusChangeConfiguration : IEntityTypeConfiguration<AccountStatusChange>
{
    public void Configure(EntityTypeBuilder<AccountStatusChange> b)
    {
        b.ToTable("AccountStatusChanges", "identity", t => t.HasCheckConstraint("CK_AccountStatusChanges_Transition",
            "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND (([FromStatus] = 1 AND [ToStatus] = 2) OR ([FromStatus] = 2 AND [ToStatus] = 1)))"));
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(AccountStatusChange.Reason), 1000);
        b.HasOne<AccountProfile>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.UserId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}
