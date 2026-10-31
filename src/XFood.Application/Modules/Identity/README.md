# Identity / Identidad y acceso

Casos de uso y contratos de cuentas, roles, sesión, suspensión y autorización (HU-04).

- `AccountUseCases`: registro, inicio y cierre de sesión y cuenta actual.
- `RegisterAccountValidator`: validación de servidor del registro (correo, nombre, rol C/E/O y datos de organización). La política de contraseña la aplica Identity según la sección `Identity:Password` de configuración.
- `IAccountStore` e `ISessionManager`: puertos implementados en `XFood.Infrastructure/Modules/Identity`.

## Endpoints (`/api/v1`)

| Método y ruta | Acceso | Respuesta |
|---|---|---|
| `POST /auth/register` | Público | 201 con la cuenta; 400 `VALIDATION_ERROR` con `errors` por campo |
| `POST /auth/login` | Público | 200 con la cuenta y cookie `XFood.Session`; 401 `INVALID_CREDENTIALS` (genérico); 403 `ACCOUNT_SUSPENDED` |
| `POST /auth/logout` | Público | 204; borra la cookie |
| `GET /me` | Sesión | 200 con la cuenta; 401 `UNAUTHENTICATED` |

Registro: `{ "email", "password", "displayName", "role": "Consumer" | "Establishment" | "Organization", "organization"? }`. El objeto `organization` (`name`, `contactPhone`, `address`, `verificationInformation?`) es obligatorio solo para `Organization`, que queda con `verificationStatus: "Pending"` hasta la decisión de un administrador. `Administrator` no se acepta: esas cuentas se provisionan aparte. El registro no inicia sesión.

Cuenta: `{ "id", "email", "displayName", "role", "status", "organization": { "id", "name", "verificationStatus" } | null }`.

## Sesión del panel web

Cookie `XFood.Session` emitida por ASP.NET Core Identity: `HttpOnly`, `Secure`, `SameSite=Lax`, 8 h con renovación deslizante. Cada solicitud comprueba que la cuenta exista, siga activa y conserve su sello de seguridad; una suspensión invalida la sesión al instante. CORS con credenciales solo para `Cors:PanelOrigins`. La app Flutter necesitará un esquema de token propio, pendiente.

Para proteger un endpoint por rol: `.RequireAuthorization(AuthorizationPolicies.Establishment)` (ver `XFood.Api/Modules/Identity/IdentitySetup.cs`).
