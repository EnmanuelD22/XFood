using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Listings;
using XFood.Domain.Modules.Notifications;
using XFood.Domain.Modules.Reservations;

namespace XFood.Infrastructure.Modules.Notifications;

public sealed class NotificationConfiguration : IEntityTypeConfiguration<Notification>
{
    public void Configure(EntityTypeBuilder<Notification> b)
    {
        b.ToTable("Notifications", "notifications", t =>
        {
            t.HasCheckConstraint("CK_Notifications_Target", "([Kind] IN (1, 2, 3, 4) AND [ReservationId] IS NOT NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] IN (5, 6, 7, 8) AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NOT NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] = 9 AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NOT NULL AND [ListingExpiryAlertId] IS NULL) OR ([Kind] = 10 AND [ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL AND [OrganizationReviewId] IS NULL AND [ListingExpiryAlertId] IS NOT NULL)");
            t.HasCheckConstraint("CK_Notifications_Read", "[ReadAtUtc] IS NULL OR [ReadAtUtc] >= [CreatedAtUtc]");
        });
        MappingRules.GuidKey(b);
        b.HasAlternateKey(x => new { x.Id, x.RecipientUserId });
        MappingRules.RequiredText(b, nameof(Notification.EventKey), 128);
        b.Property(x => x.EventKey).IsUnicode(false).UseCollation(MappingRules.BinaryCollation);
        MappingRules.RequiredText(b, nameof(Notification.Subject), 200);
        MappingRules.RequiredText(b, nameof(Notification.Body), 4000);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.RecipientUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<Reservation>().WithMany().HasForeignKey(x => x.ReservationId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<DonationAcceptance>().WithMany().HasForeignKey(x => x.DonationAcceptanceId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<OrganizationReview>().WithMany().HasForeignKey(x => x.OrganizationReviewId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<ListingExpiryAlert>().WithMany().HasForeignKey(x => x.ListingExpiryAlertId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.RecipientUserId, x.EventKey }).IsUnique();
        b.HasIndex(x => new { x.RecipientUserId, x.CreatedAtUtc });
        b.HasIndex(x => new { x.RecipientUserId, x.ReadAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class NotificationOutboxMessageConfiguration : IEntityTypeConfiguration<NotificationOutboxMessage>
{
    public void Configure(EntityTypeBuilder<NotificationOutboxMessage> b)
    {
        b.ToTable("NotificationOutboxMessages", "notifications", t =>
        {
            t.HasCheckConstraint("CK_NotificationOutboxMessages_Channel", "[Channel] IN (1, 2)");
            t.HasCheckConstraint("CK_NotificationOutboxMessages_Destination", "([Channel] = 1 AND [DeviceRegistrationId] IS NULL AND [Destination] IS NOT NULL AND LEN(LTRIM(RTRIM([Destination]))) > 0) OR ([Channel] = 2 AND [DeviceRegistrationId] IS NOT NULL AND [Destination] IS NULL)");
            t.HasCheckConstraint("CK_NotificationOutboxMessages_Status", "[Status] IN (1, 2, 3, 4)");
            t.HasCheckConstraint("CK_NotificationOutboxMessages_Attempts", "[AttemptCount] >= 0");
            t.HasCheckConstraint("CK_NotificationOutboxMessages_Lease", "([Status] = 2 AND [LeaseId] IS NOT NULL AND [LeaseExpiresAtUtc] IS NOT NULL AND [LeaseExpiresAtUtc] >= [CreatedAtUtc]) OR ([Status] IN (1, 3, 4) AND [LeaseId] IS NULL AND [LeaseExpiresAtUtc] IS NULL)");
            t.HasCheckConstraint("CK_NotificationOutboxMessages_Sent", "([Status] = 3 AND [SentAtUtc] IS NOT NULL AND [SentAtUtc] >= [CreatedAtUtc]) OR ([Status] IN (1, 2, 4) AND [SentAtUtc] IS NULL)");
            t.HasCheckConstraint("CK_NotificationOutboxMessages_Available", "[AvailableAtUtc] >= [CreatedAtUtc]");
        });
        MappingRules.GuidKey(b);
        b.Property(x => x.Destination).HasMaxLength(2048);
        b.Property(x => x.LastError).HasMaxLength(2000);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<Notification>().WithMany().HasForeignKey(x => new { x.NotificationId, x.RecipientUserId })
            .HasPrincipalKey(x => new { x.Id, x.RecipientUserId }).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<DeviceRegistration>().WithMany().HasForeignKey(x => new { x.DeviceRegistrationId, x.RecipientUserId })
            .HasPrincipalKey(x => new { x.Id, x.UserId }).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.NotificationId, x.Channel }).IsUnique().HasFilter("[DeviceRegistrationId] IS NULL");
        b.HasIndex(x => new { x.NotificationId, x.Channel, x.DeviceRegistrationId }).IsUnique()
            .HasFilter("[DeviceRegistrationId] IS NOT NULL");
        b.HasIndex(x => new { x.Status, x.AvailableAtUtc });
        b.HasIndex(x => new { x.Status, x.LeaseExpiresAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class DeviceRegistrationConfiguration : IEntityTypeConfiguration<DeviceRegistration>
{
    public void Configure(EntityTypeBuilder<DeviceRegistration> b)
    {
        b.ToTable("DeviceRegistrations", "notifications", t =>
        {
            t.HasCheckConstraint("CK_DeviceRegistrations_Platform", "[Platform] IN (1, 2)");
            t.HasCheckConstraint("CK_DeviceRegistrations_TokenHash", "LEN([TokenHash]) = 64 AND [TokenHash] NOT LIKE '%[^0-9A-F]%'");
            t.HasCheckConstraint("CK_DeviceRegistrations_Dates", "[RefreshedAtUtc] >= [RegisteredAtUtc] AND ([RevokedAtUtc] IS NULL OR [RevokedAtUtc] >= [RefreshedAtUtc])");
        });
        MappingRules.GuidKey(b);
        b.HasAlternateKey(x => new { x.Id, x.UserId });
        MappingRules.RequiredText(b, nameof(DeviceRegistration.Provider), 50);
        MappingRules.RequiredText(b, nameof(DeviceRegistration.ProtectedPushToken), 4096);
        b.Property(x => x.Provider).IsUnicode(false).UseCollation(MappingRules.BinaryCollation);
        b.Property(x => x.TokenHash).HasColumnType("char(64)").UseCollation(MappingRules.BinaryCollation).IsRequired();
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.UserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => x.InstallationId).IsUnique().HasFilter("[RevokedAtUtc] IS NULL");
        b.HasIndex(x => new { x.Provider, x.TokenHash }).IsUnique().HasFilter("[RevokedAtUtc] IS NULL");
        b.HasIndex(x => new { x.UserId, x.RevokedAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class NotificationDeliveryAttemptConfiguration : IEntityTypeConfiguration<NotificationDeliveryAttempt>
{
    public void Configure(EntityTypeBuilder<NotificationDeliveryAttempt> b)
    {
        b.ToTable("NotificationDeliveryAttempts", "notifications", t =>
        {
            t.HasCheckConstraint("CK_NotificationDeliveryAttempts_Number", "[AttemptNumber] > 0");
            t.HasCheckConstraint("CK_NotificationDeliveryAttempts_Result", "([Outcome] = 1 AND [FinishedAtUtc] IS NULL AND [Error] IS NULL) OR ([Outcome] = 2 AND [FinishedAtUtc] IS NOT NULL AND [FinishedAtUtc] >= [StartedAtUtc] AND [Error] IS NULL) OR ([Outcome] = 3 AND [FinishedAtUtc] IS NOT NULL AND [FinishedAtUtc] >= [StartedAtUtc] AND [Error] IS NOT NULL AND LEN(LTRIM(RTRIM([Error]))) > 0)");
        });
        MappingRules.GuidKey(b);
        b.Property(x => x.Error).HasMaxLength(2000);
        b.Property(x => x.ProviderMessageId).HasMaxLength(256);
        b.HasOne<NotificationOutboxMessage>().WithMany().HasForeignKey(x => x.OutboxMessageId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.OutboxMessageId, x.AttemptNumber }).IsUnique();
        MappingRules.Utc(b);
    }
}

public sealed class ListingExpiryAlertConfiguration : IEntityTypeConfiguration<ListingExpiryAlert>
{
    public void Configure(EntityTypeBuilder<ListingExpiryAlert> b)
    {
        b.ToTable("ListingExpiryAlerts", "notifications", t =>
        {
            t.HasCheckConstraint("CK_ListingExpiryAlerts_Threshold", "[ThresholdMinutes] > 0");
            t.HasCheckConstraint("CK_ListingExpiryAlerts_Quantity", "[AvailableQuantitySnapshot] > 0");
            t.HasCheckConstraint("CK_ListingExpiryAlerts_Deadline", "[CreatedAtUtc] < [DeadlineSnapshotUtc]");
        });
        MappingRules.GuidKey(b);
        b.HasOne<Listing>().WithMany().HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.ListingId, x.ThresholdMinutes }).IsUnique();
        MappingRules.Utc(b);
    }
}
