using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using XFood.Application.Modules.Donations;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Establishments.Services;
using XFood.Application.Modules.Listings.Services;
using XFood.Infrastructure.Persistence;
using XFood.Infrastructure.Modules.Donations;
using XFood.Infrastructure.Modules.Establishments;
using XFood.Infrastructure.Modules.Identity;
using XFood.Infrastructure.Modules.Listings;
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
        services.AddScoped<IEstablishmentOnboarding, EstablishmentOnboarding>();
        services.AddScoped<IEstablishmentProfileService, EstablishmentProfileService>();
        services.AddScoped<IActiveListingsQueryService, ActiveListingsQueryService>();
        services.AddScoped<ICreateListingService, CreateListingService>();
        services.AddScoped<ICreateDonationListingService, CreateDonationListingService>();
        services.AddScoped<IManageListingService, ManageListingService>();
        services.AddScoped<IManageListingStockService, ManageListingStockService>();
        services.AddScoped<IManageListingFitnessService, ManageListingFitnessService>();
        services.AddScoped<IListingExpiryAlertService, ListingExpiryAlertService>();
        services.AddScoped<IListingSearchService, ListingSearchService>();

        services.AddOptions<ListingSearchOptions>()
            .Bind(configuration.GetSection(ListingSearchOptions.SectionName))
            .Validate(options => options.IsValid(),
                "Listing search needs distinct positive radii, a default radius among them and a positive result limit.")
            .ValidateOnStart();

        services.AddOptions<ExpiryAlertOptions>()
            .Bind(configuration.GetSection(ExpiryAlertOptions.SectionName))
            .Validate(options => options.ThresholdMinutes > 0, "The expiry alert threshold must be positive.")
            .ValidateOnStart();

        return services;
    }
}
