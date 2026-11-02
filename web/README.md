# XFood · Panel HU-01

Panel de publicaciones para establecimientos. La interfaz carga sesión, perfil, publicaciones propias y categorías desde la API; no contiene datos de ejemplo ni fabrica la lista propia con la búsqueda pública.

## Iniciar

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Usa Node.js 24 o posterior. Abre `http://localhost:3000` para revisar estados sin sesión. Para el flujo autenticado, ejecuta `npm run dev -- --experimental-https` y abre `https://localhost:3000`. Para que la cookie `Secure` funcione en todos los navegadores, usa HTTPS en desarrollo y una URL de API con certificado de confianza. No desactives la validación TLS.

## Configuración

- `XFOOD_API_BASE_URL`: URL de la API que termina en `/api/v1`, por ejemplo `https://localhost:7293/api/v1`.
- `NEXT_PUBLIC_XFOOD_MY_LISTINGS_PATH`: ruta relativa bajo `/api/v1` de publicaciones propias. El contrato actual es `establishments/{establishmentId}/listings`.
- `NEXT_PUBLIC_XFOOD_CATEGORIES_PATH`: ruta relativa bajo `/api/v1` del catálogo. El contrato actual es `categories`.
- `NEXT_PUBLIC_XFOOD_MAP_TILE_URL` y `NEXT_PUBLIC_XFOOD_MAP_ATTRIBUTION`: servidor de teselas del mapa de búsqueda y su atribución. Vacías usan OpenStreetMap (`tile.openstreetmap.org`); antes del piloto el equipo debe confirmar el servidor y cumplir su política de uso.

El Route Handler `app/api/v1/[...path]/route.ts` reenvía la cookie HttpOnly y el origen del navegador a la API y replica `Set-Cookie` en la respuesta. Configura el origen HTTPS del panel en `Cors:PanelOrigins` o `Security:ApiOrigins` del backend. El navegador no lee ni guarda la cookie de sesión.

La interfaz no ofrece los botones de agotado o cambio de modalidad: no forman parte del contrato operativo aprobado. Desactivar sí llama al endpoint real y solicita un motivo.

## Disponibilidad del contrato

| Función | Estado |
| --- | --- |
| Sesión, rol y establecimientos | `GET /me` |
| Zona horaria | `GET /establishments/{id}` |
| Crear, editar y desactivar | Rutas de Listings implementadas en la API |
| Lista completa de publicaciones propias | `GET /establishments/{id}/listings` autenticada y autorizada |
| Categorías activas | `GET /categories`; requiere la migración inicial de categorías aplicada |
| Comprobar venta en búsqueda pública | Consulta `GET /listings/search-options` y recorre `GET /listings` con ubicación del establecimiento, radio configurado y cabeceras de paginación |
| Mapa y experiencia completa de búsqueda de HU-02 | Vista pública `/buscar` (ver «Búsqueda de ofertas (HU-02)») |

Para usar el panel, inicia la API y configura la sesión y la conexión local. Las publicaciones y categorías se cargan al abrir el panel o seleccionar otro establecimiento. Después de crear, editar o desactivar, el panel refresca la lista.


## Búsqueda de ofertas (HU-02)

La vista pública `http://localhost:3000/buscar` permite a un consumidor encontrar ventas disponibles cerca de su ubicación. No requiere sesión.

- **Ubicación.** Al abrir la vista se pide permiso de ubicación. Si se deniega o no está disponible, el consumidor elige un punto en el mapa; también puede cambiar el punto en cualquier momento con «Elegir en el mapa». No hay búsqueda por dirección escrita.
- **Radio.** Los valores y el radio por defecto se leen de `GET /listings/search-options`; la interfaz no los fija.
- **Mapa y lista.** Ambos usan la misma respuesta de `GET /listings` con `latitude`, `longitude`, `radiusKm`, `page` y `pageSize`. El servidor decide la distancia y la disponibilidad. «Cargar más ofertas» pide la página siguiente mientras `X-Has-Next-Page` sea `true` y descarta ids repetidos. Cada marcador agrupa las ofertas de un establecimiento; al seleccionarlo, la lista muestra solo esas ofertas.
- **Detalle.** Al abrir una oferta se consulta `GET /listings/{id}` para confirmar la disponibilidad. Si responde 404, se informa que ya no está disponible y se vuelve a buscar. Las fechas de recogida se muestran en la zona horaria del establecimiento.
- **Reservas.** No forman parte de esta historia: el detalle indica que la reserva en línea todavía no está disponible y no ofrece un botón para reservar.
- **Mapa.** Leaflet con teselas de OpenStreetMap y atribución visible. El mapa se carga solo en el navegador.

## Verificaciones

```bash
npm run lint
npm run build
npm run test:unit
npx playwright install chromium
npm run test:e2e
```

Las pruebas de navegador levantan Next.js en el puerto 3100 y simulan respuestas de API exclusivamente dentro de las pruebas. Cubren creación y edición con el contrato, errores de campo del servidor, desactivación con motivo, acceso sin sesión, filtros, teclado y movimiento reducido en móvil; en la búsqueda, ubicación concedida y denegada, cambio de radio, detalle, oferta no disponible, paginación y estados de error y vacío. Las teselas del mapa se bloquean dentro de las pruebas. No sustituyen el recorrido contra la API real con una cuenta de establecimiento y una base de datos de pruebas.

Las rutas de publicaciones y categorías tienen los valores del contrato como predeterminados; las variables de entorno permiten sustituirlos. El panel descarta consultas anteriores al cambiar de establecimiento y bloquea el cambio mientras guarda. No suma unidades vencidas, desactivadas o no aptas al indicador de unidades disponibles. Los formularios usan diálogos modales nativos para contener y devolver el foco.

La conexión HTTPS entre Next.js y .NET requiere que Node confíe en la CA del certificado de la API. Si tu entorno necesita una CA de desarrollo adicional, configura `NODE_EXTRA_CA_CERTS` con su archivo público antes de iniciar Next.js. Coordina también el origen HTTPS del panel con el backend; evita desactivar la validación TLS.


## Ajustes de revisión de HU-02

La selección manual también se puede confirmar con «Buscar desde el centro del mapa» después de moverlo con las flechas. Las longitudes elegidas se normalizan al intervalo geográfico válido. No se usa geocodificación por dirección.

Cambiar de punto o radio cancela las peticiones anteriores, incluida la página siguiente; una respuesta GPS tardía no reemplaza una selección manual. «Actualizar ofertas» vuelve a consultar disponibilidad. Si un id aparece en páginas distintas, se mantiene su posición y se actualiza con la respuesta más reciente. El detalle solo presenta precios y stock tras confirmar su consulta; una falla no convierte datos previos en disponibilidad confirmada.

La paginación sigue disponible al enfocar un establecimiento para poder cargar sus ofertas restantes. Los marcadores cuentan únicamente las ofertas cargadas, no un total global. El mapa evita animaciones de zoom y desplazamiento; los componentes compartidos mantienen la preferencia de movimiento reducido.

Antes del piloto, el equipo debe confirmar el proveedor de teselas y sus condiciones. Las pruebas de navegador bloquean las teselas externas y usan respuestas controladas; no demuestran la disponibilidad del proveedor ni una integración completa con datos reales de HU-01.
