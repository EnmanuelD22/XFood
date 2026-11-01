using XFood.Application.Modules.Establishments.Contracts;

namespace XFood.Application.Modules.Establishments.Services;

public interface IEstablishmentProfileService
{
    Task<EstablishmentProfileResponse> GetAsync(
        Guid establishmentId,
        Guid userId,
        CancellationToken cancellationToken = default);

    Task<EstablishmentProfileResponse> UpdateAsync(
        Guid establishmentId,
        Guid userId,
        UpdateEstablishmentProfileRequest request,
        CancellationToken cancellationToken = default);
}
