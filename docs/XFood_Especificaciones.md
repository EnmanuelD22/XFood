# XFood | Especificaciones funcionales
Versión 2.0 · Desarrollo del SRS v2.0 · 30 de octubre de 2026

## 1. Objeto y convenciones
Este documento describe **cómo se comportan** los recorridos principales de XFood: entradas, validaciones, cambios de estado y respuestas observables. Desarrolla los RF del SRS sin repetir sus objetivos de calidad ni prescribir la estructura del código. Las rutas y campos propuestos constituyen el contrato inicial para móvil y web; la definición OpenAPI será su representación ejecutable.

**Actores:** C consumidor; E establecimiento; O organización verificada; A administrador. Fechas enviadas a la API en UTC; los clientes muestran hora local y zona de recogida. Moneda RD$, importes decimales de dos posiciones. Identificadores estables no reutilizables. En las tablas, `*` indica obligatorio.

## 2. Entidades y reglas compartidas
| Entidad | Datos mínimos y relaciones |
| --- | --- |
| Cuenta | Id, correo único, rol, estado; se relaciona con uno o más perfiles autorizados según el modelo de acceso adoptado. |
| Establecimiento | Id, nombre, contacto, dirección, coordenadas, estado; propietario/operadores autorizados. |
| Organización | Id, nombre, datos de contacto, verificación, fecha y responsable de decisión. |
| Publicación | Id, establecimiento, título, descripción, categoría, modalidad, cantidad inicial, disponible, ventana de recogida, estado, precios si es venta. |
| Reserva | Id, consumidor, publicación de venta, cantidad, precio unitario comprometido, referencia de recogida, estado y fechas. |
| Aceptación | Id, organización, publicación de donación, cantidad, estado y fechas. |
| Evento | Actor, operación, recurso, cambio de estado, motivo y momento; no reemplaza el estado actual. |

**Invariante de cantidad.** En cada publicación: `disponible >= 0`; `cantidad inicial + aumentos autorizados = disponible + asignaciones vigentes + entregadas + merma/retiros registrados`. Las cancelaciones oportunas restituyen unidades si la publicación sigue vigente, no ha sido desactivada y el alimento es apto; una publicación agotada puede volver a estar activa por la restitución. Las unidades de una operación vencida no regresan automáticamente a un lote ya vencido.

**Invariante de propiedad.** E solo actúa sobre su establecimiento y publicaciones; C sobre sus reservas; O sobre sus aceptaciones; A sobre recursos administrativos. El filtrado por rol también se aplica a lecturas por identificador.

## 3. Casos de uso
### CU-01 Registrar cuenta y habilitar organización (RF-01, RF-02, RF-10)
**Precondición:** correo libre y datos válidos. **Flujo:** 1) El solicitante elige C, E u O e introduce los datos requeridos. 2) El sistema crea cuenta y perfil; O queda pendiente. 3) A consulta las organizaciones pendientes y registra aprobación o rechazo con motivo. 4) El sistema comunica el resultado. **Resultado:** O aprobada puede consultar/aceptar donaciones; O pendiente o rechazada no. **Alternativas:** correo duplicado o datos inválidos producen error sin crear cuenta; credenciales incorrectas no inician sesión; una suspensión bloquea nuevas acciones protegidas. Las cuentas A no se crean por registro público.

### CU-02 Publicar y modificar un lote (RF-03 a RF-05)
**Precondición:** E autenticado con perfil habilitado. **Flujo:** 1) Selecciona su establecimiento. 2) Completa modalidad, alimento, cantidad, ventana de recogida y precio si es venta. 3) El sistema valida y activa. 4) E puede editar datos permitidos o desactivar. **Resultado:** una venta activa aparece en búsqueda de C; una donación activa, en búsqueda de O verificadas. **Alternativas:** cantidad no positiva, ventana vencida o precios incoherentes rechazan la creación. La modalidad de una publicación es inmutable; para ofrecer unidades no comprometidas bajo otra modalidad se retiran del lote anterior y se crea otro, sin alterar las asignaciones existentes. Una edición de precio no modifica reservas existentes. Reducir cantidad por debajo de lo ya asignado/entregado se rechaza.

### CU-03 Buscar y reservar oferta (RF-06 a RF-08)
**Precondición:** publicación de venta activa y vigente. **Flujo:** 1) C autoriza ubicación o indica zona. 2) Filtra y abre detalle. 3) Solicita una cantidad. 4) El sistema vuelve a comprobar estado, horario y disponible dentro de una operación atómica. 5) C recibe reserva con precio congelado y referencia de recogida. **Alternativas:** si otra reserva agotó el stock, se devuelve conflicto y el disponible actual; si se repite la misma solicitud con la misma clave de idempotencia se devuelve el mismo resultado, sin asignar otra vez. **Cierre:** C cancela dentro del plazo aplicable, E confirma entrega o el sistema marca vencimiento. Una reserva no entregada no cuenta como venta efectuada.

### CU-04 Aceptar y recibir donación (RF-09)
**Precondición:** O aprobada, lote de donación activo y vigente. **Flujo:** 1) O consulta lotes y condiciones. 2) Solicita cantidad. 3) El sistema asigna atómicamente las unidades y notifica a E. 4) O confirma recepción; E consulta el resultado. **Alternativas:** O no verificada recibe denegación; falta de stock o vencimiento devuelve conflicto; una cancelación válida restituye unidades si aún pueden ofrecerse. Si el negocio necesita constancia bilateral de entrega, se registra también confirmación de E sin sustituir la recepción de O.

### CU-05 Administrar, alertar y reportar (RF-11 a RF-14)
**Flujo:** A revisa cuentas, publicaciones e incidencias; cada decisión registra actor y motivo. El sistema detecta lotes próximos al límite y crea un aviso único por umbral/lote. Los reportes agregan operaciones por fecha y estado. **Resultado:** cantidades reservadas/aceptadas se distinguen de unidades entregadas/recibidas y de no aprovechadas. La falta de entrega de un aviso no cambia el estado de la operación.

## 4. Estados y transiciones
| Recurso | Estado inicial | Transiciones permitidas | Estado final |
| --- | --- | --- | --- |
| Organización | Pendiente | Pendiente -> Aprobada / Rechazada; Aprobada -> Suspendida; una nueva revisión puede habilitarla | Según decisión vigente |
| Publicación | Activa | Activa -> Agotada / Desactivada / Vencida; Agotada -> Activa por restitución o ajuste válido antes del límite | Desactivada o Vencida |
| Reserva | Reservada | Reservada -> Entregada (E) / Cancelada (C, E o A autorizado) / Vencida (sistema) | Entregada, Cancelada, Vencida |
| Aceptación | Aceptada | Aceptada -> Recibida (O) / Cancelada (O, E o A autorizado) / Vencida (sistema) | Recibida, Cancelada, Vencida |

Al agotarse las unidades se oculta el lote del catálogo activo, pero sus operaciones siguen accesibles. La expiración se comprueba en la operación misma aunque el trabajo programado aún no haya actualizado el estado visible. Para un lote vencido, no se permite reactivación por la misma publicación; una nueva oferta requiere nueva ventana y unidades verificadas. Una transición terminal repetida se rechaza o devuelve el resultado anterior si se trata de reintento idempotente.

## 5. Datos de entrada y validaciones
| Operación | Campos y validaciones esenciales |
| --- | --- |
| Cuenta | Correo* con formato válido y único; contraseña* según política configurada; nombre*; rol público C/E/O*. |
| Establecimiento | Nombre*, contacto*, dirección*, ubicación* válida (latitud -90 a 90, longitud -180 a 180); estado controlado por permisos. |
| Publicación | Título*, categoría*, modalidad*, cantidad entera > 0*, inicio y límite de recogida* con inicio < límite y límite futuro; declaración de aptitud*. En venta: precio original > 0* y descuento > 0 y < original*. En donación: sin precios. |
| Reserva / aceptación | Publicación*, cantidad entera > 0* y <= disponible; identidad del actor tomada de sesión; no aceptar si no está activa o si ya pasó el límite. |
| Verificación | Decisión* por A; motivo obligatorio para rechazo o suspensión; fecha y actor se registran automáticamente. |
| Búsqueda | Zona válida; radio, paginación y orden limitados por configuración; no devolver publicaciones inactivas ni datos privados. |

No se establece un máximo universal de unidades por operación; los límites de radio, longitud de campos y política de contraseña se fijarán en configuración y en OpenAPI antes de implementar clientes. Ningún valor arbitrario sustituye la decisión del Product Owner. El servidor valida incluso cuando el cliente ya haya validado.

## 6. Contrato inicial de la API REST
Prefijo `/api/v1`; JSON; autenticación requerida salvo registro, acceso y consulta pública de ofertas que el equipo decida habilitar. La lista siguiente describe capacidades, no obliga a una clase por endpoint. Todos los identificadores de recurso se validan contra propiedad y rol.

| Grupo | Operaciones representativas | Rol y resultado |
| --- | --- | --- |
| Identidad | `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /me` | Registro C/E/O; sesión y perfil propios. |
| Establecimientos | `GET /establishments/me`, `PUT /establishments/me` | E consulta/actualiza su perfil. |
| Publicaciones | `POST /listings`, `PATCH /listings/{id}`, `POST /listings/{id}/deactivate` | E crea/actualiza/cierra sus lotes. |
| Descubrimiento | `GET /listings`, `GET /listings/{id}`, `GET /donations/available` | C ve ventas; O aprobada ve donaciones. |
| Reservas | `POST /reservations`, `GET /reservations/me`, `POST /reservations/{id}/cancel`, `POST /reservations/{id}/deliver` | C reserva/cancela; E cancela con motivo o entrega tras verificar referencia. |
| Donaciones | `POST /donations/{listingId}/accept`, `GET /donations/acceptances/me`, `POST /donations/acceptances/{id}/receive`, `POST /donations/acceptances/{id}/cancel` | O aprobada acepta/recibe/cancela; E cancela con motivo. |
| Verificación | `GET /admin/organizations`, `POST /admin/organizations/{id}/approve`, `POST /admin/organizations/{id}/reject` | A decide y registra motivo. |
| Operación | `GET /notifications`, `POST /incidents`, `GET /reports/establishment`, `GET /admin/reports/summary` | Bandeja propia, incidencias y reportes según rol. |

**Ejemplo: crear reserva.** `POST /api/v1/reservations` con cabecera `Idempotency-Key` y cuerpo `{ "listingId": "<id>", "quantity": 2 }`. Respuesta `201` con `id`, `status=Reserved`, `quantity`, `unitPrice`, `total`, `pickupReference`, `pickupDeadlineUtc` y dirección de recogida. La clave identifica un intento de C y se asocia al mismo cuerpo; reutilizarla con otro cuerpo es conflicto. El servidor calcula el total y nunca acepta un precio enviado por C.

**Ejemplo: crear publicación.** `POST /api/v1/listings` recibe modalidad, título, categoría, cantidad y ventana de recogida; los precios solo en venta. Respuesta `201` con identificador, estado, disponible y cabecera `Location`. El establecimiento se deduce de la sesión/contexto autorizado; no se acepta un propietario arbitrario enviado por el cliente.

**Errores.** Se devuelve una estructura uniforme `{ "code", "message", "traceId", "errors"? }` sin filtrar datos sensibles. `400 VALIDATION_ERROR`; `401 UNAUTHENTICATED`; `403 FORBIDDEN` u `ORGANIZATION_NOT_VERIFIED`; `404 NOT_FOUND`; `409 INSUFFICIENT_STOCK`, `LISTING_NOT_ACTIVE`, `PICKUP_DEADLINE_PASSED`, `INVALID_STATE_TRANSITION` o `IDEMPOTENCY_CONFLICT`; `429 RATE_LIMITED`; `500 INTERNAL_ERROR`. En un 409 de stock se incluye la disponibilidad actual cuando el receptor tiene permiso de verla.

## 7. Avisos, reportes y escenarios de prueba
**Avisos mínimos:** reserva creada/cancelada/vencida al actor y establecimiento correspondiente; aceptación/recepción de donación a E y O; decisión de verificación a O; proximidad al límite a E. El evento persistido contiene destinatario, tipo, recurso y estado de entrega. Reintentos no deben crear avisos duplicados perceptibles. La bandeja o consulta de operación mantiene acceso al estado cuando un canal push falla.

**Cortes de reportes:** período inclusivo de inicio y exclusivo de fin; contar unidades confirmadas entregadas/recibidas por fecha de confirmación, pendientes por estado actual y pérdidas como cantidades vencidas/retiradas no aprovechadas registradas. No se atribuirá a donación entregada una mera aceptación.

| Prueba | Entrada / condición | Resultado esperado |
| --- | --- | --- |
| T-01 | C intenta crear publicación | 403, sin escritura. |
| T-02 | Venta sin descuento válido | 400 y errores de campo, sin activación. |
| T-03 | Dos C reservan la última unidad a la vez | Una asignación; la otra 409; disponible nunca negativo. |
| T-04 | Reintento de reserva con misma clave/cuerpo | Mismo resultado, una sola reserva. |
| T-05 | O pendiente intenta aceptar donación | 403, cantidad intacta. |
| T-06 | E cambia precio tras una reserva | La reserva conserva el precio original acordado. |
| T-07 | Lote vence antes de su actualización programada | Nueva aceptación rechazada por fecha; operación pendiente finaliza como vencida. |
| T-08 | Canal de avisos falla después de aceptar donación | Aceptación persiste; aviso queda pendiente para reintento. |

**Reglas operativas acordadas para el MVP.** Un consumidor u organización cancela antes del inicio de la ventana; el establecimiento puede cancelar con motivo y aviso a la contraparte. El cierre normal confirma la cantidad completa. Una entrega parcial o tardía genera incidencia para revisión administrativa; no se registra una entrega completa ficticia ni se reabre automáticamente un vencimiento. La resolución excepcional detallada queda pendiente. Se permite solicitar de 1 unidad hasta el disponible, sin máximo universal inicial.

**Catálogo y responsables.** La categoría se selecciona de un catálogo controlado; sus valores iniciales serán validados por el equipo. Cada establecimiento u organización tendrá un responsable principal y podrá tener responsables autorizados, con autoría registrada.

**Verificación.** La organización informa nombre, responsable y contacto, dirección y actividad. El administrador revisa, puede solicitar evidencia adicional y registra decisión y motivo de rechazo. La evidencia concreta se definirá antes del piloto.

**Configuración inicial y pendientes.** La alerta se genera dos horas antes del límite por defecto, con umbral configurable. Los avisos permanecen en la plataforma; push móvil se incorpora tras configurar el proveedor. Quedan por acordar el proveedor, las categorías iniciales, la resolución de incidencias de entrega, el plazo de retención y los campos finales de reportes.
