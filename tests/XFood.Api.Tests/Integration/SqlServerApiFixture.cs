using System.Text.RegularExpressions;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Integration;

/// <summary>
/// Runs the real API against a brand-new database <c>XFood_Tests_&lt;guid&gt;</c> on the server given by
/// <c>XFOOD_TEST_SQLSERVER</c> (a server connection string; its database name is ignored). The database is
/// migrated at start and dropped at the end. API user secrets are never read, so <c>XFoodDB</c> is never used.
/// </summary>
public sealed partial class SqlServerApiFixture : IAsyncLifetime
{
    public const string ServerVariable = "XFOOD_TEST_SQLSERVER";
    public const string RequireVariable = "XFOOD_REQUIRE_SQL_TESTS";
    public const string PanelOrigin = "https://panel.xfood.test";

    public static string? ServerConnectionString =>
        Environment.GetEnvironmentVariable(ServerVariable) is { Length: > 0 } value ? value : null;

    /// <summary>Set XFOOD_REQUIRE_SQL_TESTS=true before integrating so missing SQL Server fails instead of skipping.</summary>
    public static bool Required =>
        string.Equals(Environment.GetEnvironmentVariable(RequireVariable), "true", StringComparison.OrdinalIgnoreCase);

    public string DatabaseName { get; } = $"XFood_Tests_{Guid.NewGuid():N}";

    public WebApplicationFactory<Program> Factory { get; private set; } = null!;

    private string? connectionString;

    public async Task InitializeAsync()
    {
        if (ServerConnectionString is null)
        {
            if (Required)
                throw new InvalidOperationException($"{RequireVariable}=true but {ServerVariable} is not set.");
            return;
        }

        var builder = new SqlConnectionStringBuilder(ServerConnectionString) { InitialCatalog = DatabaseName };
        EnsureIsolated(builder.InitialCatalog);
        connectionString = builder.ConnectionString;
        Factory = new ApiFactory(connectionString);

        using var scope = Factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<XFoodDbContext>();
        // The API could still pick another connection (e.g. a ConnectionStrings__XFood variable); refuse to migrate it.
        EnsureIsolated(db.Database.GetDbConnection().Database);
        await db.Database.MigrateAsync();
    }

    public async Task DisposeAsync()
    {
        if (connectionString is null)
            return;

        await Factory.DisposeAsync();
        SqlConnection.ClearAllPools();
        EnsureIsolated(DatabaseName);
        var master = new SqlConnectionStringBuilder(connectionString) { InitialCatalog = "master" };
        await using var connection = new SqlConnection(master.ConnectionString);
        await connection.OpenAsync();
        await using var command = connection.CreateCommand();
        command.CommandText = $"IF DB_ID(N'{DatabaseName}') IS NOT NULL BEGIN " +
            $"ALTER DATABASE [{DatabaseName}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [{DatabaseName}]; END";
        await command.ExecuteNonQueryAsync();
    }

    /// <summary>Guard before migrating or dropping: only generated test database names are acceptable.</summary>
    internal static void EnsureIsolated(string databaseName)
    {
        if (!TestDatabaseName().IsMatch(databaseName) || databaseName.Equals("XFoodDB", StringComparison.OrdinalIgnoreCase))
            throw new InvalidOperationException($"Refusing to use database '{databaseName}': only XFood_Tests_<guid> is allowed.");
    }

    [GeneratedRegex("^XFood_Tests_[0-9a-f]{32}$")]
    private static partial Regex TestDatabaseName();

    private sealed class ApiFactory(string connectionString) : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:XFood", connectionString);
            builder.UseSetting("Cors:PanelOrigins:0", PanelOrigin);
        }
    }
}

/// <summary>Skips when no test SQL Server is configured, unless XFOOD_REQUIRE_SQL_TESTS=true.</summary>
public sealed class SqlServerFactAttribute : FactAttribute
{
    public SqlServerFactAttribute()
    {
        if (SqlServerApiFixture.ServerConnectionString is null && !SqlServerApiFixture.Required)
            Skip = $"Defina {SqlServerApiFixture.ServerVariable} con un SQL Server de pruebas para ejecutar esta prueba.";
    }
}
