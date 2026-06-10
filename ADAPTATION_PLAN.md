# Plan de Adaptación Backend - EcoTacnaSpringBootJPA

## 1. Objetivo del plan
Definir la estrategia definitiva de refactorización limpia para adaptar el backend EcoTacnaSpringBootJPA al MVP actual de ECO_TACNA, eliminando todo código fuera de alcance y conservando únicamente los componentes necesarios para recojo de aceite usado, seguimiento operativo, unidades vehiculares, suscripción mensual, validación administrativa, auditoría básica, Spring Boot + JPA, MVC y Spring Security + JWT.

**Regla de Oro**: Si una clase, enum, DTO, repositorio, servicio, controlador, ruta, configuración, seed, test o dependencia no pertenece al MVP actual definido por los 6 documentos oficiales, debe eliminarse completamente junto con todas sus referencias.

## 2. Fuente de verdad documental
Los únicos documentos oficiales que rigen este plan son:
- `SSD.md`
- `spec.md`
- `architecture.md`
- `security.md`
- `tasks.md`
- `progress.md`

Los archivos `database.md` y `api-design.md` no son fuente de verdad todavía. Quedan pendientes de actualización posterior, una vez limpio el backend y definido el contrato API real.

## 3. Diagnóstico general del proyecto actual
El backend actual mezcla funcionalidad básica del recojo con modelos de negocio de compra/venta (Marketplace B2B) e integraciones externas (SUNAT). Todo este código excedente interfiere con el MVP actual y debe erradicarse bajo una política de eliminación limpia.

## 4. Mapa de alineación contra el MVP actual

### 4.1. Elementos ya alineados
- Arquitectura MVC con Spring Boot, JPA y JWT.
- Base para roles `ROLE_ADMIN`, `ROLE_GENERADOR`, `ROLE_RECOLECTOR`.
- Tipos de empresa base: `GENERADORA`, `RECOLECTORA`.
- Entidades base: `User`, `Company`, `PickupRequest`, `TransportUnit`, `AuditLog`.

### 4.2. Elementos parcialmente alineados
- **Módulo de Recojo (`PickupRequest`)**: Requiere estandarizar transiciones, seguimiento operativo e historial de estados.
- **Unidades Vehiculares (`TransportUnit`)**: Debe vincularse automáticamente a la empresa autenticada, controlando placas mayúsculas y capacidad.
- **Suscripciones**: El modelo de acceso debe validar un estado `ACTIVA`, `PENDIENTE`, `VENCIDA`, o `SUSPENDIDA`.

### 4.3. Elementos desalineados
- **Seguridad**: Existen rutas con roles ajenos y accesos que violan el nuevo esquema.
- **Estados de recojo**: Uso de estados no reconocidos en el flujo actual.

### 4.4. Elementos fuera de alcance
- Comercio B2B (Marketplace), liquidaciones, módulos independientes de seguimiento fuera del flujo operativo, pasarelas de pago, SUNAT, geolocalización.

## 5. Inventario técnico encontrado (Clasificación Definitiva)

### 5.1. Entidades y enums
- **Conservar**:
  - `User`
- **Adaptar**:
  - `Company`
  - `Role`
  - `CompanyType`
  - `PickupRequest`
  - `PickupRequestStatus`
  - `TransportUnit`
  - `TransportStatus`, solo si representa estados de unidad vehicular; si no, eliminar y crear/usar un enum claro.
  - `SubscriptionStatus`, si no existe, crearlo.
  - `AuditLog`
- **Eliminar**:
  - `OilLot`
  - `Lot`
  - `LotStatus`
  - `Order`
  - `OrderStatus`
  - `Liquidation`
  - `LiquidationStatus`
  - `Certificate`
  - `Buyer`
  - `Seller`
  - `Marketplace`
  - `OilCollection`, salvo que al revisar el código se determine que contiene lógica indispensable; en ese caso, migrar esa lógica a `PickupRequest` o servicios de recojo y eliminar la clase antigua.
  - `AuthorizedAdminEmail`, si solo existe para una tabla extra de correos autorizados.

### 5.2. Repositorios
- **Conservar**:
  - `AuditLogRepository`
  - `UserRepository`
- **Adaptar**:
  - `CompanyRepository`
  - `PickupRequestRepository`
  - `TransportUnitRepository`
- **Eliminar**:
  - Todos los asociados a entidades marcadas para eliminación en la sección 5.1.

### 5.3. Servicios
- **Conservar**:
  - Ningún servicio actual sin revisión.
- **Adaptar**:
  - `AuthService`
  - `PickupRequestService`
  - `TransportUnitService`
  - `AuditLogService`
  - Servicios administrativos relacionados al MVP.
- **Eliminar**:
  - `TraceabilityService`
  - Servicios relacionados a SUNAT, liquidaciones, lotes, órdenes, comercio, pagos comerciales, certificados externos o módulos independientes fuera del flujo operativo.

### 5.4. Controladores
- **Conservar**: Ninguno de los actuales sin requerir adaptación profunda.
- **Adaptar**:
  - `AuthController`
  - `PickupRequestController`
  - `TransportUnitController`
  - Controladores administrativos del MVP.
- **Eliminar**:
  - `TraceabilityController`
  - `SunatApiController`
  - Controladores relacionados a lotes, órdenes, pagos.

### 5.5. DTOs
- **Conservar**: Ninguno de los actuales sin requerir revisión.
- **Adaptar**:
  - DTOs de autenticación, usuario, empresa, solicitud de recojo, unidad vehicular, suscripción y auditoría.
- **Eliminar**:
  - Todo DTO asociado a entidades comerciales, pagos o DTOs de seguimiento antiguo fuera del MVP.

### 5.6. Seguridad
- **Conservar**: Estructura general de autenticación.
- **Adaptar**:
  - Rutas para roles `ROLE_ADMIN`, `ROLE_GENERADOR`, `ROLE_RECOLECTOR`.
- **Eliminar**:
  - Rutas para `ROLE_BUYER`, `ROLE_SELLER`, `BUYER`, `SELLER`.

## 6. Riesgos de refactorización
- **Ruptura de compilación**: La eliminación masiva romperá clases transversales como Mappers, Controllers o Configuraciones si no se limpian en cascada. El proyecto debe cerrar cada fase compilando; de lo contrario, la fase no está terminada.

## 7. Estrategia recomendada
Adoptar la siguiente estrategia de **eliminación limpia y refactorización directa**:
1. Respaldar el proyecto.
2. Identificar referencias a módulos fuera del MVP.
3. Eliminar enums y roles no válidos.
4. Eliminar en cascada módulos B2B y externos.
5. Consolidar entidades del nuevo dominio.
6. Consolidar servicios y controladores del flujo de recojo.
7. Consolidar unidades vehiculares.
8. Consolidar suscripción mensual.
9. Ajustar seguridad.
10. Validar compilación.
11. Actualizar `database.md` y `api-design.md`.
12. Preparar integración con frontend.

*Nota de política*: Todo elemento fuera del MVP debe eliminarse en cascada, revisando y limpiando: clase Java, imports, inyecciones por constructor, repositorios, servicios, controladores, DTOs, mappers, excepciones específicas, enums, rutas de SecurityConfig, seeds/bootstrap, tests, referencias en application.properties, colecciones Postman si existen, referencias en documentación pendiente. No se debe eliminar una clase dejando referencias rotas.

## 8. Fases de adaptación

### Fase 0: respaldo y diagnóstico final
- Crear rama o respaldo.
- Ejecutar compilación inicial.
- Registrar errores actuales si existen.
- Listar archivos con términos prohibidos.

### Fase 1: limpieza de enums, roles y tipos base
- Limpiar `Role`.
- Limpiar `CompanyType`.
- Limpiar `PickupRequestStatus`.
- Crear o adaptar `SubscriptionStatus`.
- El proyecto debe compilar al final de esta fase. Si aparecen referencias a roles o tipos eliminados, deben corregirse dentro de la misma fase antes de avanzar.

### Fase 2: eliminación en cascada de módulos fuera del MVP
- Eliminar módulos de lotes, órdenes, marketplace, SUNAT, pagos, liquidaciones, certificados externos y módulos independientes de seguimiento fuera del MVP.
- Eliminar entidades, repositorios, servicios, controladores, DTOs, tests y rutas asociadas.
- Limpiar imports e inyecciones.
- El proyecto debe compilar al final.

### Fase 3: consolidación del dominio MVP
- Adaptar `Company`.
- Adaptar `PickupRequest`.
- Adaptar `TransportUnit`.
- Adaptar `AuditLog`.
- Asegurar relaciones JPA.
- El proyecto debe compilar al final.

### Fase 4: servicios de negocio del flujo de recojo
- Crear/adaptar lógica de solicitud.
- Crear/adaptar cambios de estado.
- Crear/adaptar confirmación con volumen real.
- Crear/adaptar historial de estados o auditoría.
- El proyecto debe compilar al final.

### Fase 5: unidades vehiculares
- Crear/adaptar CRUD de unidades.
- Vincular a empresa recolectora autenticada.
- Validar placa única y capacidad mayor a cero.
- Proteger propiedad por recolector.
- El proyecto debe compilar al final.

### Fase 6: suscripción mensual
- Validar `SubscriptionStatus`.
- Restringir operaciones principales si no está `ACTIVA`.
- Agregar administración de suscripciones.
- El proyecto debe compilar al final.

### Fase 7: seguridad y RBAC
- Actualizar `SecurityConfig`.
- Quitar rutas eliminadas.
- Proteger rutas válidas por rol.
- Validar acceso a unidades por empresa.
- El proyecto debe compilar al final.

### Fase 8: contratos API y DTOs finales
- Limpiar DTOs.
- Ajustar controladores.
- Garantizar contratos esperados por frontend.
- El proyecto debe compilar al final.

### Fase 9: seeds, bootstrap y configuración
- Crear usuarios mínimos si aplica.
- Configurar empresas de prueba con suscripción `ACTIVA`.
- Evitar seeds B2B.
- El proyecto debe compilar y levantar.

### Fase 10: pruebas backend
- Probar placa única.
- Probar capacidad > 0.
- Probar suscripción no activa.
- Probar flujo completo de solicitud.
- Probar RBAC.
- Probar unidad vinculada a recolector autenticado.

### Fase 11: actualizar `database.md` y `api-design.md`
- Actualizar según el backend real ya limpio.
- No basarse en documentos viejos.

### Fase 12: preparación para integración con frontend
- Documentar contratos finales.
- Identificar endpoints para EcoTacnaFrontend.
- No modificar frontend todavía.

## 9. Orden exacto recomendado de trabajo
Las fases deben ejecutarse de manera lineal, desde la Fase 0 hasta la Fase 12. Cada iteración garantiza que el código fuente y las configuraciones no arrastran deuda, manteniendo la compilación estable al cierre de cada tarea.

## 10. Archivos candidatos a modificar
- Todo componente del backend que permanezca en la lista "Adaptar". Especialmente Enums base, Entidades (Company, PickupRequest, TransportUnit), Configuración de Seguridad y los flujos de servicio principales de solicitudes de recojo, unidades vehiculares, suscripción mensual y seguimiento operativo.

## 11. Archivos candidatos a eliminar
Todo archivo relacionado al comercio B2B, pagos comerciales, SUNAT, lotes, órdenes, certificados externos o seguimiento antiguo fuera del MVP se elimina directamente bajo la política de eliminación limpia.

## 12. Contratos API propuestos
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/empresa/solicitudes`
- `POST /api/empresa/solicitudes`
- `PUT /api/empresa/solicitudes/{id}/cancelar`
- `GET /api/empresa/solicitudes/{id}/historial`
- `GET /api/recolector/recojos`
- `PUT /api/recolector/recojos/{id}/en-ruta`
- `PUT /api/recolector/recojos/{id}/confirmar`
- `GET /api/recolector/unidades`
- `POST /api/recolector/unidades`
- `PUT /api/recolector/unidades/{id}`
- `GET /api/admin/empresas`
- `PUT /api/admin/empresas/{id}/aprobar`
- `PUT /api/admin/empresas/{id}/rechazar`
- `GET /api/admin/solicitudes`
- `GET /api/admin/unidades`
- `GET /api/admin/suscripciones`
- `PUT /api/admin/suscripciones/{empresaId}`

*(Nota: Rutas de `/api/lots`, `/api/orders`, `/api/trazabilidad`, `/api/sunat`, `/api/pagos`, liquidaciones y certificados quedan eliminadas por completo)*.

## 13. Pruebas mínimas obligatorias
- Registro exitoso de unidad vehicular con placa única/mayúscula y capacidad > 0.
- Fallo esperado al registrar una placa duplicada.
- Fallo esperado al registrar una unidad vehicular con capacidad menor o igual a cero.
- Fallo esperado cuando un recolector intenta crear una unidad vehicular enviando manualmente un `empresaId` de otra empresa.
- Restricción de acceso para un recolector tratando de ver unidades de otro recolector.
- Fallo esperado al solicitar recojo con suscripción no ACTIVA.
- Transición de recojo hasta COMPLETADO con volumen registrado y seguimiento operativo consolidado.
- RBAC operativo sobre las rutas válidas.

## 14. Criterios de aceptación para considerar la adaptación terminada
- El backend compila limpio.
- No existen clases activas ni inactivas relacionadas con lotes, órdenes, marketplace, SUNAT, módulos antiguos de seguimiento fuera del MVP, liquidaciones comerciales, certificados externos o pagos comerciales.
- No existen roles `BUYER` ni `SELLER`.
- No existe `CompanyType.COMERCIAL`.
- No existen rutas `/api/lots`, `/api/orders`, `/api/sunat`, `/api/trazabilidad`, `/api/pagos`.
- Existen rutas válidas para auth, solicitudes, recojos, unidades vehiculares, admin y suscripciones.
- Las unidades vehiculares se vinculan a la empresa recolectora autenticada.
- Las operaciones principales validan suscripción `ACTIVA`.
- El seguimiento se maneja mediante estado e historial, no por módulo independiente.
- `database.md` y `api-design.md` quedan actualizados al final.
- El backend queda listo para integración con EcoTacnaFrontend.

## Preparación para integración con EcoTacnaFrontend
El frontend necesitará integrarse con los contratos finales del backend:
- **Login y Autenticación**: Autenticación vía JWT.
- **Usuario autenticado**: Extracción de rol y tipo de empresa.
- **Solicitudes del generador**: Creación de `PickupRequest` sujeta a verificación de suscripción.
- **Recojos del recolector**: Listado y atención de solicitudes.
- **Unidades vehiculares**: CRUD interno para gestionar transporte.
- **Administración general**: Listado de empresas, unidades y control de suscripciones.
- **Seguimiento operativo**: Recuperación del historial de estados de la solicitud sin depender de un módulo independiente adicional; el avance se consulta mediante seguimiento operativo e historial de estados.

## Reglas para ejecutar este plan
- Ejecutar una fase por prompt.
- Antes de modificar, listar archivos que se tocarán.
- Después de modificar, compilar.
- Si no compila, corregir dentro de la misma fase antes de avanzar.
- No conservar código fuera del MVP.
- No crear paquetes legacy.
- No comentar código muerto.
- No dejar endpoints antiguos.
- No dejar servicios sin uso.
- No dejar repositorios sin entidad.
- No dejar DTOs sin controlador.
- No dejar tests de módulos eliminados.
- No usar `database.md` ni `api-design.md` como fuente de verdad hasta actualizarlos.
- Mantener alineación estricta con los 6 documentos oficiales.

## 15. Siguiente prompt recomendado para ejecutar la Fase 0
```text
Ejecuta únicamente la Fase 0 del ADAPTATION_PLAN.md. No modifiques lógica todavía. Crea respaldo o confirma rama de trabajo, ejecuta compilación inicial, lista errores actuales, y genera un inventario exacto de archivos que contienen términos o módulos fuera del MVP: BUYER, SELLER, COMERCIAL, OilLot, Order, Liquidation, Certificate, Traceability, Sunat, Lot, Stock, Marketplace, /api/lots, /api/orders, /api/sunat, /api/trazabilidad y /api/pagos. Al terminar, no avances a Fase 1 hasta que yo lo apruebe.
```
