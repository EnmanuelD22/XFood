# CI/CD de XFood

## Alcance y topología

La automatización usa GitHub Actions y prepara Linux **x86-64** con Docker Engine y Docker Compose v2. El backend sigue siendo un único monolito modular; los contenedores de Next.js y Caddy son su cliente web y su entrada HTTPS. SQL Server permanece externo al ciclo de vida de los contenedores de aplicación.

```text
Internet → Caddy (HTTPS, 80/443) → Next.js (páginas)
                              → API .NET (/api/* y /health/*) → SQL Server
```

El navegador usa `/api/v1` bajo el mismo dominio. Caddy conserva cookies y origen y comunica el esquema original mediante cabeceras. La API solo acepta cabeceras reenviadas desde la IP explícita de Caddy, con un salto de confianza. No se habilita confianza global mediante `ASPNETCORE_FORWARDEDHEADERS_ENABLED`.

No se ha contratado alojamiento, configurado GitHub remotamente ni desplegado esta implementación. CD queda bloqueado hasta que el administrador complete la preparación y active `XFOOD_CD_ENABLED=true`.

## CI: qué ocurre con cada pull request

`.github/workflows/ci.yml` se ejecuta en PR dirigidos a `develop` y `main`, pushes a esas dos ramas, ejecución manual y llamada desde CD. No se omiten trabajos por filtros de rutas. Los PR de forks usan `pull_request`, sin secretos de despliegue ni permisos de publicación; GitHub puede exigir que un mantenedor autorice su primera ejecución.

| Comprobación | Operaciones |
|---|---|
| Backend and SQL Server | SDK 10.0.400, herramientas locales, restore, build Release, xUnit y SQL Server 2022 Developer desechable. `XFOOD_REQUIRE_SQL_TESTS=true` impide dar por válidas pruebas SQL omitidas por falta de conexión. |
| Modelo | `migrations has-pending-model-changes` y generación de SQL idempotente. No se modifica el snapshot ni se aplica este SQL. |
| Web and browser tests | Node 24.13.0, `npm ci`, ESLint, pruebas unitarias, compilación y Playwright Chromium con respuestas API simuladas para comprobar estados de interfaz. |
| Containers and real CRUD | Construye API, migrador de pruebas y Next.js; levanta Caddy HTTPS y SQL Server propios; aplica las migraciones exclusivamente a `XFood_WebTests_<guid>` y ejecuta el CRUD real sin simular `/api/v1`. |
| CI required | Solo pasa si los tres trabajos anteriores pasan. Es el estado que debe exigirse en las reglas de ramas. |

El recorrido real cubre registro, login, cookie segura, perfil, catálogo, alta/lectura/edición de venta, aparición en búsqueda, desactivación y logout. Las teselas externas del mapa se bloquean en la prueba; no se valida disponibilidad del proveedor de mapas. No implica que reservas, donaciones completas u otras historias pendientes estén terminadas.

Las pruebas .NET crean y borran `XFood_Tests_<guid>` en su servidor efímero. El smoke de contenedores usa otro SQL Server efímero, sin conexiones personales ni volúmenes reutilizados, y elimina solo su proyecto Compose y sus volúmenes al salir. Un cierre forzado del runner puede impedir la limpieza normal; los runners alojados por GitHub se descartan al terminar el trabajo.

Se conservan TRX, informes del navegador, logs de contenedores y SQL generado durante 14 días. Este plazo corresponde a artefactos técnicos, no define la retención de datos de negocio. Las imágenes intermedias para CD se conservan 2 días y no contienen credenciales. Los timeouts y la cancelación de ejecuciones antiguas de un mismo PR limitan trabajo innecesario. Los tres trabajos se ejecutan en paralelo; el consumo de minutos depende del plan de GitHub.

## Configuración del repositorio en GitHub

Estos cambios requieren permisos de administración y **no se realizan por añadir archivos al repositorio**:

1. Integrar y publicar los archivos mediante el PR habitual. Para que aparezca la ejecución manual, el workflow debe existir también en la rama predeterminada. No cambiar la rama predeterminada solo para probarlo.
2. En Rulesets o Branch protection de `develop` y `main`, exigir PR revisado, el estado `CI required`, resolución de conversaciones y actualización con la rama destino. Comprobar el nombre mostrado por el primer run antes de seleccionarlo. Evitar saltarse los controles mediante pushes directos.
3. Crear los environments `staging` y `production`. Restringir sus ramas a `develop` y `main`, respectivamente. Exigir aprobación para producción y evitar la autoaprobación si el plan lo permite. El YAML no crea esa exigencia; verificarla en GitHub antes de activar CD. Si el plan no ofrece esa protección, no activar producción sin acordar un control equivalente.
4. En cada environment crear las variables `DEPLOY_SSH_HOST`, `DEPLOY_SSH_USER` y opcionalmente `DEPLOY_SSH_PORT` (22 por defecto).
5. En cada environment crear los secretos `DEPLOY_SSH_KEY` y `DEPLOY_SSH_KNOWN_HOSTS`. Obtener la huella del servidor por un canal confiable; no aceptar una clave obtenida únicamente con `ssh-keyscan` sin contrastarla. Para un puerto distinto de 22, usar el formato `[host]:puerto` de known_hosts.
6. Permitir que el trabajo de publicación use `GITHUB_TOKEN` con `packages:write`. Comprobar acceso del repositorio a sus paquetes GHCR si ya existen. Los demás trabajos conservan permisos de lectura.
7. Solo después de preparar y probar el servidor, añadir la variable **de repositorio** `XFOOD_CD_ENABLED=true`.

Las Actions están fijadas por SHA completo. Dependabot propone actualizaciones semanales de Actions, imágenes Docker, npm y NuGet; esas propuestas se revisan y pasan CI. No actualizar versiones de SDK o Node sin mantener alineados `global.json`, workflows y Dockerfiles.

## Preparación del servidor

Se requiere un servidor Linux x86-64 por entorno, DNS público, puertos 80/443 disponibles para Caddy y SSH accesible al runner. Instalar Docker Engine, Compose v2 (con soporte de múltiples `--env-file`), Bash, `curl`, `flock`, `sha256sum` y OpenSSH. Esta composición reserva 80/443: dos entornos en una sola máquina necesitan adaptar la entrada compartida antes de usarlos; cambiar solo la subred no evita el conflicto de puertos.

Crear un usuario de despliegue dedicado. El acceso a Docker otorga privilegios importantes en el host: limitar su clave y su acceso a mantenedores autorizados. Preparar estas rutas con el propietario y permisos adecuados:

```text
/opt/xfood/staging/
  environment.env
  secrets/api-settings.json
  releases/
  current → releases/<commit>-<run>-<intento>
```

Para producción usar `/opt/xfood/production/`. Copiar `deploy/environment.example` a `environment.env` **en el servidor**, cambiar dominio y ruta del archivo privado y conservar sintaxis simple `CLAVE=valor`, sin comillas ni espacios en el dominio. No copiar secretos al checkout ni a los artefactos de Actions.

El archivo privado `secrets/api-settings.json` contiene la conexión de ese entorno. Plantilla sin credenciales:

```json
{
  "ConnectionStrings": {
    "XFood": "<configurar conexión privada a SQL Server de este entorno>"
  }
}
```

Configurar TLS hacia SQL Server con certificado válido y `Encrypt=True;TrustServerCertificate=False`. Una instancia SQL fuera de Docker necesita DNS/ruta y firewall accesibles desde los contenedores; `localhost` dentro de la API apunta al contenedor. La autenticación integrada de Windows de los ejemplos locales no se traslada automáticamente a Linux: preparar una identidad compatible con el servidor elegido, con privilegios limitados para el runtime. La identidad operativa que aplica migraciones tendrá permisos separados.

El usuario de la API es el no privilegiado del runtime .NET (UID/GID 1654 en la imagen utilizada). Asegurar que el archivo montado pueda leerse por ese usuario, sin lectura pública; por ejemplo, propietario root, grupo 1654 y modo 0440. Los secretos Compose son archivos montados en lectura, no una bóveda cifrada. Proteger disco, respaldos y acceso del host.

Si GHCR es privado, ejecutar `docker login ghcr.io` **en el servidor y con el usuario de despliegue**, usando una credencial de solo lectura de paquetes. No reutilizar el token temporal `GITHUB_TOKEN` del runner. La clave SSH de CD no transporta la conexión SQL ni la credencial del registro.

La API persiste las claves de Data Protection en `identity_keys` y utiliza el nombre de aplicación estable `XFood`, para conservar sesiones al recrear contenedores. El volumen y los datos/certificados de Caddy deben respaldarse; no ejecutar `down --volumes` en entornos compartidos. Las claves se protegen mediante acceso al host/volumen; no se ha configurado cifrado adicional de sus archivos. La introducción del nombre estable puede invalidar cookies creadas por versiones anteriores: prever un nuevo login en esa transición.

## Migraciones: revisión y aplicación explícita

La automatización no edita ni reemplaza migraciones existentes. `InitialIdentity` permanece intacta. Cada cambio de modelo debe incorporar su migración, diseñador y snapshot, y coordinarse con otros compañeros.

1. Descargar `schema-<commit>` del run de CI o CD que corresponda a la versión que se va a entregar. Verificar `commit.txt` y `SHA256SUMS`.
2. Revisar SQL, índices, datos duplicados y posibles pérdidas; un script idempotente evita reaplicar migraciones registradas, pero no convierte cualquier cambio en seguro.
3. Probar el avance sobre una copia aislada representativa del entorno. La CI cubre creación desde cero, no todos los datos ni rutas históricas de una base compartida.
4. Respaldar y comprobar el destino. Un operador autorizado aplica el SQL aprobado a la base del entorno, con su procedimiento de conexión seguro. Como alternativa, desde la raíz del código de ese commit, con `ConnectionStrings__XFood` configurada fuera de Git:

   ```bash
   dotnet tool restore
   dotnet tool run dotnet-ef database update --project src/XFood.Infrastructure --startup-project src/XFood.Api --context XFoodDbContext
   ```

5. Coordinar la ventana de despliegue. Favorecer cambios aditivos y compatibles con la versión en ejecución; cambios incompatibles requieren mantenimiento y un plan específico.

No usar el migrador de `compose.smoke.yml` en una base compartida. Solo existe para la topología efímera de CI. CD comprueba `/health/ready`; devuelve 503 si SQL no está disponible o quedan migraciones del ensamblado pendientes. Esta comprobación no valida por sí sola todos los datos ni detecta cualquier alteración manual del esquema.

## CD: publicación y activación

CD es **entrega controlada con despliegue manual**, no un despliegue automático por cada push:

1. Integrar un PR en `develop` y verificar CI.
2. En Actions → **XFood CD** → Run workflow, seleccionar rama `develop` y entorno `staging`.
3. CD valida activación y combinación rama/entorno. Reutiliza toda la CI sobre el SHA seleccionado, sin heredar secretos de despliegue.
4. Exporta las imágenes de API y web que superaron el CRUD real, comprueba sus checksums y el SHA de sus etiquetas OCI, y publica **esas mismas imágenes**, sin reconstruir, en `ghcr.io/<owner>/<repo>/api` y `/web`. Las etiquetas incluyen commit, run e intento; el despliegue usa referencias `@sha256:...`.
5. El trabajo de despliegue espera las protecciones del environment configuradas en GitHub. Los secretos SSH solo se entregan a ese trabajo. Antes de aprobar, revisar el SQL de ese run y preparar el esquema si hace falta.
6. Transfiere configuración y manifiesto sin credenciales por SSH con host verificado. En el servidor comprueba checksums, digests, dominio y un bloqueo por entorno; descarga imágenes antes de cambiar los servicios.
7. Actualiza los contenedores y comprueba HTTPS válido, `/health/ready`, catálogo y portada. Solo entonces actualiza el enlace `current` y comunica éxito.
8. Tras aceptar staging y revisar el PR hacia `main`, ejecutar CD con rama `main` y entorno `production`. Se vuelve a validar ese commit; no se presupone que el SHA del merge sea idéntico al de develop.

Las solicitudes de CD se serializan por entorno y no cancelan un despliegue activo. GitHub puede sustituir ejecuciones pendientes por una más reciente; no se garantiza una cola ilimitada. El servidor añade `flock` para impedir dos activaciones simultáneas.

Los despliegues Compose pueden interrumpir brevemente el servicio: no hay despliegue sin interrupción ni alta disponibilidad en esta primera versión. Las comprobaciones posteriores de CD son de lectura; el CRUD con escritura ya se ejecutó contra SQL aislado en CI.

## Fallos y recuperación

Una prueba fallida impide llegar a publicación/despliegue. Un fallo de readiness o de comprobación HTTP hace fallar CD, aunque algunos contenedores pueden haber sido actualizados. `current` conserva la última versión verificada y las carpetas de releases quedan disponibles para inspección. No hay rollback automático de aplicación ni de esquema.

Para recuperar una release anterior, un operador comprueba primero que su aplicación siga siendo compatible con el esquema actual y ejecuta desde su carpeta conservada:

```bash
bash /opt/xfood/staging/releases/<commit>-<run>-<intento>/deploy.sh staging <commit>-<run>-<intento>
```

Ese comando vuelve a comprobar digests y disponibilidad. No revierte migraciones. No borrar historial, volúmenes ni tablas para solucionar un fallo. La restauración de SQL Server exige el procedimiento de respaldo y recuperación acordado. Conservar en GHCR las imágenes referenciadas por releases de recuperación; no hay limpieza automática de esas imágenes ni de carpetas antiguas del servidor.

## Referencias

- [GitHub: compilar y probar .NET](https://docs.github.com/en/actions/tutorials/build-and-test-code/net).
- [GitHub: reutilizar workflows](https://docs.github.com/en/actions/how-tos/reuse-automations/reuse-workflows).
- [GitHub: environments y protecciones](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
- [Docker: secretos Compose](https://docs.docker.com/compose/how-tos/use-secrets/).
- [Microsoft: cabeceras de proxies de confianza](https://learn.microsoft.com/en-us/aspnet/core/host-and-deploy/proxy-load-balancer?view=aspnetcore-10.0).
- [Playwright: integración continua](https://playwright.dev/docs/ci).
