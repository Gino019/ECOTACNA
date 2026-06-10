# BACKEND_FINAL_VALIDATION_PROMPT.md

# Validación final Backend ECO_TACNA antes de adaptar Frontend

## Contexto

Ya se realizó una primera estabilización del backend para el MVP de ECO_TACNA.

Resumen de cambios reportados previamente:

```txt
Backend estabilizado para MVP ECO_TACNA.

Archivos modificados:
- application.properties
- SecurityConfig.java
- AdminDashboardService.java
- CompanyPortalService.java
- CompanySummaryResponse.java
- PickupConfirmationRequest.java
- PickupRequestController.java
- TransportUnitResponse.java
- ModelMapper.java
- PickupRequestService.java
- index.html
- dashboard.html
- js/dashboard.js
- docs/BACKEND_CONTRACT_MVP.md

Cambios principales:
- server.port=8082
- context-path=/ecotacna
- CORS para React local
- camelCase en contratos
- eliminación de totalIngresos
- eliminación de propiedad legacy ecotacna.liquidation.rate-per-liter
- DTO PickupConfirmationRequest para confirmar recojo usando body JSON
- capacidadLiters cambiado a capacidadLitros
- transporteId almacenado en la asignación
- flujo actualizado hacia COMPLETADO
- limpieza de frontend estático legacy del backend
- contrato oficial creado en docs/BACKEND_CONTRACT_MVP.md
```

Ahora se necesita una validación final técnica antes de adaptar el frontend React.

---

# Objetivo

Confirmar que el backend `EcoTacnaSpringBootJPA`:

```txt
compila
corre correctamente
expone los endpoints reales documentados
usa JWT correctamente
tiene CORS compatible con React local
mantiene contratos JSON coherentes
no conserva contratos legacy activos
está listo para que el frontend obedezca su contrato
```

---

# Restricción principal

No modificar todavía el frontend.

No tocar diseño.

No adaptar pantallas React.

No trabajar sobre `EcoTacnaFrontend`.

Esta tarea es únicamente para validar y, si es necesario, corregir detalles finales del backend y su documentación.

---

# Instrucciones para optimizar memoria y consumo de tokens

1. Leer primero los `.md` relevantes del proyecto.
2. Priorizar especialmente:

```txt
docs/BACKEND_CONTRACT_MVP.md
```

3. No pegar archivos completos en la respuesta.
4. No analizar carpetas pesadas o generadas:

```txt
node_modules
target
dist
.git
build
```

5. Usar búsquedas puntuales con `rg`, `grep` o búsqueda interna.
6. Revisar únicamente archivos relevantes:

```txt
Controller
Service
DTO
Entity
Enum
Repository
SecurityConfig
application.properties
docs/BACKEND_CONTRACT_MVP.md
```

7. Si encuentras una inconsistencia menor entre documentación y código, corregirla.
8. Si encuentras una inconsistencia mayor, reportarla claramente.
9. Al final responder con el formato de entregable indicado en este documento.

---

# Reglas del MVP actual

El backend debe mantener únicamente estos roles:

```txt
ADMIN
GENERADOR
RECOLECTOR
```

El backend debe mantener únicamente estos tipos de empresa:

```txt
GENERADORA
RECOLECTORA
```

No debe reactivar ni depender de:

```txt
B2B marketplace
BUYER
SELLER
lotes comerciales
órdenes de compra
pagos
liquidaciones
certificados
SUNAT
trazabilidad como módulo independiente
```

---

# Base URL oficial esperada

El backend debe correr en:

```txt
http://localhost:8082/ecotacna
```

La base API oficial debe ser:

```txt
http://localhost:8082/ecotacna/api
```

Validar que `application.properties` tenga:

```properties
server.port=8082
server.servlet.context-path=/ecotacna
```

---

# Validación 1 — Compilación

Ejecutar desde la raíz del backend:

```bash
mvn clean package -DskipTests
```

Si es posible, también ejecutar:

```bash
mvn clean test
```

Confirmar:

```txt
el proyecto compila
no hay errores Java
no hay errores de beans
no hay errores por imports faltantes
no hay errores por DTOs renombrados
no hay errores por métodos inexistentes
```

Si falla, corregir primero el backend.

---

# Validación 2 — CORS

Confirmar que `SecurityConfig.java` o la configuración correspondiente permite peticiones desde frontend local.

Orígenes mínimos permitidos:

```txt
http://localhost:5173
http://localhost:8081
http://localhost:3000
```

Métodos permitidos:

```txt
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Headers permitidos:

```txt
Authorization
Content-Type
Accept
```

Confirmar que CORS está integrado con Spring Security.

Confirmar que `Authorization` no queda bloqueado por CORS.

---

# Validación 3 — JWT Bearer

Confirmar que el login devuelve token JWT.

El backend debe aceptar autenticación mediante:

```http
Authorization: Bearer <token>
```

Validar que:

```txt
POST /api/auth/login sea público
POST /api/auth/register sea público
/api/admin/** requiera ADMIN
/api/empresa/** requiera GENERADOR
/api/recolector/** requiera RECOLECTOR
```

Confirmar que no se requiere cookie de sesión para las rutas protegidas.

El frontend futuro enviará el JWT en el header `Authorization`.

---

# Validación 4 — Endpoints reales

Revisar controllers y confirmar que estos endpoints existen realmente.

Si un endpoint usa otro método HTTP distinto al listado, actualizar `docs/BACKEND_CONTRACT_MVP.md` para que refleje exactamente el código real.

## Auth

```txt
POST /api/auth/login
POST /api/auth/register
```

## Empresa generadora

```txt
GET  /api/empresa/perfil
GET  /api/empresa/resumen
GET  /api/empresa/solicitudes
POST /api/empresa/solicitudes
```

## Recolector

```txt
GET /api/recolector/perfil
GET /api/recolector/resumen
GET /api/recolector/solicitudes
GET /api/recolector/transportes
GET /api/recolector/unidades
POST /api/recolector/unidades
PUT /api/recolector/unidades/{id}
PUT /api/recolector/recojos/{id}/en-ruta
PUT /api/recolector/recojos/{id}/confirmar
```

## Admin

```txt
GET /api/admin/resumen
GET /api/admin/empresas
GET /api/admin/usuarios
GET /api/admin/solicitudes
GET /api/admin/transportes
POST /api/admin/solicitudes/{id}/asignar
PUT /api/admin/suscripciones/{empresaId}
```

Nota importante:

Si el endpoint de asignación quedó como `PUT` en vez de `POST`, no cambiarlo necesariamente. Solo asegurar que:

```txt
el código real y docs/BACKEND_CONTRACT_MVP.md coincidan exactamente
```

---

# Validación 5 — Contratos JSON oficiales

Confirmar que los contratos activos usan estos nombres:

```txt
volumenAproximado
fechaProgramada
direccion
observaciones
recolectorId
transporteId
volumenReal
capacidadLitros
subscriptionStatus
```

Confirmar que no queden contratos activos con nombres legacy:

```txt
volumen_aproximado
fecha_programada
direccion_recojo
capacidadLiters
nuevoEstado
estadoSuscripcion
totalIngresos
```

Si aparecen en mocks, comentarios o documentación antigua, evaluar si deben eliminarse o marcarse como legacy.

Si aparecen en código activo, corregir.

---

# Validación 6 — Crear solicitud de recojo

Endpoint esperado:

```http
POST /api/empresa/solicitudes
```

Body oficial:

```json
{
  "volumenAproximado": 30,
  "fechaProgramada": "2026-06-01",
  "direccion": "Av. Ejemplo 123",
  "observaciones": "Recojo por la mañana"
}
```

Validar que:

```txt
volumenAproximado sea requerido y mayor a cero
fechaProgramada sea requerida
direccion sea requerida
usuario autenticado tenga rol GENERADOR
empresa generadora exista
estado inicial sea PENDIENTE
```

Confirmar si hay validación de suscripción. Si existe, debe estar documentada.

---

# Validación 7 — Asignación de recolector y transporte

Endpoint esperado según contrato real:

```http
POST /api/admin/solicitudes/{id}/asignar
```

o:

```http
PUT /api/admin/solicitudes/{id}/asignar
```

Usar el método que realmente exista en el código y documentarlo igual.

Body oficial:

```json
{
  "recolectorId": 3,
  "transporteId": 5
}
```

Validar que:

```txt
la solicitud existe
la solicitud está PENDIENTE
el usuario recolector existe
el usuario tiene rol RECOLECTOR
la empresa del recolector es tipo RECOLECTORA
la unidad vehicular existe
la unidad vehicular pertenece a la empresa recolectora del usuario asignado
la unidad vehicular está activa
transporteId se guarda realmente en la solicitud
```

Al asignar:

```txt
PENDIENTE -> PROGRAMADO
```

Respuesta esperada, o equivalente real:

```json
{
  "id": 1,
  "estado": "PROGRAMADO",
  "recolectorNombre": "Nombre del recolector",
  "transportePlaca": "ABC-123"
}
```

---

# Validación 8 — Flujo operativo de estados

El flujo operativo MVP debe quedar así:

```txt
PENDIENTE -> PROGRAMADO -> EN_RUTA -> COMPLETADO
```

Validar acciones:

## Admin asigna

```txt
PENDIENTE -> PROGRAMADO
```

## Recolector inicia ruta

Endpoint:

```http
PUT /api/recolector/recojos/{id}/en-ruta
```

Cambio:

```txt
PROGRAMADO -> EN_RUTA
```

## Recolector confirma recojo

Endpoint:

```http
PUT /api/recolector/recojos/{id}/confirmar
```

Body oficial:

```json
{
  "volumenReal": 28.5
}
```

Cambio:

```txt
EN_RUTA -> COMPLETADO
```

Confirmar que `confirmar` usa:

```txt
@RequestBody
PickupConfirmationRequest
```

y no:

```txt
@RequestParam volumenReal
```

Si `RECOGIDO` sigue en el enum, documentar en `docs/BACKEND_CONTRACT_MVP.md`:

```txt
RECOGIDO queda como estado legacy/no usado en el flujo operativo MVP.
```

---

# Validación 9 — Unidades vehiculares

Revisar contrato real para:

```txt
GET  /api/recolector/transportes
GET  /api/recolector/unidades
POST /api/recolector/unidades
PUT  /api/recolector/unidades/{id}
```

Request oficial:

```json
{
  "placa": "ABC-123",
  "tipo": "CAMIONETA",
  "capacidadLitros": 500,
  "activo": true
}
```

Response oficial:

```json
{
  "id": 1,
  "placa": "ABC-123",
  "tipo": "CAMIONETA",
  "capacidadLitros": 500,
  "activo": true
}
```

Confirmar que no queda `capacidadLiters` en código activo, DTOs ni documentación final.

---

# Validación 10 — Suscripciones

Endpoint esperado:

```http
PUT /api/admin/suscripciones/{empresaId}
```

Body oficial:

```json
{
  "subscriptionStatus": "ACTIVA"
}
```

Estados válidos:

```txt
ACTIVA
PENDIENTE
VENCIDA
SUSPENDIDA
```

Validar que:

```txt
la empresa existe
el estado es válido
solo ADMIN puede actualizar suscripción
el nombre oficial sea subscriptionStatus
no se use nuevoEstado
no se use estadoSuscripcion como contrato activo
```

---

# Validación 11 — Registro de usuarios y empresas

Revisar `RegisterRequest` y la lógica de registro.

Debe evitar combinaciones incoherentes:

```txt
GENERADOR  -> GENERADORA
RECOLECTOR -> RECOLECTORA
ADMIN      -> sin empresa o manejo especial
```

Si el registro público acepta empresas, validar que permita datos reales:

```json
{
  "ruc": "20123456789",
  "businessName": "Empresa Demo SAC",
  "address": "Av. Principal 123",
  "email": "demo@empresa.com",
  "password": "123456",
  "firstName": "Juan",
  "lastName": "Pérez",
  "role": "GENERADOR",
  "companyType": "GENERADORA"
}
```

Confirmar que no se creen empresas con datos falsos como contrato principal:

```txt
Empresa + ruc
Dirección + ruc
```

Si existen solo para seed/demo, documentarlo claramente.

---

# Validación 12 — Resúmenes para dashboards

Los resúmenes deben entregar datos reales del MVP, sin pagos ni liquidaciones.

## Empresa generadora

Endpoint:

```http
GET /api/empresa/resumen
```

Campos recomendados o equivalentes reales:

```json
{
  "totalSolicitudes": 10,
  "solicitudesPendientes": 2,
  "solicitudesProgramadas": 3,
  "solicitudesEnRuta": 1,
  "solicitudesCompletadas": 4,
  "totalLitrosReciclados": 250.5
}
```

No incluir:

```txt
totalIngresos
pagos
liquidaciones
certificados
```

## Recolector

Endpoint:

```http
GET /api/recolector/resumen
```

Campos recomendados o equivalentes reales:

```json
{
  "recojosProgramados": 3,
  "recojosEnRuta": 1,
  "recojosCompletados": 12,
  "totalLitrosRecolectados": 850.5,
  "unidadesActivas": 2
}
```

## Admin

Endpoint:

```http
GET /api/admin/resumen
```

Campos recomendados o equivalentes reales:

```json
{
  "totalEmpresas": 20,
  "totalGeneradoras": 14,
  "totalRecolectoras": 6,
  "totalUsuarios": 25,
  "totalSolicitudes": 40,
  "solicitudesPendientes": 8,
  "solicitudesProgramadas": 10,
  "solicitudesEnRuta": 2,
  "solicitudesCompletadas": 20,
  "totalLitrosRecolectados": 1800.5,
  "totalUnidades": 9
}
```

---

# Validación 13 — Limpieza legacy

Buscar referencias activas a:

```txt
B2B
SELLER
BUYER
marketplace
lot
order
liquidation
certificate
SUNAT
totalIngresos
```

No es necesario borrar cada comentario histórico si no afecta, pero no debe quedar código activo ni documentación final que contradiga el MVP.

Revisar:

```txt
src/main/resources/static
```

Confirmar que:

```txt
index.html fue reemplazado por una página simple
dashboard.html fue eliminado
js/dashboard.js fue eliminado
no quedan pantallas legacy activas dentro del backend
```

---

# Validación 14 — Documento de contrato oficial

Revisar y actualizar si hace falta:

```txt
docs/BACKEND_CONTRACT_MVP.md
```

Debe reflejar exactamente el backend real.

Debe incluir:

```txt
Base URL
autenticación
uso de Authorization Bearer
endpoints por rol
métodos HTTP reales
payloads oficiales
estados oficiales
nota de RECOGIDO legacy si aplica
contratos de unidades vehiculares
contrato de suscripción
contrato de confirmación de recojo
```

No debe documentar endpoints que no existen.

No debe documentar nombres de campos que el backend no usa.

---

# Validación 15 — Prueba manual mínima sugerida

Si hay datos seed o usuarios disponibles, probar o documentar cómo probar:

```txt
1. Login ADMIN
2. Login GENERADOR
3. Login RECOLECTOR
4. GENERADOR crea solicitud
5. ADMIN asigna recolector y transporte
6. RECOLECTOR inicia ruta
7. RECOLECTOR confirma recojo con volumenReal en body JSON
8. Verificar que la solicitud queda COMPLETADO
9. Verificar que los resúmenes reflejan los cambios
10. Verificar que unidades vehiculares devuelven capacidadLitros
```

Si no hay datos seed suficientes, reportar que falta seed/demo para prueba E2E manual.

---

# Criterios de aceptación

La validación se considera aprobada cuando:

```txt
1. mvn clean package -DskipTests termina correctamente.
2. El backend corre en http://localhost:8082/ecotacna.
3. La base API real es http://localhost:8082/ecotacna/api.
4. CORS permite React local.
5. JWT funciona con Authorization: Bearer.
6. Los endpoints documentados existen realmente.
7. docs/BACKEND_CONTRACT_MVP.md coincide con los controllers.
8. No hay contratos activos con snake_case.
9. Confirmar recojo usa JSON body.
10. transporteId se guarda realmente en la asignación.
11. capacidadLitros está unificado.
12. subscriptionStatus está unificado.
13. El flujo queda:
    PENDIENTE -> PROGRAMADO -> EN_RUTA -> COMPLETADO
14. RECOGIDO queda documentado como legacy/no usado si sigue existiendo.
15. No quedan restos activos del marketplace B2B.
16. El backend queda listo para que el frontend React se adapte al contrato.
```

---

# Entregable esperado de Antigravity

Responder únicamente con este formato:

```md
## Resultado de compilación

Comando ejecutado:

Resultado:

## Backend corriendo

URL confirmada:

Base API confirmada:

## CORS

Orígenes permitidos:

Métodos permitidos:

Headers permitidos:

## JWT

Login devuelve token:

Rutas protegidas usan Authorization Bearer:

## Endpoints confirmados

### Auth

- ...

### Empresa

- ...

### Recolector

- ...

### Admin

- ...

## Contratos JSON confirmados

- volumenAproximado
- fechaProgramada
- direccion
- observaciones
- recolectorId
- transporteId
- volumenReal
- capacidadLitros
- subscriptionStatus

## Flujo de estados confirmado

PENDIENTE -> PROGRAMADO -> EN_RUTA -> COMPLETADO

## Registro

Validación role + companyType:

## Limpieza legacy

Estado de static:

Referencias legacy activas encontradas:

## Documento actualizado

Archivo:

Cambios:

## Riesgos encontrados

- ...

## Estado final

Backend listo para adaptar frontend / Backend requiere ajustes
```

---

# Nota final

No avanzar todavía con el frontend.

Después de esta validación, si el estado final es:

```txt
Backend listo para adaptar frontend
```

el siguiente paso será crear el documento:

```txt
FRONTEND_ADAPTATION_TO_BACKEND_CONTRACT.md
```

Ese documento deberá indicar que `EcoTacnaFrontend` debe obedecer estrictamente el contrato final de:

```txt
docs/BACKEND_CONTRACT_MVP.md
```
