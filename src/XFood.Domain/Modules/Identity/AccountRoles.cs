namespace XFood.Domain.Modules.Identity;

/// <summary>Role names stored in Identity. Administrators are provisioned, never self-registered.</summary>
public static class AccountRoles
{
    public const string Consumer = "Consumer";
    public const string Establishment = "Establishment";
    public const string Organization = "Organization";
    public const string Administrator = "Administrator";

    public static IReadOnlyList<string> PubliclyRegistrable { get; } = [Consumer, Establishment, Organization];
}
