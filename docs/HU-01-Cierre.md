# Cierre técnico de HU-01

## Alcance

HU-01 cubre el backend de establecimientos y publicaciones bajo responsabilidad de Carlos. La implementación conserva la separación por capas y reutiliza `IEstablishmentOnboarding` de HU-04 para resolver membresías y autorización. El catálogo inicial se añadió después por decisión de Producto. Los filtros geográficos, la paginación, el detalle público y los procesos de otros módulos siguen fuera de este cambio.

## Funcionalidades implementadas

- Perfil de establecimiento: `GET /api/v1/establishments/{establishmentId}` y `PUT /api/v1/establishments/{establishmentId}`.
- Publicaciones activas: `GET /api/v1/listings`, con fecha opcional `asOfUtc` obligatoriamente UTC.
- Publicaciones propias: `GET /api/v1/establishments/{establishmentId}/listings`, autenticada y con comprobación de membresía, devuelve todas las modalidades y estados persistidos del establecimiento.
- Categorías activas: `GET /api/v1/categories`, devuelve identificador y nombre de las categorías activas. La migración `20261101212804_SeedInitialCategories` aporta seis valores iniciales aprobados para arrancar el piloto.
- Creación de Sale: `POST /api/v1/listings`.
- Creación de Donation: `POST /api/v1/listings/donations`.
- Edición y desactivación: `PATCH /api/v1/listings/{listingId}` y `POST /api/v1/listings/{listingId}/deactivate`.
- Cambios de aptitud: `POST /api/v1/listings/{listingId}/fitness`.
- Ajustes y transferencias de inventario: `POST /api/v1/listings/{listingId}/stock-adjustments` y `POST /api/v1/listings/{listingId}/stock-transfers`.
- Cuenta y establecimientos disponibles: `GET /api/v1/me`; la respuesta incluye `Establishments` con `Id`, `Name`, `Status`, `MemberRole` e `IsPrimary`. No se añadió una ruta duplicada.
- Historial de estados, ajustes, transferencias y aptitud con actor, motivo y fecha UTC. Las ediciones de perfil y publicación guardan actor, fecha UTC y valores anteriores/posteriores en revisiones persistentes.
- Detección y persistencia deduplicada de alertas de vencimiento mediante `IListingExpiryAlertService`.

## Autorización

Las operaciones privadas requieren la política de establecimiento y vuelven a verificar dentro del caso de uso el identificador del usuario autenticado, la membresía no revocada, el establecimiento concreto solicitado y `EstablishmentStatus.Active`. No se acepta un establecimiento arbitrario ni se elige silenciosamente el primero. Los usuarios Consumer no acceden a operaciones privadas; una membresía revocada o un establecimiento Inactive/Suspended no puede operar.

## Inventario y concurrencia

Listings es el único propietario de las cantidades. El balance se mantiene mediante restricciones SQL y las mutaciones usan transacciones, `RowVersion` y auditoría. `IListingInventoryService` es únicamente el contrato público para Reservations y Donations; no se registra una implementación ficticia ni se permite escritura directa en tablas de Listings.

## Categorías

`Category` existe y las publicaciones validan que la categoría exista y esté activa. `GET /api/v1/categories` permite consultar las activas, ordenadas por nombre. La migración `SeedInitialCategories` agrega, con identificadores estables: Comidas preparadas; Panadería y repostería; Frutas y verduras; Lácteos y huevos; Carnes y pescados; Alimentos envasados. Se pueden desactivar sin cambiar publicaciones históricas. El equipo deberá revisar este catálogo con usuarios del piloto antes de ampliarlo.

## Alertas y Notifications

La detección guarda una alerta por publicación y umbral, usa fecha UTC y evita duplicados mediante la restricción persistente. El modelo de Notifications contiene entidades relacionadas, outbox y restricciones, pero no existe en el alcance actual un caso de uso/despachador operativo que determine destinatarios y envío para RF-14. Por tanto, detección y persistencia están implementadas; generación de notificación y entrega al usuario quedan como dependencia de Notifications. No se creó un trabajador paralelo.

## Integraciones externas

Reservations y Donations no aportan todavía casos de uso persistentes, ledger/operación externa ni unidad de trabajo compartida suficiente para implementar asignación/liberación idempotente de forma segura. La integración operativa queda pendiente de esos módulos. Deben consumir `IListingInventoryService`, aportar `OperationId` idempotente y guardar su operación en la misma transacción que el movimiento de stock, conforme a la arquitectura.

## Clasificación

### COMPLETADO

Perfil, publicaciones Sale y Donation, consulta activa, edición, desactivación, aptitud, ajustes, transferencias, validaciones de modalidad/precio/currency/UTC, autorización por establecimiento, balance de inventario, `RowVersion`, auditoría de ediciones y transiciones, contrato público de inventario, detección/persistencia deduplicada de alertas y documentación OpenAPI generada desde las rutas implementadas.

### PENDIENTE DE CARLOS

No se identifica un requisito obligatorio de HU-01 con implementación local claramente definida que falte sin inventar decisiones externas. La validación final de la rama debe ejecutarse antes de la revisión.

### PENDIENTE DE APROBACIÓN

Juan Eliud debe confirmar para el frontend el uso de `/me`, los DTO finales, rutas de perfil, formato de fechas y errores. El catálogo inicial ya tiene seis valores y consulta pública; ampliaciones y orden de presentación para el piloto se coordinan con Producto.

### DEPENDENCIA EXTERNA

Wilmer/HU-04 mantiene identidad, roles y ciclo de membresías. Reservations debe implementar sus operaciones de reserva y consumir asignación/liberación. Donations debe implementar aceptación, recepción, cancelación y vencimiento según reglas aprobadas. Notifications debe definir eventos, destinatarios, creación de bandeja/outbox y envío de alertas RF-14.

### FUERA DEL ALCANCE

Búsqueda geográfica por distancia, paginación, filtros no aprobados, detalle individual no implementado, reservas/aceptaciones operativas, envío push y procesos de otros módulos.

## Migración y validación de entrega

`20261101171937_AuditHu01Edits` agrega únicamente `establishments.EstablishmentProfileRevisions` y `listings.ListingRevisions`, con actor referenciado a `identity.Users`, fecha UTC, referencias al recurso, índices y JSON válido. Su script ascendente solo crea tablas, claves, índices y restricciones; no altera las migraciones previas ni elimina datos. El snapshot coincide con el modelo EF Core.

`20261101212804_SeedInitialCategories` inserta seis categorías con GUID fijos y fecha UTC; no altera tablas ni elimina datos en su avance. Su reversión intenta borrar esas filas y la clave foránea impide borrar una categoría que ya tenga publicaciones.

La restauración y compilación terminaron sin errores. Con la instancia predeterminada local `MSSQLSERVER` y las pruebas SQL obligatorias se ejecutaron **142 pruebas de API y 24 de arquitectura: 166 correctas, cero fallidas y cero omitidas**. Las pruebas nuevas verificaron lectura propia, categorías activas, autorización y el recorrido web de creación y desactivación, además de auditoría, conflicto de última unidad y transferencia atómica. La fixture aplicó todas las migraciones, incluida `SeedInitialCategories`, en bases aisladas `XFood_Tests_<guid>` y las eliminó al finalizar. Comando usado:

```powershell
$env:XFOOD_TEST_SQLSERVER='Server=localhost;Integrated Security=True;Encrypt=True;TrustServerCertificate=True'
$env:XFOOD_REQUIRE_SQL_TESTS='true'
dotnet test XFood.slnx --no-build --no-restore -m:1 --nologo
```

La base de pruebas se crea y elimina por la fixture; no usar `XFoodDB`. RF-14 completo de extremo a extremo y las operaciones de Reservations/Donations no deben declararse terminadas hasta que sus módulos entreguen los contratos operativos indicados. La migración no se aplicó a `XFoodDB` durante esta revisión.
