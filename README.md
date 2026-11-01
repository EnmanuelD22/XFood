# XFood

Backend para conectar establecimientos con excedentes alimentarios, consumidores y organizaciones beneficiarias. Es un **monolito modular**: una API desplegable y una base SQL Server, con separación de Dominio, Aplicación, Infraestructura y presentación HTTP.

Actualmente incluye el modelo de datos, migraciones, registro e inicio de sesión por rol (HU-04, sesión por cookie para el panel web), perfil de establecimientos y publicaciones (HU-01), búsqueda pública de ofertas cercanas con detalle (HU-02, backend) y pruebas. Los demás casos de uso, la autenticación de la app móvil y los trabajadores de notificaciones aún deben implementarse. Flutter y React/Next.js son clientes previstos.

## Tecnologías y requisitos

- .NET SDK 10 compatible con `net10.0` y soluciones `.slnx` (validado con SDK 10.0.400).
- ASP.NET Core; OpenAPI, EF Core SQL Server, Identity EF y herramientas EF en versión 10.0.11.
- xUnit 2.9.3, runner 3.1.4 y Microsoft.NET.Test.Sdk 17.14.1.
- System.Security.Cryptography.Pkcs 10.0.14, fijado por seguridad de la dependencia transitiva.
- Git, acceso a NuGet y SQL Server disponible. Los ejemplos siguientes usan PowerShell y autenticación de Windows; la cuenta debe tener permisos para crear o actualizar su base local.

## Estructura

| Ruta | Responsabilidad |
|---|---|
| `XFood.slnx` | Solución completa |
| `src/XFood.Domain` | Entidades y estados sin dependencias de EF ni ASP.NET |
| `src/XFood.Application` | Lugar para casos de uso y contratos entre módulos |
| `src/XFood.Infrastructure` | Mapeos EF, Identity, SQL Server y configuración |
| `src/XFood.Api` | Única aplicación ejecutable y composición HTTP |
| `tests/XFood.Architecture.Tests` | Pruebas de modelo, migraciones y dependencias |
| `docs/modelo-datos.md` | Diseño de datos y decisiones |
| `docs/HU-01-Cierre.md`, `docs/HU-02-Cierre.md` | Alcance, contrato y decisiones de producto de cada historia |
| `docs/sql/AddV1DataModel.sql` | SQL idempotente de avance desde Identity a negocio |

Los módulos se organizan bajo `Modules`: Identity (cuentas y acceso), Establishments (perfiles y responsables), Listings (catálogo, publicaciones y stock), Reservations (reservas y entregas), Donations (organizaciones, verificación y recepciones), Notifications (bandeja, dispositivos y outbox), Administration (incidencias y reportes).

Publicaciones es dueño del stock. Los módulos se comunican mediante contratos de aplicación, sin acceso directo a tablas privadas ajenas. Infraestructura descubre los mapeos `IEntityTypeConfiguration<T>` desde su ensamblado. Un único `XFoodDbContext` permite coordinar las transacciones.

## Obtener y compilar

```powershell
git clone https://github.com/EnmanuelD22/XFood.git
cd XFood
dotnet tool restore
dotnet restore XFood.slnx
dotnet build XFood.slnx --no-restore
```

Todos los comandos restantes se ejecutan desde la carpeta que contiene `XFood.slnx`. No es necesario instalar globalmente `dotnet-ef`: `dotnet tool run dotnet-ef` usa la versión del manifiesto `dotnet-tools.json`.

## Configurar SQL Server y User Secrets

La conexión de `appsettings.json` está vacía. El proyecto API ya tiene `UserSecretsId`; no necesita inicializarlo de nuevo. Los secretos se guardan fuera del repositorio. Elija **uno** de estos ejemplos locales y adapte la instancia:

```powershell
# Instancia predeterminada local, autenticación de Windows:
dotnet user-secrets set "ConnectionStrings:XFood" "Server=localhost;Database=XFoodDB;Integrated Security=True;Encrypt=True;TrustServerCertificate=True" --project src/XFood.Api

# Alternativa: SQL Server Express local, autenticación de Windows:
dotnet user-secrets set "ConnectionStrings:XFood" "Server=.\SQLEXPRESS;Database=XFoodDB;Integrated Security=True;Encrypt=True;TrustServerCertificate=True" --project src/XFood.Api
```

`TrustServerCertificate=True` es exclusivamente una facilidad de desarrollo local. En otros entornos use certificados válidos y `TrustServerCertificate=False`. No versione conexiones personales ni contraseñas. `appsettings.Example.json` ilustra la configuración y no se carga automáticamente. La variable `ConnectionStrings__XFood`, si existe, sobrescribe los secretos de usuario: revise su destino antes de ejecutar migraciones.

## Crear o actualizar la base local

Las migraciones existentes son `20261030065020_InitialIdentity`, `20261030234244_AddV1DataModel` y `20261101171937_AuditHu01Edits`. El comando siguiente crea la base configurada si no existe y aplica solo las migraciones pendientes. Verifique servidor y base antes de ejecutarlo; una base compartida requiere coordinación y revisión del SQL. Si existen correos normalizados duplicados, el nuevo índice único de Identity impedirá actualizar hasta resolverlos.

```powershell
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet tool run dotnet-ef database update 20261101171937_AuditHu01Edits --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext
```

No use `EnsureCreated` con esta estrategia. No elimine el historial ni edite migraciones ya aplicadas. El catálogo queda vacío: sus valores iniciales requieren aprobación. No hay usuarios, roles de negocio ni credenciales precargados.

## Ejecutar la API

```powershell
dotnet dev-certs https --trust
dotnet run --project src/XFood.Api --launch-profile https
```

El perfil configura Development, HTTPS en `https://localhost:7293` y HTTP en `http://localhost:5008` con redirección HTTPS. La API exige configurar la conexión al arrancar, pero no aplica migraciones automáticamente.

- Vida del proceso: `https://localhost:7293/health/live` (no comprueba disponibilidad de SQL Server).
- Documento OpenAPI JSON en Development: `https://localhost:7293/openapi/v1.json`.
- No hay Swagger UI configurada. Las rutas de negocio usan `/api/v1`; las de cuentas y sesión están descritas en `src/XFood.Application/Modules/Identity/README.md`.
- Búsqueda pública (HU-02): `GET /api/v1/listings?latitude=&longitude=&radiusKm=`, `GET /api/v1/listings/{id}` y `GET /api/v1/listings/search-options`. Radios, radio por defecto y máximo de resultados se configuran en `Listings:Search` de `appsettings.json`; contrato y decisiones en `docs/HU-02-Cierre.md`.

## Pruebas

```powershell
dotnet test XFood.slnx --no-build
```

`XFood.Architecture.Tests` inspecciona el modelo y las migraciones sin conectarse a una base. `XFood.Api.Tests` prueba los casos de uso y el contrato HTTP de Identity con dobles y, en `Integration/`, el recorrido real contra SQL Server: transacción de registro y su reversión, bloqueo tras cinco intentos, cookie, login → `/me` → logout y protección CSRF; las operaciones de HU-01 y la búsqueda geográfica de HU-02 (radios, filtros de disponibilidad y recorrido HU-01 → búsqueda).

Las pruebas de integración usan **su propia configuración**, nunca los User Secrets de la API: la variable `XFOOD_TEST_SQLSERVER` con una cadena de conexión al servidor (se ignora el nombre de base). Cada ejecución crea `XFood_Tests_<guid>`, aplica las migraciones y la borra al terminar. Antes de migrar o borrar, el código comprueba que el nombre tenga ese formato y nunca sea `XFoodDB`. Sin la variable, esas pruebas aparecen como omitidas.

**Antes de integrar en `develop` deben ejecutarse con SQL Server** (el repositorio no tiene CI). Con `XFOOD_REQUIRE_SQL_TESTS=true`, una configuración ausente hace fallar las pruebas en lugar de omitirlas:

```powershell
$env:XFOOD_TEST_SQLSERVER='Server=.\SQLEXPRESS;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
$env:XFOOD_REQUIRE_SQL_TESTS='true'
dotnet test XFood.slnx
```

La protección CSRF de la API usa `Cors:PanelOrigins` y `Security:ApiOrigins` (vacíos por defecto, `localhost` en Development); configúrelos con las URL públicas en cada entorno. Existe además una validación real opcional de SQL Server:

```powershell
./tests/Validate-IsolatedSqlServer.ps1
```

Ese script usa el servidor de User Secrets, crea una base nueva `XFood_Validation_*`, aplica ambas migraciones y prueba restricciones. Requiere permisos de creación de bases. Conserva la base para inspección y revierte los datos temporales; nunca selecciona `XFoodDB` como destino de escritura.

## Trabajo del equipo y nuevas migraciones

Coordine cambios de modelo porque todos comparten un snapshot y una secuencia de migraciones. Actualice su copia antes de generar una; acuerde el orden para evitar snapshots divergentes. Desde la raíz:

```powershell
$env:ASPNETCORE_ENVIRONMENT='Development'
dotnet tool run dotnet-ef migrations add NombreDelCambio --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext --output-dir Persistence/Migrations
dotnet tool run dotnet-ef migrations script --idempotent --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext -o migration.sql
dotnet tool run dotnet-ef migrations has-pending-model-changes --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext
```

Revise el SQL, pruebe en una base aislada y versione migración, diseñador y snapshot junto con las entidades y mapeos. Las transacciones de stock, autorización, idempotencia, existencia del principal y procesamiento del outbox deben implementarse y probarse en sus casos de uso. El índice de principal solo garantiza como máximo uno activo; padre y primer principal deben confirmarse en una sola transacción.

`documentacion/`, `AGENTS.md`, `.agents/` y `.codex/` están ignorados por Git y **no llegan en una copia clonada**. Comparta esas referencias por el canal acordado del equipo; la guía versionada está en `docs/`. Los artefactos `bin/`, `obj/`, secretos y bases locales no deben incluirse en commits. Siguen pendientes catálogo inicial, evidencia de verificación, resolución de incidencias parciales/tardías, proveedor push y retención.
