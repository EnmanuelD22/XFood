using XFood.Api.Http;
using XFood.Api.Modules.Identity;
using XFood.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddOpenApi();
builder.Services.AddApiErrors();
builder.Services.AddXFoodInfrastructure(builder.Configuration);
builder.Services.AddIdentityApi(builder.Configuration);

var app = builder.Build();

app.UseApiErrors();

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseCors(IdentitySetup.PanelCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/health/live", () => Results.Ok(new { status = "live" }))
    .WithName("Liveness");

var api = app.MapGroup("/api/v1");
api.MapIdentityEndpoints();

app.Run();

public partial class Program;
