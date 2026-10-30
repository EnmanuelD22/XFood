using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace XFood.Infrastructure.Modules;

/// <summary>Storage rules shared by the new module tables, without changing the applied Identity model.</summary>
internal static class MappingRules
{
    internal const string BinaryCollation = "Latin1_General_100_BIN2";

    internal static void GuidKey<T>(EntityTypeBuilder<T> b, string name = "Id") where T : class
    {
        b.HasKey(name);
        b.Property<Guid>(name).ValueGeneratedNever();
    }

    internal static void RequiredText<T>(EntityTypeBuilder<T> b, string name, int length) where T : class
    {
        b.Property<string>(name).HasMaxLength(length).IsRequired();
        b.ToTable(t => t.HasCheckConstraint($"CK_{b.Metadata.GetTableName()}_{name}_NotBlank",
            $"LEN(LTRIM(RTRIM([{name}]))) > 0"));
    }

    internal static void Utc<T>(EntityTypeBuilder<T> b) where T : class
    {
        var dates = typeof(T).GetProperties()
            .Where(p => p.PropertyType == typeof(DateTimeOffset) || p.PropertyType == typeof(DateTimeOffset?))
            .ToArray();
        foreach (var date in dates)
            b.Property(date.Name).HasPrecision(3);
        if (dates.Length > 0)
        {
            b.ToTable(t => t.HasCheckConstraint($"CK_{b.Metadata.GetTableName()}_Utc",
                string.Join(" AND ", dates.Select(p => $"([{p.Name}] IS NULL OR DATEPART(TZOFFSET, [{p.Name}]) = 0)"))));
        }
    }

    internal static void Idempotency<T>(EntityTypeBuilder<T> b) where T : class
    {
        b.Property<string>("IdempotencyKey").HasMaxLength(128).IsUnicode(false)
            .UseCollation(BinaryCollation).IsRequired();
        b.Property<string>("RequestHash").HasColumnType("char(64)")
            .UseCollation(BinaryCollation).IsRequired();
        b.ToTable(t =>
        {
            t.HasCheckConstraint($"CK_{b.Metadata.GetTableName()}_IdempotencyKey", "LEN([IdempotencyKey]) > 0 AND DATALENGTH([IdempotencyKey]) = DATALENGTH(LTRIM(RTRIM([IdempotencyKey])))");
            t.HasCheckConstraint($"CK_{b.Metadata.GetTableName()}_RequestHash", "LEN([RequestHash]) = 64 AND [RequestHash] NOT LIKE '%[^0-9A-F]%'");
        });
    }
}
