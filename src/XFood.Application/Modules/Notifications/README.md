# Notifications / Notificaciones

Lugar de contratos de bandeja, outbox, avisos y alertas de vencimiento. El futuro trabajador en `XFood.Infrastructure` procesará mensajes persistidos después del commit, con reintentos y deduplicación. Ningún proveedor externo decidirá el estado de una operación.
