# XFood | Arquitectura de software
Versión 2.0 · Diseño objetivo para el MVP · 30 de octubre de 2026

## 1. Alcance y decisiones rectoras
Este documento define **con qué piezas y reglas de dependencia** se construirá XFood. Atiende los requisitos del SRS v2.0 y el comportamiento de las especificaciones v2.0. El estilo es un **monolito modular**: un backend de negocio desplegable como una unidad, con módulos internos delimitados. Las interfaces móvil y web son aplicaciones cliente independientes; no son microservicios del backend.

Los criterios que dominan el diseño son: integridad de unidades frente a solicitudes concurrentes; trazabilidad de reservas, donaciones y entregas; separación clara de roles; rapidez para entregar el piloto; y facilidad para evolucionar módulos sin distribuir prematuramente las transacciones.

**Restricciones:** API REST sobre HTTPS; base relacional SQL Server; backend .NET 10 LTS / ASP.NET Core Web API; EF Core 10; identidad con ASP.NET Core Identity; app móvil Flutter para C y O; panel React con Next.js para E y A. La propuesta previa de Node.js/PostgreSQL/Firebase Auth no rige este diseño. El medio de alojamiento, servicio de mapas y canal push se seleccionarán en la preparación del piloto.

## 2. Contexto y contenedores

**App móvil (Flutter).** Presenta búsqueda, detalle, reserva y donación, pide ubicación con consentimiento y traduce respuestas de la API a estados comprensibles. No decide stock ni verificación. **Panel web (React + Next.js).** Presenta publicaciones, operaciones, verificación y reportes; puede usar renderizado de servidor para páginas, pero las operaciones de negocio se ejecutan en la API. **API modular (ASP.NET Core).** Expone contratos REST, valida identidad/roles, ejecuta casos de uso y coordina transacciones. **SQL Server.** Guarda datos operativos, historial y cola de avisos persistentes. **Servicios externos.** Un proveedor de mapas ofrece visualización/geocodificación y un proveedor de notificaciones entrega push/correo cuando se configure; ninguno es fuente de verdad del estado.

Una sola compilación y despliegue del backend simplifica el control de consistencia. Los módulos no se comunican por llamadas HTTP internas. Las comunicaciones entre clientes y API se versionan desde `/api/v1` y se documentan con OpenAPI.

## 3. Módulos y propiedad
| Módulo | Responsabilidad | Datos propios y salida principal |
| --- | --- | --- |
| Identidad y acceso | Cuentas, roles, sesión, suspensión y autorización | Cuentas/roles; identidad del actor autorizada. |
| Establecimientos | Perfil comercial, dirección y ubicación | Establecimiento; referencia propietaria de publicación. |
| Publicaciones | Lotes de venta/donación, precios, cantidades, vigencia | Publicaciones y disponibilidad; consultas públicas filtradas. |
| Reservas | Asignar unidades de venta, cancelar, confirmar entrega | Reservas y estado; evento de asignación/entrega. |
| Donaciones | Verificación de organización, asignación y recepción | Organización, revisión, aceptación; evento de donación. |
| Notificaciones | Crear bandeja, despachar/reintentar avisos y alertas | Avisos, intentos y deduplicación. |
| Administración y reportes | Incidencias, decisiones administrativas, agregados | Incidencias y proyecciones de lectura; datos por interfaces de módulo. |

Los nombres de módulos son límites de responsabilidad, no servicios desplegables. Publicaciones es dueño del disponible. Reservas y Donaciones solicitan una operación de asignación al dueño del stock mediante una interfaz de aplicación; no editan directamente su tabla. Identidad determina quién puede actuar, pero la autorización de propiedad se confirma dentro del caso de uso correspondiente. Reportes accede a vistas/consultas de lectura explícitas, sin modificar datos de otros módulos.

**Dependencias permitidas:** contratos compartidos mínimos (identificadores, eventos, resultados), interfaces públicas de módulo y eventos internos posteriores al commit. Se prohíben referencias a `DbContext`, entidades de infraestructura o tablas privadas de otro módulo desde la lógica de negocio ajena. Una composición central configura dependencias, seguridad y persistencia.

## 4. Clean Architecture pragmática
Cada módulo se organiza en cuatro áreas, sin exigir proyectos separados para cada capa si eso añade fricción al equipo.

| Área | Contenido | Puede depender de |
| --- | --- | --- |
| API / presentación | Controladores, DTO, filtros de autenticación, mapeo HTTP | Casos de uso y contratos. |
| Aplicación | Comandos/consultas, orquestación, transacciones, interfaces de repositorio/servicio | Dominio y contratos publicados. |
| Dominio | Entidades, estados, invariantes, reglas y eventos de negocio | Ningún framework ni persistencia. |
| Infraestructura | EF Core, Identity, SQL Server, proveedores de mapas/avisos, trabajos programados | Interfaces de aplicación y modelos de dominio. |

El flujo de una reserva es: controlador autentica y valida formato -> caso de uso verifica rol/propiedad y vigencia -> módulo Publicaciones asigna unidades en transacción -> módulo Reservas guarda la operación y precio instantáneo -> se persiste un evento/aviso pendiente -> commit -> respuesta HTTP -> despachador entrega el aviso fuera de la solicitud. Una falla de notificación no revierte el compromiso de stock. Las validaciones de estado y cantidad se repiten en el servidor dentro de la transacción.

## 5. Persistencia y consistencia
**Modelo.** SQL Server almacena relaciones entre cuenta, establecimiento, publicación y operación; claves foráneas y restricciones protegen datos básicos. Las tablas se agrupan por esquema o prefijo de módulo para hacer visible su propiedad. EF Core 10 administra mapeos y migraciones revisadas. La base es una sola para la v1, con acceso a datos por módulo; los reportes usan consultas de lectura controladas.

**Reserva y donación.** La asignación y el registro de la operación forman una única transacción SQL. Una actualización condicional del disponible (`disponible >= cantidad` y publicación activa/vigente) o control de concurrencia con `rowversion` impide sobreasignación; un conflicto se devuelve como 409. La elección concreta se implementa y prueba con dos solicitudes simultáneas a la última unidad. Una clave de idempotencia por actor/intento evita dobles reservas por reenvíos de red. La cancelación reintegra unidades en la misma transacción solo cuando la regla de vigencia lo permite.

**Estados e historial.** Cada transición conserva actor, fecha, motivo y datos pertinentes. Reserva/aceptación y publicación tienen estados distintos; una publicación agotada puede tener operaciones pendientes. Precio y condiciones de recogida quedan en la operación como instantánea para que una edición posterior no cambie lo prometido.

**Tiempo y ubicación.** Se almacenan instantes UTC y la zona horaria de presentación del establecimiento para mostrar ventanas de recogida. Se indexan estado, modalidad, fecha límite y claves de relación. Para búsqueda inicial se pueden usar coordenadas y una consulta acotada; si la consulta espacial/índice geográfico es necesaria, EF Core SQL Server integra NetTopologySuite mediante `Microsoft.EntityFrameworkCore.SqlServer.NetTopologySuite`. El cliente no calcula la autoridad de cercanía ni filtra todo el catálogo localmente.

**Respaldo.** Programar copias, protección de credenciales y prueba de restauración antes del piloto. Las metas de recuperación y retención requieren acuerdo operativo y se documentarán junto con el entorno de despliegue.

**Decisiones funcionales con impacto en datos.** Las categorías se gestionan mediante un catálogo controlado, referenciado por la publicación. Una membresía distingue responsable principal y responsables autorizados; la auditoría registra al actor. Las cancelaciones, incidencias y sus motivos se conservan sin fingir entregas completas. La alerta usa un umbral configurable inicial de dos horas. El período de retención permanece pendiente. Los límites de cancelación y el procesamiento de entrega tardía se implementan en los casos de uso, no solo como restricciones estáticas de base de datos.

## 6. Procesamiento asíncrono
Los avisos se desacoplan de las transacciones principales. Al confirmar una operación, el backend persiste un mensaje pendiente en la misma transacción (patrón outbox simple). Un trabajador del mismo despliegue lo lee, envía y marca el resultado; guarda intentos, aplica reintentos limitados y deduplica. Las alertas de proximidad y el vencimiento de estados son trabajos periódicos idempotentes. La hora límite se comprueba también en cada solicitud, por lo que un retraso del trabajador no acepta un lote vencido.

Para el piloto, `BackgroundService` y una tabla de trabajo pueden bastar. **Hangfire es opcional**, cuando se requieran reintentos/agenda más completos. Si se ejecutan varias instancias del backend, el trabajo debe usar reclamo exclusivo en base de datos o coordinación equivalente para que no se procese dos veces. La entrega de push o correo es complementaria; la bandeja y el estado consultable reflejan la verdad persistida.

## 7. Seguridad y contratos
ASP.NET Core Identity administra cuentas, hash de contraseña, roles y controles de acceso. El backend emite credenciales para la app móvil y una sesión segura para el panel web; el diseño concreto de token/renovación y cookie se fija antes de desarrollar ambos clientes. Si el panel usa cookie, se aplican protecciones CSRF, `HttpOnly`, `Secure` y `SameSite` adecuados; la app almacena credenciales en almacenamiento seguro. Se aplica autorización por política y por propiedad, sin confiar en el rol, ID de negocio o precio enviado por el cliente.

TLS protege tráfico; CORS se limita a orígenes del panel; secretos quedan fuera del repositorio. Las respuestas de error usan códigos estables y `traceId`, sin divulgar información sensible. Los accesos y decisiones administrativas relevantes se registran con auditoría. La geolocalización requiere consentimiento y alternativa manual.

La API usa DTO separados de entidades EF, paginación en listados, validación del lado servidor, versión explícita y OpenAPI como contrato. La interfaz interactiva Swagger UI es una herramienta de desarrollo separada de la generación del documento OpenAPI y se restringe según el entorno.

## 8. Despliegue, observabilidad y pruebas
**Topología inicial:** app móvil distribuida al grupo piloto; panel web alojado como cliente; una instancia de API con trabajador integrado; una base SQL Server y configuración de proveedores externos. El backend puede escalar con más instancias cuando el estado de sesión, idempotencia y trabajos estén coordinados en persistencia común. No se requiere una cola distribuida ni una base por módulo en el MVP.

Se registran solicitudes con identificador de correlación, resultados de transacción, conflictos de stock, trabajos fallidos y latencia de consultas. Comprobaciones de vida y disponibilidad de base permiten distinguir caída del proceso de dependencia fallida. Las métricas deben verificar la meta de respuesta y disponibilidad del SRS con una carga piloto definida.

**Pruebas prioritarias:** reglas de dominio (precio, vigencia, estados), autorización por rol y propiedad, integración EF/SQL Server para asignación y cancelación, concurrencia de última unidad, idempotencia, expiración antes de que corra el trabajo, fallo de proveedor de avisos, y recorridos completos móvil/web con API. xUnit cubre pruebas unitarias e integración; las pruebas de transacción deben usar SQL Server del entorno de pruebas, no una simulación que ignore su concurrencia.

## 9. Decisiones, riesgos y evolución
| Decisión | Motivo y efecto |
| --- | --- |
| Monolito modular con una base | Mantiene transacciones locales y despliegue sencillo; exige límites internos revisados. |
| Clean Architecture pragmática | Protege reglas del dominio de frameworks sin multiplicar proyectos innecesarios. |
| Asignación atómica con idempotencia | Evita stock negativo y reintentos duplicados; requiere pruebas de concurrencia reales. |
| Avisos posteriores al commit | La comunicación externa no bloquea reservas; requiere outbox, seguimiento y reintentos. |
| Pagos presenciales en v1 | Evita introducir pasarela y conciliación financiera fuera del alcance aprobado. |
| Geoespacial como incorporación medida | Se añade NetTopologySuite solo si la consulta piloto lo necesita; conserva API de búsqueda estable. |

**Riesgos a vigilar:** resolución administrativa de entregas parciales o tardías por definir; modificación de cantidad cuando existen asignaciones; discrepancia entre entrega física y confirmación digital; acumulación de avisos fallidos; información sanitaria incorrecta publicada por un negocio; calidad de coordenadas; sobrecarga de consultas de ubicación. Las mitigaciones son decisiones de producto previas al piloto, restricciones de datos, auditoría, reintentos y pruebas con establecimientos reales.

Una versión futura podrá introducir pagos, recomendaciones con datos, integraciones y despliegues más complejos, sujetos a nuevos requisitos. La separación modular permite evaluar esos cambios sin convertir la v1 en microservicios. Las decisiones pendientes del SRS y de las especificaciones deben cerrarse antes de congelar esquemas y contrato OpenAPI.

**Referencias técnicas de diseño:** Microsoft Learn, ciclo de soporte .NET; documentación de EF Core sobre proveedor SQL Server y datos espaciales; documentación ASP.NET Core sobre OpenAPI e Identity. Consulta de referencia: 30/10/2026. Las fuentes del alcance son BRD XFood, Propuesta XFood y Actividad Scrum XFood.
