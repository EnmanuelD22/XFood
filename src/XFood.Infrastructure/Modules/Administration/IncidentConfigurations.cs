using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using XFood.Domain.Modules.Administration;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Listings;
using XFood.Domain.Modules.Reservations;

namespace XFood.Infrastructure.Modules.Administration;

public sealed class IncidentConfiguration : IEntityTypeConfiguration<Incident>
{
    public void Configure(EntityTypeBuilder<Incident> b)
    {
        b.ToTable("Incidents", "administration", t =>
        {
            t.HasCheckConstraint("CK_Incidents_Status", "[Status] IN (1, 2, 3, 4)");
            t.HasCheckConstraint("CK_Incidents_Kind", "[Kind] IN (1, 2, 3)");
            t.HasCheckConstraint("CK_Incidents_PickupFacts", "([Kind] = 1 AND [ActualQuantity] IS NULL) OR ([Kind] = 2 AND [ActualQuantity] IS NOT NULL AND [ActualQuantity] > 0 AND [ObservedAtUtc] IS NOT NULL AND ([ReservationId] IS NOT NULL OR [DonationAcceptanceId] IS NOT NULL)) OR ([Kind] = 3 AND ([ActualQuantity] IS NULL OR [ActualQuantity] >= 0) AND [ObservedAtUtc] IS NOT NULL AND ([ReservationId] IS NOT NULL OR [DonationAcceptanceId] IS NOT NULL))");
            t.HasCheckConstraint("CK_Incidents_Observation", "[ObservedAtUtc] IS NULL OR [ObservedAtUtc] <= [CreatedAtUtc]");
            t.HasCheckConstraint("CK_Incidents_Target", "(CASE WHEN [ListingId] IS NULL THEN 0 ELSE 1 END + CASE WHEN [ReservationId] IS NULL THEN 0 ELSE 1 END + CASE WHEN [DonationAcceptanceId] IS NULL THEN 0 ELSE 1 END) <= 1");
            t.HasCheckConstraint("CK_Incidents_Closed", "([Status] IN (1, 2) AND [ClosedAtUtc] IS NULL) OR ([Status] IN (3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])");
        });
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(Incident.Title), 200);
        MappingRules.RequiredText(b, nameof(Incident.Description), 4000);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ReporterUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.AssignedToUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<Listing>().WithMany().HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<Reservation>().WithMany().HasForeignKey(x => x.ReservationId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<DonationAcceptance>().WithMany().HasForeignKey(x => x.DonationAcceptanceId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.Status, x.CreatedAtUtc });
        b.HasIndex(x => new { x.ReporterUserId, x.CreatedAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class IncidentStatusChangeConfiguration : IEntityTypeConfiguration<IncidentStatusChange>
{
    public void Configure(EntityTypeBuilder<IncidentStatusChange> b)
    {
        b.ToTable("IncidentStatusChanges", "administration", t => t.HasCheckConstraint("CK_IncidentStatusChanges_Status",
            "[ToStatus] IN (1, 2, 3, 4) AND (([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] IN (1, 2, 3, 4) AND [FromStatus] <> [ToStatus]))"));
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(IncidentStatusChange.Reason), 1000);
        b.HasOne<Incident>().WithMany().HasForeignKey(x => x.IncidentId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.IncidentId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}
