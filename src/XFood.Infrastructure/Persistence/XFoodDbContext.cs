using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace XFood.Infrastructure.Persistence;

/// <summary>
/// The single unit-of-work for the modular monolith. Each module owns its mappings
/// and must place its tables in its own SQL schema.
/// </summary>
public sealed class XFoodDbContext(DbContextOptions<XFoodDbContext> options)
    : IdentityDbContext<IdentityUser<Guid>, IdentityRole<Guid>, Guid>(options)
{
    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);

        builder.Entity<IdentityUser<Guid>>().ToTable("Users", "identity");
        builder.Entity<IdentityRole<Guid>>().ToTable("Roles", "identity");
        builder.Entity<IdentityUserClaim<Guid>>().ToTable("UserClaims", "identity");
        builder.Entity<IdentityUserRole<Guid>>().ToTable("UserRoles", "identity");
        builder.Entity<IdentityUserLogin<Guid>>().ToTable("UserLogins", "identity");
        builder.Entity<IdentityRoleClaim<Guid>>().ToTable("RoleClaims", "identity");
        builder.Entity<IdentityUserToken<Guid>>().ToTable("UserTokens", "identity");

        // Module owners place IEntityTypeConfiguration<T> alongside their infrastructure code.
        builder.ApplyConfigurationsFromAssembly(typeof(XFoodDbContext).Assembly);
    }
}
