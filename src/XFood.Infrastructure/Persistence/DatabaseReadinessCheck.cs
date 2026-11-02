using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Diagnostics.HealthChecks;

namespace XFood.Infrastructure.Persistence;

/// <summary>Read-only readiness; it never creates databases or applies migrations.</summary>
public sealed class DatabaseReadinessCheck(XFoodDbContext db) : IHealthCheck
{
    public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default)
    {
        if (!await db.Database.CanConnectAsync(cancellationToken))
            return HealthCheckResult.Unhealthy("Database unavailable.");

        var pending = await db.Database.GetPendingMigrationsAsync(cancellationToken);
        return pending.Any()
            ? HealthCheckResult.Unhealthy("Database migrations are pending.")
            : HealthCheckResult.Healthy();
    }
}
