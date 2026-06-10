# Roadmap y Tareas de Desarrollo (tasks.md)

**Proyecto**: ECO_TACNA - Gestión de Recojo de Aceite Usado
**Versión**: 1.1.0-MVP
**Arquitectura**: MVC en Spring Boot

---

## 1. Roadmap del Proyecto

| Fase | Descripción | Estado |
| :--- | :--- | :---: |
| Fase 1 | Ajuste de alcance y documentación según observación docente | En progreso |
| Fase 2 | Configuración base Spring Boot + JPA | En progreso |
| Fase 3 | Modelo de dominio de recojo de aceite usado | En progreso |
| Fase 4 | Gestión de empresas generadoras y recolectoras | En progreso |
| Fase 5 | Solicitudes de recojo y estados operativos | En progreso |
| Fase 6 | Panel recolector: recojos y unidades vehiculares | En progreso |
| Fase 7 | Modelo de suscripción mensual | Pendiente |
| Fase 8 | Seguridad por roles y validación administrativa | En progreso |
| Fase 9 | Frontend, formularios y limpieza de pantallas | En progreso |
| Fase 10 | Pruebas, demo y Postman del flujo principal | Pendiente |

---

## 2. Lista de Tareas (checklist)

### 2.1. Documentación del Proyecto
- [x] Actualizar el Sistema de Especificación Documental (`SSD.md`) al enfoque de recojo.
- [x] Actualizar la especificación de requerimientos (`spec.md`) alineada al nuevo alcance de recojo y modelo de suscripción mensual.
- [x] Actualizar y reestructurar la planeación del roadmap en `tasks.md`.
- [x] Adaptar el documento de arquitectura (`architecture.md`) para documentar el flujo MVC de recojo, el manejo transaccional de estados operativos y la seguridad RBAC.
- [x] Adaptar el modelo de seguridad (`security.md`) eliminando roles y rutas comerciales.
- [ ] Adaptar el esquema de base de datos (`database.md`), removiendo tablas y campos comerciales B2B y agregando unidades vehiculares y campos de suscripción.
- [ ] Refactorizar el diseño de endpoints (`api-design.md`) eliminando rutas comerciales y documentando rutas del flujo de recojo, unidades vehiculares y suscripción.
- [x] Revisar `progress.md` para que refleje el avance real después de los ajustes finales.

### 2.2. Backend: Modelo de Dominio y JPA
- [ ] Implementar o refactorizar entidades básicas de negocio:
  - `User` y `Company` (con estados de habilitación y CompanyType `GENERADORA`/`RECOLECTORA`).
  - `PickupRequest` (Solicitud de recojo: volumen estimado, dirección, fecha programada, estado, observaciones).
  - `TransportUnit` / `UnidadVehicular` / `Vehicle` (Unidades vehiculares: placa, modelo, capacidad en litros, tipo, estado y observación. Debe quedar vinculada a la empresa recolectora autenticada).
  - `AuditLog` (Bitácora de auditoría inmutable).
- [ ] Crear interfaces de persistencia de Spring Data JPA (`Repository`) para todas las entidades físicas.
- [ ] Configurar restricciones de integridad: placa única en base de datos, capacidad vehicular $> 0.0$ y volumen aproximado $> 0.0$.

### 2.3. Backend: Lógica de Recojo, Unidades Vehiculares y Suscripciones
- [ ] **Módulo de Recojo**:
  - Implementar lógica transaccional de transiciones de estados: `PENDIENTE` $\rightarrow$ `PROGRAMADO` $\rightarrow$ `EN_RUTA` $\rightarrow$ `RECOGIDO` $\rightarrow$ `COMPLETADO`.
  - Crear lógica de cancelación de solicitudes con justificación operativa por generador o recolector.
  - Implementar la confirmación del recojo forzando el registro de volumen real recolectado en litros ($> 0.0$).
- [ ] **Módulo de Unidades Vehiculares**:
  - [ ] Implementar el apartado `Mis unidades` en el panel del recolector, si aún no está completo.
  - [ ] Agregar botón visible `Agregar unidad`, `Nueva unidad` o `Registrar unidad vehicular`.
  - [ ] Crear formulario con placa, modelo, capacidad en litros, tipo, estado y observación.
  - [x] Culqi Preparation
  - [x] Crear endpoints dummy
  - [x] Configurar mock sandbox
  - [x] Preparar base para pagosd mayor a cero.
  - [ ] Guardar cada unidad vinculada automáticamente a la empresa recolectora autenticada.
  - [ ] Impedir que un recolector registre, visualice o modifique unidades de otra empresa.
- [ ] **Módulo de Suscripción**:
  - Agregar campo/entidad para controlar el estado interno de la suscripción mensual (`ACTIVA`, `PENDIENTE`, `VENCIDA`, `SUSPENDIDA`).
  - Lógica para impedir la creación de solicitudes si el generador tiene la suscripción `VENCIDA`, `PENDIENTE` o `SUSPENDIDA`.
  - Endpoint o acción administrativa para registrar internamente la renovación o cambio de estado de las suscripciones.

### 2.4. Seguridad por Roles y Validación Administrativa
- [ ] Configurar el filtro de seguridad HTTP de Spring Security con JWT.
- [ ] Mapear los roles del sistema: `ROLE_ADMIN`, `ROLE_GENERADOR`, `ROLE_RECOLECTOR`.
- [ ] Proteger rutas y endpoints críticos asociados a administración, solicitudes de empresas generadoras, recojos del recolector y unidades vehiculares.
- [ ] Setup del bootstrap de administrador del sistema (`ROLE_ADMIN`) y asignación de permisos para aprobación de empresas y revisión general.

### 2.5. Frontend y Usabilidad
- [ ] Limpiar vistas estáticas (`index.html`, `dashboard.html`):
  - Eliminar secciones de catálogos comerciales, compras de stock, filtros de lotes y vistas de pedidos comerciales.
  - Adecuar KPIs de paneles generador, recolector y administrador al enfoque operativo.
- [ ] Desarrollar la vista "Mis unidades" dentro del panel del recolector:
  - Formulario sencillo con placa, modelo, capacidad en litros, tipo, estado, observación opcional.
  - Botón visible para agregar nuevas unidades vehiculares y refrescar dinámicamente el listado de unidades vehiculares registradas.

### 2.6. Pruebas y Postman
- [ ] Desarrollar pruebas unitarias de persistencia JPA para validar no duplicidad de placas y capacidades de las unidades vehiculares $> 0.0$.
- [ ] Desarrollar pruebas de integración transaccional en el ciclo de cambio de estados del recojo.
- [ ] Crear/actualizar colección Postman documentando el flujo de fin a fin (`registro -> aprobación administrador -> suscripción activa -> solicitud de recojo -> registro de unidad vehicular -> inicio de ruta -> confirmación del recojo -> cierre operativo`).

---

## 3. Posible Evolución Futura (Fuera de Alcance del MVP)

* **Módulo de Comercio B2B (Marketplace)**: Posible evolución futura para comercialización de derivados o lotes procesados, fuera del MVP actual.
* **Integración de APIs Gubernamentales**: Posible integración futura con SUNAT, fuera del MVP actual.
* **Pasarelas de Pago**: Posible integración futura para automatizar el cobro de suscripciones, fuera del MVP actual.
* **Geolocalización Automatizada**: Posible integración futura con mapas y rutas, fuera del MVP actual.
