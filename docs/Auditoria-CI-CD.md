# Auditoría de la incorporación de CI/CD

Fecha: 2 de noviembre de 2026.

## Dictamen y alcance

La implementación está preparada y validada localmente para GitHub Actions y Linux x86-64 con Docker. Conserva el monolito modular, una API y una base SQL Server. **No equivale a una instalación activa en GitHub ni a un despliegue remoto comprobado**: faltan alojamiento, DNS, configuración de environments y publicación de estos cambios.

Se trabajó en `feature/frontend-integracion`, sobre el árbol que ya contenía la revisión del frontend. Se conservaron esos cambios. Los resultados siguientes corresponden al árbol local actual, no a un nuevo commit publicado. No se hizo commit, push, merge, despliegue remoto ni aplicación de migraciones sobre `XFoodDB`.

## Cambios auditados

| Área | Implementación y motivo |
|---|---|
| CI | `.github/workflows/ci.yml`: PR y push a develop/main, ejecución manual y reutilización por CD; tres trabajos de comprobación y un estado agregado obligatorio. |
| Backend | Restore, build Release, xUnit con SQL obligatorio, comparación modelo/snapshot y SQL idempotente de revisión. |
| Frontend | Node fijado, instalación reproducible mediante lockfile, ESLint, pruebas unitarias, compilación y navegador. Se añadieron trazas/capturas de fallos. |
| Contenedores | Dockerfiles multietapa; API y Next.js sin usuario root; Next standalone. Migrador separado usado únicamente en pruebas efímeras. |
| Integración real | Compose de pruebas con SQL Server propio, Caddy HTTPS, API y web. El CRUD escribe solo en `XFood_WebTests_<guid>`, sin simular respuestas de la API. |
| CD | `.github/workflows/cd.yml`: activación explícita, ejecución manual, develop→staging/main→production, repetición de CI y publicación en GHCR de las mismas imágenes probadas. |
| Activación remota | SSH con clave de host verificada, digests en el manifiesto, checksum de archivos, bloqueo por entorno, descarga previa y verificación de readiness/catálogo/portada. |
| Configuración | Conexión privada mediante archivo montado; variables y secretos del entorno fuera del repositorio. La composición de entrega no contiene SQL Server ni aplica migraciones. |
| Sesión y HTTPS | Data Protection persistente con nombre estable; cabeceras reenviadas desde proxy explícito; cookie y controles de origen existentes conservados. |
| Operación | `/health/ready` comprueba conexión y migraciones pendientes, sin aplicarlas y sin exponer detalles en la respuesta. `/health/live` sigue independiente de SQL. |
| Mantenimiento | SDK fijado mediante `global.json`; Actions por SHA; propuestas Dependabot para Actions, Docker, npm y NuGet. |
| Guías | README y `docs/CI-CD.md` explican activación, trabajo del equipo, migraciones y recuperación. |

## Verificaciones ejecutadas

| Verificación | Resultado |
|---|---|
| `dotnet tool restore` y `dotnet restore XFood.slnx` | Correctos. La restauración completa requirió salir del aislamiento de red local. |
| `dotnet build XFood.slnx --configuration Release --no-restore` | Correcto, 0 errores y 0 advertencias. |
| `dotnet test XFood.slnx --configuration Release --no-build --no-restore` con SQL obligatorio | **205 pruebas API y 24 de arquitectura: 229 correctas, 0 fallidas, 0 omitidas.** |
| Nuevas pruebas de despliegue | 9 casos: proxy conocido/desconocido/límite de salto, claves entre instancias, readiness frente a estado de dependencia, arranque con archivo privado y SQL real con migraciones aplicadas/pendientes. |
| `npm run lint` | Correcto. |
| `npm run test:unit` | 33 correctas. |
| `npm run build` | Compilación de producción correcta, incluida salida standalone. |
| `npm run test:e2e -- --reporter=line` | 58 correctas en la suite final, incluidas las comprobaciones automáticas de accesibilidad existentes. |
| `CI=true bash scripts/ci/container-smoke.sh` | Correcto en Docker Linux: imágenes construidas y cargadas, 4 migraciones aplicadas al SQL desechable, readiness saludable y CRUD real correcto. La topología se eliminó al salir. |
| Transferencia de imágenes entre CI y CD | Exportación con `docker save`, compresión, checksum SHA-256 y recarga con `docker load` correctas; no se publicaron imágenes en ningún registro. |
| `migrations has-pending-model-changes` | Sin diferencias entre modelo y snapshot. |
| `migrations script --idempotent` | SQL generado sin conexión a una base. Inspección sin operaciones DROP, TRUNCATE, DELETE ni ALTER COLUMN en el script actual. Esto no garantiza que futuras migraciones sean no destructivas. |
| Hashes de migraciones, diseñadores y snapshot | Coinciden con el estado previo a este trabajo; `InitialIdentity` intacta. |
| Actionlint 1.7.12 | Ambos workflows válidos. Herramienta oficial descargada y contrastada con su checksum. Validación local sin integración de ShellCheck. |
| Bash y Compose | Los tres scripts pasan `bash -n`; configuración Compose de entrega válida con valores de ejemplo sin secretos. |
| Git | `git diff --check` correcto; archivos de Codex, documentación local, secretos de despliegue y artefactos ignorados; workflows, código y configuración de ejemplo versionables. |

La primera ejecución del navegador encontró una carrera de la prueba de sesión vencida con el prefetch de Next.js. Se corrigió la navegación de esa prueba; no se modificó el diseño de la interfaz. La suite completa posterior pasó. Las restricciones iniciales del sandbox impidieron una compilación Next local; al ejecutar con los permisos necesarios y en Docker, la compilación pasó.

## Revisión de arquitectura y persistencia

- No se añadieron microservicios de negocio, módulos paralelos, controladores de negocio, tablas ni migraciones.
- El dominio y la aplicación permanecen sin cambios por CI/CD. La composición HTTP registra proxies y protección de claves; Infraestructura es responsable del chequeo SQL.
- Los cuatro scripts de migración existentes se conservan. La identidad ya aplicada no se reescribe.
- El SQL generado se entrega para revisión humana. Solo el entorno efímero de CI aplica automáticamente migraciones. Una base compartida requiere respaldo, comprobación del destino y aprobación operativa.
- Readiness detecta migraciones del ensamblado pendientes; no sustituye revisar datos existentes, compatibilidad con la versión anterior ni alteraciones manuales del esquema.

## Seguridad y hallazgos pendientes

1. **Activación pendiente, no defecto del código:** configurar reglas de ramas y exigir `CI required`, environments, restricciones de rama, aprobación de producción, SSH, acceso al registro, servidor, DNS y SQL privado. Ninguno de esos controles administrativos se crea automáticamente mediante YAML. CD permanece bloqueado sin `XFOOD_CD_ENABLED=true`.
2. **Dependencias de desarrollo:** `npm audit --json` informó 16 avisos moderados relacionados con el árbol de ESLint/minimatch y [GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249). Todos los nodos afectados del lockfile están marcados como dependencias de desarrollo; el informe no contiene paquetes de producción afectados ni avisos altos/críticos. Queda actualizar de forma compatible el conjunto de herramientas. No se ejecutó `audit fix --force`, cuyas propuestas incluían degradaciones incompatibles. Este informe es una observación puntual, no un escaneo completo de imágenes o del sistema operativo.
3. **Secretos y claves en el host:** los secretos Compose son archivos montados, y las claves Data Protection se conservan en un volumen sin cifrado adicional configurado. Corresponde al administrador proteger permisos, disco y respaldos. El usuario de despliegue con acceso a Docker tiene privilegios importantes.
4. **Disponibilidad y recuperación:** Compose puede interrumpir brevemente el servicio y dejar contenedores actualizados si falla una comprobación posterior. Se conserva la última release verificada, pero no hay rollback automático de aplicación o base. Se deben probar recuperación y respaldos antes del piloto.
5. **Compatibilidad de base existente:** crear desde cero en CI y probar historias no cubre todas las posibles bases históricas. Cada migración futura debe probarse también con datos representativos y coordinarse con los demás responsables.

## Qué no se pudo comprobar todavía

- Una ejecución alojada por GitHub y el efecto real de las reglas de ramas/environments: estos cambios no se publicaron.
- Publicación y permisos de GHCR, conexión SSH al futuro servidor, emisión de certificado público y activación de un despliegue remoto: no hay alojamiento ni credenciales configurados.
- Restauración real de un respaldo o recuperación remota de una release: pendiente del entorno operativo.

## Cómo trabajará el equipo

1. Cada compañero actualiza su rama desde `develop`, implementa y comprueba localmente lo pertinente.
2. Al abrir o actualizar el PR, GitHub ejecuta las comprobaciones comunes. Un fallo debe corregirse antes de integrar; un run exitoso no reemplaza la revisión funcional y de arquitectura.
3. Si cambia el modelo, coordina el snapshot, versiona su nueva migración y revisa el SQL del artefacto. No edita migraciones ya aplicadas.
4. Tras integrar en `develop`, un responsable ejecuta CD hacia staging para validación conjunta. El despliegue vuelve a probar el commit y usa las mismas imágenes verificadas.
5. Tras aceptación y revisión del PR hacia `main`, se solicita CD a producción y se completa la aprobación del environment configurada en GitHub.

La guía operativa con rutas, variables y comandos está en [CI-CD.md](CI-CD.md).
