# Listings / Publicaciones

Dueño de lotes, disponibilidad, búsqueda y asignación atómica de unidades. `IListingInventoryService` es el contrato público para que Reservas y Donaciones soliciten asignación o reintegro dentro de la misma transacción. Sus reglas deben impedir sobreasignación, incluso con solicitudes concurrentes.

La implementación operativa queda pendiente de que Reservations y Donations aporten sus casos de uso persistentes y de una unidad de trabajo compartida que permita registrar la operación externa y el movimiento de inventario de forma atómica. No se usa `StockAdjustment` para asignaciones o liberaciones: sus tipos existentes representan aumentos y pérdidas, no operaciones reservadas. Hasta completar esa integración, ningún módulo externo debe escribir directamente `Listing`, `StockAdjustment` o `StockTransfer`.

## Lecturas para HU-01 frontend

- `GET /api/v1/establishments/{establishmentId}/listings` requiere la cookie de sesión, rol `Establishment`, membresía activa y establecimiento `Active`. Devuelve `200` con un arreglo de `ListingResponse` de ese establecimiento, incluidas ventas y donaciones activas, agotadas, desactivadas y con fecha límite pasada; `401` sin sesión y `403` sin permiso. Si no hay publicaciones, devuelve `[]`. El estado es el persistido; para mostrar «vencida» en la interfaz también se compara `pickupDeadlineUtc` con la hora actual.
- `GET /api/v1/categories` es público y devuelve `200` con un arreglo de `{ id, name }` para categorías activas, ordenadas por nombre. La migración `SeedInitialCategories` incorpora seis categorías iniciales con identificadores estables: Comidas preparadas, Panadería y repostería, Frutas y verduras, Lácteos y huevos, Carnes y pescados y Alimentos envasados. No se exponen categorías inactivas.

`ListingResponse` usa las enumeraciones numéricas existentes: `mode` 1 venta/2 donación; `status` 1 activa/2 agotada/3 desactivada/4 vencida. La API conserva las comprobaciones de propiedad en cada mutación. No existe una acción directa «marcar agotada»: el estado resulta de un movimiento real que lleva el disponible a cero. La búsqueda geográfica y el detalle público corresponden a HU-02 backend.

## Búsqueda pública (HU-02)

La búsqueda pública de ventas (HU-02) es `IListingSearchService`: lista y detalle comparten las reglas de disponibilidad (venta activa, apta, con unidades, fecha límite posterior al reloj del servidor y establecimiento habilitado) y calculan la distancia en el servidor. Los datos del establecimiento se leen mediante la proyección pública de solo lectura `PublicEstablishmentQueries` del módulo Establishments. Contrato y decisiones en `docs/HU-02-Cierre.md`.
