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
| Mapa y experiencia completa de búsqueda de HU-02 | Se implementan en la rama frontend de HU-02; aquí solo se comprueba la visibilidad de la venta |

Para usar el panel, inicia la API y configura la sesión y la conexión local. Las publicaciones y categorías se cargan al abrir el panel o seleccionar otro establecimiento. Después de crear, editar o desactivar, el panel refresca la lista.


## Verificaciones

```bash
npm run lint
npm run build
npm run test:unit
npx playwright install chromium
npm run test:e2e
```

Las pruebas de navegador levantan Next.js en el puerto 3100 y simulan respuestas de API exclusivamente dentro de las pruebas. Cubren creación y edición con el contrato, errores de campo del servidor, desactivación con motivo, acceso sin sesión, filtros, teclado y movimiento reducido en móvil. No sustituyen el recorrido contra la API real con una cuenta de establecimiento y una base de datos de pruebas.

Las rutas de publicaciones y categorías tienen los valores del contrato como predeterminados; las variables de entorno permiten sustituirlos. El panel descarta consultas anteriores al cambiar de establecimiento y bloquea el cambio mientras guarda. No suma unidades vencidas, desactivadas o no aptas al indicador de unidades disponibles. Los formularios usan diálogos modales nativos para contener y devolver el foco.

La conexión HTTPS entre Next.js y .NET requiere que Node confíe en la CA del certificado de la API. Si tu entorno necesita una CA de desarrollo adicional, configura `NODE_EXTRA_CA_CERTS` con su archivo público antes de iniciar Next.js. Coordina también el origen HTTPS del panel con el backend; evita desactivar la validación TLS.
