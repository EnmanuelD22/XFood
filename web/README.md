# XFood · Panel HU-01

Panel de publicaciones para establecimientos. La interfaz carga sesión, perfil, publicaciones propias y categorías desde la API; no contiene datos de ejemplo ni fabrica la lista propia con la búsqueda pública.

## Iniciar

```bash
cp .env.example .env.local
npm install
npm run dev
```

Abre `http://localhost:3000`. Para que la cookie `Secure` funcione en todos los navegadores, usa HTTPS en desarrollo y una URL de API con certificado de confianza. No desactives la validación TLS.

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
