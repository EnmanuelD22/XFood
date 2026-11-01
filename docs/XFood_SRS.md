# XFood | Especificación de Requisitos de Software
Versión 2.0 · Línea base propuesta · 30 de octubre de 2026

## 1. Propósito y alcance
Este SRS establece **qué debe hacer** la primera versión funcional de XFood y bajo qué condiciones debe operar. Sus requisitos verificables son la referencia para implementación, pruebas y aceptación. Los contratos detallados de comportamiento se encuentran en el documento de especificaciones; la estructura técnica, en el documento de arquitectura.

XFood conecta establecimientos que disponen de alimentos excedentes aptos para consumo con consumidores que los reservan a precio reducido y organizaciones verificadas que reciben donaciones. La recogida ocurre en el establecimiento. La versión inicial incluye cuentas por rol, establecimientos, publicaciones, búsqueda por cercanía, reservas, donaciones, entrega, notificaciones, alertas por fecha límite, administración y reportes básicos. Se orienta a un piloto en República Dominicana, en español y con precios en RD$.

**Fuentes y precedencia.** El BRD XFood (11/10/2026) aporta alcance y códigos RF-01 a RF-14; la Actividad Scrum XFood (25/10/2026) aporta épicas E-01 a E-04 e historias HU-01 a HU-04; la Propuesta XFood aporta detalles de flujo compatibles. Ante diferencias, prevalece el alcance del BRD y las decisiones de arquitectura indicadas para esta revisión.

## 2. Contexto del producto
La aplicación móvil sirve a consumidores y organizaciones beneficiarias; el panel web sirve a establecimientos y administradores. Ambos clientes consumen operaciones del mismo sistema. Los actores externos son un proveedor de mapas/geocodificación y un canal de notificaciones, sujetos a disponibilidad y configuración. XFood no inspecciona alimentos ni organiza transporte.

| Actor | Necesidad y acceso principal |
| --- | --- |
| Consumidor | Consultar ofertas de venta, reservar unidades y seguir su recogida. |
| Establecimiento | Mantener su perfil, publicar lotes, gestionar reservas y donaciones, confirmar entregas. |
| Organización beneficiaria | Presentar datos para verificación; consultar y aceptar donaciones una vez aprobada; confirmar recepción. |
| Administrador | Verificar organizaciones, supervisar cuentas/publicaciones/incidencias y consultar indicadores. |

**Definiciones.** Publicación: lote con una sola modalidad, venta o donación. Disponible: unidades todavía no asignadas y dentro del horario válido. Reserva: asignación de unidades de venta a un consumidor. Aceptación de donación: asignación de unidades a una organización. Fecha límite: instante a partir del cual no se admiten nuevas asignaciones ni recogidas ordinarias.

## 3. Requisitos funcionales
Cada RF es obligatorio para el alcance descrito. Las reglas transversales de la sección 4 precisan sus límites; las historias Scrum son una muestra priorizada y no sustituyen estos requisitos.

### 3.1 Cuentas y establecimientos
**RF-01 Registro.** El sistema permitirá registrar cuentas de consumidor, establecimiento y organización con identificador de acceso único. La creación de una cuenta no verificará automáticamente a una organización. Las cuentas administrativas serán provisionadas por personal autorizado.

**RF-02 Autenticación y autorización.** El sistema permitirá iniciar y cerrar sesión; denegará credenciales inválidas y operaciones ajenas al rol o a la propiedad del recurso. Una cuenta suspendida no podrá realizar operaciones protegidas.

**RF-03 Establecimientos.** Un establecimiento podrá registrar y actualizar nombre, dirección, ubicación, contacto y estado operativo. Solo sus operadores autorizados podrán modificar su perfil y publicaciones.

### 3.2 Publicaciones y descubrimiento
**RF-04 Publicación.** Un establecimiento podrá publicar un lote con nombre, descripción, categoría, cantidad, modalidad, fecha y horario de recogida; una venta incluirá precio original y precio con descuento, y una donación no tendrá precio. El sistema validará los campos obligatorios antes de activarla.

**RF-05 Gestión de publicaciones.** El establecimiento podrá editar o desactivar sus publicaciones y señalar un lote agotado. Una publicación sin unidades disponibles, desactivada o vencida no admitirá nuevas asignaciones. Una edición no alterará las condiciones ni la cantidad comprometidas en operaciones ya creadas.

**RF-06 Consulta de ofertas.** Un consumidor podrá ver y filtrar publicaciones activas de venta y abrir su detalle, incluidos precio, unidades disponibles, establecimiento, dirección y ventana de recogida. Una organización verificada tendrá una vista separada de donaciones.

**RF-07 Ubicación.** El sistema permitirá buscar establecimientos/ofertas por ubicación y distancia. Si se deniega el permiso de ubicación, el usuario podrá indicar una zona manualmente; la búsqueda no requerirá almacenar su ubicación continua.

### 3.3 Reservas, donaciones y entregas
**RF-08 Reservas.** Un consumidor podrá reservar una cantidad disponible de una publicación de venta, consultar sus reservas y cancelarlas mientras aún sean cancelables. La creación asignará las unidades una sola vez, registrará precio y condiciones al momento de reservar y emitirá una referencia para la recogida. El establecimiento podrá confirmar la entrega; las operaciones no recogidas deberán terminar como vencidas.

**RF-09 Donaciones.** Un establecimiento podrá publicar un lote de donación. Solo una organización verificada y habilitada podrá consultar y aceptar unidades disponibles; el establecimiento conocerá la asignación. La organización podrá confirmar la recepción y ambas partes consultarán el estado. Una aceptación cancelada a tiempo liberará las unidades si el lote todavía está vigente.

**RF-10 Verificación.** El administrador podrá revisar la información presentada por una organización, aprobarla o rechazarla con un motivo registrable. Una organización pendiente, rechazada o suspendida no podrá aceptar donaciones.

**RF-11 Notificaciones.** El sistema informará a los actores involucrados sobre cambios relevantes de reservas, donaciones y verificaciones, y avisará de lotes próximos a su fecha límite. Un fallo de entrega de un aviso no revertirá una operación confirmada; el usuario podrá consultar su estado en la plataforma.

### 3.4 Supervisión e información
**RF-12 Administración.** El administrador podrá consultar y suspender cuentas, desactivar publicaciones inapropiadas y atender incidencias registradas, conservando el motivo y la autoría de sus decisiones.

**RF-13 Reportes básicos.** El establecimiento podrá consultar sus cantidades publicadas, entregadas y no aprovechadas por período; el administrador podrá consultar totales de publicaciones, reservas y donaciones. Los reportes distinguirán reservas/aceptaciones de entregas efectivamente confirmadas.

**RF-14 Alertas de seguimiento.** El sistema identificará publicaciones activas próximas a la fecha límite y con unidades sin asignar, y avisará al establecimiento como máximo una vez por umbral configurado y lote. La alerta sugerirá revisar la publicación; ninguna conversión automática a donación ocurrirá sin una acción del establecimiento.

## 4. Reglas de negocio
**RN-01 Modalidad.** Cada publicación tiene exactamente una modalidad. Para ofrecer el mismo excedente por venta y donación se crearán lotes separados, sin duplicar unidades físicas.

**RN-02 Aptitud y responsabilidad.** El establecimiento declara que el alimento es apto, describe condiciones de recogida y responde por su conservación y manipulación. La plataforma coordina operaciones y registra información; no certifica inocuidad.

**RN-03 Disponibilidad.** La cantidad inicial y cualquier ajuste serán positivos y consistentes con las unidades ya asignadas. La disponibilidad nunca será negativa. La asignación concurrente de las últimas unidades permitirá como máximo la cantidad real restante.

**RN-04 Vigencia.** No se activarán publicaciones con límite ya vencido. Transcurrido el límite, no se crearán nuevas reservas o aceptaciones. El vencimiento de operaciones pendientes y el destino de las unidades no recogidas quedarán registrados.

**RN-05 Estados.** Una reserva o aceptación terminará en entregada/recibida, cancelada o vencida. Una operación terminal no se entregará ni cancelará de nuevo. La baja de una publicación no borra el historial ni invalida entregas confirmadas.

**RN-06 Pagos.** La versión inicial no procesa pagos electrónicos ni afirma que una reserva equivale a una venta cobrada. El establecimiento indica la forma de pago aplicable en la recogida; el monto comprometido queda visible en la reserva.

**RN-07 Responsables.** Cada establecimiento y organización tendrá un responsable principal que administra los accesos y podrá tener otros responsables autorizados. Las acciones relevantes registrarán su autoría.

**RN-08 Categorías.** Cada publicación seleccionará una categoría de un catálogo controlado; la lista inicial será validada por el equipo y el administrador podrá mantenerla cuando la funcionalidad esté disponible.

**RN-09 Cancelación.** El consumidor o la organización podrán cancelar sus operaciones activas antes del inicio de la ventana de recogida. El establecimiento podrá cancelar con motivo registrado y aviso a la otra parte. Las unidades canceladas vuelven a estar disponibles solo si el lote sigue vigente y es apto para ofrecerse.

**RN-10 Entrega y excepciones.** El flujo normal confirma la cantidad completa asignada. Una entrega parcial o tardía se registrará como incidencia para revisión administrativa, sin confirmar falsamente la totalidad ni cambiar automáticamente el estado vencido. El tratamiento definitivo de la excepción queda pendiente de definición.

**RN-11 Cantidad y alertas.** Se permite solicitar desde una unidad hasta la disponibilidad; no se establece máximo universal inicial. La alerta de lote con unidades disponibles se activará dos horas antes del límite por defecto, con parámetro configurable y validación durante el piloto.

**RN-12 Verificación y avisos.** Una organización aporta nombre, responsable y contacto, dirección y descripción de actividad. El administrador revisa y puede solicitar evidencia adicional. Habrá avisos en la plataforma y push móvil para eventos relevantes una vez configurado el proveedor; un fallo del canal no revierte la operación.

## 5. Interfaces externas
**Interfaces de usuario.** La app móvil expondrá registro, mapa/lista, detalle, reservas y donaciones según rol. El panel web expondrá perfil del negocio, publicación, gestión de operaciones y administración. Ambas interfaces estarán en español y mostrarán fecha, hora y moneda de forma inequívoca.

**Interfaces de software.** Los clientes usarán una API HTTPS con datos JSON. La consulta geográfica puede apoyarse en servicios de mapa, pero la ausencia de permiso de geolocalización permitirá búsqueda manual. Las notificaciones externas son un canal complementario: el estado persistido en XFood será la referencia de verdad.

## 6. Requisitos no funcionales verificables
| ID | Requisito y criterio de aceptación |
| --- | --- |
| RNF-01 | Seguridad: contraseñas con hash apropiado, canal HTTPS y acceso por rol/propiedad; pruebas negativas de acceso cruzado. |
| RNF-02 | Rendimiento: las consultas habituales responderán en <= 3 s para el 95 % de solicitudes bajo la carga acordada del piloto; la carga se documentará antes de la prueba. |
| RNF-03 | Usabilidad: representantes de los cuatro roles completarán los recorridos centrales en pruebas observadas; los problemas y ajustes quedarán registrados. |
| RNF-04 | Compatibilidad: recorridos principales verificados en los dispositivos Android/iOS y navegadores objetivo definidos en el plan de pruebas del piloto. |
| RNF-05 | Disponibilidad: meta operativa del 99 % mensual, excluido mantenimiento anunciado; registrar indisponibilidad y verificar monitoreo. |
| RNF-06 | Integridad: ninguna ejecución concurrente podrá asignar dos veces una unidad; probar el caso de última unidad con peticiones simultáneas. |
| RNF-07 | Mantenibilidad: los módulos mantendrán interfaces explícitas y pruebas de reglas críticas; una modificación de un módulo no requerirá acceso directo a la persistencia de otro. |
| RNF-08 | Evolución: el backend podrá añadir capacidad de ejecución sin cambiar contratos de cliente ni duplicar trabajo programado; verificar en entorno de prueba si se despliega más de una instancia. |
| RNF-09 | Privacidad: solicitar datos y permiso de ubicación solo cuando sean necesarios; limitar la exposición de datos personales según rol y registrar acceso administrativo relevante. |
| RNF-10 | Recuperación: realizar respaldos y una restauración comprobada antes del piloto; registrar tiempo de recuperación y pérdida de datos observados. |


## 7. Datos, límites y aceptación
El sistema conservará cuentas y roles, establecimientos con dirección/ubicación, publicaciones y su modalidad/cantidad/fechas, reservas y aceptaciones, eventos de estado, verificaciones, incidencias y notificaciones. Guardará instantáneas de precio y condiciones relevantes para las operaciones ya aceptadas. El historial debe permitir reconstruir quién creó, cambió, canceló o confirmó una operación. La política de retención y eliminación de datos personales requiere aprobación antes del piloto.

**Fuera de alcance v1:** pasarela de pagos, reparto a domicilio, inventario empresarial completo, integraciones POS/ERP, reseñas, calificaciones, recomendaciones predictivas basadas en IA y expansión internacional. Las alertas por tiempo del RF-14 sí forman parte de v1.

**Aceptación del producto.** Se considerará cumplido el alcance cuando se demuestre con pruebas documentadas: (1) un establecimiento publica un lote válido; (2) un consumidor encuentra y reserva unidades sin sobreasignación y se registra su entrega/cancelación/vencimiento; (3) una organización verificada acepta y confirma una donación; (4) una no verificada recibe rechazo; (5) cuentas, roles, alertas y reportes básicos funcionan con los estados reales; (6) se completan pruebas RNF acordadas para el piloto.

| Épica Scrum | Requisitos BRD cubiertos |
| --- | --- |
| E-01 Gestión de inventario de vendedores | RF-03, RF-04, RF-05, RF-14 |
| E-02 Experiencia de compra del consumidor | RF-06, RF-07, RF-08 |
| E-03 Red de distribución benéfica | RF-09, RF-11 |
| E-04 Cuentas, administración y reportes | RF-01, RF-02, RF-10, RF-12, RF-13 |

**Pendientes antes del piloto:** zona y carga esperada; categorías iniciales; evidencia adicional de verificación; proveedor push; política y plazo de retención; dispositivos objetivo y política de respaldo. La alerta de dos horas es configurable y deberá validarse con los negocios.
