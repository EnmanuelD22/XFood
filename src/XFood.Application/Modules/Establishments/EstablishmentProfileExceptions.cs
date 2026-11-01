namespace XFood.Application.Modules.Establishments;

public sealed class EstablishmentProfileValidationException(IReadOnlyDictionary<string, string[]> errors) : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; } = errors;
}

public sealed class EstablishmentProfileForbiddenException : Exception;

public sealed class EstablishmentProfileNotFoundException : Exception;
