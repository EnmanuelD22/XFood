using Microsoft.AspNetCore.Identity;

namespace XFood.Infrastructure.Modules.Identity;

/// <summary>Spanish messages for the Identity errors that registration can return to clients.</summary>
internal sealed class SpanishIdentityErrorDescriber : IdentityErrorDescriber
{
    public override IdentityError DuplicateEmail(string email) => Error(nameof(DuplicateEmail), "El correo ya está registrado.");
    public override IdentityError DuplicateUserName(string userName) => Error(nameof(DuplicateUserName), "El correo ya está registrado.");
    public override IdentityError InvalidEmail(string? email) => Error(nameof(InvalidEmail), "El correo no tiene un formato válido.");
    public override IdentityError InvalidUserName(string? userName) => Error(nameof(InvalidUserName), "El correo contiene caracteres no permitidos.");
    public override IdentityError PasswordTooShort(int length) => Error(nameof(PasswordTooShort), $"La contraseña debe tener al menos {length} caracteres.");
    public override IdentityError PasswordRequiresUniqueChars(int uniqueChars) => Error(nameof(PasswordRequiresUniqueChars), $"La contraseña debe tener al menos {uniqueChars} caracteres distintos.");
    public override IdentityError PasswordRequiresNonAlphanumeric() => Error(nameof(PasswordRequiresNonAlphanumeric), "La contraseña debe incluir al menos un símbolo.");
    public override IdentityError PasswordRequiresDigit() => Error(nameof(PasswordRequiresDigit), "La contraseña debe incluir al menos un número.");
    public override IdentityError PasswordRequiresLower() => Error(nameof(PasswordRequiresLower), "La contraseña debe incluir al menos una letra minúscula.");
    public override IdentityError PasswordRequiresUpper() => Error(nameof(PasswordRequiresUpper), "La contraseña debe incluir al menos una letra mayúscula.");

    private static IdentityError Error(string code, string description) => new() { Code = code, Description = description };
}
