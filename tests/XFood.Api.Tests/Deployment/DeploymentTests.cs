using System.Net;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Logging.Abstractions;
using Microsoft.Extensions.Options;
using XFood.Api.Http;

namespace XFood.Api.Tests.Deployment;

public sealed class DeploymentTests
{
    [Theory]
    [InlineData("172.30.50.2", "https", "https")]
    [InlineData("172.30.50.9", "https", "http")]
    [InlineData("172.30.50.2", "http,https", "https")]
    public async Task Only_the_configured_proxy_can_set_the_external_scheme(string remote, string header, string expected)
    {
        var services = new ServiceCollection();
        services.AddLogging();
        services.AddDeploymentSupport(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
        {
            ["ReverseProxy:KnownProxies:0"] = "172.30.50.2"
        }).Build());
        using var provider = services.BuildServiceProvider();
        var middleware = new ForwardedHeadersMiddleware(_ => Task.CompletedTask, NullLoggerFactory.Instance,
            provider.GetRequiredService<IOptions<ForwardedHeadersOptions>>());
        var context = new DefaultHttpContext();
        context.Connection.RemoteIpAddress = IPAddress.Parse(remote);
        context.Request.Scheme = "http";
        context.Request.Headers["X-Forwarded-Proto"] = header;

        await middleware.Invoke(context);

        Assert.Equal(expected, context.Request.Scheme);
    }

    [Fact]
    public void Persisted_keys_allow_a_new_application_instance_to_read_existing_protected_data()
    {
        var directory = Path.Combine(Path.GetTempPath(), "XFood_Keys_" + Guid.NewGuid().ToString("N"));
        Directory.CreateDirectory(directory);
        try
        {
            ServiceProvider CreateProvider()
            {
                var services = new ServiceCollection();
                services.AddLogging();
                services.AddDeploymentSupport(new ConfigurationBuilder().AddInMemoryCollection(new Dictionary<string, string?>
                {
                    ["DataProtection:KeysPath"] = directory
                }).Build());
                return services.BuildServiceProvider();
            }

            string token;
            using (var first = CreateProvider())
                token = first.GetRequiredService<IDataProtectionProvider>().CreateProtector("session-test").Protect("session");
            using var second = CreateProvider();
            Assert.Equal("session", second.GetRequiredService<IDataProtectionProvider>().CreateProtector("session-test").Unprotect(token));
        }
        finally
        {
            // This test creates only key files in its own unique directory; no recursive deletion.
            foreach (var file in Directory.GetFiles(directory)) File.Delete(file);
            Directory.Delete(directory);
        }
    }

    [Theory]
    [InlineData(true, HttpStatusCode.OK)]
    [InlineData(false, HttpStatusCode.ServiceUnavailable)]
    public async Task Readiness_reflects_dependency_status_while_liveness_stays_available(bool healthy, HttpStatusCode expected)
    {
        await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:XFood", "Server=unused.invalid;Database=Unused");
            builder.ConfigureTestServices(services => services.Configure<HealthCheckServiceOptions>(options =>
            {
                options.Registrations.Clear();
                options.Registrations.Add(new HealthCheckRegistration("test", _ => new DependencyCheck(healthy), null, ["ready"]));
            }));
        });
        using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

        var readiness = await client.GetAsync("/health/ready");

        Assert.Equal(expected, readiness.StatusCode);
        Assert.DoesNotContain("private-detail", await readiness.Content.ReadAsStringAsync());
        Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/live")).StatusCode);
    }

    private sealed class DependencyCheck(bool healthy) : IHealthCheck
    {
        public Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default) =>
            Task.FromResult(healthy ? HealthCheckResult.Healthy() : HealthCheckResult.Unhealthy("private-detail"));
    }

    [Fact]
    public async Task Mounted_settings_allow_startup_without_a_connection_bundled_in_the_application()
    {
        var file = Path.GetTempFileName();
        try
        {
            await File.WriteAllTextAsync(file, """
                { "ConnectionStrings": { "XFood": "Server=unused.invalid;Database=Unused" } }
                """);
            await using var factory = new WebApplicationFactory<Program>().WithWebHostBuilder(builder =>
            {
                builder.UseEnvironment("Testing");
                builder.UseSetting("Deployment:SettingsFile", file);
            });
            using var client = factory.CreateClient(new WebApplicationFactoryClientOptions { BaseAddress = new Uri("https://localhost") });

            // Liveness does not connect to SQL; successful startup proves the mounted settings were loaded first.
            Assert.Equal(HttpStatusCode.OK, (await client.GetAsync("/health/live")).StatusCode);
        }
        finally { File.Delete(file); }
    }
}
