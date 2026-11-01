# Listings / Publicaciones

Dueño de lotes, disponibilidad, búsqueda y asignación atómica de unidades. `IListingInventoryService` es el contrato público para que Reservas y Donaciones soliciten asignación o reintegro dentro de la misma transacción. Sus reglas deben impedir sobreasignación, incluso con solicitudes concurrentes.

La implementación operativa queda pendiente de que Reservations y Donations aporten sus casos de uso persistentes y de una unidad de trabajo compartida que permita registrar la operación externa y el movimiento de inventario de forma atómica. No se usa `StockAdjustment` para asignaciones o liberaciones: sus tipos existentes representan aumentos y pérdidas, no operaciones reservadas. Hasta completar esa integración, ningún módulo externo debe escribir directamente `Listing`, `StockAdjustment` o `StockTransfer`.
