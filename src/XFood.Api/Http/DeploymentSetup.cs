using System.Net;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.HttpOverrides;

namespace XFood.Api.Http;

public static class DeploymentSetup
{
    public static void AddDeploymentSettings(this WebApplicationBuilder builder)
    {
        var settingsFile = builder.Configuration["Deployment:SettingsFile"];
        if (!string.IsNullOrWhiteSpace(settingsFile))
        {
            // Mounted by the operator, never bundled into the application image.
            builder.Configuration.AddJsonFile(settingsFile, optional: false, reloadOnChange: false);
            builder.Configuration.AddEnvironmentVariables();
        }
    }

    public static IServiceCollection AddDeploymentSupport(this IServiceCollection services, IConfiguration configuration)
    {
        var proxies = configuration.GetSection("ReverseProxy:KnownProxies").Get<string[]>() ?? [];
        services.Configure<ForwardedHeadersOptions>(options =>
        {
            options.ForwardLimit = 1;
            options.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
            foreach (var proxy in proxies)
                options.KnownProxies.Add(IPAddress.Parse(proxy));
            // Keep the framework's loopback defaults; never trust every incoming address.
        });

        var protection = services.AddDataProtection().SetApplicationName("XFood");
        if (configuration["DataProtection:KeysPath"] is { Length: > 0 } keysPath)
            protection.PersistKeysToFileSystem(new DirectoryInfo(keysPath));

        return services;
    }
}
