using System.Net;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Integration;

public sealed class ReadinessSqlServerTests(SqlServerApiFixture fixture) : IClassFixture<SqlServerApiFixture>
{
    [SqlServerFact]
    public async Task Migrated_isolated_database_is_ready()
    {
        using var client = fixture.Factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost")
        });
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/ready")).StatusCode);
    }

    [SqlServerFact]
    public async Task Pending_migration_returns_503_without_applying_it()
    {
        using var scope = fixture.Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
        SqlServerApiFixture.EnsureIsolated(db.Database.GetDbConnection().Database);
        var migration = (await db.Database.GetAppliedMigrationsAsync()).Last();
        var version = await db.Database.SqlQuery<string>(
            $"SELECT [ProductVersion] AS [Value] FROM [__EFMigrationsHistory] WHERE [MigrationId] = {migration}").SingleAsync();
        // Simulate a missing history entry only in this fixture's brand-new disposable database.
        await db.Database.ExecuteSqlInterpolatedAsync($"DELETE FROM [__EFMigrationsHistory] WHERE [MigrationId] = {migration}");
        try
        {
            using var client = fixture.Factory.CreateClient(new Microsoft.AspNetCore.Mvc.Testing.WebApplicationFactoryClientOptions
            {
                BaseAddress = new Uri("https://localhost")
            });
            Assert.Equal(HttpStatusCode.ServiceUnavailable, (await client.GetAsync("/health/ready")).StatusCode);
            Assert.Contains(migration, await db.Database.GetPendingMigrationsAsync());
        }
        finally
        {
            await db.Database.ExecuteSqlInterpolatedAsync(
                $"INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion]) VALUES ({migration}, {version})");
        }
    }
}
