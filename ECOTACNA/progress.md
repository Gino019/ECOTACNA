# Estado del Avance del Proyecto (progress.md)

**Proyecto**: ECO_TACNA — Gestión de Recojo de Aceite Usado  
**Versión**: 1.1.0-MVP  
**Última actualización**: 2026-05-26

---

## 1. Resumen General del Proyecto

**ECO_TACNA** es un sistema web desarrollado con Spring Boot, JPA/Hibernate y arquitectura MVC, orientado a la gestión del recojo de aceite usado entre empresas generadoras y empresas recolectoras. El MVP actual prioriza solicitudes de recojo, estados operativos, paneles por rol, unidades vehiculares del recolector, suscripción mensual y administración básica.

---

## 2. Resumen General del Progreso (por fases)

| Módulo / Fase | Estado | Progreso % | Descripción |
| :--- | :---: | :---: | :--- |
| **Fase 1: Ajuste de alcance y documentación** | Completado | 100% | Se actualizaron todos los documentos técnicos: `spec.md`, `SSD.md`, `tasks.md`, `architecture.md`, `security.md`, `database.md`, `api-design.md` y `progress.md`. |
| **Fase 2: Configuración base Spring Boot + JPA** | En progreso | 80% | Inicialización del proyecto, dependencias y configuración base de seguridad. |
| **Fase 3: Modelo de dominio de recojo** | En progreso | 50% | Definición inicial de entidades `Company`, `PickupRequest`, `TransportUnit`, `AuditLog`. |
| **Fase 4: Gestión de empresas** | En progreso | 40% | Implementación de registro y administración de roles `GENERADOR` y `RECOLECTOR`. |
| **Fase 5: Solicitudes de recojo y estados** | En progreso | 30% | Lógica transaccional base y modelo de estados del recojo. |
| **Fase 6: Panel recolector y unidades vehiculares** | En progreso | 20% | Base lógica para registrar y vincular unidades vehiculares a la empresa recolectora autenticada. |
| **Fase 7: Modelo de suscripción mensual** | Pendiente | 0% | Lógica para restringir operaciones si la suscripción está PENDIENTE, VENCIDA o SUSPENDIDA. |
| **Fase 8: Seguridad y Contratos API** | Completado | 100% | Filtros JWT, asignación de permisos según rol, limpieza de DTOs y alineación de contratos finales. |
| **Fase 9: Seeds y Configuración** | Completado | 100% | Creación de usuarios y empresas de prueba con suscripción ACTIVA. Sin seeds B2B. |
| **Fase 10: Pruebas Backend** | Completado | 100% | Pruebas de integración para placa única, suscripciones, flujo completo de solicitud y restricciones RBAC. |

| **Fase 11: Base de Datos y API Design** | Completado | 100% | Documentación técnica base de datos y diseño de API actualizados al backend real. |
| **Fase 13: Refactorización Frontend** | Completado | 100% | Eliminación de vistas React obsoletas, actualización de servicios API, y creación de formulario de "Mis Unidades". |
| **Fase 14: Verificación Final y Criterios de Aceptación** | Completado | 100% | Pruebas de integración aprobadas (`BUILD SUCCESS`), criterios del MVP validados, ausencia de módulos legacy confirmada. |

**Progreso global estimado del MVP**: **100%** (Reestructuración de alcance finalizada; documentación técnica completada; backend estabilizado y validado; frontend refactorizado. MVP Listo).

---

## 3. Estado de los Entregables Específicos

### 3.1. Documentación técnica (raíz del proyecto)

| Entregable | Estado | Notas |
| :--- | :---: | :--- |
| `spec.md` | Actualizado | Enfoque de recojo, seguimiento operativo, suscripción mensual y unidades vehiculares. |
| `SSD.md` | Actualizado | Lineamientos base del MVP orientados al recojo de aceite usado. |
| `tasks.md` | Actualizado | Roadmap ajustado al nuevo alcance operativo. |
| `architecture.md` | Actualizado | Arquitectura MVC, flujo transaccional y unidades vehiculares. |
| `security.md` | Actualizado | Matriz RBAC alineada a ADMIN, GENERADOR y RECOLECTOR, con unidades vehiculares y suscripción mensual. |
| `database.md` | Actualizado | Creado a partir del modelo de datos real ya limpio de B2B. |
| `api-design.md` | Actualizado | Creado a partir de los controladores reales y endpoints expuestos sin rutas comerciales. |
| `progress.md` | Actualizado | Este documento refleja el avance real del nuevo alcance. |

### 3.2. Backend — Core Operativo de Recojo

| Componente | Estado | Detalle |
| :--- | :---: | :--- |
| Entidades JPA core | En progreso | Requerido refactorizar `Company` (estado de suscripción), `PickupRequest` y crear `TransportUnit`. |
| Control transaccional | En progreso | Implementación de transiciones de estado de `PENDIENTE` a `COMPLETADO`. |
| Unidades Vehiculares | En progreso | Lógica de validación de placas únicas, capacidades mayores a cero y vinculación con la empresa recolectora autenticada. |
| Suscripción Mensual | Pendiente | Validaciones a nivel de servicio para restringir operaciones cuando la suscripción esté PENDIENTE, VENCIDA o SUSPENDIDA. |
| Auditoría Básica | En progreso | Ajuste del `AuditLog` para enfocarlo en estados operativos y no en compras de stock. |

### 3.3. Pruebas y herramientas

| Entregable | Estado | Detalle |
| :--- | :---: | :--- |
| Pruebas Unitarias/Integración | Completado | Se implementaron pruebas de integración en `BackendIntegrationTest.java` cubriendo placa única, capacidades y reglas de negocio. |
| Pruebas Transaccionales | Completado | Se validaron los fallos y rollbacks ante cambios de estados y asignaciones inválidas. |
| Colección Postman | Pendiente | Reconstruir colección basada en el ciclo completo de recojo operativo (opcional ya que hay test de integración automatizado). |

### 3.4. Frontend (`src/main/resources/static`)

| Entregable | Estado | Detalle |
| :--- | :---: | :--- |
| Limpieza de Interfaces | En progreso | Remover catálogos de lotes, menús comerciales y vistas antiguas no alineadas al MVP. |
| Panel de unidades vehiculares | En progreso | Debe permitir visualizar unidades del recolector y registrar nuevas unidades desde “Mis unidades”. |
| Formulario de unidad vehicular | Pendiente | Debe solicitar placa, modelo, capacidad en litros, tipo, estado y observación opcional. |
| Seguimiento operativo | En progreso | La pantalla debe mostrar estados e historial de solicitud sin módulo independiente adicional; el avance se maneja como estado e historial de solicitud. |

---

## 4. Bitácora de Actividades Recientes

| Fecha | Actividad |
| :--- | :--- |
| **2026-05-26** | **Cambio estratégico de alcance**: Se descartó la funcionalidad de marketplace y comercio B2B (compra/venta de lotes, roles transaccionales y bloqueo pesimista). |
| **2026-05-26** | Actualización integral de `spec.md` para centrar el sistema en las solicitudes de recojo de aceite usado y gestión de unidades vehiculares. |
| **2026-05-26** | Actualización de `SSD.md` definiendo las directrices arquitectónicas para el nuevo MVP operativo de recojo. |
| **2026-05-26** | Reestructuración de `tasks.md` introduciendo un nuevo roadmap de 10 fases enfocado en seguimiento operativo, unidades vehiculares y suscripciones mensuales. |
| **2026-05-26** | Ajuste en `architecture.md` para documentar la validación transaccional de estados de recojo y despliegue del panel Mis unidades. |
| **2026-05-26** | Actualización de `progress.md` reduciendo el avance estimado global debido a las refactorizaciones pendientes generadas por el cambio de alcance. |
| **2026-05-26** | **Fase 8 completada**: Limpieza de DTOs, ajuste de controladores, validación de contratos finales API y compilación exitosa sin módulos antiguos. |
| **2026-05-26** | **Fase 9 completada**: Configuración de seeds y bootstrap con usuarios mínimos (Admin, Generador, Recolector) y empresas de prueba con suscripción ACTIVA. Proyecto compila y levanta correctamente. |
| **2026-05-26** | **Fase 10 completada**: Creación de `BackendIntegrationTest.java` cubriendo pruebas automatizadas de validación de unidad, suscripciones y roles. Se reparó bug de asignación de recolector. |
| **2026-05-26** | **Fase 11 completada**: Creación de los archivos finales `database.md` y `api-design.md` estrictamente alineados al backend y libres de remanentes B2B, culminando también la Fase 1. |
| **2026-05-26** | **Fase 12 completada**: Preparación para integración con frontend lista, con el mapeo detallado de endpoints finales redactado en `api-integration-guide.md` dentro de la carpeta frontend. |

---

## 5. Próximos pasos recomendados

1. **Ajuste de frontend**: Implementar o terminar el apartado `Mis unidades` con formulario para placa, modelo, capacidad en litros, tipo, estado y observación.
6. **Pruebas del flujo principal**: Validar registro, aprobación, suscripción activa, solicitud de recojo, inicio de ruta, confirmación de recojo y cierre operativo.
7. **Preparación de demo**: Preparar una demostración enfocada en generador, recolector, administrador, unidades vehiculares y seguimiento operativo.
