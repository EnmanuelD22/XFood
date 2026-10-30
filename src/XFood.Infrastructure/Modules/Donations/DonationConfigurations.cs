using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Listings;

namespace XFood.Infrastructure.Modules.Donations;

public sealed class OrganizationConfiguration : IEntityTypeConfiguration<Organization>
{
    public void Configure(EntityTypeBuilder<Organization> b)
    {
        b.ToTable("Organizations", "donations", t => t.HasCheckConstraint("CK_Organizations_VerificationStatus", "[VerificationStatus] IN (1, 2, 3, 4)"));
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(Organization.Name), 200);
        MappingRules.RequiredText(b, nameof(Organization.ContactName), 200);
        MappingRules.RequiredText(b, nameof(Organization.ContactEmail), 320);
        MappingRules.RequiredText(b, nameof(Organization.ContactPhone), 32);
        MappingRules.RequiredText(b, nameof(Organization.Address), 500);
        b.Property(x => x.VerificationInformation).HasMaxLength(4000);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.VerificationStatus, x.CreatedAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class OrganizationMemberConfiguration : IEntityTypeConfiguration<OrganizationMember>
{
    public void Configure(EntityTypeBuilder<OrganizationMember> b)
    {
        b.ToTable("OrganizationMembers", "donations", t =>
        {
            t.HasCheckConstraint("CK_OrganizationMembers_Role", "[Role] IN (1, 2)");
            t.HasCheckConstraint("CK_OrganizationMembers_Revocation", "([RevokedAtUtc] IS NULL AND [RevokedByUserId] IS NULL) OR ([RevokedAtUtc] IS NOT NULL AND [RevokedByUserId] IS NOT NULL AND [RevokedAtUtc] >= [JoinedAtUtc])");
        });
        MappingRules.GuidKey(b);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.GrantedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.RevokedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.OrganizationId, x.UserId }).IsUnique().HasFilter("[RevokedAtUtc] IS NULL");
        b.HasIndex(x => x.OrganizationId, "UX_OrganizationMembers_ActivePrimary").IsUnique()
            .HasFilter("[RevokedAtUtc] IS NULL AND [IsPrimary] = 1");
        b.HasIndex(x => new { x.UserId, x.RevokedAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class OrganizationReviewConfiguration : IEntityTypeConfiguration<OrganizationReview>
{
    public void Configure(EntityTypeBuilder<OrganizationReview> b)
    {
        b.ToTable("OrganizationReviews", "donations", t => t.HasCheckConstraint("CK_OrganizationReviews_Status",
            "[FromStatus] IN (1, 2, 3, 4) AND [ToStatus] IN (2, 3, 4)"));
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(OrganizationReview.Reason), 1000);
        MappingRules.RequiredText(b, nameof(OrganizationReview.NameSnapshot), 200);
        MappingRules.RequiredText(b, nameof(OrganizationReview.ContactNameSnapshot), 200);
        MappingRules.RequiredText(b, nameof(OrganizationReview.ContactEmailSnapshot), 320);
        MappingRules.RequiredText(b, nameof(OrganizationReview.ContactPhoneSnapshot), 32);
        MappingRules.RequiredText(b, nameof(OrganizationReview.AddressSnapshot), 500);
        b.Property(x => x.VerificationInformationSnapshot).HasMaxLength(4000);
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ReviewerUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.OrganizationId, x.ReviewedAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class DonationAcceptanceConfiguration : IEntityTypeConfiguration<DonationAcceptance>
{
    public void Configure(EntityTypeBuilder<DonationAcceptance> b)
    {
        b.ToTable("DonationAcceptances", "donations", t =>
        {
            t.HasCheckConstraint("CK_DonationAcceptances_DonationOnly", "[ListingMode] = 2");
            t.HasCheckConstraint("CK_DonationAcceptances_Quantity", "[Quantity] > 0");
            t.HasCheckConstraint("CK_DonationAcceptances_Status", "[Status] IN (1, 2, 3, 4)");
            t.HasCheckConstraint("CK_DonationAcceptances_Closed", "([Status] = 1 AND [ClosedAtUtc] IS NULL) OR ([Status] IN (2, 3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])");
            t.HasCheckConstraint("CK_DonationAcceptances_Window", "[PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]");
        });
        MappingRules.GuidKey(b);
        b.HasAlternateKey(x => new { x.Id, x.ListingId });
        b.Property<ListingMode>("ListingMode").HasDefaultValue(ListingMode.Donation).HasSentinel((ListingMode)0);
        b.HasOne<Listing>().WithMany().HasForeignKey("ListingId", "ListingMode")
            .HasPrincipalKey(x => new { x.Id, x.Mode }).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<Organization>().WithMany().HasForeignKey(x => x.OrganizationId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.AcceptedByUserId).OnDelete(DeleteBehavior.NoAction);
        MappingRules.RequiredText(b, nameof(DonationAcceptance.ListingTitleSnapshot), 200);
        MappingRules.RequiredText(b, nameof(DonationAcceptance.PickupAddressSnapshot), 500);
        MappingRules.RequiredText(b, nameof(DonationAcceptance.PickupInstructionsSnapshot), 2000);
        MappingRules.RequiredText(b, nameof(DonationAcceptance.TimeZoneIdSnapshot), 100);
        MappingRules.Idempotency(b);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasIndex(x => new { x.AcceptedByUserId, x.IdempotencyKey }).IsUnique();
        b.HasIndex(x => new { x.OrganizationId, x.CreatedAtUtc });
        b.HasIndex(x => new { x.ListingId, x.Status });
        b.HasIndex(x => new { x.Status, x.PickupDeadlineUtc });
        MappingRules.Utc(b);
    }
}

public sealed class DonationAcceptanceStatusChangeConfiguration : IEntityTypeConfiguration<DonationAcceptanceStatusChange>
{
    public void Configure(EntityTypeBuilder<DonationAcceptanceStatusChange> b)
    {
        b.ToTable("DonationAcceptanceStatusChanges", "donations", t =>
        {
            t.HasCheckConstraint("CK_DonationAcceptanceStatusChanges_Transition", "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] = 1 AND [ToStatus] IN (2, 3, 4))");
            t.HasCheckConstraint("CK_DonationAcceptanceStatusChanges_Actor", "[ActorUserId] IS NOT NULL OR [ToStatus] = 4");
        });
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(DonationAcceptanceStatusChange.Reason), 1000);
        b.HasOne<DonationAcceptance>().WithMany().HasForeignKey(x => x.DonationAcceptanceId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.DonationAcceptanceId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class DonationHandoverConfiguration : IEntityTypeConfiguration<DonationHandover>
{
    public void Configure(EntityTypeBuilder<DonationHandover> b)
    {
        b.ToTable("DonationHandovers", "donations");
        MappingRules.GuidKey(b, nameof(DonationHandover.DonationAcceptanceId));
        b.Property(x => x.Notes).HasMaxLength(1000);
        b.HasOne<DonationAcceptance>().WithOne().HasForeignKey<DonationHandover>(x => x.DonationAcceptanceId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ConfirmedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => x.HandedOverAtUtc);
        MappingRules.Utc(b);
    }
}

public sealed class DonationReceiptConfiguration : IEntityTypeConfiguration<DonationReceipt>
{
    public void Configure(EntityTypeBuilder<DonationReceipt> b)
    {
        b.ToTable("DonationReceipts", "donations");
        MappingRules.GuidKey(b, nameof(DonationReceipt.DonationAcceptanceId));
        b.Property(x => x.Notes).HasMaxLength(1000);
        b.HasOne<DonationAcceptance>().WithOne().HasForeignKey<DonationReceipt>(x => x.DonationAcceptanceId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ReceivedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => x.ReceivedAtUtc);
        MappingRules.Utc(b);
    }
}
