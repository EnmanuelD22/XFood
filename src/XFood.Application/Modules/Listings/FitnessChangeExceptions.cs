namespace XFood.Application.Modules.Listings;

public sealed class FitnessChangeValidationException(IReadOnlyDictionary<string, string[]> errors) : Exception
{
    public IReadOnlyDictionary<string, string[]> Errors { get; } = errors;
}
