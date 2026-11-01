# Identity / Identidad y acceso

Casos de uso y contratos de cuentas, roles, sesión, suspensión y autorización (HU-04). **Esta entrega implementa la sesión del panel web (cookie).** El acceso de la app Flutter (token) sigue pendiente.

- `AccountUseCases`: registro, inicio y cierre de sesión y cuenta actual.
- `RegisterAccountValidator`: validación de servidor del registro. La política de contraseña la aplica Identity según la sección `Identity:Password` de configuración (valores por defecto de Identity mientras el PO no fije otros).
- `IAccountStore` e `ISessionManager`: puertos implementados en `XFood.Infrastructure/Modules/Identity`.
- Contratos de otros módulos usados en el registro: `IEstablishmentOnboarding` (Establishments) e `IOrganizationOnboarding` (Donations). Cuenta, rol, perfil y establecimiento u organización se guardan en **una sola transacción**: o se crea todo o nada.

## Endpoints (`/api/v1`)

| Método y ruta | Acceso | Respuesta |
|---|---|---|
| `POST /auth/register` | Público | 201 con la cuenta; 400 `VALIDATION_ERROR` con `errors` por campo |
| `POST /auth/login` | Público | 200 con la cuenta y cookie `XFood.Session`; 401 `INVALID_CREDENTIALS`; 403 `ACCOUNT_SUSPENDED` |
| `POST /auth/logout` | **Sesión** | 204 y cierre de todas las sesiones de la cuenta; 401 `UNAUTHENTICATED` sin sesión |
| `GET /me` | Sesión | 200 con la cuenta; 401 `UNAUTHENTICATED` |

Toda petición `POST/PUT/PATCH/DELETE` puede recibir además **403 `FORBIDDEN`** por la protección CSRF (ver más abajo).

### Registro

```json
{
  "email": "panaderia@ejemplo.com",
  "password": "Clave#2026",
  "displayName": "Panadería Central",
  "role": "Consumer | Establishment | Organization",
  "establishment": { },
  "organization": { }
}
```

- `role`: no distingue mayúsculas. `Administrator` se rechaza; esas cuentas se provisionan aparte.
- `establishment`: **obligatorio solo para `Establishment`** y rechazado para otros roles. Crea el establecimiento activo con el usuario como responsable principal (`Owner`).

  | Campo | Obligatorio | Regla |
  |---|---|---|
  | `name` | Sí | Hasta 200 caracteres |
  | `contactPhone` | Sí | Dígitos, espacios, `+ - ( )`; de 7 a 32 caracteres |
  | `address` | Sí | Hasta 500 caracteres |
  | `latitude` | Sí | Entre -90 y 90; nunca se asume 0; se guarda con 6 decimales |
  | `longitude` | Sí | Entre -180 y 180; nunca se asume 0; se guarda con 6 decimales |
  | `timeZoneId` | No | Identificador IANA válido (p. ej. `America/Santo_Domingo`). Si falta se usa `America/Santo_Domingo`: **supuesto del piloto dominicano, no regla aprobada** |
  | `contactName` | No | Si falta, se usa `displayName` |
  | `contactEmail` | No | Si falta, se usa `email`; si se envía, debe ser un correo válido |

- `organization`: **obligatorio solo para `Organization`** y rechazado para otros roles. Campos `name`, `contactPhone`, `address` y `verificationInformation` (opcional). La organización queda con `verificationStatus: "Pending"` hasta la decisión de un administrador; su contacto es `displayName` y `email`.
- El registro **no** inicia sesión.

### Cuenta (respuesta de registro, login y `/me`)

```json
{
  "id": "…", "email": "…", "displayName": "…", "role": "Establishment", "status": "Active",
  "organization": null,
  "establishments": [ { "id": "…", "name": "Panadería Central", "status": "Active", "memberRole": "Owner", "isPrimary": true } ]
}
```

`organization` solo aparece para el rol Organization y `establishments` solo para Establishment; en los demás casos vienen en `null`. `establishments` es una lista porque el modelo permite que un usuario opere varios establecimientos.

## Errores

Formato uniforme: `{ "code", "message", "traceId", "errors"? }`.

| Código | HTTP | Cuándo |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Datos inválidos, JSON mal formado o correo ya registrado (`errors` por campo) |
| `UNAUTHENTICATED` | 401 | Sin sesión, o sesión revocada (logout, cambio de sello o suspensión) |
| `INVALID_CREDENTIALS` | 401 | **Nuevo, pendiente de confirmar con frontend.** Login fallido: el mismo mensaje para un correo inexistente, una contraseña incorrecta y una cuenta bloqueada (5 intentos fallidos) |
| `ACCOUNT_SUSPENDED` | 403 | **Nuevo, pendiente de confirmar con frontend.** Contraseña correcta, pero la cuenta está suspendida |
| `FORBIDDEN` | 403 | Rol insuficiente o petición rechazada por origen (CSRF) |
| `UNSUPPORTED_MEDIA_TYPE` | 415 | El cuerpo no es `application/json` |

## Sesión del panel web y CSRF

- Cookie `XFood.Session`: `HttpOnly`, `Secure`, `SameSite=Lax`, de sesión del navegador, con caducidad de 8 h renovable. En cada solicitud se comprueba que la cuenta exista, siga activa y conserve su sello de seguridad.
- El logout cambia el sello de seguridad. Así ninguna copia de la cookie vuelve a funcionar, pero también se cierran las sesiones de esa cuenta en otros navegadores.
- **Validación de origen** para `POST/PUT/PATCH/DELETE`:
  - Si llega `Origin` (o `Referer`, cuando falta `Origin`), debe estar en `Cors:PanelOrigins` o `Security:ApiOrigins`. `Origin: null` siempre se rechaza.
  - Sin `Origin` ni `Referer`, pero con la cookie de sesión: se rechaza. Los navegadores siempre envían `Origin` en estos métodos; un cliente que no sea navegador y use la cookie (por ejemplo curl o llamadas desde el servidor de Next.js) debe enviar `Origin` con un origen permitido.
  - Sin `Origin`, sin `Referer` y sin cookie: se permite (por ejemplo curl o, en el futuro, la app móvil con token), porque no hay sesión de navegador que aprovechar. Cada endpoint aplica igual su autorización.
  - Los orígenes de confianza salen **solo de configuración**, nunca de la cabecera `Host`, para que la regla siga siendo correcta detrás de un proxy. En producción, configure `Cors:PanelOrigins` con la URL pública del panel y `Security:ApiOrigins` con la URL pública de la API (ambos vacíos por defecto; en Development, `localhost`).
- CORS con credenciales solo para `Cors:PanelOrigins`.

## Autorización por rol

`.RequireAuthorization(AuthorizationPolicies.Establishment)` (ver `XFood.Api/Modules/Identity/IdentitySetup.cs`). Las políticas **solo comprueban el rol**:

- Endpoints de establecimiento: además deben comprobar la propiedad con `IEstablishmentOnboarding.FindActiveMembershipAsync(userId, establishmentId)`.
- Endpoints de donaciones: además deben comprobar que la organización esté aprobada (`VerificationStatus.Approved`) y que el usuario sea un responsable activo de ella.

## Probar con curl (Git Bash)

```bash
B=https://localhost:7293/api/v1
O="Origin: http://localhost:3000"   # origen permitido en Development
J="Content-Type: application/json"

curl -k -X POST $B/auth/register -H "$J" -H "$O" -d '{"email":"pan@test.com","password":"Clave#2026","displayName":"Panadería","role":"Establishment","establishment":{"name":"Panadería Central","contactPhone":"809-555-0102","address":"Av. Duarte 10","latitude":18.4861,"longitude":-69.9312}}'
curl -k -c cookies.txt -X POST $B/auth/login -H "$J" -H "$O" -d '{"email":"pan@test.com","password":"Clave#2026"}'
curl -k -b cookies.txt $B/me                                       # GET no requiere Origin
curl -k -b cookies.txt -X POST $B/auth/logout -H "$O"               # 204
curl -k -b cookies.txt -X POST $B/auth/logout -H "Origin: https://evil.example"   # 403 FORBIDDEN
```

`cookies.txt` contiene la sesión: no lo versione.
