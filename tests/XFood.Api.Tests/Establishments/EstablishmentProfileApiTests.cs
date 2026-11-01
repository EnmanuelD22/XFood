using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using XFood.Application.Modules.Establishments.Contracts;
using XFood.Application.Modules.Establishments.Services;

namespace XFood.Api.Tests.Establishments;

public sealed class EstablishmentProfileApiTests : IClassFixture<EstablishmentProfileApiTests.Factory>
{
    public sealed class Factory : WebApplicationFactory<Program>
    {
        protected override void ConfigureWebHost(IWebHostBuilder builder)
        {
            builder.UseEnvironment("Testing");
            builder.UseSetting("ConnectionStrings:XFood", "Server=unused.invalid;Database=Unused");
            builder.UseSetting("Cors:PanelOrigins:0", "https://panel.xfood.test");
            builder.UseSetting("Security:ApiOrigins:0", "https://api.xfood.test");
            builder.ConfigureTestServices(services => services.AddSingleton<IEstablishmentProfileService, ThrowingProfileService>());
        }
    }

    private readonly HttpClient client;

    public EstablishmentProfileApiTests(Factory factory)
    {
        client = factory.CreateClient(new WebApplicationFactoryClientOptions
        {
            BaseAddress = new Uri("https://localhost"),
            HandleCookies = false,
        });
    }

    [Fact]
    public async Task Get_profile_without_a_session_returns_401()
    {
        var response = await client.GetAsync($"/api/v1/establishments/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }

    [Fact]
    public async Task Update_profile_without_a_session_returns_401()
    {
        var response = await client.PutAsJsonAsync($"/api/v1/establishments/{Guid.NewGuid()}", new { });

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
        Assert.Equal("UNAUTHENTICATED", (await response.Content.ReadFromJsonAsync<XFood.Api.Http.ApiError>())!.Code);
    }
}

internal sealed class ThrowingProfileService : IEstablishmentProfileService
{
    public Task<EstablishmentProfileResponse> GetAsync(Guid establishmentId, Guid userId, CancellationToken cancellationToken = default) =>
        throw new NotSupportedException();

    public Task<EstablishmentProfileResponse> UpdateAsync(Guid establishmentId, Guid userId, UpdateEstablishmentProfileRequest request, CancellationToken cancellationToken = default) =>
        throw new NotSupportedException();
}
