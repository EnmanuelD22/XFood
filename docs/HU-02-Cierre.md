# Cierre técnico de HU-02 (backend)

## Historia

Como consumidor, quiero encontrar y filtrar ofertas de alimentos cerca de mi ubicación para conocer opciones disponibles a precio reducido y sus condiciones de recogida. Este documento cubre solo el backend; el frontend web (React + Next.js) se entrega en `feature/hu-02-frontend`.

## Decisiones de producto registradas

`documentacion/` no se versiona, así que estas decisiones aprobadas por el Product Owner quedan aquí para que API y web sigan el mismo contrato. Amplían lo que el SRS y la arquitectura dejaban abierto:

- **Consumidor web.** La búsqueda de consumidores también se ofrece en la web compartida (React + Next.js). Se mantienen una sola API .NET y una sola base SQL Server.
- **Mapa.** Leaflet con datos de OpenStreetMap, solo en el frontend. El backend no depende de ningún proveedor de mapas ni de teselas. Antes del piloto, el equipo debe confirmar el servidor de teselas y cumplir su política: atribución visible, sin descarga anticipada y sin uso sin conexión.
- **Ubicación manual.** Si el usuario no concede o no logra dar su ubicación, elige **un punto en el mapa**. La dirección escrita y su geocodificación (Nominatim u otro proveedor) quedan **fuera** de esta historia: la API solo recibe coordenadas.
- **Radios.** 1, 3, 5 y 10 km, con 3 km por defecto, configurables en `Listings:Search`. El radio es la **distancia geográfica en línea recta** (gran círculo), no la distancia por calles.
- **Límite.** Como máximo 100 resultados, configurable y sin paginación.
- **Detalle.** Solo muestra ventas. Las donaciones conservan su vista separada para organizaciones verificadas (`/listings/donations`).
- **Reservas.** No forman parte de esta historia; el frontend no debe presentar una acción «Reservar» como operativa.
- **Privacidad.** El servidor no guarda la ubicación del consumidor. Las coordenadas viajan en la URL de una consulta GET; con el nivel de registro configurado (`Microsoft.AspNetCore: Warning`), ASP.NET no registra esas URL. No se deben activar registros de peticiones con la ruta completa sin una decisión de privacidad.

## Contrato de la API

Todas las rutas son públicas (no requieren sesión) y están documentadas en `/openapi/v1.json` (Development).

| Ruta | Descripción |
|---|---|
| `GET /api/v1/listings` | Búsqueda de ventas disponibles. Parámetros opcionales: `asOfUtc` (comportamiento anterior sin cambios), `latitude`, `longitude` y `radiusKm`. |
| `GET /api/v1/listings/{listingId}` | Detalle de una venta disponible. `latitude` y `longitude` opcionales para incluir `distanceKm`. Responde 404 si ya no está disponible. |
| `GET /api/v1/listings/search-options` | `{ radiiKm: [1,3,5,10], defaultRadiusKm: 3, maxResults: 100 }`, leído de la configuración. |

**Validación (400 `VALIDATION_ERROR`, con el campo en `errors`):**
- `latitude` y `longitude` van juntas.
- La latitud debe estar en el rango -90…90 y la longitud en -180…180.
- `radiusKm` solo se admite junto con un punto y debe ser uno de los radios configurados.
- Si se envía un punto sin radio, se usa el radio por defecto.
- Un valor no numérico se rechaza con 400.

**Orden de los resultados:**
- Sin punto: por fecha límite y luego por id, igual que antes.
- Con punto: por distancia, luego por fecha límite y luego por id.

**Respuesta.** Mantiene todos los campos que ya tenía `ListingResponse`, así que los clientes existentes no se rompen, y agrega:
- `categoryName`.
- `establishment`: `id`, `name`, `address`, `latitude`, `longitude` y `timeZoneId`.
- `distanceKm`: redondeada a 2 decimales y `null` cuando no se envía un punto.

No expone el correo, el teléfono ni el nombre de contacto del establecimiento, ni quién creó la publicación. El mapa y la lista deben usar la misma respuesta. `PickupStartsAtUtc` y `PickupDeadlineUtc` son UTC; se muestran en la zona `establishment.timeZoneId`.

## Reglas de disponibilidad

La lista y el detalle comparten la misma consulta. Una venta es visible solo si cumple todo esto:
- La modalidad es `Sale`.
- El estado es `Active`.
- `AvailableQuantity > 0`.
- El alimento es apto.
- `PickupDeadlineUtc` es posterior al **reloj del servidor**.
- El establecimiento está habilitado (`Active`).

**Sobre el reloj del servidor:**
- En la lista, `asOfUtc` solo puede adelantar la evaluación, nunca llevarla al pasado. Es la misma regla que existía en HU-01.
- El detalle usa siempre la hora del servidor.
- Una venta cuya fecha límite ya pasó deja de verse aunque su estado guardado todavía sea `Active`.
- No hay caché: cada consulta lee el estado vigente.

**Corrección para HU-01.** La consulta anterior no comprobaba el estado del establecimiento. El filtro de establecimiento habilitado se añadió también a `ActiveListingsQueryService`, de modo que `/listings/donations` deja de mostrar donaciones de establecimientos inactivos o suspendidos.

## Cálculo de distancia

No se usa NetTopologySuite; la arquitectura lo reserva para cuando el volumen lo justifique. El cálculo se hace en dos pasos:
1. En SQL, un rectángulo de latitud y longitud alrededor del punto reduce los candidatos. Usa el índice existente `IX_Establishments_Status_Latitude_Longitude`. Cerca de los polos o del antimeridiano, el rectángulo abarca todas las longitudes.
2. En el servidor, la fórmula de Haversine (radio terrestre medio de 6371,0088 km) decide el radio exacto, ordena los resultados y aplica el límite.

El cliente nunca decide la cercanía.

La unión entre Listings y Establishments usa `PublicEstablishmentQueries`, una proyección de solo lectura del módulo Establishments que contiene solo establecimientos habilitados y solo campos públicos. Ningún módulo modifica tablas ajenas.

## Configuración

```json
"Listings": { "Search": { "AllowedRadiiKm": [ 1, 3, 5, 10 ], "DefaultRadiusKm": 3, "MaxResults": 100 } }
```

La API no arranca si la lista está vacía, si tiene valores repetidos o no positivos, si el radio por defecto no está en la lista o si el límite no es positivo. OpenAPI publica los radios como `enum` y el radio por defecto como `default` de `radiusKm`, tomados de esta misma configuración.

## Migración

No se necesita. No cambia el esquema y el índice de coordenadas ya existía. `has-pending-model-changes` lo confirma: «No changes have been made to the model since the last migration».

## Pruebas

**Unitarias:**
- Haversine (distancias conocidas y simetría) y el rectángulo de búsqueda (contiene el círculo; casos de antimeridiano y polo).
- El validador y la búsqueda en memoria: radios, borde del radio, reglas de disponibilidad, orden, límite, datos públicos y distancia del detalle.
- El contrato HTTP: rutas públicas, enlace de parámetros, 404, ausencia de datos privados, compatibilidad de campos con `ListingResponse`, `search-options` desde la configuración, fallo de arranque con una configuración inválida y el documento OpenAPI.

**Integración con SQL Server** (`Hu02SqlServerTests`, en una base aislada `XFood_Tests_<guid>`):
- Para cada radio (1, 3, 5 y 10 km) y para el radio por defecto se usan establecimientos situados justo dentro y justo fuera de cada límite (por ejemplo, 2,95 y 3,05 km). Se comprueban los resultados exactos, su orden y su distancia, y que se excluyen los establecimientos suspendidos o inactivos.
- La lista y el detalle ocultan donaciones y ventas no aptas, agotadas, desactivadas, vencidas con estado `Active` o de un local suspendido. El detalle devuelve los datos reales del establecimiento y de la venta.
- **Recorrido HU-01 → HU-02:** una venta creada con `ICreateListingService` aparece dentro del radio. Desaparece de la lista y del detalle al agotarse (retiro de stock), al desactivarse, al pasar su fecha límite o al suspenderse el establecimiento.
- Las entradas inválidas devuelven 400 con el campo afectado.

**Resultado:** con `XFOOD_REQUIRE_SQL_TESTS=true` sobre `.\SQLEXPRESS` pasaron **182 pruebas de API y 24 de arquitectura: 206 correctas, ninguna fallida y ninguna omitida**. Son las 163 anteriores más 43 nuevas. Al terminar no quedó ninguna base `XFood_Tests_*`.

## Pendiente o fuera del alcance

- Pruebas de interfaz y evidencia visual del mapa, la lista, el detalle y la selección manual (frontend).
- Búsqueda por dirección escrita o geocodificación.
- Paginación.
- Filtros adicionales, como categoría o precio, si producto los aprueba.
- Reservas.
- Elección del servidor de teselas para el piloto.
- Actualizar el SRS y la arquitectura (no versionados) con las decisiones anteriores.
