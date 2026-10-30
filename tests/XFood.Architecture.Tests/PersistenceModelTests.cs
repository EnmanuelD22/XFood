using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Migrations;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using XFood.Domain.Modules.Donations;
using XFood.Domain.Modules.Establishments;
using XFood.Domain.Modules.Administration;
using XFood.Domain.Modules.Listings;
using XFood.Domain.Modules.Notifications;
using XFood.Domain.Modules.Reservations;
using XFood.Infrastructure.Persistence;

namespace XFood.Architecture.Tests;

public sealed class PersistenceModelTests
{
    [Fact]
    public void Model_matches_the_last_migration_without_connecting_to_a_database()
    {
        using var context = CreateContext();
        Assert.False(context.Database.HasPendingModelChanges());
    }

    [Fact]
    public void New_foreign_keys_do_not_cascade_delete_or_discard_history_actors()
    {
        using var context = CreateContext();
        var foreignKeys = BusinessEntities(context).SelectMany(entity => entity.GetForeignKeys()).ToArray();
        Assert.NotEmpty(foreignKeys);
        Assert.All(foreignKeys, key => Assert.Equal(DeleteBehavior.NoAction, key.DeleteBehavior));
    }

    [Theory]
    [InlineData(typeof(Listing))]
    [InlineData(typeof(Reservation))]
    [InlineData(typeof(DonationAcceptance))]
    [InlineData(typeof(NotificationOutboxMessage))]
    public void Contended_rows_use_database_generated_concurrency_tokens(Type entityType)
    {
        using var context = CreateContext();
        var version = Model(context).FindEntityType(entityType)!.FindProperty("RowVersion")!;
        Assert.True(version.IsConcurrencyToken);
        Assert.Equal(ValueGenerated.OnAddOrUpdate, version.ValueGenerated);
        Assert.Equal("rowversion", version.GetColumnType());
    }

    [Fact]
    public void Money_and_coordinates_have_explicit_precision()
    {
        using var context = CreateContext();
        var decimals = BusinessEntities(context).SelectMany(entity => entity.GetProperties())
            .Where(property => (Nullable.GetUnderlyingType(property.ClrType) ?? property.ClrType) == typeof(decimal))
            .ToArray();
        Assert.NotEmpty(decimals);
        Assert.All(decimals, property =>
        {
            Assert.NotNull(property.GetPrecision());
            Assert.NotNull(property.GetScale());
            if (property.Name.Contains("Price", StringComparison.Ordinal))
            {
                Assert.Equal(18, property.GetPrecision());
                Assert.Equal(2, property.GetScale());
            }
        });
    }

    [Theory]
    [InlineData(typeof(Reservation), "ConsumerUserId")]
    [InlineData(typeof(DonationAcceptance), "AcceptedByUserId")]
    public void Idempotency_is_unique_per_actor_and_preserves_the_request_hash(Type entityType, string actorProperty)
    {
        using var context = CreateContext();
        var entity = Model(context).FindEntityType(entityType)!;
        Assert.Contains(entity.GetIndexes(), index => index.IsUnique &&
            index.Properties.Select(property => property.Name).SequenceEqual([actorProperty, "IdempotencyKey"]));
        Assert.False(entity.FindProperty("RequestHash")!.IsNullable);
        Assert.EndsWith("_BIN2", entity.FindProperty("IdempotencyKey")!.GetCollation());
    }

    [Theory]
    [InlineData(typeof(ReservationDelivery), "ReservationId")]
    [InlineData(typeof(DonationReceipt), "DonationAcceptanceId")]
    [InlineData(typeof(DonationHandover), "DonationAcceptanceId")]
    public void Full_pickup_confirmations_cannot_be_duplicated(Type entityType, string operationKey)
    {
        using var context = CreateContext();
        var key = Model(context).FindEntityType(entityType)!.FindPrimaryKey()!;
        Assert.Equal(operationKey, Assert.Single(key.Properties).Name);
    }

    [Fact]
    public void Alerts_and_delivery_jobs_have_deduplication_keys()
    {
        using var context = CreateContext();
        AssertUniqueIndex<ListingExpiryAlert>(context, "ListingId", "ThresholdMinutes");
        AssertUniqueIndex<NotificationOutboxMessage>(context, "NotificationId", "Channel");
        AssertUniqueIndex<NotificationOutboxMessage>(context, "NotificationId", "Channel", "DeviceRegistrationId");
        AssertUniqueIndex<NotificationDeliveryAttempt>(context, "OutboxMessageId", "AttemptNumber");
    }

    [Fact]
    public void Category_is_a_required_controlled_reference_without_seed_values()
    {
        using var context = CreateContext();
        var listing = Model(context).FindEntityType(typeof(Listing))!;
        Assert.Null(listing.FindProperty("Category"));
        Assert.False(listing.FindProperty("CategoryId")!.IsNullable);
        Assert.Contains(listing.GetForeignKeys(), key => key.PrincipalEntityType.ClrType == typeof(Category));
        Assert.Empty(Model(context).FindEntityType(typeof(Category))!.GetSeedData());
    }

    [Theory]
    [InlineData(typeof(EstablishmentMember), "EstablishmentId")]
    [InlineData(typeof(OrganizationMember), "OrganizationId")]
    public void Only_one_active_primary_member_is_allowed(Type entityType, string ownerId)
    {
        using var context = CreateContext();
        Assert.Contains(Model(context).FindEntityType(entityType)!.GetIndexes(), index => index.IsUnique
            && index.Properties.Select(p => p.Name).SequenceEqual([ownerId])
            && index.GetFilter() == "[RevokedAtUtc] IS NULL AND [IsPrimary] = 1");
    }

    [Fact]
    public void Transfer_links_both_listings_to_the_same_establishment_without_cascade()
    {
        using var context = CreateContext();
        var keys = Model(context).FindEntityType(typeof(StockTransfer))!.GetForeignKeys()
            .Where(key => key.PrincipalEntityType.ClrType == typeof(Listing)).ToArray();
        Assert.Equal(2, keys.Length);
        Assert.All(keys, key => Assert.Equal(new[] { "Id", "EstablishmentId", "Mode" }, key.PrincipalKey.Properties.Select(p => p.Name)));
    }

    [Fact]
    public void Push_jobs_cannot_reference_another_recipients_device()
    {
        using var context = CreateContext();
        var key = Assert.Single(Model(context).FindEntityType(typeof(NotificationOutboxMessage))!.GetForeignKeys(),
            fk => fk.PrincipalEntityType.ClrType == typeof(DeviceRegistration));
        Assert.Equal(new[] { "DeviceRegistrationId", "RecipientUserId" }, key.Properties.Select(p => p.Name));
        Assert.Equal(new[] { "Id", "UserId" }, key.PrincipalKey.Properties.Select(p => p.Name));
    }

    [Fact]
    public void Pickup_incident_preserves_observed_facts_separately_from_full_confirmation()
    {
        using var context = CreateContext();
        var incident = Model(context).FindEntityType(typeof(Incident))!;
        Assert.True(incident.FindProperty("ActualQuantity")!.IsNullable);
        Assert.True(incident.FindProperty("ObservedAtUtc")!.IsNullable);
        Assert.Contains(incident.GetCheckConstraints(), constraint => constraint.Name == "CK_Incidents_PickupFacts");
        Assert.Equal(120, new XFood.Infrastructure.Modules.Notifications.ExpiryAlertOptions().ThresholdMinutes);
    }

    [Fact]
    public void V1_upgrade_is_additive_and_does_not_mutate_existing_identity_rows()
    {
        using var context = CreateContext();
        var assembly = context.GetService<IMigrationsAssembly>();
        var migrationInfo = Assert.Single(assembly.Migrations, entry => entry.Key.EndsWith("_AddV1DataModel", StringComparison.Ordinal));
        var migration = assembly.CreateMigration(migrationInfo.Value, context.Database.ProviderName!);
        Assert.NotEmpty(migration.UpOperations);
        Assert.All(migration.UpOperations, operation => Assert.True(
            operation is EnsureSchemaOperation or CreateTableOperation or CreateIndexOperation or AddForeignKeyOperation,
            $"Unexpected operation: {operation.GetType().Name}"));
        Assert.DoesNotContain(migration.UpOperations.OfType<CreateTableOperation>(), table =>
            table.Schema == "identity" && new[] { "Users", "Roles", "UserClaims", "UserRoles", "UserLogins", "RoleClaims", "UserTokens" }.Contains(table.Name));
    }

    [Fact]
    public void Original_email_index_is_preserved_and_uniqueness_is_added_separately()
    {
        using var context = CreateContext();
        var indexes = Model(context).FindEntityType(typeof(Microsoft.AspNetCore.Identity.IdentityUser<Guid>))!.GetIndexes();
        Assert.Contains(indexes, index => index.GetDatabaseName() == "EmailIndex" && !index.IsUnique);
        Assert.Contains(indexes, index => index.GetDatabaseName() == "UX_Users_NormalizedEmail" && index.IsUnique
            && index.GetFilter() == "[NormalizedEmail] IS NOT NULL");
    }

    [Theory]
    [InlineData(typeof(Reservation))]
    [InlineData(typeof(DonationAcceptance))]
    public void Operation_foreign_key_includes_listing_mode(Type entityType)
    {
        using var context = CreateContext();
        var key = Assert.Single(Model(context).FindEntityType(entityType)!.GetForeignKeys(),
            fk => fk.PrincipalEntityType.ClrType == typeof(Listing));
        Assert.Equal(new[] { "ListingId", "ListingMode" }, key.Properties.Select(property => property.Name));
        Assert.Equal(new[] { "Id", "Mode" }, key.PrincipalKey.Properties.Select(property => property.Name));
    }

    [Fact]
    public void Domain_does_not_reference_entity_framework_or_aspnet()
    {
        var references = typeof(Listing).Assembly.GetReferencedAssemblies().Select(assembly => assembly.Name!);
        Assert.DoesNotContain(references, name => name.StartsWith("Microsoft.EntityFrameworkCore", StringComparison.Ordinal)
            || name.StartsWith("Microsoft.AspNetCore", StringComparison.Ordinal));
    }

    private static XFoodDbContext CreateContext() => new(new DbContextOptionsBuilder<XFoodDbContext>()
        .UseSqlServer("Server=localhost;Database=XFood_ModelTest;Integrated Security=True")
        .Options);

    private static IModel Model(XFoodDbContext context) => context.GetService<IDesignTimeModel>().Model;

    private static IEnumerable<IEntityType> BusinessEntities(XFoodDbContext context) => Model(context).GetEntityTypes()
        .Where(entity => entity.ClrType.Namespace?.StartsWith("XFood.Domain.Modules.", StringComparison.Ordinal) == true);

    private static void AssertUniqueIndex<T>(XFoodDbContext context, params string[] properties)
    {
        Assert.Contains(Model(context).FindEntityType(typeof(T))!.GetIndexes(), index =>
            index.IsUnique && index.Properties.Select(property => property.Name).SequenceEqual(properties));
    }
}
