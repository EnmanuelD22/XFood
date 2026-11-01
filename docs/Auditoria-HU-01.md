# Auditoría técnica de HU-01 — Backend XFood

**Fecha de auditoría:** 2026-11-01  
**Rama revisada:** `feature/hu-01-backend`  
**Commit de HU-01:** `8734f8ed562ffec5a932721150ea94d98ac883ea` — `HU-01: implement establishment profile and listings`  
**Base funcional:** `07e16e9` — merge de HU-04 en `origin/develop`  
**Tecnología:** .NET 10, ASP.NET Core Minimal APIs, EF Core 10, SQL Server, ASP.NET Core Identity

> Este informe documenta el estado verificable del código de HU-01. No atribuye a HU-01 la implementación de identidad, autenticación, registro, sesiones, CSRF u onboarding inicial que pertenece a HU-04. Esos componentes se describen únicamente como dependencias consumidas.

## 1. Introducción y alcance

HU-01 implementa el backend de perfil de establecimientos y gestión de publicaciones de XFood. El trabajo revisado añade los contratos, endpoints, validadores, servicios de aplicación/infraestructura y pruebas necesarios para operar publicaciones Sale y Donation bajo el establecimiento autorizado del usuario autenticado.

El alcance implementado comprende:

- Consulta y actualización del perfil de un establecimiento concreto.
- Creación de publicaciones de venta y donación.
- Consulta pública de publicaciones activas, aptas, vigentes y con unidades disponibles.
- Edición y desactivación de publicaciones.
- Cambio explícito de aptitud alimentaria.
- Aumentos, retiros, expiración y transferencias de unidades entre publicaciones del mismo establecimiento.
- Registro de eventos de estado, ajustes, transferencias y cambios de aptitud.
- Contrato de frontera para que Reservations y Donations soliciten asignación/liberación al propietario del inventario.
- Detección y persistencia deduplicada de alertas próximas al vencimiento.
- Validación de concurrencia mediante `RowVersion`, transacciones EF Core y restricciones SQL.

No forman parte de la implementación operativa de HU-01 revisada:

- Registro, login, logout, cookies, roles, políticas generales y onboarding inicial de establecimientos: pertenecen a HU-04.
- Casos de uso persistentes de Reservations y Donations, incluyendo reserva, aceptación, cancelación, recepción, entrega y vencimiento.
- Envío de notificaciones, push o correo; el código de HU-01 solo persiste/deduplica alertas mediante el servicio disponible.
- Catálogo inicial de categorías, semillas, orden de presentación o endpoint de catálogo activo.
- Búsqueda geográfica por distancia, filtros geográficos, paginación y detalle individual.
- Reportes funcionales de cantidades entregadas/no aprovechadas y administración.

La especificación general SRS describe un producto mayor que HU-01. Por tanto, que un requisito exista en `docs/XFood_SRS.md` no significa que esté implementado en este commit.

## 2. Metodología de auditoría

Se revisaron las siguientes fuentes del repositorio:

| Fuente | Evidencia revisada | Propósito |
| --- | --- | --- |
| `docs/XFood_SRS.md` | RF-03 a RF-07 y RF-14; reglas de UTC, precios, disponibilidad y auditoría | Contrastar requisitos funcionales generales |
| `docs/XFood_Especificaciones.md` | CU-02, CU-03, CU-04 y CU-05; contratos HTTP propuestos y reglas de cantidad | Contrastar comportamiento esperado y límites |
| `docs/XFood_Arquitectura.md` | Monolito modular, capas, ownership de stock, transacciones y dependencias | Verificar límites arquitectónicos |
| `src/XFood.Api/Modules/Establishments/` | `EstablishmentProfileEndpoints` | Verificar rutas y mapeo HTTP |
| `src/XFood.Api/Modules/Listings/` | `ListingEndpoints` | Verificar rutas, autorización y respuestas |
| `src/XFood.Application/Modules/Establishments/` | Contratos, validator, excepciones e interfaz | Verificar API de aplicación |
| `src/XFood.Application/Modules/Listings/` | DTOs, validators, excepciones e interfaces | Verificar contratos y reglas de entrada |
| `src/XFood.Domain/Modules/Listings/` | `Listing`, `Category`, `StockAdjustment`, `StockTransfer`, eventos | Verificar estado e invariantes del dominio |
| `src/XFood.Infrastructure/Modules/Establishments/` | `EstablishmentProfileService`, `EstablishmentOnboarding` | Verificar perfil y membresías consumidas |
| `src/XFood.Infrastructure/Modules/Listings/` | Servicios y configuraciones EF Core | Verificar persistencia y lógica de negocio |
| `src/XFood.Infrastructure/Persistence/Migrations/` | `20261030234244_AddV1DataModel` y snapshot | Verificar modelo SQL y migraciones |
| `tests/XFood.Api.Tests/` | Pruebas API, servicios, validadores y alertas | Verificar cobertura disponible |
| `tests/XFood.Architecture.Tests/` | Pruebas del modelo y reglas estructurales | Verificar restricciones arquitectónicas |
| Git | Commit `8734f8e`, commits HU-04 `8deb7f9`, `3ef0d5b` y merge `07e16e9` | Separar autoría y alcance |

El commit de HU-01 registra 60 archivos y 3267 inserciones respecto a `07e16e9`. Los commits `8deb7f9` y `3ef0d5b` son HU-04 y el merge `07e16e9` integra esa historia en `origin/develop`; no se cuentan como cambios de HU-01.

La suite compilada de `XFood.Api.Tests` contiene ahora 136 pruebas, incluidas pruebas de HU-04. En la ejecución realizada para esta revisión se obtuvieron 127 pruebas correctas, 0 errores y 9 omitidas; las omitidas son pruebas `IdentitySqlServerTests` porque no estaba definida la variable `XFOOD_TEST_SQLSERVER`. La suite `XFood.Architecture.Tests` ejecutó 24 pruebas correctas y 0 errores. En este informe se identifican las pruebas de HU-01 por nombre y no se presenta la suite completa como si fuera exclusivamente HU-01. No se afirma una validación SQL Server completa de HU-01 en esta ejecución.

## 3. Arquitectura implementada

XFood utiliza un monolito modular con una única aplicación ASP.NET Core y un único `XFoodDbContext`. La solución separa responsabilidades por proyectos:

| Capa/proyecto | Responsabilidad en HU-01 |
| --- | --- |
| `src/XFood.Api` | Minimal APIs, rutas `/api/v1`, autorización de rol, extracción del actor desde claims y traducción de excepciones a HTTP |
| `src/XFood.Application` | DTOs, interfaces de servicios, validadores, errores y contratos públicos entre módulos |
| `src/XFood.Domain` | Entidades, enums y propiedades de estado/balance sin dependencia de EF Core o ASP.NET |
| `src/XFood.Infrastructure` | Servicios concretos, consultas EF Core, transacciones, configuraciones SQL Server, Identity/onboarding consumido y migraciones |
| `tests/XFood.Api.Tests` | Pruebas de API, servicios, validadores, alertas y contrato de inventario |
| `tests/XFood.Architecture.Tests` | Verificaciones de modelo, RowVersion, índices, claves y límites de dependencias |

El arranque se realiza en `src/XFood.Api/Program.cs`: registra OpenAPI, errores de API, infraestructura e Identity; configura middleware; mapea identidad, Listings y perfil de establecimientos. `src/XFood.Infrastructure/DependencyInjection.cs` registra `IEstablishmentProfileService`, las interfaces de consulta/creación/gestión de Listings y `IListingExpiryAlertService`. No registra una implementación de `IListingInventoryService`, porque solo existe el contrato y Reservations/Donations no aportan todavía una unidad de trabajo operativa.

Flujo de una mutación privada:

1. ASP.NET Core aplica la política `RequireEstablishment`.
2. El endpoint extrae `ClaimTypes.NameIdentifier`.
3. El servicio carga el recurso solicitado.
4. El servicio consulta `IEstablishmentOnboarding.FindActiveMembershipAsync` con el usuario autenticado y el establecimiento propietario real.
5. Se valida que la membresía no esté revocada y que el establecimiento tenga `EstablishmentStatus.Active`.
6. Se ejecuta el validador de entrada y las reglas de estado/cantidad.
7. Se actualiza la entidad y se añade el registro histórico correspondiente.
8. EF Core guarda en una transacción relacional; `DbUpdateConcurrencyException` se traduce a conflicto 409.
9. Se devuelve el DTO de respuesta o `ApiError`.

## 4. Inventario de archivos de HU-01

| Ruta | Tipo | Responsabilidad | Cambio auditado |
| --- | --- | --- | --- |
| `src/XFood.Api/Modules/Establishments/EstablishmentProfileEndpoints.cs` | Endpoint | Perfil | GET/PUT del perfil autorizado |
| `src/XFood.Api/Modules/Listings/ListingEndpoints.cs` | Endpoint | Listings | Consulta, creación, edición, desactivación, aptitud y stock |
| `src/XFood.Api/Program.cs` | Composición API | Arranque | Mapea endpoints de HU-01 |
| `src/XFood.Application/Modules/Establishments/Contracts/*` | DTO | Perfil | Respuesta y solicitud de actualización |
| `src/XFood.Application/Modules/Establishments/EstablishmentProfileValidator.cs` | Validator | Perfil | Obligatorios, longitudes, email y coordenadas |
| `src/XFood.Application/Modules/Establishments/Services/IEstablishmentProfileService.cs` | Contrato | Perfil | Puerta de aplicación para GET/PUT |
| `src/XFood.Application/Modules/Establishments/EstablishmentProfileExceptions.cs` | Errores | Perfil | Validación, forbidden y not found |
| `src/XFood.Application/Modules/Listings/Contracts/*` | DTO | Listings/stock | Solicitudes, respuestas y frontera de inventario |
| `src/XFood.Application/Modules/Listings/*Validator.cs` | Validator | Reglas de entrada | Creación, edición, stock, aptitud e inventario externo |
| `src/XFood.Application/Modules/Listings/*Exceptions.cs` | Errores | Listings | Errores de validación, autorización, estado y concurrencia |
| `src/XFood.Application/Modules/Listings/Services/*` | Contratos | Casos de uso | Interfaces de consulta, gestión, alertas e inventario |
| `src/XFood.Infrastructure/Modules/Establishments/EstablishmentProfileService.cs` | Servicio | Perfil | Persiste campos editables y autoriza membresía |
| `src/XFood.Infrastructure/Modules/Listings/CreateListingService.cs` | Servicio | Sale | Crea lote Sale y evento inicial |
| `src/XFood.Infrastructure/Modules/Listings/CreateDonationListingService.cs` | Servicio | Donation | Crea lote Donation y evento inicial |
| `src/XFood.Infrastructure/Modules/Listings/ManageListingService.cs` | Servicio | Gestión | Edita y desactiva sin borrar historial |
| `src/XFood.Infrastructure/Modules/Listings/ManageListingStockService.cs` | Servicio | Inventario | Ajusta y transfiere unidades |
| `src/XFood.Infrastructure/Modules/Listings/ManageListingFitnessService.cs` | Servicio | Aptitud | Cambia aptitud y registra auditoría |
| `src/XFood.Infrastructure/Modules/Listings/ActiveListingsQueryService.cs` | Consulta | Catálogo activo | Filtra status, stock, aptitud y vigencia |
| `src/XFood.Infrastructure/Modules/Listings/ListingExpiryAlertService.cs` | Servicio | RF-14 parcial | Detecta y persiste alertas deduplicadas |
| `src/XFood.Infrastructure/DependencyInjection.cs` | DI | Composición | Registra servicios concretos |
| `tests/XFood.Api.Tests/Establishments/*` | Pruebas | Perfil | Pipeline HTTP y servicio |
| `tests/XFood.Api.Tests/Listings/*` | Pruebas | Listings | Validadores, servicios, API, alertas e inventario |
| `docs/HU-01-Cierre.md` | Documentación | Entrega | Alcance, dependencias, pendientes y pruebas |

Los archivos de HU-04 en `src/XFood.Api/Modules/Identity`, `src/XFood.Infrastructure/Modules/Identity`, `AccountUseCases`, `AccountStore`, `IdentitySetup`, `OriginValidation` y sus pruebas no son cambios de HU-01. HU-01 los consume como infraestructura base.

## 5. API REST implementada

Todas las rutas de aplicación están bajo `/api/v1`. Los endpoints privados requieren la política `RequireEstablishment`. `ApiError` tiene forma `{ code, message, traceId, errors? }`; `errors` aparece para errores de validación.

| Método | Ruta | Entrada | Éxito | Errores declarados/observables |
| --- | --- | --- | --- | --- |
| GET | `/api/v1/establishments/{establishmentId}` | `establishmentId: Guid` | 200 `EstablishmentProfileResponse` | 401 anónimo, 403 membresía no autorizada/establecimiento no activo, 404 inexistente |
| PUT | `/api/v1/establishments/{establishmentId}` | Guid + `UpdateEstablishmentProfileRequest` | 200 perfil actualizado | 400 validación, 401, 403, 404 |
| GET | `/api/v1/listings` | Query opcional `asOfUtc: DateTimeOffset`; debe tener offset cero | 200 `IReadOnlyList<ListingResponse>` | 400 `VALIDATION_ERROR` para fecha no UTC |
| GET | `/api/v1/listings/donations` | Query opcional `asOfUtc: DateTimeOffset`; organización autenticada y aprobada | 200 `IReadOnlyList<ListingResponse>` | 401 anónimo, 403 rol/verificación, 400 fecha no UTC |
| POST | `/api/v1/listings` | `CreateListingRequest` | 201 `ListingResponse`, Location `/api/v1/listings/{id}` | 400 validación, 401, 403, 404 categoría |
| POST | `/api/v1/listings/donations` | `CreateDonationListingRequest` | 201 `ListingResponse`, Location | 400 validación, 401, 403, 404 categoría |
| PATCH | `/api/v1/listings/{listingId}` | Guid + `UpdateListingRequest` | 200 `ListingResponse` | 400 validación/estado, 401, 403, 404, 409 concurrencia |
| POST | `/api/v1/listings/{listingId}/deactivate` | Guid + `DeactivateListingRequest` | 200 `ListingResponse` | 400 motivo/estado, 401, 403, 404, 409 concurrencia |
| POST | `/api/v1/listings/{listingId}/fitness` | Guid + `ChangeListingFitnessRequest` | 200 `ListingResponse` | 400 motivo/estado, 401, 403, 404, 409 concurrencia |
| POST | `/api/v1/listings/{listingId}/stock-adjustments` | Guid + `AdjustListingStockRequest` | 200 `ListingResponse` | 400 tipo/cantidad/motivo/estado, 401, 403, 404, 409 concurrencia |
| POST | `/api/v1/listings/{listingId}/stock-transfers` | Guid + `TransferListingStockRequest` | 200 `StockTransferResponse` con origen/destino | 400 cantidad/estado, 401, 403, 404, 409 concurrencia |

No existe en este commit un endpoint HTTP de categorías activas, asignación/liberación de inventario externo, reservas, aceptaciones, notificaciones, reportes, búsqueda geográfica o detalle individual. El contrato de `IListingInventoryService` es Application, no una ruta REST implementada.

## 6. Contratos y DTOs

### Perfil

`EstablishmentProfileResponse` expone `Guid Id`, `string Name`, `string ContactName`, `string ContactEmail`, `string ContactPhone`, `string Address`, `decimal Latitude`, `decimal Longitude` y `string TimeZoneId`. `UpdateEstablishmentProfileRequest` recibe todos los campos salvo el identificador y la zona horaria, que no se modifica en este servicio.

`EstablishmentProfileValidator` exige nombre, contacto, email, teléfono y dirección; aplica longitudes máximas de 200, 200, 320, 32 y 500; valida el email mediante `MailAddress`; limita latitud a -90..90 y longitud a -180..180. El servicio recorta valores de texto antes de persistir.

### Creación Sale

`CreateListingRequest` contiene `Guid EstablishmentId`, `Guid CategoryId`, `string Title`, `string Description`, `int InitialQuantity`, `string PickupInstructions`, fechas `PickupStartsAtUtc`/`PickupDeadlineUtc`, precios `decimal OriginalUnitPrice`/`DiscountedUnitPrice`, `string PaymentInstructions` y `bool? FoodSafetyDeclared`. El valor debe ser exactamente `true`; tanto la omisión como `false` se rechazan. El DTO no usa valor predeterminado que pueda simular una declaración.

`CreateListingValidator` exige IDs no vacíos, título/descripción/instrucciones de recogida/instrucciones de pago, cantidades y precios positivos, descuento menor que original, declaración de seguridad verdadera, fechas UTC, inicio anterior al límite y creación anterior al límite. Los límites de texto son título 200, descripción 4000, recogida 2000, pago 1000.

### Creación Donation

`CreateDonationListingRequest` contiene establecimiento, categoría, título, descripción, cantidad, instrucciones de recogida, fechas UTC y `bool? FoodSafetyDeclared`. El valor debe ser exactamente `true`; omisión y `false` se rechazan. No contiene precios ni pago. `CreateDonationListingValidator` aplica las mismas reglas de IDs, textos, cantidad, seguridad y ventana, sin reglas de precio.

### Respuesta de publicación

`ListingResponse` expone identificadores, título, descripción, `ListingMode`, `ListingStatus`, cantidades inicial/disponible, precios nullable, `Currency`, instrucciones, seguridad, aptitud, fechas y fecha de creación. Los servicios fijan `Currency = "DOP"`; Donation devuelve precios e instrucciones de pago nulos.

### Gestión e inventario

- `UpdateListingRequest`: categoría, textos, cantidad inicial, ventana y precios/pago nullable. Mantiene la modalidad existente; no existe campo para cambiar Sale a Donation o viceversa.
- `DeactivateListingRequest`: `Reason`, obligatorio y máximo 1000.
- `ChangeListingFitnessRequest`: `bool IsFoodFit` y motivo obligatorio máximo 1000.
- `AdjustListingStockRequest`: `StockAdjustmentKind Kind`, cantidad positiva y motivo máximo 1000.
- `TransferListingStockRequest`: destino Guid, cantidad positiva y motivo máximo 1000.
- `AllocateListingUnitsRequest`/`ReleaseListingUnitsRequest`: `OperationId`, `ListingMode`, cantidad, `ActorUserId` y motivo. Sirven como contrato externo; no tienen implementación registrada.

## 7. Servicios y lógica de negocio

### Perfil

`EstablishmentProfileService.GetAsync` valida primero la membresía concreta mediante `IEstablishmentOnboarding`, carga el establecimiento con `AsNoTracking` y proyecta solo sus campos públicos de perfil. `UpdateAsync` valida antes de cargar/escribir, verifica membresía y estado activo, actualiza exclusivamente nombre, contacto, dirección y coordenadas, y llama a `SaveChangesAsync`. No cambia estado, propietario, zona horaria ni membresías.

### Crear Sale

`CreateListingService.CreateAsync` obtiene el reloj UTC, valida el request, comprueba la membresía activa sobre `request.EstablishmentId`, verifica que `CategoryId` exista y esté activa, inicia transacción relacional, crea un `Listing` Sale activo con disponibilidad igual a la cantidad inicial y agrega un `ListingStatusChange` inicial. Persiste ambos registros y confirma la transacción.

### Crear Donation

`CreateDonationListingService.CreateAsync` sigue el mismo flujo de validación, autorización, categoría y transacción, pero fija `Mode = Donation`, precios nulos y pago nulo. También crea el evento inicial de estado.

### Consulta activa

`ActiveListingsQueryService.GetActiveAsync` recibe el `ListingMode` explícito y usa `AsNoTracking`. `GET /api/v1/listings` solicita únicamente `Sale`; `GET /api/v1/listings/donations` solicita únicamente `Donation` y exige rol Organization y `VerificationStatus.Approved` mediante `IOrganizationOnboarding`. Ambas consultas devuelven solo publicaciones `Active`, con `AvailableQuantity > 0`, `IsFoodFit = true` y `PickupDeadlineUtc` posterior al instante efectivo. El endpoint no acepta que un `asOfUtc` pasado reabra lotes: usa como mínimo el reloj UTC del servidor. No une nombre/dirección de establecimiento.

### Edición

`ManageListingService.UpdateAsync` carga la publicación y autoriza el establecimiento propietario real. `ManageListingValidator` valida la modalidad existente, la ventana futura, categoría activa, textos, precios y cantidad. Calcula `availableDelta = nuevaInicial - inicialAnterior`; rechaza reducir por debajo de unidades comprometidas y actualiza la disponibilidad por el delta. Guarda con transacción y traduce conflictos de `RowVersion`.

### Desactivación

`DeactivateAsync` valida el motivo, autoriza, permite transición desde `Active` o `Exhausted`, cambia a `Deactivated` y crea `ListingStatusChange` con actor, motivo y UTC. No borra la publicación ni sus cantidades/historial.

### Aptitud

`ManageListingFitnessService.ChangeAsync` valida motivo, carga y autoriza, rechaza publicación desactivada o el mismo valor, cambia `IsFoodFit` y crea `ListingFitnessChange`. No elimina unidades automáticamente ni convierte una publicación a Donation.

### Ajustes

`ManageListingStockService.AdjustAsync` valida tipo/cantidad/motivo y autoriza. Un aumento solo se permite para publicación activa o agotada y vigente; incrementa `AddedQuantity` y `AvailableQuantity`. Un retiro o expiración exige disponibilidad suficiente, reduce disponible e incrementa `WrittenOffQuantity`. Si el retiro deja cero unidades, cambia a `Exhausted` y agrega `ListingStatusChange` con actor, fecha y motivo. Un aumento válido antes del límite puede reactivar de `Exhausted` a `Active`, también con historial. Cada operación agrega `StockAdjustment` con actor, motivo y UTC.

### Transferencias

`TransferAsync` valida destino/cantidad/motivo, rechaza origen igual a destino, carga ambas publicaciones, autoriza al propietario del origen, exige mismo establecimiento, ambas activas/vigentes/aptas y disponibilidad suficiente. Reduce el origen, incrementa `TransferredOutQuantity`, aumenta destino y `TransferredInQuantity`, y crea `StockTransfer`. Si el origen queda sin unidades, cambia a `Exhausted` y registra `ListingStatusChange`; una transferencia no reactiva un destino agotado. La transacción incluye ambos cambios y el historial.

### Alertas

`ListingExpiryAlertService.DetectAsync` exige `asOfUtc` UTC y umbral positivo. Selecciona lotes activos, aptos (`IsFoodFit`), con stock, deadline posterior a `asOfUtc` y dentro del umbral configurable `ExpiryAlertOptions.ThresholdMinutes`. Persiste `ListingExpiryAlert` con snapshot de cantidad/deadline. Consulta alertas existentes y maneja una carrera de inserción mediante la restricción/detección de duplicado. Esto implementa una parte de RF-14 —detección y persistencia—, no la creación de la notificación de bandeja ni su despacho.

## 8. Base de datos y persistencia

La migración `20261030234244_AddV1DataModel` crea los esquemas `listings`, `establishments`, `notifications`, `donations`, `reservations` y `administration`, junto con el modelo v1. HU-01 utiliza principalmente estas entidades:

| Entidad | Tabla/esquema | Relación principal |
| --- | --- | --- |
| `Establishment` | `establishments.Establishments` | Perfil y propietario de Listings |
| `EstablishmentMember` | `establishments.EstablishmentMembers` | Usuario autorizado por establecimiento |
| `EstablishmentStatusChange` | `establishments.EstablishmentStatusChanges` | Historial de estado |
| `Listing` | `listings.Listings` | Pertenece a establecimiento y categoría |
| `Category` | `listings.Categories` | Referencia controlada activa/inactiva |
| `StockAdjustment` | `listings.StockAdjustments` | Aumento, retiro o expiración |
| `StockTransfer` | `listings.StockTransfers` | Movimiento entre dos Listings del mismo establecimiento |
| `ListingStatusChange` | `listings.ListingStatusChanges` | Historial de estado del lote |
| `ListingFitnessChange` | `listings.ListingFitnessChanges` | Historial de aptitud |
| `ListingExpiryAlert` | `notifications.ListingExpiryAlerts` | Alerta persistida por lote/umbral |

`ListingConfiguration` establece checks para modo, estado, cantidades, balance, precios, pago, moneda DOP, ventana UTC y seguridad alimentaria. Usa claves alternativas que incluyen modo/establecimiento para las relaciones de operaciones. Las claves foráneas tienen `DeleteBehavior.NoAction` para no borrar historial en cascada. `Listing`, `Category` y `Establishment` tienen `RowVersion`; las fechas se mapean con reglas UTC y los importes con precisión decimal 18,2. Coordenadas de establecimiento usan precisión 9,6. La migración existente ya contiene el check que exige `FoodSafetyDeclared = 1`; no se modificó ninguna migración aplicada.

La configuración de miembros exige rol válido, consistencia de revocación, una membresía activa única por usuario/establecimiento y una única membresía primaria activa por establecimiento. La categoría tiene nombre único, pero no se insertan semillas.

## 9. Inventario y transferencias

La entidad `Listing` mantiene estos contadores: `InitialQuantity`, `AddedQuantity`, `TransferredInQuantity`, `TransferredOutQuantity`, `AvailableQuantity`, `AssignedQuantity`, `FulfilledQuantity` y `WrittenOffQuantity`. La restricción SQL `CK_Listings_StockBalance` exige:

`InitialQuantity + AddedQuantity + TransferredInQuantity = AvailableQuantity + AssignedQuantity + FulfilledQuantity + WrittenOffQuantity + TransferredOutQuantity`.

También se exige disponibilidad no negativa y que un Listing `Exhausted` tenga disponibilidad cero. Los ajustes de aumento y pérdida no se utilizan para representar reservas o donaciones; el comentario de dominio indica que asignación, liberación y cumplimiento pertenecen a operaciones externas.

La frontera pública `IListingInventoryService` define `AllocateAsync` y `ReleaseAsync`, con `OperationId` para idempotencia conceptual, modo, cantidad, actor y motivo. `ListingInventoryAllocationResult` devuelve cantidad disponible/asignada; `ListingInventoryReleaseResult` incluye `AlreadyReleased`. Sin embargo, la interfaz no tiene implementación operativa ni registro DI en este commit. Esto es correcto frente a la arquitectura: Reservations y Donations todavía no aportan casos de uso persistentes ni una unidad de trabajo compartida para guardar su operación y el movimiento de stock atómicamente.

Las transferencias son distintas de las asignaciones: solo mueven unidades no comprometidas entre dos Listings del mismo establecimiento, mantienen el balance de ambos y dejan `StockTransfer`. No hay escritura directa permitida desde módulos externos.

## 10. Validaciones y manejo de errores

Los validadores propios del proyecto se ejecutan dentro de Application/Infrastructure antes de modificar entidades; no se utiliza FluentValidation. Los principales rechazos son:

- IDs de establecimiento/categoría/destino vacíos.
- Textos vacíos o sobre sus límites.
- Cantidad no positiva.
- Venta con precios no positivos, descuento no menor al original, o pago ausente.
- Donation con precios o pago, si se intenta enviar esos valores mediante edición.
- Declaración de seguridad alimentaria falsa.
- Fechas con offset distinto de cero, ventana invertida o deadline pasado.
- Categoría inexistente o inactiva.
- Cantidad editada inferior a unidades comprometidas/entregadas.
- Desactivación sin motivo o desde estado no permitido.
- Ajuste no válido, aumento fuera de ventana, retiro superior al disponible.
- Transferencia al mismo Listing, entre establecimientos diferentes, desde/hacia Listings no activos, vencidos o no aptos, o superior al disponible.
- Cambio de aptitud redundante o sobre Listing desactivado.
- Membresía inexistente/revocada o establecimiento no activo.

`ApiErrors` centraliza `ApiError`, `traceId` y el mapa de códigos a HTTP: validación 400, no autenticado 401, forbidden/suspendido 403, not found 404 y errores no clasificados 500. Los servicios de Listings añaden `CONCURRENCY_CONFLICT` con 409 para `DbUpdateConcurrencyException`. El pipeline también normaliza bad JSON, 401/403/404, método no permitido y media type no soportado.

## 11. Seguridad y autorización

HU-01 no implementa identidad propia. Consume la autenticación por cookie, claims y políticas provistas por HU-04. Las mutaciones de perfil y Listings usan `RequireAuthorization(AuthorizationPolicies.Establishment)`. Los servicios no confían únicamente en el `EstablishmentId` enviado: vuelven a comprobar la membresía del usuario autenticado contra el establecimiento concreto, su revocación y el estado operativo.

La autorización evita, según código y pruebas, que un consumidor anónimo o de rol incorrecto acceda a mutaciones, que un operador actúe sobre otro establecimiento o que un establecimiento inactivo/revocado opere. La consulta pública de Listings no requiere sesión.

La protección CSRF/origin, cookies, suspensión de cuenta, roles y emisión/validación de sesión son responsabilidad de HU-04 (`IdentitySetup`, `OriginValidation`, `CookieSessionManager` y `AccountUseCases`). No se atribuyen a HU-01. En HU-01 no existe una autorización de destinatario para reservas/donaciones porque esos casos de uso no están implementados. Tampoco se implementan rate limiting, auditoría de acceso de lectura, endpoint administrativo de categorías ni envío de notificaciones.

## 12. Pruebas y evidencia

### Pruebas específicas de HU-01

| Prueba | Escenario | Resultado/evidencia | Observación |
| --- | --- | --- | --- |
| `EstablishmentProfileApiTests.Get_profile_without_a_session_returns_401` | GET de perfil sin sesión | Pasada en la suite histórica | Verifica 401 y `UNAUTHENTICATED` |
| `EstablishmentProfileApiTests.Update_profile_without_a_session_returns_401` | PUT sin sesión | Pasada | El servicio no se alcanza |
| `EstablishmentProfileServiceTests.GetAsync_returns_only_the_requested_establishment_profile` | Consulta perfil autorizado | Pasada | Devuelve solo el establecimiento solicitado |
| `EstablishmentProfileServiceTests.UpdateAsync_changes_only_profile_fields` | Actualización de campos | Pasada | Conserva ID, creador, estado y zona horaria |
| `EstablishmentProfileServiceTests.UpdateAsync_rejects_invalid_coordinates_without_writing` | Latitud fuera de rango | Pasada | No deja escritura parcial |
| `EstablishmentProfileServiceTests.GetAsync_rejects_user_without_membership` | Usuario sin membresía | Pasada | Lanza forbidden |
| `ListingApiTests.Get_active_listings_returns_service_response_and_passes_as_of_utc` | Consulta pública con fecha UTC | Pasada | Propaga `asOfUtc` |
| `ListingApiTests.Get_active_listings_without_as_of_uses_utc_time_provider` | Consulta sin fecha | Pasada | Usa `TimeProvider` UTC |
| `ListingApiTests.Get_active_listings_rejects_non_utc_as_of` | Fecha con offset -04:00 | Pasada | Devuelve 400 y no consulta servicio |
| `ListingApiTests.Create_sale_without_a_session_returns_401` | POST Sale anónimo | Pasada | Rechazo de política |
| `ListingApiTests.Create_donation_without_a_session_returns_401` | POST Donation anónimo | Pasada | Rechazo de política |
| `ListingApiTests.Update_listing_without_a_session_returns_401` | PATCH anónimo | Pasada | Rechazo de política |
| `ListingApiTests.Deactivate_listing_without_a_session_returns_401` | Desactivación anónima | Pasada | Rechazo de política |
| `ListingApiTests.Adjust_listing_without_a_session_returns_401` | Ajuste anónimo | Pasada | Rechazo de política |
| `ListingApiTests.Transfer_listing_without_a_session_returns_401` | Transferencia anónima | Pasada | Rechazo de política |
| `ActiveListingsQueryServiceTests.GetActiveAsync_returns_only_active_listings_with_future_deadline` | Filtra status/vigencia/stock/aptitud | Pasada | Solo devuelve el lote elegible |
| `ActiveListingsQueryServiceTests.GetActiveAsync_orders_by_deadline_then_id` | Orden determinista | Pasada | Deadline y luego ID |
| `CreateListingServiceTests.CreateAsync_persists_sale_and_initial_status_event` | Crear Sale | Pasada | Listing y evento inicial persistidos |
| `CreateDonationListingServiceTests.CreateAsync_rejects_missing_category_without_persisting` | Donation sin categoría | Pasada | No hay escritura |
| `CreateDonationListingServiceTests.CreateAsync_rejects_inactive_category_without_persisting` | Categoría inactiva | Pasada | No hay escritura |
| `CreateListingValidatorTests.Validate_valid_sale_request_returns_no_errors` | Request Sale válido | Pasada | Sin errores |
| `CreateListingValidatorTests.Validate_rejects_invalid_sale_values` | Valores Sale inválidos | Pasada | Detecta errores de campos |
| `ManageListingServiceTests.UpdateAsync_changes_sale_fields_and_preserves_committed_units` | Edición y unidades asignadas | Pasada | Ajusta disponible sin perder comprometidas |
| `ManageListingServiceTests.UpdateAsync_rejects_quantity_below_committed_units` | Reducción ilegal | Pasada | Rechaza y preserva cantidad |
| `ManageListingServiceTests.DeactivateAsync_preserves_listing_and_adds_status_history` | Desactivación | Pasada | Conserva registro y añade evento |
| `ManageListingServiceTests.UpdateAsync_rejects_user_without_membership` | Usuario sin pertenencia | Pasada | Rechaza autorización |
| `ManageListingServiceTests.AdjustAsync_increases_available_stock_and_records_history` | Aumento | Pasada | Actualiza stock y `StockAdjustment` |
| `ManageListingServiceTests.AdjustAsync_rejects_withdrawal_above_available_quantity` | Retiro superior a disponible | Pasada | No permite retirar comprometidas |
| `ManageListingServiceTests.AdjustAsync_records_expiry_loss_for_an_expired_listing` | Pérdida por expiración | Pasada | Registra retiro de expiración |
| `ListingExpiryAlertServiceTests.DetectAsync_persists_only_active_available_listings_inside_threshold` | Candidatos RF-14 | Pasada | Persiste solo candidatos válidos |
| `ListingExpiryAlertServiceTests.DetectAsync_is_idempotent_for_repeated_runs` | Ejecución repetida | Pasada | Segunda ejecución no duplica |
| `ListingExpiryAlertServiceTests.DetectAsync_deduplicates_by_listing_and_threshold` | Alerta existente | Pasada | Deduplica por lote/umbral |
| `ListingInventoryContractTests.Allocation_request_accepts_sale_mode_and_positive_quantity` | Contrato de asignación | Pasada | Request válido |
| `ListingInventoryContractTests.Release_request_rejects_empty_operation_and_non_positive_quantity` | Contrato de liberación inválido | Pasada | Detecta operación/cantidad/actor |
| `ListingInventoryContractTests.Requests_preserve_operation_identity_for_idempotent_integration` | Identidad de operación | Pasada | Conserva `OperationId` |

La suite completa listada en el entorno contiene 134 pruebas; incluye las de Identity/HU-04. En esta auditoría se ejecutó con 125 correctas, 0 errores y 9 omitidas, porque las pruebas `IdentitySqlServerTests` requieren `XFOOD_TEST_SQLSERVER`. Deben ejecutarse contra una base temporal, nunca contra `XFoodDB`. Las pruebas de HU-01 mostradas usan en gran parte EF Core InMemory; esto valida lógica de aplicación, pero no sustituye una comprobación SQL Server de transacciones, checks y concurrencia mediante `RowVersion`. La suite de arquitectura sí se ejecutó completa: 24 correctas y 0 errores.

## 13. Integración con HU-04

HU-01 depende de HU-04 en tres puntos concretos, sin apropiarse de su implementación:

1. `AuthorizationPolicies.Establishment` determina el rol permitido en el pipeline.
2. `ClaimsPrincipal` aporta `ClaimTypes.NameIdentifier`, de donde se obtiene el actor.
3. `IEstablishmentOnboarding` expone `FindActiveMembershipAsync` y `ListActiveMembershipsAsync`. HU-01 usa el primero para autorizar el establecimiento concreto.

La implementación de `EstablishmentOnboarding`, registro de cuentas, `/api/v1/me`, cookies, login/logout, CSRF/origin y políticas se encuentra en HU-04/base. La respuesta `/api/v1/me` ya expone establecimientos con `Id`, `Name`, `Status`, `MemberRole` e `IsPrimary`, por lo que HU-01 no duplica un endpoint de selección.

La lista de membresías filtra membresías no revocadas, devuelve el estado del establecimiento y permite selección explícita. HU-01 no elige arbitrariamente el primer establecimiento. Las decisiones de ciclo de vida de membresías y suspensión corresponden a HU-04/Wilmer.

## 14. Calidad del código

Aspectos positivos verificables:

- Separación clara entre endpoints, contratos Application, dominio y servicios Infrastructure.
- Servicios pequeños con una responsabilidad principal y mapeos DTO explícitos.
- Validación antes de persistencia y persistencia de eventos junto al cambio principal.
- Uso de `AsNoTracking` en consultas de lectura.
- Transacciones explícitas para mutaciones relacionales.
- `RowVersion`, checks SQL, claves foráneas e índices para proteger invariantes.
- Errores de API uniformes y trazables mediante `traceId`.
- No se registra una implementación ficticia del contrato de inventario.
- Pruebas de API separadas de pruebas de servicio y validadores.

Puntos de mantenibilidad:

- Hay mapeos `Listing` -> `ListingResponse` repetidos en varios servicios; un mapper común podría reducir duplicación, siempre que no oculte diferencias de caso de uso.
- Las comprobaciones de membresía y establecimiento activo se repiten en varios servicios; una política/servicio de autorización de dominio podría centralizar la semántica, manteniendo la verificación dentro del caso de uso.
- `StockManagementValidator.ValidateReason` utiliza la clave de `AdjustListingStockRequest.Reason` también para transferencias; funcionalmente coincide el nombre, pero un contrato común de errores sería más expresivo.
- Los endpoints repiten extracción del actor y traducción de excepciones; un filtro/abstracción de aplicación podría simplificarlo, aunque la implementación actual es explícita.
- La consulta activa devuelve `ListingResponse` sin nombre/dirección del establecimiento, aunque el SRS describe esos datos para el catálogo. Se necesita decisión/contrato antes de ampliar el DTO.
- La configuración y migración contienen el modelo completo v1, incluyendo tablas de otros módulos; eso es coherente con el monolito y no significa que HU-01 implemente sus casos de uso.

## 15. Hallazgos

| Severidad | Hallazgo | Evidencia | Impacto |
| --- | --- | --- | --- |
| Alta | No existe implementación operativa de `IListingInventoryService` | Interfaz presente, sin clase concreta ni registro DI | Reservations/Donations no pueden asignar/liberar stock todavía |
| Alta | RF-14 no está completo de extremo a extremo | `ListingExpiryAlertService` detecta/persiste solo publicaciones activas, aptas y con stock, pero no crea/envía notificación al usuario | Falta generación de bandeja y despacho |
| Alta | No existen casos de uso HTTP de reservas/donaciones | `ListingEndpoints` solo crea Listings Donation; no acepta donaciones | RF-08/RF-09 quedan fuera de HU-01/dependencia externa |
| Media | No existe endpoint de categorías activas | `Category` se valida por ID, pero no hay consulta HTTP ni seeds | Frontend no puede descubrir un catálogo desde HU-01 |
| Media | Consulta activa no devuelve establecimiento/dirección | `ActiveListingsQueryService` proyecta solo campos de Listing | Puede ser insuficiente para RF-06; requiere contrato frontend aprobado |
| Media | No existe endpoint de detalle individual | Solo `GET /listings` está implementado | El detalle descrito en RF-06 no está disponible |
| Media | No hay paginación/filtros geográficos | No aparecen parámetros ni servicios para ello | RF-07 y parte del descubrimiento no están cubiertos |
| Baja | Mapeo de respuestas repetido | `ToResponse` en varios servicios | Coste de mantenimiento y riesgo de divergencia |
| Baja | La suite de 134 mezcla HU-01 y HU-04 | Tests de Identity dentro del mismo proyecto | Puede dificultar atribuir cobertura sin filtros por clase/proyecto |
| Alta | Las ediciones de perfil y publicación no conservan autoría | `EstablishmentProfileService.UpdateAsync` y `ManageListingService.UpdateAsync` sobrescriben propiedades sin una entidad de historial de edición | No se puede reconstruir quién cambió cada campo ni cuándo; requiere diseño y migración nueva antes de implementarse |

No se clasifica como defecto la ausencia de implementación de Reservations, Donations o Notifications: el alcance y la arquitectura establecen que son dependencias externas y que no deben resolverse con servicios ficticios.

## 16. Riesgos y recomendaciones

1. **Integridad de integración externa:** Reservations y Donations deben implementar operaciones idempotentes con `OperationId`, autorización propia y una unidad de trabajo compartida con Listings. No deben escribir `Listing`, `StockAdjustment` ni `StockTransfer` directamente.
2. **Concurrencia real:** mantener pruebas SQL Server con dos solicitudes simultáneas sobre la última unidad y verificar que una operación obtiene conflicto o rechazo sin balance negativo. Las pruebas InMemory no reproducen todas las propiedades de SQL Server.
3. **RF-14:** definir con Notifications el evento, destinatario del establecimiento, clave de deduplicación, creación de `Notification`, outbox, reintentos y política posterior al commit. No crear un trabajador paralelo en Listings.
4. **Categorías:** Producto debe proporcionar catálogo inicial, identificadores, nombres, orden y ciclo de activación. Después debe definirse un endpoint versionado para frontend si se aprueba.
5. **Contrato de catálogo:** Juan Eliud debe confirmar si `ListingResponse` necesita nombre/dirección, separación Sale/Donation, filtros, paginación o detalle. No ampliar el contrato por inferencia.
6. **Trazabilidad de ediciones:** definir una entidad mínima de historial para perfil y publicación con recurso, actor, fecha UTC, operación, motivo y valores/campos afectados. Aprobar el modelo y generar una nueva migración antes de implementarlo; no modificar migraciones ya aplicadas.
7. **Estados operativos:** HU-04 debe mantener consistente la revocación de membresías y estados Inactive/Suspended, y las pruebas de HU-01 deben cubrir ambos cambios durante una sesión activa.
8. **OpenAPI:** la metadata actual se genera con `AddOpenApi`/`MapOpenApi` en Development. Para revisión de frontend conviene publicar un documento versionado, pero solo después de cerrar DTOs y errores aprobados.
9. **Auditoría:** conservar actor, motivo y UTC en cada transición. Los reportes futuros deben distinguir disponible, asignado, cumplido, retirado y transferido.
10. **Estado Git/entrega:** mantener separado el commit de HU-01 de los commits de HU-04. El PR de HU-01 debe compararse con `develop`, donde HU-04 ya está integrado, y contener solo cambios de HU-01 y documentación aprobada.

## 17. Conclusión

HU-01 tiene una implementación backend verificable para perfil de establecimientos, creación y gestión de Listings, controles de inventario local, transferencias, aptitud, consulta separada de ventas/donaciones, auditoría de transiciones de estado y detección/persistencia filtrada de alertas. La implementación está organizada conforme al monolito modular y respeta que Listings sea propietario del disponible. La autorización se apoya en HU-04, pero la propiedad se vuelve a comprobar dentro de los casos de uso de HU-01. Las ediciones de perfil y datos de publicación todavía no tienen historial de autoría persistente.

La evidencia de pruebas incluye validadores, servicios, API anónima, autorización por membresía, edición sin reducir unidades comprometidas, persistencia de eventos, reglas de stock, transferencias, filtros por modalidad, rechazo de declaración omitida, exclusión de publicaciones no aptas y deduplicación de alertas. En la ejecución de esta revisión, la suite API registró 127 pruebas correctas, 0 errores y 9 omitidas por falta de `XFOOD_TEST_SQLSERVER`; la suite de arquitectura registró 24 correctas y 0 errores. La suite API incluye HU-04 y no debe interpretarse como cobertura exclusiva de HU-01. No se ejecutó una prueba SQL Server real de las nuevas operaciones ni un conflicto concurrente porque la variable de conexión no estaba disponible.

El estado real no permite afirmar que todo el producto SRS esté completado. Permanecen como dependencias o decisiones externas la asignación operativa desde Reservations/Donations, el envío de Notifications, el catálogo inicial de categorías, los contratos ampliados de frontend, búsqueda geográfica, paginación, detalle y reportes. Dentro del alcance de Carlos, el commit `8734f8e` entrega la base funcional de HU-01 y deja explícitos los límites para revisión técnica y coordinación del PR.
