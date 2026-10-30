using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using XFood.Domain.Modules.Listings;
using XFood.Domain.Modules.Reservations;

namespace XFood.Infrastructure.Modules.Reservations;

public sealed class ReservationConfiguration : IEntityTypeConfiguration<Reservation>
{
    public void Configure(EntityTypeBuilder<Reservation> b)
    {
        b.ToTable("Reservations", "reservations", t =>
        {
            t.HasCheckConstraint("CK_Reservations_SaleOnly", "[ListingMode] = 1");
            t.HasCheckConstraint("CK_Reservations_Quantity", "[Quantity] > 0");
            t.HasCheckConstraint("CK_Reservations_Price", "[UnitPrice] > 0 AND [Currency] = 'DOP'");
            t.HasCheckConstraint("CK_Reservations_Status", "[Status] IN (1, 2, 3, 4)");
            t.HasCheckConstraint("CK_Reservations_Closed", "([Status] = 1 AND [ClosedAtUtc] IS NULL) OR ([Status] IN (2, 3, 4) AND [ClosedAtUtc] IS NOT NULL AND [ClosedAtUtc] >= [CreatedAtUtc])");
            t.HasCheckConstraint("CK_Reservations_Window", "[PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]");
        });
        MappingRules.GuidKey(b);
        b.HasAlternateKey(x => new { x.Id, x.ListingId });
        b.Property<ListingMode>("ListingMode").HasDefaultValue(ListingMode.Sale).HasSentinel((ListingMode)0);
        b.HasOne<Listing>().WithMany().HasForeignKey("ListingId", "ListingMode")
            .HasPrincipalKey(x => new { x.Id, x.Mode }).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ConsumerUserId).OnDelete(DeleteBehavior.NoAction);
        b.Property(x => x.UnitPrice).HasPrecision(18, 2);
        b.Property(x => x.Currency).HasColumnType("char(3)").UseCollation(MappingRules.BinaryCollation).IsRequired();
        MappingRules.RequiredText(b, nameof(Reservation.ListingTitleSnapshot), 200);
        MappingRules.RequiredText(b, nameof(Reservation.PickupAddressSnapshot), 500);
        MappingRules.RequiredText(b, nameof(Reservation.PickupInstructionsSnapshot), 2000);
        MappingRules.RequiredText(b, nameof(Reservation.PaymentInstructionsSnapshot), 1000);
        MappingRules.RequiredText(b, nameof(Reservation.TimeZoneIdSnapshot), 100);
        MappingRules.RequiredText(b, nameof(Reservation.PickupReference), 32);
        b.Property(x => x.PickupReference).IsUnicode(false).UseCollation(MappingRules.BinaryCollation);
        b.Property(x => x.RowVersion).IsRowVersion();
        MappingRules.Idempotency(b);
        b.HasIndex(x => x.PickupReference).IsUnique();
        b.HasIndex(x => new { x.ConsumerUserId, x.IdempotencyKey }).IsUnique();
        b.HasIndex(x => new { x.ConsumerUserId, x.CreatedAtUtc });
        b.HasIndex(x => new { x.ListingId, x.Status });
        b.HasIndex(x => new { x.Status, x.PickupDeadlineUtc });
        MappingRules.Utc(b);
    }
}

public sealed class ReservationStatusChangeConfiguration : IEntityTypeConfiguration<ReservationStatusChange>
{
    public void Configure(EntityTypeBuilder<ReservationStatusChange> b)
    {
        b.ToTable("ReservationStatusChanges", "reservations", t =>
        {
            t.HasCheckConstraint("CK_ReservationStatusChanges_Transition", "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND [FromStatus] = 1 AND [ToStatus] IN (2, 3, 4))");
            t.HasCheckConstraint("CK_ReservationStatusChanges_Actor", "[ActorUserId] IS NOT NULL OR [ToStatus] = 4");
        });
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(ReservationStatusChange.Reason), 1000);
        b.HasOne<Reservation>().WithMany().HasForeignKey(x => x.ReservationId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.ReservationId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class ReservationDeliveryConfiguration : IEntityTypeConfiguration<ReservationDelivery>
{
    public void Configure(EntityTypeBuilder<ReservationDelivery> b)
    {
        b.ToTable("ReservationDeliveries", "reservations");
        MappingRules.GuidKey(b, nameof(ReservationDelivery.ReservationId));
        b.Property(x => x.Notes).HasMaxLength(1000);
        b.HasOne<Reservation>().WithOne().HasForeignKey<ReservationDelivery>(x => x.ReservationId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ConfirmedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => x.DeliveredAtUtc);
        MappingRules.Utc(b);
    }
}
