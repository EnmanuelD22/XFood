# XFood · Aplicación web

Aplicación Next.js única del proyecto: portada pública, registro e inicio de sesión (HU-04), panel del establecimiento (HU-01) y búsqueda pública de ofertas (HU-02). Todos los datos vienen de la API; la interfaz no contiene datos de ejemplo.

## Iniciar

```bash
cp .env.example .env.local
npm ci
npm run dev -- --experimental-https
```

Usa Node.js 24 o posterior y abre `https://localhost:3000`. La cookie de sesión de la API es `Secure`, así que el flujo con sesión necesita HTTPS en desarrollo y una URL de API con certificado de confianza. Sin HTTPS, el login muestra un aviso que lo explica.

**En Windows**, arranca el frontend así para que Node confíe en el certificado de desarrollo de la API:

```bash
NODE_USE_SYSTEM_CA=1 npm run dev -- --experimental-https
```

El certificado de `dotnet dev-certs https --trust` queda en el almacén de certificados de Windows, pero Node usa por defecto su propia lista de autoridades y no lo ve: el proxy `/api/v1` falla al conectar con la API aunque el navegador la abra sin avisos. `NODE_USE_SYSTEM_CA=1` hace que Node use también el almacén del sistema. Esa sintaxis es la de Git Bash; en PowerShell usa `$env:NODE_USE_SYSTEM_CA=1; npm run dev -- --experimental-https`.

No desactives la validación TLS (`NODE_TLS_REJECT_UNAUTHORIZED=0`). Si la CA de la API no está en el almacén del sistema, configura `NODE_EXTRA_CA_CERTS` con su archivo público antes de iniciar Next.js.

## Configuración

- `XFOOD_API_BASE_URL`: URL de la API terminada en `/api/v1`, por ejemplo `https://localhost:7293/api/v1`.
- `NEXT_PUBLIC_XFOOD_MY_LISTINGS_PATH`: publicaciones propias bajo `/api/v1`. Contrato actual: `establishments/{establishmentId}/listings`.
- `NEXT_PUBLIC_XFOOD_CATEGORIES_PATH`: catálogo bajo `/api/v1`. Contrato actual: `categories`.
- `NEXT_PUBLIC_XFOOD_MAP_TILE_URL` y `NEXT_PUBLIC_XFOOD_MAP_ATTRIBUTION`: servidor de teselas y su atribución. Vacías usan OpenStreetMap (`tile.openstreetmap.org`); antes del piloto el equipo debe confirmar el proveedor y cumplir su política de uso.

El Route Handler `app/api/v1/[...path]/route.ts` reenvía la cookie HttpOnly y el origen del navegador a la API y replica `Set-Cookie`. El navegador nunca lee la cookie. El origen del panel (`https://localhost:3000` en desarrollo) debe estar en `Cors:PanelOrigins` de la API; ya está incluido en `appsettings.Development.json`.

## Pantallas

| Ruta | Acceso | Contenido |
| --- | --- | --- |
| `/` | Pública | Portada: propuesta, cómo funciona, categorías, sección para negocios e impacto |
| `/login` | Pública | Inicio de sesión; acepta `?next=` y avisos de registro o cierre de sesión |
| `/registro` | Pública | Registro como consumidor, establecimiento u organización; `?rol=establecimiento` preselecciona el rol |
| `/buscar` | Pública | Búsqueda de ofertas cercanas con mapa, lista y detalle (HU-02) |
| `/panel` | Establecimiento | Mis publicaciones: crear, editar, desactivar y comprobar en la búsqueda (HU-01) |
| `/panel/categorias` | Establecimiento | Catálogo aprobado con sus ilustraciones |
| `/panel/configuracion` | Establecimiento | Perfil del establecimiento (contacto, dirección, ubicación) y cuenta |
| `/organizacion` | Organización | Estado de verificación de la organización |
| `/acceso-denegado` | — | Mensaje para roles sin pantalla web (por ejemplo, administrador) |

## Sesión y roles

- `features/auth/SessionProvider.tsx` consulta `GET /me` al cargar y es la única fuente del estado de sesión.
- **Login.** `POST /auth/login` y, a continuación, `GET /me`. El rol que devuelve `/me` decide el destino: establecimiento → `/panel`, consumidor → `/buscar`, organización → `/organizacion`, otros → `/acceso-denegado`. `?next=` solo se respeta si es una ruta interna que ese rol puede abrir. Si `/me` responde 401 justo después de un login correcto, el navegador no guardó la cookie (normalmente por usar HTTP) y se explica así.
- **Errores de login.** `INVALID_CREDENTIALS` (incluye el bloqueo tras cinco intentos), `ACCOUNT_SUSPENDED`, rechazo de origen (CSRF) y API no disponible tienen mensajes propios. La recuperación de contraseña no se muestra hasta que la API la ofrezca.
- **Registro.** `POST /auth/register` con el bloque `establishment` (nombre, teléfono, dirección, latitud y longitud elegidas en el mapa) u `organization` según el rol. No abre sesión: lleva a `/login?registro=ok`. Los errores del servidor conservan las claves de la API (`email`, `establishment.name`, …) y se muestran junto a su campo.
- **Cierre de sesión.** `POST /auth/logout` desde la barra lateral, la cabecera pública o Configuración, y luego `/login?sesion=cerrada`. La API cierra todas las sesiones de la cuenta, también en otros navegadores.
- **Protección de rutas.** `RequireRole` envía a las personas sin sesión a `/login?next=…` y muestra un mensaje a otros roles. Solo mejora la navegación: la autorización real la hace la API en cada petición.

## Estructura

```
app/                  Rutas (páginas delgadas que montan una funcionalidad)
components/ui/        Botones, campos, diálogo, avisos, menú, estados, precio, marca e íconos SVG
components/layout/    Cabecera pública, menú móvil, pie y estados de página completa
components/brand/     Ilustraciones originales de marca
features/auth/        Sesión, login, registro, protección por rol
features/listings/    Panel de publicaciones (HU-01)
features/search/      Búsqueda pública (HU-02)
features/categories/  Imágenes ilustrativas y catálogo
features/settings/    Perfil del establecimiento
features/panel/       Estructura y barra lateral del panel
features/location/    Selector de ubicación en mapa (registro y configuración)
lib/                  Cliente HTTP, formatos y configuración del mapa
public/images/categories/  Ilustraciones SVG por categoría
```

## Sistema de diseño

- **Variables** en `app/globals.css`: colores de marca (verde `#214a31`, verde oscuro `#103625`, lima `#c7ea67`, salvia `#e2ebcb`, fondo crema `#f8f8f3`), colores de estado con contraste AA, escala tipográfica, espaciado de 4 px, radios, sombras y duraciones de animación. Los componentes no fijan colores propios.
- **Tipografía** Plus Jakarta Sans (licencia SIL OFL), autoalojada con `next/font`; el navegador no hace peticiones a Google.
- **Estilos** con CSS Modules por componente y CSS global solo para variables, base y utilidades (`.sr-only`, `.skip-link`). No se usa Tailwind.
- **Íconos** SVG propios en `components/ui/Icon.tsx`; son decorativos salvo que reciban `label`.
- **Animaciones** discretas (aparición de tarjetas y diálogos, elevación al pasar el cursor). Con `prefers-reduced-motion: reduce` se desactivan todas desde `globals.css`.

## Imágenes por categoría

- Siete ilustraciones SVG originales del proyecto en `public/images/categories/`: una por cada categoría aprobada y `sin-imagen.svg` como marcador neutro. No dependen de licencias de terceros.
- `features/categories/category-images.ts` centraliza la correspondencia con los identificadores sembrados por `SeedInitialCategories` (y, como respaldo, con los nombres aprobados). Una categoría nueva usa el marcador neutro hasta que se le asigne una ilustración. El formulario sigue enviando los identificadores que entrega la API.
- `CategoryImage` reserva un espacio 16:10 con `width` y `height`, carga diferida salvo en la primera fila, y muestra la leyenda visible «Imagen ilustrativa de la categoría». Nunca se presenta como fotografía del lote.

## Contrato utilizado

| Función | Endpoint |
| --- | --- |
| Registro, login, logout, cuenta | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me` |
| Perfil y zona horaria del establecimiento | `GET /establishments/{id}`, `PUT /establishments/{id}` |
| Publicaciones propias | `GET /establishments/{id}/listings` |
| Crear, editar y desactivar ventas | `POST /listings`, `PATCH /listings/{id}`, `POST /listings/{id}/deactivate` |
| Categorías activas | `GET /categories` (requiere la migración inicial de categorías) |
| Búsqueda pública | `GET /listings/search-options`, `GET /listings`, `GET /listings/{id}` |

La interfaz no ofrece agotar manualmente ni cambiar de modalidad: no forman parte del contrato aprobado. Desactivar exige un motivo.

## Panel de publicaciones (HU-01)

Las publicaciones y categorías se cargan al abrir el panel o al elegir otro establecimiento; tras crear, editar o desactivar, la lista se refresca. El buscador filtra por nombre, categoría o descripción, y el filtro de estado por Activa, Agotada, Desactivada o Vencida. Los indicadores no cuentan lotes vencidos, desactivados o no aptos. «Comprobar en búsqueda pública» recorre `GET /listings` desde la ubicación del establecimiento con el radio por defecto y las cabeceras de paginación. El panel descarta respuestas de un establecimiento anterior y bloquea el cambio mientras guarda.

## Búsqueda de ofertas (HU-02)

- **Ubicación.** Se pide permiso de ubicación; si se deniega, se elige un punto en el mapa (también con las flechas del teclado y «Buscar desde el centro del mapa»). No hay búsqueda por dirección escrita.
- **Radio y resultados.** Los radios vienen de `GET /listings/search-options`. Mapa y lista usan la misma respuesta de `GET /listings`; «Cargar más ofertas» sigue `X-Has-Next-Page` y descarta ids repetidos. Cambiar punto o radio cancela las peticiones anteriores, y una respuesta GPS tardía no reemplaza una selección manual.
- **Detalle.** `GET /listings/{id}` confirma la disponibilidad antes de mostrar precio y stock; un 404 se informa y se vuelve a buscar. La reserva en línea no forma parte de esta historia.

## Accesibilidad

HTML semántico con puntos de referencia, encabezados ordenados y enlace «Ir al contenido» en cada pantalla. Todos los campos tienen etiqueta, y los errores se asocian con `aria-describedby` y llevan el foco al primer campo inválido. Los diálogos son nativos (contienen y devuelven el foco, se cierran con Escape) y el menú «…» sigue el patrón de botón de menú. Los objetivos táctiles miden al menos 44 px y no hay desplazamiento horizontal a 390 px. Las pruebas pasan axe (WCAG 2.1 A/AA) por todas las pantallas.

## Verificaciones

```bash
npm run lint
npm run build
npm run test:unit
npx playwright install chromium
npm run test:e2e
```

Las pruebas de navegador levantan Next.js en el puerto 3100 y simulan la API solo dentro de las pruebas, con las teselas del mapa bloqueadas. Cubren login y redirección por rol, errores de acceso, registro de los tres roles, cierre de sesión, protección por rol, el CRUD del panel, el menú con teclado, las imágenes, Configuración, Categorías, la búsqueda (ubicación, radio, detalle, paginación, errores), la portada, móvil, movimiento reducido y axe. No sustituyen el recorrido contra la API real descrito abajo.

## Recorrido manual con la API real

Requiere la API en `https://localhost:7293` con todas las migraciones aplicadas (ver el README de la raíz) y la web en `https://localhost:3000`.

1. **Registro.** En `/registro` elige *Establecimiento*, completa tus datos y los del negocio, marca la ubicación en el mapa y pulsa *Crear cuenta*. Debes llegar a `/login` con el aviso «Cuenta creada».
2. **Login.** Entra con ese correo y contraseña: debes llegar a `/panel`, con el nombre del establecimiento arriba y en la barra lateral.
3. **Crear.** Pulsa *Publicar excedente*, completa título, descripción, categoría, cantidad, precios (el rebajado menor que el original), una recogida futura y la declaración de aptitud, y guarda. La tarjeta aparece como *Activa*, con la ilustración de su categoría, y los indicadores suben.
4. **Leer.** Usa el buscador y el filtro de estado; recarga la página y comprueba que la publicación sigue ahí.
5. **Comprobar en la búsqueda.** En el menú «…» de la tarjeta elige *Comprobar en búsqueda pública*. Después abre `/buscar`, elige en el mapa un punto cerca del establecimiento y verifica que la oferta aparece en el mapa y en la lista, y que el detalle muestra precio, unidades y horario.
6. **Editar.** Vuelve a `/panel`, pulsa *Editar*, cambia el título o el precio y guarda: la tarjeta se actualiza.
7. **Desactivar.** En «…» elige *Desactivar*, escribe un motivo y confirma: la tarjeta pasa a *Desactivada* y la oferta deja de aparecer en `/buscar`.
8. **Configuración.** En `/panel/configuracion` cambia el teléfono o la ubicación y guarda; recarga para confirmar.
9. **Paginación y ubicación manual.** En `/buscar`, deniega el permiso de ubicación y elige el punto en el mapa; con más ofertas que el tamaño de página, usa *Cargar más ofertas*.
10. **Cierre de sesión y roles.** Cierra sesión desde la barra lateral: debes llegar a `/login?sesion=cerrada`, y `/panel` debe volver a pedir el login. Registra un consumidor y comprueba que el login lo lleva a `/buscar` y que `/panel` muestra «No tienes acceso a esta sección».
11. **Móvil y teclado.** Repite los pasos 3 y 7 con el navegador a 390 px de ancho y luego solo con el teclado (Tab, Enter, flechas en el menú, Escape en diálogos y menú).


## Ejecución integrada revisada

La versión revisada conserva el diseño de esta rama y añade correcciones de sesión y ubicación. Desde la raíz, `./scripts/Start-XFood.ps1` inicia API y web con HTTPS local en `https://localhost:3002/`. No aplica migraciones automáticamente. Las instrucciones, rutas y resultados están en [la guía de revisión](../docs/Revision-frontend-integracion.md).
