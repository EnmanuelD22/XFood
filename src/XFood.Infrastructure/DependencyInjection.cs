using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using XFood.Application.Modules.Donations;
using XFood.Infrastructure.Persistence;
using XFood.Infrastructure.Modules.Donations;
using XFood.Infrastructure.Modules.Identity;
using XFood.Infrastructure.Modules.Notifications;

namespace XFood.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddXFoodInfrastructure(
        this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("XFood");
        if (string.IsNullOrWhiteSpace(connectionString))
        {
            throw new InvalidOperationException(
                "Configure ConnectionStrings:XFood using environment variables or user secrets.");
        }

        services.AddDbContext<XFoodDbContext>(options =>
            options.UseSqlServer(connectionString, sql =>
                sql.MigrationsAssembly(typeof(XFoodDbContext).Assembly.GetName().Name)));

        services.AddIdentityModule(configuration);
        services.AddScoped<IOrganizationOnboarding, OrganizationOnboarding>();

        services.AddOptions<ExpiryAlertOptions>()
            .Bind(configuration.GetSection(ExpiryAlertOptions.SectionName))
            .Validate(options => options.ThresholdMinutes > 0, "The expiry alert threshold must be positive.")
            .ValidateOnStart();

        return services;
    }
}
