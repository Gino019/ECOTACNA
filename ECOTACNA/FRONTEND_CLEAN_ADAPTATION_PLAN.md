# FRONTEND_CLEAN_ADAPTATION_PLAN.md

# Tarea Antigravity — Limpieza real y adaptación del Frontend React al Backend ECO_TACNA

## Contexto

El backend `EcoTacnaSpringBootJPA` ya fue estabilizado y validado como contrato oficial del MVP ECO_TACNA.

Resultado confirmado del backend:

```txt
BUILD SUCCESS
Backend corriendo en: http://localhost:8082/ecotacna
Base API: http://localhost:8082/ecotacna/api
CORS configurado para React local
JWT funcionando con Authorization: Bearer <token>
Contrato oficial documentado en: EcoTacnaSpringBootJPA/docs/BACKEND_CONTRACT_MVP.md
```

Ahora el frontend `EcoTacnaFrontend` debe limpiarse y adaptarse estrictamente a ese contrato.

---

# Objetivo principal

Dejar el frontend React limpio, funcional y compatible con el backend final.

El frontend debe:

```txt
compilar sin errores
usar JWT Bearer
consumir solo endpoints reales del backend
usar payloads camelCase
eliminar código legacy
eliminar archivos basura
eliminar servicios muertos
eliminar rutas que no pertenecen al MVP
eliminar mocks comerciales antiguos
eliminar componentes que ya no sirven
quedar listo para una futura fase de diseño visual
```

---

# Regla principal

El backend es la fuente de verdad.

El frontend debe obedecer el contrato documentado en:

```txt
EcoTacnaSpringBootJPA/docs/BACKEND_CONTRACT_MVP.md
```

No inventar endpoints.

No maquillar errores.

No dejar archivos muertos.

No dejar rutas ocultas pero importadas.

No dejar código legacy comentado.

No conservar pantallas antiguas sin funcionalidad.

No usar mocks como fuente principal de datos.

No adaptar el backend al frontend.

---

# Restricción importante

Esta tarea NO es una fase de rediseño visual profundo.

No invertir tiempo en:

```txt
animaciones complejas
video de fondo
rediseño avanzado de landing
dashboard visual premium
gráficos elaborados
microinteracciones
```

Primero se debe dejar el frontend limpio y funcional.

La fase visual vendrá después.

---

# Instrucciones para optimizar memoria y consumo de tokens

Antes de modificar código:

1. Leer primero:

```txt
EcoTacnaSpringBootJPA/docs/BACKEND_CONTRACT_MVP.md
```

2. Revisar solo los `.md` necesarios para contexto.
3. No analizar carpetas pesadas o generadas:

```txt
node_modules
dist
build
target
.git
coverage
```

4. No pegar archivos completos en la respuesta.
5. Usar búsquedas puntuales con:

```bash
rg
grep
find
```

6. Priorizar estos directorios y archivos del frontend:

```txt
EcoTacnaFrontend/src/services
EcoTacnaFrontend/src/pages
EcoTacnaFrontend/src/components
EcoTacnaFrontend/src/context
EcoTacnaFrontend/src/hooks
EcoTacnaFrontend/src/types
EcoTacnaFrontend/src/data
EcoTacnaFrontend/src/routes
EcoTacnaFrontend/src/App.tsx
EcoTacnaFrontend/src/main.tsx
EcoTacnaFrontend/package.json
EcoTacnaFrontend/.env
```

7. Trabajar por cambios pequeños y verificables.
8. Borrar archivos que ya no sirvan.
9. Al final ejecutar compilación y TypeScript.
10. Reportar claramente archivos eliminados, modificados y pendientes.

---

# Alcance del MVP frontend

## Roles permitidos

```txt
ADMIN
GENERADOR
RECOLECTOR
```

No usar:

```txt
BUYER
SELLER
```

---

## Tipos de empresa permitidos

```txt
GENERADORA
RECOLECTORA
```

---

## Módulos permitidos

```txt
Login con email/password
Registro si está soportado por backend
Landing limpia
Dashboard admin
Dashboard empresa generadora
Dashboard recolector
Solicitudes de recojo
Asignación de recolector y unidad vehicular
Unidades vehiculares
Estados de suscripción
Resumen por rol
Flujo operativo de recojo
```

---

## Módulos prohibidos o fuera del MVP

Eliminar del flujo activo y borrar archivos si no cumplen función:

```txt
B2B marketplace
BUYER
SELLER
lotes comerciales
órdenes comerciales
orders
pagos
liquidaciones
certificados
SUNAT
trazabilidad como módulo independiente
OTP/código de acceso
solicitarCodigo
validarCodigo
mocks comerciales antiguos
modales legacy sin uso
```

---

# Base API oficial

El frontend debe usar:

```txt
http://localhost:8082/ecotacna/api
```

Configurar:

```env
VITE_API_BASE_URL=http://localhost:8082/ecotacna/api
```

Si ya existe variable equivalente, dejar una sola fuente de configuración.

---

# Fase 1 — Inventario real del frontend

Antes de editar, realizar inventario de archivos en:

```txt
src/pages
src/components
src/services
src/types
src/data
src/context
src/hooks
src/routes
```

Clasificar cada archivo en una de estas categorías:

---

## A. Se conserva

Archivos que sí sirven para el MVP:

```txt
Login
Register si funciona con backend
Landing limpia
Dashboard Admin
Dashboard Empresa
Dashboard Recolector
Solicitudes de recojo
Asignación admin
Unidades vehiculares
Servicios API reales
AuthContext
Layout general
Navbar/Sidebar si sirven
Componentes UI reutilizables
Tipos del dominio MVP
```

---

## B. Se reescribe

Archivos útiles pero desalineados:

```txt
authApi
empresaApi
recolectorApi
adminApi
apiClient
authStorage
AuthContext
dashboards con datos antiguos
formularios que mandan snake_case
rutas con nombres legacy
landing con textos legacy
login con OTP/código
```

---

## C. Se elimina

Archivos fuera del MVP o sin funcionalidad real:

```txt
liquidaciones
certificados
pagos
trazabilidad independiente
marketplace
lotes
órdenes
orders
buyer
seller
mocks comerciales
modales legacy
componentes no importados
servicios API inexistentes
pantallas que no aparecen en el contrato backend
archivos comentados sin uso
```

Regla:

```txt
Si no sirve al MVP y no se importa en una ruta activa, se borra.
```

---

# Fase 2 — Limpiar rutas y navegación

Revisar:

```txt
src/App.tsx
src/routes
src/components/layout
src/components/sidebar
src/components/navbar
```

Solo deben quedar rutas activas del MVP.

---

## Rutas públicas

```txt
/
 /login
 /register
```

Si register no queda funcional, retirarlo temporalmente de la navegación principal.

---

## Rutas Admin

```txt
/admin
/admin/empresas
/admin/solicitudes
/admin/transportes
/admin/usuarios
/admin/suscripciones
```

---

## Rutas Empresa Generadora

```txt
/empresa
/empresa/solicitar-recojo
/empresa/solicitudes
```

---

## Rutas Recolector

```txt
/recolector
/recolector/solicitudes
/recolector/unidades
```

---

## Rutas que deben eliminarse

Eliminar rutas, imports y archivos asociados si no sirven:

```txt
/pagos
/liquidaciones
/certificados
/trazabilidad
/marketplace
/lotes
/orders
/buyer
/seller
```

No basta con esconderlas del menú.

Deben eliminarse del router y quitarse imports activos.

---

# Fase 3 — Corregir cliente HTTP y JWT

Revisar:

```txt
src/services/apiClient.ts
src/lib/apiClient.ts
```

El cliente HTTP debe:

```txt
usar VITE_API_BASE_URL
enviar Content-Type: application/json
enviar Accept: application/json
leer token desde authStorage o AuthContext
enviar Authorization: Bearer <token>
manejar errores HTTP
manejar 401 limpiando sesión si corresponde
```

Ejemplo de lógica esperada:

```ts
const token = authStorage.getToken();

const headers: HeadersInit = {
  "Content-Type": "application/json",
  "Accept": "application/json",
};

if (token) {
  headers.Authorization = `Bearer ${token}`;
}
```

No depender de cookies.

No usar solamente:

```ts
credentials: "include"
```

porque el backend usa JWT Bearer.

---

# Fase 4 — Corregir sesión y autenticación

Revisar:

```txt
src/services/authStorage.ts
src/context/AuthContext.tsx
src/hooks/useAuth.ts
```

La sesión debe guardar como mínimo:

```txt
token
usuario
rol
empresa si viene en la respuesta
```

Debe tener funciones equivalentes a:

```txt
getToken
setSession
clearSession
getUser
```

---

## Login

El backend usa:

```http
POST /api/auth/login
```

Body:

```json
{
  "email": "admin@demo.com",
  "password": "123456"
}
```

El frontend debe usar email/password.

Eliminar completamente flujo OTP si existe:

```txt
solicitarCodigo
validarCodigo
codigo
OTP
```

El login debe:

```txt
enviar email y password
guardar token recibido
guardar usuario/rol
redirigir según rol
mostrar error si credenciales fallan
```

Redirección por rol:

```txt
ADMIN      -> /admin
GENERADOR  -> /empresa
RECOLECTOR -> /recolector
```

---

## Register

Endpoint:

```http
POST /api/auth/register
```

Body oficial:

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

Reglas:

```txt
GENERADOR  -> GENERADORA
RECOLECTOR -> RECOLECTORA
ADMIN      -> manejo especial si aplica
```

Si la pantalla de registro está incompleta y rompe el flujo, dejarla funcional básica o retirarla de la navegación principal.

---

# Fase 5 — Reescribir servicios API

Todos los servicios en:

```txt
src/services
```

deben coincidir exactamente con:

```txt
EcoTacnaSpringBootJPA/docs/BACKEND_CONTRACT_MVP.md
```

---

## authApi

Debe tener solo:

```txt
login
register
logout
```

Eliminar:

```txt
solicitarCodigo
validarCodigo
OTP
```

---

## empresaApi

Endpoints oficiales:

```txt
GET  /empresa/perfil
GET  /empresa/resumen
GET  /empresa/solicitudes
POST /empresa/solicitudes
```

Métodos sugeridos:

```txt
getPerfil
getResumen
getSolicitudes
crearSolicitud
```

Crear solicitud debe enviar:

```json
{
  "volumenAproximado": 30,
  "fechaProgramada": "2026-06-01",
  "direccion": "Av. Ejemplo 123",
  "observaciones": "Recojo por la mañana"
}
```

Eliminar métodos si no existen en backend:

```txt
getTrazabilidadDetalle
getCertificados
getPagos
getLiquidaciones
getIngresos
```

---

## recolectorApi

Endpoints oficiales:

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

Métodos sugeridos:

```txt
getPerfil
getResumen
getSolicitudes
getTransportes
getUnidades
crearUnidad
actualizarUnidad
iniciarRuta
confirmarRecojo
```

Confirmar recojo debe enviar body JSON:

```json
{
  "volumenReal": 28.5
}
```

No usar query param:

```txt
?volumenReal=28.5
```

Unidades vehiculares deben usar:

```txt
capacidadLitros
```

Eliminar métodos inexistentes:

```txt
getRecojosDia
getSolicitudesDisponibles
aceptarSolicitud
cancelarSolicitud
```

si no están en el contrato.

---

## adminApi

Endpoints oficiales:

```txt
GET /admin/resumen
GET /admin/empresas
GET /admin/usuarios
GET /admin/solicitudes
GET /admin/transportes
POST /admin/solicitudes/{id}/asignar
PUT /admin/suscripciones/{empresaId}
```

Métodos sugeridos:

```txt
getResumen
getEmpresas
getUsuarios
getSolicitudes
getTransportes
asignarSolicitud
actualizarSuscripcion
```

Asignar solicitud debe enviar:

```json
{
  "recolectorId": 3,
  "transporteId": 5
}
```

Actualizar suscripción debe enviar:

```json
{
  "subscriptionStatus": "ACTIVA"
}
```

Eliminar métodos inexistentes:

```txt
getAdminLiquidaciones
anularRecoleccionesVencidas
getPagos
getCertificados
```

---

# Fase 6 — Limpiar tipos TypeScript

Revisar:

```txt
src/types
src/types/api.ts
src/types/domain.ts
src/types/*.ts
```

Crear o dejar tipos oficiales del MVP.

---

## Roles

```ts
export type Role = "ADMIN" | "GENERADOR" | "RECOLECTOR";
```

---

## Tipo de empresa

```ts
export type CompanyType = "GENERADORA" | "RECOLECTORA";
```

---

## Estados de solicitud

```ts
export type PickupRequestStatus =
  | "PENDIENTE"
  | "PROGRAMADO"
  | "EN_RUTA"
  | "COMPLETADO"
  | "CANCELADO";
```

Si `RECOGIDO` aparece por compatibilidad backend, incluirlo solo si el contrato final lo documenta como legacy.

---

## Eliminar tipos legacy

Eliminar tipos relacionados a:

```txt
BUYER
SELLER
ORDER
LOT
PAYMENT
CERTIFICATE
LIQUIDATION
TRACEABILITY_DETAIL
MARKETPLACE
```

Si un tipo no se usa, se borra.

---

# Fase 7 — Adaptar páginas que sí quedan

No hacer rediseño profundo.

Priorizar compatibilidad funcional.

---

## Landing

Mantenerla simple y limpia.

Debe hablar de:

```txt
gestión ambiental
empresas generadoras
empresas recolectoras
solicitudes de recojo
unidades vehiculares
seguimiento operativo básico
```

Eliminar textos sobre:

```txt
marketplace B2B
compra/venta de residuos
lotes
órdenes comerciales
pagos
certificados
SUNAT
liquidaciones
```

---

## Login

Debe ser email/password.

Debe consumir:

```txt
authApi.login
```

Debe redirigir por rol.

No debe usar OTP ni código.

---

## Dashboard Admin

Consumir:

```txt
GET /admin/resumen
```

Mostrar solo KPIs MVP:

```txt
totalEmpresas
totalGeneradoras
totalRecolectoras
totalUsuarios
totalSolicitudes
solicitudesPendientes
solicitudesProgramadas
solicitudesEnRuta
solicitudesCompletadas
totalLitrosRecolectados
totalUnidades
```

No mostrar:

```txt
ingresos
pagos
liquidaciones
certificados
```

---

## Admin Solicitudes

Consumir:

```txt
GET /admin/solicitudes
GET /admin/usuarios
GET /admin/transportes
POST /admin/solicitudes/{id}/asignar
```

Permitir asignar:

```txt
recolector
unidad vehicular
```

Payload:

```json
{
  "recolectorId": 3,
  "transporteId": 5
}
```

---

## Admin Empresas

Consumir:

```txt
GET /admin/empresas
PUT /admin/suscripciones/{empresaId}
```

Actualizar suscripción con:

```json
{
  "subscriptionStatus": "ACTIVA"
}
```

---

## Dashboard Empresa Generadora

Consumir:

```txt
GET /empresa/resumen
GET /empresa/solicitudes
```

Mostrar:

```txt
totalSolicitudes
solicitudesPendientes
solicitudesProgramadas
solicitudesEnRuta
solicitudesCompletadas
totalLitrosReciclados
```

No mostrar ingresos.

---

## Solicitar Recojo

Consumir:

```txt
POST /empresa/solicitudes
```

Enviar:

```json
{
  "volumenAproximado": 30,
  "fechaProgramada": "2026-06-01",
  "direccion": "Av. Ejemplo 123",
  "observaciones": "Recojo por la mañana"
}
```

Validar:

```txt
volumenAproximado > 0
fechaProgramada obligatoria
direccion obligatoria
```

---

## Mis Solicitudes Empresa

Consumir:

```txt
GET /empresa/solicitudes
```

Mostrar estados:

```txt
PENDIENTE
PROGRAMADO
EN_RUTA
COMPLETADO
CANCELADO
```

No usar trazabilidad independiente.

---

## Dashboard Recolector

Consumir:

```txt
GET /recolector/resumen
GET /recolector/solicitudes
```

Mostrar:

```txt
recojosProgramados
recojosEnRuta
recojosCompletados
totalLitrosRecolectados
unidadesActivas
```

---

## Solicitudes Recolector

Consumir:

```txt
GET /recolector/solicitudes
PUT /recolector/recojos/{id}/en-ruta
PUT /recolector/recojos/{id}/confirmar
```

Acciones:

```txt
PROGRAMADO -> botón Iniciar ruta
EN_RUTA -> botón Confirmar recojo
```

Confirmar recojo debe pedir:

```txt
volumenReal
```

Payload:

```json
{
  "volumenReal": 28.5
}
```

---

## Unidades Recolector

Consumir:

```txt
GET /recolector/unidades
POST /recolector/unidades
PUT /recolector/unidades/{id}
```

Usar campos:

```txt
placa
tipo
capacidadLitros
activo
```

No usar:

```txt
capacidadLiters
```

---

# Fase 8 — Eliminar mocks y datos falsos

Buscar archivos como:

```txt
src/data/mock.ts
src/data/mocks.ts
src/data
```

Eliminar mocks relacionados a:

```txt
mockLiquidaciones
mockCertificados
mockPagos
mockTrazabilidad
mockMarketplace
mockLotes
mockOrders
mockBuyer
mockSeller
```

Regla:

```txt
No usar mocks para funcionalidades principales.
```

Solo se permiten mocks mínimos temporales si:

```txt
el backend no tiene seed suficiente
son claramente temporales
no sustituyen servicios reales
no alimentan dashboards principales
están documentados como demo temporal
```

Pero la prioridad es consumir backend real.

---

# Fase 9 — Borrar componentes muertos

Buscar componentes no usados.

Eliminar si no pertenecen al MVP:

```txt
LiquidationModal
TraceabilityModal
CertificateModal
PaymentModal
MarketplaceCard
LotCard
OrderCard
BuyerPanel
SellerPanel
```

Regla:

```txt
Si no está en el MVP y no se importa en ninguna ruta activa, se borra.
```

No dejar cementerio de componentes.

---

# Fase 10 — Búsqueda obligatoria de residuos legacy

Después de limpiar, ejecutar desde `EcoTacnaFrontend`:

```bash
rg "BUYER|SELLER|marketplace|Marketplace|lote|Lote|lot|Lot|orden|Orden|order|Order|liquidacion|liquidación|Liquidacion|Liquidación|certificate|Certificate|certificado|Certificado|pago|Pago|payment|Payment|SUNAT|trazabilidad|Trazabilidad|solicitarCodigo|validarCodigo|OTP|capacidadLiters|nuevoEstado|estadoSuscripcion|totalIngresos|volumen_aproximado|fecha_programada|direccion_recojo" src
```

Si aparecen coincidencias:

1. Eliminar si están en código activo.
2. Justificar si quedan en texto histórico no usado.
3. Preferiblemente borrar todo lo que contradiga el MVP.

---

# Fase 11 — Compilación obligatoria

Ejecutar desde `EcoTacnaFrontend`:

```bash
npm install
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

El objetivo final:

```txt
sin errores TypeScript
sin imports rotos
sin métodos API inexistentes
sin rutas legacy activas
sin componentes muertos importados
sin servicios API fuera del contrato
```

No resolver errores usando `any` de forma masiva.

No ocultar errores reales.

---

# Fase 12 — Prueba funcional manual

Con backend corriendo:

```txt
http://localhost:8082/ecotacna/api
```

Y frontend corriendo:

```txt
http://localhost:5173
```

Probar manualmente:

```txt
1. Login ADMIN
2. Login GENERADOR
3. Login RECOLECTOR
4. GENERADOR crea solicitud
5. ADMIN ve solicitud pendiente
6. ADMIN asigna recolector y unidad vehicular
7. RECOLECTOR ve solicitud programada
8. RECOLECTOR inicia ruta
9. RECOLECTOR confirma con volumenReal
10. Solicitud queda COMPLETADO
11. Resúmenes se actualizan
12. Unidades vehiculares muestran capacidadLitros
```

Si no hay datos seed suficientes, reportar:

```txt
Falta seed/demo para prueba E2E manual completa.
```

---

# Criterios de aceptación

La tarea se considera terminada cuando:

```txt
1. El frontend compila.
2. npm run build termina correctamente.
3. npx tsc --noEmit -p tsconfig.app.json termina sin errores.
4. apiClient usa VITE_API_BASE_URL.
5. apiClient envía Authorization: Bearer <token>.
6. Login usa email/password.
7. No quedan llamadas a solicitarCodigo o validarCodigo.
8. Los servicios consumen solo endpoints existentes en BACKEND_CONTRACT_MVP.md.
9. Los payloads usan camelCase.
10. Crear solicitud usa volumenAproximado, fechaProgramada, direccion y observaciones.
11. Confirmar recojo usa body JSON con volumenReal.
12. Unidades usan capacidadLitros.
13. Suscripciones usan subscriptionStatus.
14. No hay rutas activas de pagos, liquidaciones, certificados, marketplace, lotes ni órdenes.
15. No hay imports activos de componentes legacy.
16. No hay archivos basura evidentes en src.
17. La navegación queda alineada a ADMIN, GENERADOR y RECOLECTOR.
18. El frontend queda listo para una siguiente fase de diseño visual.
```

---

# Entregable esperado de Antigravity

Responder con este formato:

```md
## Resumen

Frontend limpiado y adaptado al contrato del backend MVP ECO_TACNA.

## Archivos eliminados

- archivo eliminado 1
- archivo eliminado 2
- archivo eliminado 3

## Archivos modificados

- archivo modificado 1
- archivo modificado 2
- archivo modificado 3

## Cambios principales

- cambio 1
- cambio 2
- cambio 3

## Servicios API finales

### authApi
- ...

### empresaApi
- ...

### recolectorApi
- ...

### adminApi
- ...

## Rutas finales activas

### Público
- ...

### Admin
- ...

### Empresa
- ...

### Recolector
- ...

## Módulos legacy eliminados

- ...

## Resultado búsqueda legacy

Comando ejecutado:

Resultado:

## Pruebas ejecutadas

```bash
npm install
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

## Resultado

Frontend listo / Frontend requiere ajustes

## Pendientes o riesgos

- ...
```

---

# Nota final

No hacer rediseño visual profundo todavía.

Primero limpieza real y compatibilidad funcional.

Después de esta tarea, recién se debe crear una nueva fase para:

```txt
landing moderno
login con video o animación
dashboards profesionales
responsive design
mejor UX visual
mejor diseño de cards, tablas y estados
```

El objetivo de esta tarea es dejar el frontend sin basura y obedeciendo completamente al backend.
