using Microsoft.EntityFrameworkCore;
using System.Text.Json;
using XFood.Application.Modules.Establishments;
using XFood.Application.Modules.Establishments.Contracts;
using XFood.Domain.Modules.Establishments;
using XFood.Infrastructure.Modules.Establishments;
using XFood.Infrastructure.Persistence;

namespace XFood.Api.Tests.Establishments;

public sealed class EstablishmentProfileServiceTests
{
    [Fact]
    public async Task GetAsync_returns_only_the_requested_establishment_profile()
    {
        var establishmentId = Guid.NewGuid();
        var userId = Guid.NewGuid();
        await using var db = CreateDbContext(CreateEstablishment(establishmentId, "Original"));
        var service = new EstablishmentProfileService(db, new ProfileOnboarding(establishmentId));

        var result = await service.GetAsync(establishmentId, userId);

        Assert.Equal(establishmentId, result.Id);
        Assert.Equal("Original", result.Name);
        Assert.Equal("Santo Domingo", result.Address);
    }

    [Fact]
    public async Task UpdateAsync_changes_only_profile_fields()
    {
        var establishmentId = Guid.NewGuid();
        var createdByUserId = Guid.NewGuid();
        var establishment = CreateEstablishment(establishmentId, "Original");
        establishment.CreatedByUserId = createdByUserId;
        await using var db = CreateDbContext(establishment);
        var service = new EstablishmentProfileService(db, new ProfileOnboarding(establishmentId));
        var actor = Guid.NewGuid();

        var result = await service.UpdateAsync(establishmentId, actor, new UpdateEstablishmentProfileRequest
        {
            Name = "Actualizado",
            ContactName = "Contacto nuevo",
            ContactEmail = "nuevo@xfood.test",
            ContactPhone = "809-555-0104",
            Address = "Calle nueva",
            Latitude = 18.5m,
            Longitude = -69.95m,
        });

        var stored = await db.Set<Establishment>().SingleAsync();
        Assert.Equal("Actualizado", result.Name);
        Assert.Equal("Actualizado", stored.Name);
        Assert.Equal(EstablishmentStatus.Active, stored.Status);
        Assert.Equal(createdByUserId, stored.CreatedByUserId);
        Assert.Equal("America/Santo_Domingo", stored.TimeZoneId);
        var revision = await db.Set<EstablishmentProfileRevision>().SingleAsync();
        Assert.Equal(actor, revision.ActorUserId);
        Assert.Equal(establishmentId, revision.EstablishmentId);
        Assert.Equal("Original", JsonDocument.Parse(revision.BeforeJson).RootElement.GetProperty("Name").GetString());
        Assert.Equal("Actualizado", JsonDocument.Parse(revision.AfterJson).RootElement.GetProperty("Name").GetString());
    }

    [Fact]
    public async Task UpdateAsync_rejects_invalid_coordinates_without_writing()
    {
        var establishmentId = Guid.NewGuid();
        await using var db = CreateDbContext(CreateEstablishment(establishmentId, "Original"));
        var service = new EstablishmentProfileService(db, new ProfileOnboarding(establishmentId));

        await Assert.ThrowsAsync<EstablishmentProfileValidationException>(() => service.UpdateAsync(establishmentId, Guid.NewGuid(), new UpdateEstablishmentProfileRequest
        {
            Name = "Actualizado",
            ContactName = "Contacto",
            ContactEmail = "contacto@xfood.test",
            ContactPhone = "809-555-0104",
            Address = "Calle nueva",
            Latitude = 91,
            Longitude = -69,
        }));

        Assert.Equal("Original", (await db.Set<Establishment>().SingleAsync()).Name);
        Assert.Empty(await db.Set<EstablishmentProfileRevision>().ToListAsync());
    }

    [Fact]
    public async Task GetAsync_rejects_user_without_membership()
    {
        var establishmentId = Guid.NewGuid();
        await using var db = CreateDbContext(CreateEstablishment(establishmentId, "Original"));
        var service = new EstablishmentProfileService(db, new ProfileOnboarding(null));

        await Assert.ThrowsAsync<EstablishmentProfileForbiddenException>(() => service.GetAsync(establishmentId, Guid.NewGuid()));
    }

    private static Establishment CreateEstablishment(Guid id, string name) => new()
    {
        Id = id,
        Name = name,
        ContactName = "Contacto",
        ContactEmail = "contacto@xfood.test",
        ContactPhone = "809-555-0103",
        Address = "Santo Domingo",
        Latitude = 18.4861m,
        Longitude = -69.9312m,
        TimeZoneId = "America/Santo_Domingo",
        Status = EstablishmentStatus.Active,
        CreatedByUserId = Guid.NewGuid(),
        CreatedAtUtc = DateTimeOffset.UtcNow,
    };

    private static XFoodDbContext CreateDbContext(Establishment establishment)
    {
        var options = new DbContextOptionsBuilder<XFoodDbContext>().UseInMemoryDatabase(Guid.NewGuid().ToString()).Options;
        var db = new XFoodDbContext(options);
        db.Add(establishment);
        db.SaveChanges();
        return db;
    }
}

internal sealed class ProfileOnboarding(Guid? establishmentId) : IEstablishmentOnboarding
{
    public EstablishmentMembershipSummary StageEstablishment(NewEstablishmentProfile establishment) => throw new NotSupportedException();

    public Task<IReadOnlyList<EstablishmentMembershipSummary>> ListActiveMembershipsAsync(Guid userId, CancellationToken cancellationToken) =>
        Task.FromResult<IReadOnlyList<EstablishmentMembershipSummary>>([]);

    public Task<EstablishmentMembershipSummary?> FindActiveMembershipAsync(Guid userId, Guid requestedEstablishmentId, CancellationToken cancellationToken) =>
        Task.FromResult(establishmentId == requestedEstablishmentId
            ? new EstablishmentMembershipSummary(requestedEstablishmentId, "Establecimiento", EstablishmentStatus.Active, EstablishmentMemberRole.Owner, true)
            : null);
}
