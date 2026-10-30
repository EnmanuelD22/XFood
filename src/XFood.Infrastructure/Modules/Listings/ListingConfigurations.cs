using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Listings;
using XFood.Domain.Modules.Reservations;

namespace XFood.Infrastructure.Modules.Listings;

public sealed class ListingConfiguration : IEntityTypeConfiguration<Listing>
{
    public void Configure(EntityTypeBuilder<Listing> b)
    {
        b.ToTable("Listings", "listings", t =>
        {
            t.HasCheckConstraint("CK_Listings_Mode", "[Mode] IN (1, 2)");
            t.HasCheckConstraint("CK_Listings_Status", "[Status] IN (1, 2, 3, 4) AND ([Status] <> 2 OR [AvailableQuantity] = 0)");
            t.HasCheckConstraint("CK_Listings_Quantities", "[InitialQuantity] >= 0 AND [AddedQuantity] >= 0 AND [TransferredInQuantity] >= 0 AND [TransferredOutQuantity] >= 0 AND CAST([InitialQuantity] AS bigint) + [TransferredInQuantity] > 0 AND [AvailableQuantity] >= 0 AND [AssignedQuantity] >= 0 AND [FulfilledQuantity] >= 0 AND [WrittenOffQuantity] >= 0");
            t.HasCheckConstraint("CK_Listings_StockBalance", "CAST([InitialQuantity] AS bigint) + [AddedQuantity] + [TransferredInQuantity] = CAST([AvailableQuantity] AS bigint) + [AssignedQuantity] + [FulfilledQuantity] + [WrittenOffQuantity] + [TransferredOutQuantity]");
            t.HasCheckConstraint("CK_Listings_Prices", "([Mode] = 1 AND [OriginalUnitPrice] IS NOT NULL AND [DiscountedUnitPrice] IS NOT NULL AND [OriginalUnitPrice] > 0 AND [DiscountedUnitPrice] > 0 AND [DiscountedUnitPrice] < [OriginalUnitPrice]) OR ([Mode] = 2 AND [OriginalUnitPrice] IS NULL AND [DiscountedUnitPrice] IS NULL)");
            t.HasCheckConstraint("CK_Listings_Payment", "([Mode] = 1 AND [PaymentInstructions] IS NOT NULL AND LEN(LTRIM(RTRIM([PaymentInstructions]))) > 0) OR ([Mode] = 2 AND [PaymentInstructions] IS NULL)");
            t.HasCheckConstraint("CK_Listings_Currency", "[Currency] = 'DOP'");
            t.HasCheckConstraint("CK_Listings_Window", "[PickupStartsAtUtc] < [PickupDeadlineUtc] AND [CreatedAtUtc] < [PickupDeadlineUtc]");
            t.HasCheckConstraint("CK_Listings_FoodSafety", "[FoodSafetyDeclared] = 1");
        });
        MappingRules.GuidKey(b);
        b.HasAlternateKey(x => new { x.Id, x.Mode });
        b.HasAlternateKey(x => new { x.Id, x.EstablishmentId, x.Mode });
        MappingRules.RequiredText(b, nameof(Listing.Title), 200);
        MappingRules.RequiredText(b, nameof(Listing.Description), 4000);
        MappingRules.RequiredText(b, nameof(Listing.PickupInstructions), 2000);
        b.Property(x => x.PaymentInstructions).HasMaxLength(1000);
        b.Property(x => x.Currency).HasColumnType("char(3)").UseCollation(MappingRules.BinaryCollation).IsRequired();
        b.Property(x => x.OriginalUnitPrice).HasPrecision(18, 2);
        b.Property(x => x.DiscountedUnitPrice).HasPrecision(18, 2);
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasOne<Establishment>().WithMany().HasForeignKey(x => x.EstablishmentId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.CreatedByUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.Status, x.Mode, x.PickupDeadlineUtc });
        b.HasIndex(x => new { x.EstablishmentId, x.CreatedAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class CategoryConfiguration : IEntityTypeConfiguration<Category>
{
    public void Configure(EntityTypeBuilder<Category> b)
    {
        b.ToTable("Categories", "listings");
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(Category.Name), 100);
        b.Property(x => x.Name).UseCollation("Latin1_General_100_CI_AI");
        b.Property(x => x.RowVersion).IsRowVersion();
        b.HasIndex(x => x.Name).IsUnique();
        MappingRules.Utc(b);
    }
}

public sealed class StockTransferConfiguration : IEntityTypeConfiguration<StockTransfer>
{
    public void Configure(EntityTypeBuilder<StockTransfer> b)
    {
        b.ToTable("StockTransfers", "listings", t =>
        {
            t.HasCheckConstraint("CK_StockTransfers_Quantity", "[Quantity] > 0");
            t.HasCheckConstraint("CK_StockTransfers_DifferentListings", "[SourceListingId] <> [DestinationListingId]");
            t.HasCheckConstraint("CK_StockTransfers_Modes", "[SourceMode] IN (1, 2) AND [DestinationMode] IN (1, 2)");
        });
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(StockTransfer.Reason), 1000);
        b.HasOne<Listing>().WithMany().HasForeignKey(x => new { x.SourceListingId, x.EstablishmentId, x.SourceMode })
            .HasPrincipalKey(x => new { x.Id, x.EstablishmentId, x.Mode }).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<Listing>().WithMany().HasForeignKey(x => new { x.DestinationListingId, x.EstablishmentId, x.DestinationMode })
            .HasPrincipalKey(x => new { x.Id, x.EstablishmentId, x.Mode }).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.SourceListingId, x.OccurredAtUtc });
        b.HasIndex(x => new { x.DestinationListingId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class ListingFitnessChangeConfiguration : IEntityTypeConfiguration<ListingFitnessChange>
{
    public void Configure(EntityTypeBuilder<ListingFitnessChange> b)
    {
        b.ToTable("ListingFitnessChanges", "listings", t => t.HasCheckConstraint("CK_ListingFitnessChanges_Changed", "[FromIsFoodFit] <> [ToIsFoodFit]"));
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(ListingFitnessChange.Reason), 1000);
        b.HasOne<Listing>().WithMany().HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.ListingId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class StockAdjustmentConfiguration : IEntityTypeConfiguration<StockAdjustment>
{
    public void Configure(EntityTypeBuilder<StockAdjustment> b)
    {
        b.ToTable("StockAdjustments", "listings", t =>
        {
            t.HasCheckConstraint("CK_StockAdjustments_Kind", "[Kind] IN (1, 2, 3)");
            t.HasCheckConstraint("CK_StockAdjustments_Quantity", "[Quantity] > 0");
            t.HasCheckConstraint("CK_StockAdjustments_Operation", "([ReservationId] IS NULL OR [DonationAcceptanceId] IS NULL) AND ([Kind] <> 1 OR ([ReservationId] IS NULL AND [DonationAcceptanceId] IS NULL))");
            t.HasCheckConstraint("CK_StockAdjustments_Actor", "[ActorUserId] IS NOT NULL OR [Kind] = 3");
        });
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(StockAdjustment.Reason), 1000);
        b.HasOne<Listing>().WithMany().HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<Reservation>().WithMany().HasForeignKey(x => new { x.ReservationId, x.ListingId })
            .HasPrincipalKey(x => new { x.Id, x.ListingId }).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<DonationAcceptance>().WithMany().HasForeignKey(x => new { x.DonationAcceptanceId, x.ListingId })
            .HasPrincipalKey(x => new { x.Id, x.ListingId }).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => x.ReservationId).IsUnique().HasFilter("[ReservationId] IS NOT NULL");
        b.HasIndex(x => x.DonationAcceptanceId).IsUnique().HasFilter("[DonationAcceptanceId] IS NOT NULL");
        b.HasIndex(x => new { x.ListingId, x.Kind, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}

public sealed class ListingStatusChangeConfiguration : IEntityTypeConfiguration<ListingStatusChange>
{
    public void Configure(EntityTypeBuilder<ListingStatusChange> b)
    {
        b.ToTable("ListingStatusChanges", "listings", t =>
        {
            t.HasCheckConstraint("CK_ListingStatusChanges_Transition", "([FromStatus] IS NULL AND [ToStatus] = 1) OR ([FromStatus] IS NOT NULL AND (([FromStatus] = 1 AND [ToStatus] IN (2, 3, 4)) OR ([FromStatus] = 2 AND [ToStatus] IN (1, 3, 4))))");
            t.HasCheckConstraint("CK_ListingStatusChanges_Actor", "[ActorUserId] IS NOT NULL OR [ToStatus] IN (1, 2, 4)");
        });
        MappingRules.GuidKey(b);
        MappingRules.RequiredText(b, nameof(ListingStatusChange.Reason), 1000);
        b.HasOne<Listing>().WithMany().HasForeignKey(x => x.ListingId).OnDelete(DeleteBehavior.NoAction);
        b.HasOne<IdentityUser<Guid>>().WithMany().HasForeignKey(x => x.ActorUserId).OnDelete(DeleteBehavior.NoAction);
        b.HasIndex(x => new { x.ListingId, x.OccurredAtUtc });
        MappingRules.Utc(b);
    }
}
