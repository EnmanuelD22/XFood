# Listings / Publicaciones

Dueño de lotes, disponibilidad, búsqueda y asignación atómica de unidades. `IListingInventoryService` es el contrato público para que Reservas y Donaciones soliciten asignación o reintegro dentro de la misma transacción. Sus reglas deben impedir sobreasignación, incluso con solicitudes concurrentes.

La implementación operativa queda pendiente de que Reservations y Donations aporten sus casos de uso persistentes y de una unidad de trabajo compartida que permita registrar la operación externa y el movimiento de inventario de forma atómica. No se usa `StockAdjustment` para asignaciones o liberaciones: sus tipos existentes representan aumentos y pérdidas, no operaciones reservadas. Hasta completar esa integración, ningún módulo externo debe escribir directamente `Listing`, `StockAdjustment` o `StockTransfer`.

La búsqueda pública de ventas (HU-02) es `IListingSearchService`: lista y detalle comparten las reglas de disponibilidad (venta activa, apta, con unidades, fecha límite posterior al reloj del servidor y establecimiento habilitado) y calculan la distancia en el servidor. Los datos del establecimiento se leen mediante la proyección pública de solo lectura `PublicEstablishmentQueries` del módulo Establishments. Contrato y decisiones en `docs/HU-02-Cierre.md`.
