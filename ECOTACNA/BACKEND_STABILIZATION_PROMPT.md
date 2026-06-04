# BACKEND_STABILIZATION_PROMPT.md

# Tarea Antigravity — Pulir Backend ECO_TACNA antes de integrar Frontend

## Objetivo principal

Pulir y estabilizar el backend `EcoTacnaSpringBootJPA` para que sea el contrato oficial que luego obedecerá el frontend React.

El backend debe quedar como fuente de verdad. El frontend se adaptará después al backend final, no al revés.

---

## Restricción principal

No modificar todavía el frontend.

No hacer cambios de diseño.

No adaptar pantallas.

No corregir componentes React.

No modificar `EcoTacnaFrontend`, salvo que sea estrictamente necesario revisar nombres o confirmar incompatibilidades, pero sin aplicar cambios ahí.

El objetivo de esta tarea es dejar el backend limpio, coherente, compilable y alineado al MVP actual.

---

## Instrucciones para optimizar memoria y consumo de tokens

Antes de modificar código:

1. Leer primero los documentos `.md` del proyecto.
2. Usar esos `.md` como contexto principal del flujo actual.
3. No pegar archivos completos en la respuesta.
4. No analizar carpetas generadas o pesadas:
   - `node_modules`
   - `target`
   - `dist`
   - `.git`
   - `build`
   - archivos compilados
5. Usar búsquedas puntuales con `grep`, `rg` o búsqueda interna.
6. Priorizar estos archivos:
   - `.md`
   - `Controller`
   - `Service`
   - `DTO`
   - `Entity`
   - `Enum`
   - `Repository`
   - `SecurityConfig`
   - `application.properties`
7. Trabajar por cambios pequeños y verificables.
8. No reescribir todo el proyecto si no es necesario.
9. Evitar introducir librerías nuevas salvo que sean realmente necesarias.
10. Al final, entregar un resumen corto con:
    - archivos modificados
    - endpoints finales
    - decisiones tomadas
    - comandos ejecutados
    - errores pendientes, si existieran

---

# Contexto del MVP actual

El proyecto ECO_TACNA ya no debe trabajar como marketplace B2B.

El flujo actual debe enfocarse en gestión de recolección de residuos, empresas generadoras, empresas recolectoras, unidades vehiculares, solicitudes de recojo, asignación por administrador y seguimiento operativo básico.

---

## Roles válidos

El backend debe manejar únicamente estos roles:

```txt
ADMIN
GENERADOR
RECOLECTOR
```

No usar ni reactivar:

```txt
SELLER
BUYER
```

---

## Tipos de empresa válidos

El backend debe manejar únicamente estos tipos de empresa:

```txt
GENERADORA
RECOLECTORA
```

---

## Módulos permitidos en el MVP

El backend puede mantener y pulir estos módulos:

```txt
Autenticación con JWT
Gestión de empresas
Gestión de usuarios
Solicitudes de recojo
Asignación de recolector
Unidades vehiculares del recolector
Estados de suscripción
Resumen administrativo
Resumen de empresa generadora
Resumen de recolector
Auditoría básica, si ya existe
```

---

## Módulos que NO deben reintroducirse

No agregar, no reactivar y no depender de:

```txt
B2B marketplace
buyer/seller
lotes comerciales
órdenes de compra
pagos
liquidaciones
certificados
SUNAT
trazabilidad como módulo independiente
validaciones externas innecesarias
```

Si existen restos legacy, limpiarlos o dejarlos claramente fuera del flujo operativo.

---

# Fase 1 — Revisar backend actual

Analizar el backend real ubicado en:

```txt
EcoTacnaSpringBootJPA
```

Revisar especialmente:

```txt
EcoTacnaSpringBootJPA/src/main/java
EcoTacnaSpringBootJPA/src/main/resources/application.properties
EcoTacnaSpringBootJPA/src/main/resources/static
```

Identificar:

```txt
controllers existentes
DTOs actuales
entidades actuales
enums actuales
servicios principales
repositorios principales
configuración JWT
configuración de seguridad
configuración de puerto/context-path
restos legacy B2B o marketplace
```

No modificar nada hasta tener claro el mapa del backend.

---

# Fase 2 — Configuración base para integración con React

## 1. Configurar puerto y context path

El backend debe quedar compatible con esta base URL:

```txt
http://localhost:8082/ecotacna/api
```

Actualizar `application.properties` si falta:

```properties
server.port=8082
server.servlet.context-path=/ecotacna
```

Todos los endpoints `/api/...` deben resolverse finalmente como:

```txt
http://localhost:8082/ecotacna/api/...
```

---

## 2. Configurar CORS

Agregar configuración CORS compatible con frontend local.

Permitir al menos estos orígenes:

```txt
http://localhost:5173
http://localhost:8081
http://localhost:3000
```

Permitir métodos:

```txt
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Permitir headers:

```txt
Authorization
Content-Type
Accept
```

La configuración CORS debe integrarse correctamente con Spring Security.

No usar una configuración insegura de producción salvo que quede claramente limitada para desarrollo.

---

## 3. Confirmar JWT Bearer

El backend debe aceptar JWT mediante:

```http
Authorization: Bearer <token>
```

Verificar que:

```txt
login retorna token
rutas protegidas validan token
rutas públicas siguen públicas
rutas por rol están protegidas correctamente
CORS no bloquea Authorization
```

Rutas públicas mínimas:

```txt
POST /api/auth/login
POST /api/auth/register
```

Rutas protegidas por rol:

```txt
/api/admin/**       -> ADMIN
/api/empresa/**     -> GENERADOR
/api/recolector/**  -> RECOLECTOR
```

---

# Fase 3 — Estabilizar contratos DTO/API

## 4. Unificar nombres camelCase

Todo JSON del backend debe usar `camelCase`.

Usar nombres claros en español cuando el proyecto ya los usa.

Correcto:

```json
{
  "volumenAproximado": 30,
  "fechaProgramada": "2026-06-01",
  "direccion": "Av. Ejemplo 123",
  "observaciones": "Recojo por la mañana"
}
```

Evitar `snake_case`.

Incorrecto:

```json
{
  "volumen_aproximado": 30,
  "fecha_programada": "2026-06-01",
  "direccion_recojo": "Av. Ejemplo 123"
}
```

---

## 5. Solicitud de recojo de empresa generadora

Endpoint esperado:

```http
POST /api/empresa/solicitudes
```

Body esperado:

```json
{
  "volumenAproximado": 30,
  "fechaProgramada": "2026-06-01",
  "direccion": "Av. Ejemplo 123",
  "observaciones": "Recojo por la mañana"
}
```

Validaciones mínimas:

```txt
volumenAproximado requerido y mayor a cero
fechaProgramada requerida
direccion requerida
usuario autenticado debe ser GENERADOR
empresa generadora debe existir
si hay validación de suscripción, debe estar clara y documentada
```

Estado inicial:

```txt
PENDIENTE
```

---

## 6. Asignación de recolector y unidad vehicular

Revisar endpoint admin:

```http
POST /api/admin/solicitudes/{id}/asignar
```

o, si ya existe como `PUT`, mantenerlo pero documentarlo claramente.

Body esperado:

```json
{
  "recolectorId": 3,
  "transporteId": 5
}
```

Implementar correctamente `transporteId` si actualmente se recibe pero no se usa.

Validaciones obligatorias:

```txt
la solicitud existe
la solicitud está PENDIENTE
el usuario recolector existe
el usuario tiene rol RECOLECTOR
la empresa del recolector es tipo RECOLECTORA
la unidad vehicular existe
la unidad vehicular pertenece a la empresa recolectora del usuario asignado
la unidad vehicular está activa
guardar la unidad en la solicitud
```

Al asignar:

```txt
PENDIENTE -> PROGRAMADO
```

La respuesta debe incluir datos básicos como:

```json
{
  "id": 1,
  "estado": "PROGRAMADO",
  "recolectorNombre": "Nombre del recolector",
  "transportePlaca": "ABC-123"
}
```

---

## 7. Flujo de estados del recojo

Para el MVP, cerrar el flujo de forma simple:

```txt
PENDIENTE -> PROGRAMADO -> EN_RUTA -> COMPLETADO
```

Si existe el estado `RECOGIDO`, no eliminarlo si puede causar problemas con base de datos o migración, pero dejar documentado que para el MVP no se usará como estado final operativo.

Acciones esperadas:

### Admin asigna

```txt
PENDIENTE -> PROGRAMADO
```

### Recolector inicia ruta

Endpoint:

```http
PUT /api/recolector/recojos/{id}/en-ruta
```

Cambio de estado:

```txt
PROGRAMADO -> EN_RUTA
```

### Recolector confirma recojo

Endpoint:

```http
PUT /api/recolector/recojos/{id}/confirmar
```

Body:

```json
{
  "volumenReal": 28.5
}
```

Si actualmente el backend usa `@RequestParam`, cambiarlo a `@RequestBody`.

DTO sugerido:

```java
public class PickupConfirmationRequest {

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal volumenReal;

    public BigDecimal getVolumenReal() {
        return volumenReal;
    }

    public void setVolumenReal(BigDecimal volumenReal) {
        this.volumenReal = volumenReal;
    }
}
```

Al confirmar:

```txt
EN_RUTA -> COMPLETADO
```

Guardar:

```txt
volumenReal
fecha/hora de confirmación si existe campo
estado COMPLETADO
```

---

## 8. Unidades vehiculares

Revisar endpoints de recolector:

```txt
GET  /api/recolector/transportes
GET  /api/recolector/unidades
POST /api/recolector/unidades
PUT  /api/recolector/unidades/{id}
```

El contrato debe ser coherente.

Request esperado:

```json
{
  "placa": "ABC-123",
  "tipo": "CAMIONETA",
  "capacidadLitros": 500,
  "activo": true
}
```

Respuesta esperada:

```json
{
  "id": 1,
  "placa": "ABC-123",
  "tipo": "CAMIONETA",
  "capacidadLitros": 500,
  "activo": true
}
```

Si existe `capacidadLiters`, cambiarlo a:

```txt
capacidadLitros
```

Mantener coherencia entre:

```txt
request
response
entity
service
documentación
frontend futuro
```

---

## 9. Suscripciones

Revisar endpoint admin de suscripciones:

```http
PUT /api/admin/suscripciones/{empresaId}
```

Debe aceptar:

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

Validaciones:

```txt
empresa existe
estado válido
solo ADMIN puede cambiar suscripción
```

No usar nombres alternativos como:

```txt
nuevoEstado
estadoSuscripcion
```

El contrato oficial debe ser:

```txt
subscriptionStatus
```

---

## 10. Registro de usuarios y empresas

Revisar `RegisterRequest`.

Debe evitar combinaciones incoherentes.

Reglas esperadas:

```txt
GENERADOR  -> empresa GENERADORA
RECOLECTOR -> empresa RECOLECTORA
ADMIN      -> sin empresa o manejo especial
```

Si el request recibe `role` y `companyType`, validar que sean compatibles.

Si el registro público será usado para generador/recolector, permitir datos reales de empresa:

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

No crear datos falsos como:

```txt
Empresa + ruc
Dirección + ruc
```

salvo que sea únicamente para seed/demo y quede documentado.

---

# Fase 4 — Resúmenes y datos para dashboards

## 11. Resumen empresa generadora

Revisar:

```http
GET /api/empresa/resumen
```

Debe devolver datos útiles y reales para el MVP.

Ejemplo recomendado:

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

Eliminar o dejar fuera campos de ingresos si el MVP no usa pagos/liquidaciones.

No devolver `totalIngresos` si ya no forma parte del proyecto.

---

## 12. Resumen recolector

Revisar:

```http
GET /api/recolector/resumen
```

Debe devolver datos útiles:

```json
{
  "recojosProgramados": 3,
  "recojosEnRuta": 1,
  "recojosCompletados": 12,
  "totalLitrosRecolectados": 850.5,
  "unidadesActivas": 2
}
```

---

## 13. Resumen admin

Revisar:

```http
GET /api/admin/resumen
```

Debe devolver KPIs del MVP:

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

No incluir:

```txt
pagos
liquidaciones
certificados
ingresos
```

---

# Fase 5 — Limpieza legacy

## 14. Limpiar frontend estático viejo dentro del backend

Revisar:

```txt
src/main/resources/static
```

Si contiene archivos viejos como:

```txt
index.html
dashboard.html
js/dashboard.js
```

y usan conceptos como:

```txt
SELLER
BUYER
marketplace
lots
orders
B2B
```

hacer una de estas dos opciones:

### Opción recomendada

Eliminar esos archivos legacy si no son necesarios.

### Opción segura

Reemplazarlos por una página mínima:

```html
<!doctype html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>ECO_TACNA API</title>
</head>
<body>
  <h1>ECO_TACNA API funcionando</h1>
  <p>Usar el frontend React ubicado en EcoTacnaFrontend.</p>
</body>
</html>
```

No dejar pantallas legacy que contradigan el MVP.

---

## 15. Limpiar propiedades legacy

Revisar `application.properties`.

Eliminar o comentar propiedades que ya no pertenecen al MVP, por ejemplo:

```properties
ecotacna.liquidation.rate-per-liter
```

Solo dejar configuración realmente usada.

---

## 16. Limpiar nombres legacy en comentarios o clases no usadas

Buscar referencias a:

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
```

No borrar código necesario sin revisar.

Sí eliminar restos claros del flujo antiguo si contradicen el MVP.

---

# Fase 6 — Documentación final del backend

Crear o actualizar el documento:

```txt
docs/BACKEND_CONTRACT_MVP.md
```

Si no existe la carpeta `docs`, crearla.

El documento debe contener como mínimo:

---

## 1. Base URL

```txt
http://localhost:8082/ecotacna/api
```

---

## 2. Autenticación

```txt
POST /auth/login
POST /auth/register
Authorization: Bearer <token>
```

---

## 3. Endpoints por rol

### Auth

```txt
POST /auth/login
POST /auth/register
```

### Empresa generadora

```txt
GET  /empresa/perfil
GET  /empresa/resumen
GET  /empresa/solicitudes
POST /empresa/solicitudes
```

### Recolector

```txt
GET /recolector/perfil
GET /recolector/resumen
GET /recolector/solicitudes
GET /recolector/transportes
GET /recolector/unidades
POST /recolector/unidades
PUT /recolector/unidades/{id}
PUT /recolector/recojos/{id}/en-ruta
PUT /recolector/recojos/{id}/confirmar
```

### Admin

```txt
GET /admin/resumen
GET /admin/empresas
GET /admin/usuarios
GET /admin/solicitudes
GET /admin/transportes
POST o PUT /admin/solicitudes/{id}/asignar
PUT /admin/suscripciones/{empresaId}
```

---

## 4. Estados de solicitud

Estados oficiales del MVP:

```txt
PENDIENTE
PROGRAMADO
EN_RUTA
COMPLETADO
CANCELADO
```

Si `RECOGIDO` queda en el enum por compatibilidad, documentar:

```txt
RECOGIDO queda como estado legacy/no usado en el flujo operativo MVP.
```

---

## 5. Payloads oficiales

Documentar JSON oficial de:

```txt
login
register
crear solicitud
asignar recolector
confirmar recojo
crear unidad vehicular
editar unidad vehicular
actualizar suscripción
```

---

# Fase 7 — Pruebas obligatorias

Al terminar, ejecutar desde el backend:

```bash
mvn clean test
```

Si no hay tests suficientes o si los tests no están preparados, ejecutar al menos:

```bash
mvn clean package -DskipTests
```

El backend debe compilar.

También documentar cómo probar manualmente estos flujos:

```txt
POST /api/auth/login
GET /api/empresa/resumen con Bearer token
POST /api/empresa/solicitudes con Bearer token GENERADOR
POST o PUT /api/admin/solicitudes/{id}/asignar con Bearer token ADMIN
PUT /api/recolector/recojos/{id}/en-ruta con Bearer token RECOLECTOR
PUT /api/recolector/recojos/{id}/confirmar con body JSON y Bearer token RECOLECTOR
GET /api/recolector/unidades con Bearer token RECOLECTOR
```

---

# Criterios de aceptación

La tarea se considera terminada cuando:

```txt
1. El backend compila.
2. El backend corre en http://localhost:8082/ecotacna.
3. CORS permite peticiones desde React local.
4. JWT funciona con Authorization: Bearer.
5. No hay contratos activos con snake_case.
6. Confirmar recojo recibe JSON body, no query param.
7. transporteId se usa realmente al asignar recolector.
8. capacidadLitros está unificado.
9. subscriptionStatus está unificado.
10. El flujo operativo queda claro:
   PENDIENTE -> PROGRAMADO -> EN_RUTA -> COMPLETADO
11. No quedan restos activos del flujo B2B/marketplace.
12. Existe o se actualizó docs/BACKEND_CONTRACT_MVP.md.
13. La respuesta final de Antigravity incluye:
    - resumen de cambios
    - archivos modificados
    - endpoints finales
    - comandos ejecutados
    - errores pendientes si los hubiera
```

---

# Entregable esperado de Antigravity

Al finalizar, responder con este formato:

```md
## Resumen

Backend estabilizado para MVP ECO_TACNA.

## Archivos modificados

- archivo 1
- archivo 2
- archivo 3

## Cambios principales

- cambio 1
- cambio 2
- cambio 3

## Endpoints finales relevantes

- endpoint 1
- endpoint 2
- endpoint 3

## Pruebas ejecutadas

```bash
mvn clean package -DskipTests
```

## Pendientes o riesgos

- pendiente 1
- pendiente 2
```

---

# Nota final

No avanzar con el frontend todavía.

Después de cerrar esta tarea, el siguiente paso será crear otro documento `.md` para adaptar `EcoTacnaFrontend` al contrato final documentado en:

```txt
docs/BACKEND_CONTRACT_MVP.md
```

El frontend debe obedecer ese contrato.
