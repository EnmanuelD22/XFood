# Cierre técnico de HU-01

## Alcance

HU-01 cubre el backend de establecimientos y publicaciones bajo responsabilidad de Carlos. La implementación conserva la separación por capas y reutiliza `IEstablishmentOnboarding` de HU-04 para resolver membresías y autorización. No se han añadido semillas, categorías inventadas, filtros geográficos, paginación, detalle individual ni procesos ficticios de otros módulos.

## Funcionalidades implementadas

- Perfil de establecimiento: `GET /api/v1/establishments/{establishmentId}` y `PUT /api/v1/establishments/{establishmentId}`.
- Publicaciones activas: `GET /api/v1/listings`, con fecha opcional `asOfUtc` obligatoriamente UTC.
- Creación de Sale: `POST /api/v1/listings`.
- Creación de Donation: `POST /api/v1/listings/donations`.
- Edición y desactivación: `PATCH /api/v1/listings/{listingId}` y `POST /api/v1/listings/{listingId}/deactivate`.
- Cambios de aptitud: `POST /api/v1/listings/{listingId}/fitness`.
- Ajustes y transferencias de inventario: `POST /api/v1/listings/{listingId}/stock-adjustments` y `POST /api/v1/listings/{listingId}/stock-transfers`.
- Cuenta y establecimientos disponibles: `GET /api/v1/me`; la respuesta incluye `Establishments` con `Id`, `Name`, `Status`, `MemberRole` e `IsPrimary`. No se añadió una ruta duplicada.
- Historial de estados, ajustes, transferencias, aptitud y auditoría con actor, motivo y fecha UTC.
- Detección y persistencia deduplicada de alertas de vencimiento mediante `IListingExpiryAlertService`.

## Autorización

Las operaciones privadas requieren la política de establecimiento y vuelven a verificar dentro del caso de uso el identificador del usuario autenticado, la membresía no revocada, el establecimiento concreto solicitado y `EstablishmentStatus.Active`. No se acepta un establecimiento arbitrario ni se elige silenciosamente el primero. Los usuarios Consumer no acceden a operaciones privadas; una membresía revocada o un establecimiento Inactive/Suspended no puede operar.

## Inventario y concurrencia

Listings es el único propietario de las cantidades. El balance se mantiene mediante restricciones SQL y las mutaciones usan transacciones, `RowVersion` y auditoría. `IListingInventoryService` es únicamente el contrato público para Reservations y Donations; no se registra una implementación ficticia ni se permite escritura directa en tablas de Listings.

## Categorías

`Category` existe y las publicaciones validan que la categoría exista y esté activa según el modelo disponible. No existe un endpoint de catálogo activo ni datos iniciales porque no están definidos un catálogo, identificadores, orden ni aprobación de producto. Producto debe proporcionar y aprobar esos valores; Juan Eliud debe confirmar el contrato que consumirá el frontend.

## Alertas y Notifications

La detección guarda una alerta por publicación y umbral, usa fecha UTC y evita duplicados mediante la restricción persistente. El modelo de Notifications contiene entidades relacionadas, outbox y restricciones, pero no existe en el alcance actual un caso de uso/despachador operativo que determine destinatarios y envío para RF-14. Por tanto, detección y persistencia están implementadas; generación de notificación y entrega al usuario quedan como dependencia de Notifications. No se creó un trabajador paralelo.

## Integraciones externas

Reservations y Donations no aportan todavía casos de uso persistentes, ledger/operación externa ni unidad de trabajo compartida suficiente para implementar asignación/liberación idempotente de forma segura. La integración operativa queda pendiente de esos módulos. Deben consumir `IListingInventoryService`, aportar `OperationId` idempotente y guardar su operación en la misma transacción que el movimiento de stock, conforme a la arquitectura.

## Clasificación

### COMPLETADO

Perfil, publicaciones Sale y Donation, consulta activa, edición, desactivación, aptitud, ajustes, transferencias, validaciones de modalidad/precio/currency/UTC, autorización por establecimiento, balance de inventario, `RowVersion`, auditoría, contrato público de inventario, detección/persistencia deduplicada de alertas y documentación OpenAPI generada desde las rutas implementadas.

### PENDIENTE DE CARLOS

No se identifica un requisito obligatorio de HU-01 con implementación local claramente definida que falte sin inventar decisiones externas. La validación final de la rama debe ejecutarse antes de la revisión.

### PENDIENTE DE APROBACIÓN

Producto debe aprobar el catálogo inicial de categorías, sus identificadores, nombres, orden y ciclo de activación. Juan Eliud debe confirmar para el frontend el uso de `/me`, los DTO finales, rutas de perfil, formato de fechas, errores, filtros permitidos y si se requiere una consulta de categorías. No se han marcado esas decisiones como resueltas.

### DEPENDENCIA EXTERNA

Wilmer/HU-04 mantiene identidad, roles y ciclo de membresías. Reservations debe implementar sus operaciones de reserva y consumir asignación/liberación. Donations debe implementar aceptación, recepción, cancelación y vencimiento según reglas aprobadas. Notifications debe definir eventos, destinatarios, creación de bandeja/outbox y envío de alertas RF-14.

### FUERA DEL ALCANCE

Búsqueda geográfica por distancia, paginación, filtros no aprobados, detalle individual no implementado, semillas de categorías, reservas/aceptaciones operativas, envío push y procesos de otros módulos.

## Validación de entrega

La validación debe usar SQL Server aislado mediante `SqlServerApiFixture`; nunca `XFoodDB`. Ejecutar restore, build, pruebas unitarias/API, pruebas de integración SQL Server, verificación de migraciones/snapshot, `git diff --check` y revisión de secretos/configuración local. No hacer commit ni push. La rama queda técnicamente preparada para revisión de HU-01 siempre que estas comprobaciones finales resulten correctas; RF-14 completo de extremo a extremo y las operaciones de Reservations/Donations no deben declararse terminadas hasta que sus módulos entreguen los contratos operativos indicados.
