# Revisión e integración local del frontend

## Fuente y diseño

Se revisó la entrega de `origin/feature/frontend-integracion`, commit `7bcdd1c`, sobre el backend modular existente. Se conserva su diseño: inicio público, tipografía, componentes, distribución, CSS Modules, ilustraciones por categoría, navegación móvil y pantallas de autenticación, búsqueda y panel. No se incorpora la segunda aplicación de `entrega/hu-02-frontend` ni los artefactos `.next` de otras ramas.

La copia de integración anterior se conserva por separado. Esta revisión toma como base la solución del compañero y añade únicamente correcciones de comportamiento, pruebas y herramientas locales de ejecución.

## Correcciones

- Una respuesta 401 en una operación protegida invalida el estado de sesión y permite que los guards redirijan al login. Las credenciales incorrectas del formulario no disparan esa invalidación global.
- La confirmación de sesión usa cancelación; una respuesta tardía de `/me` no puede volver a autenticar visualmente al usuario después de cerrar sesión.
- La ruta `next` se interpreta y normaliza antes de comprobar el rol. Se rechazan caracteres de control, rutas de red y separadores codificados que cambien el destino. Las rutas normalizadas del panel mantienen su restricción de rol.
- Un GPS pendiente no sobrescribe el punto que el usuario eligió manualmente para un establecimiento. La consulta se invalida al desmontar o deshabilitar el selector; la acción de usar el centro espera a que el mapa esté preparado.
- El perfil descarta respuestas de una selección anterior. El registro comprueba que las coordenadas sean finitas y estén dentro de sus rangos.
- Escape en la navegación móvil devuelve el foco al botón que la abrió.

La API sigue autorizando cada operación por rol y membresía. No se cambian entidades, DbContext, migraciones ni casos de uso del backend. Desactivar conserva el historial; no se implementan borrado físico, reservas o entregas desde estas pantallas.

## Ejecutar esta copia

Requisitos: .NET 10, Node.js 24 o posterior, SQL Server y PowerShell 7 en Windows. Desde la raíz:

```powershell
dotnet dev-certs https --trust
.\scripts\Start-XFood.ps1
```

El script compila e inicia API y web con HTTPS local validado. Puede usarse `-SkipBuild` si ya se compilaron los cambios.

| Dirección | Función |
| --- | --- |
| `https://localhost:3002/` | Inicio público del nuevo diseño. |
| `https://localhost:3002/registro` | Registro C/E/O, sin inicio automático de sesión. |
| `https://localhost:3002/login` | Acceso con cookie real de Identity. |
| `https://localhost:3002/panel` | CRUD de publicaciones propias del establecimiento. |
| `https://localhost:3002/panel/configuracion` | Consulta y actualización del perfil autorizado. |
| `https://localhost:3002/panel/categorias` | Catálogo de lectura, administrado por el equipo. |
| `https://localhost:3002/buscar` | Búsqueda pública, radio, páginas, mapa y detalle. |
| `https://localhost:3002/organizacion` | Estado real de verificación y funciones disponibles. |
| `https://localhost:7294/api/v1` | API común. |

Para detener únicamente los procesos de esta copia:

```powershell
.\scripts\Stop-XFood.ps1
```

La conexión se resuelve desde `ConnectionStrings__XFood`, `.local/settings.json` o los User Secrets de la API, en ese orden. Se proporciona `scripts/local-settings.example.json` sin credenciales. Los certificados, claves, configuración personal, logs y estado de procesos quedan ignorados dentro de `.local/`. El arranque no aplica migraciones ni carga datos de demostración.

Para la ejecución local revisada se reutiliza `XFood_Integracion_Local`, preparada anteriormente con las cuatro migraciones y el catálogo. Se conservan sus cuentas y publicaciones. No se han aplicado cambios a `XFoodDB`.

## Verificaciones

- Restauración y compilación .NET: correctas, 0 errores y 0 advertencias.
- ESLint y compilación de Next.js: correctos.
- Backend: 196 pruebas de API y 24 de arquitectura correctas, ninguna omitida, incluidas las de SQL Server aislado.
- Web: 33 pruebas unitarias y 58 de navegador correctas. Incluyen las pruebas originales de diseño/accesibilidad y las regresiones añadidas de sesión y ubicación.
- Recorrido real con API, web compilada y SQL Server: correcto. Verifica registro, cookie Secure/HttpOnly/SameSite=Lax, login, edición y persistencia del perfil, catálogo, creación de venta, persistencia tras recargar, edición, búsqueda y detalle, desactivación con historial y logout. Durante ese recorrido no se detectaron errores de JavaScript ni de hidratación en el navegador.

Las pruebas de navegador normales usan respuestas controladas. El recorrido real escribe exclusivamente en una base nueva `XFood_WebTests_<guid>` y elimina esa base al finalizar; no simula las respuestas de la API. Las teselas externas se bloquean en las pruebas, por lo que aún debe validarse el proveedor y sus condiciones para el piloto.

```powershell
dotnet test XFood.slnx
cd web
npm ci
npm run lint
npm run build
npm run test:unit
npx playwright install chromium
npm run test:e2e
cd ..
# Con la ejecución local detenida y la solución compilada:
.\scripts\Run-WebCrudSmoke.ps1 -Server localhost
```

El recorrido real necesita `sqlcmd` y permiso para crear bases temporales. Comprueba el patrón del nombre antes de crear o eliminar su base y nunca apunta a una base personal. Las capturas y datos de prueba no se versionan.

La implementación queda local, sin crear commits, publicar ramas ni integrar cambios en el remoto.
