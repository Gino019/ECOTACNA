# EcoTacna — Flujo final de aprobación administrativa de empresas

## 1. Contexto del problema

En el Panel Administrador ya existe visualmente el módulo **Empresas registradas**, con las secciones:

- Indicadores superiores: empresas totales, verificadas, pendientes y litros acumulados.
- Tabla **Listado empresarial**.
- Panel lateral **Pendientes de aprobación**.
- Botones visibles para **Aprobar** y **Rechazar**.

Sin embargo, actualmente los botones de aprobación y rechazo se encuentran deshabilitados o no ejecutan ninguna acción real. Esto impide cerrar el flujo correcto de registro empresarial.

El comportamiento esperado es que una empresa, luego de registrarse, quede en estado pendiente de revisión administrativa. Desde el Panel Administrador, el administrador debe poder aprobar o rechazar esa solicitud. Según la decisión tomada, el usuario que consulta nuevamente su RUC debe ver el estado correspondiente y continuar o detener el flujo.

---

## 2. Objetivo general

Implementar de forma limpia, segura y funcional el flujo real de **aprobación administrativa** y **rechazo administrativo** de empresas registradas en EcoTacna.

El flujo debe respetar la arquitectura actual del proyecto:

```text
Frontend administrativo
→ adminApi
→ Controller backend administrativo
→ Service backend administrativo
→ Repository
→ Entity Company
→ Base de datos
→ Estado actualizado
→ registration-status
→ Frontend público de registro
```

No se debe resolver con mocks, datos inventados, cambios manuales en base de datos ni botones de desarrollo.

---

## 3. Flujo funcional esperado

### 3.1 Registro inicial de empresa

Cuando una empresa completa el formulario de registro:

```text
Empresa completa formulario
→ Backend crea Company y User
→ Company queda en estado pendiente
→ Usuario ve pantalla “Tu empresa está en revisión”
```

La pantalla pública debe mostrar:

```text
Tu empresa está en revisión
Tu solicitud está siendo revisada por el equipo administrativo.
Cuando sea aprobada, podrás continuar con el proceso.
```

Debe mostrarse un botón:

```text
Continuar
```

pero deshabilitado mientras la empresa siga pendiente.

---

### 3.2 Aprobación desde Panel Administrador

En el Panel Administrador, cada empresa pendiente debe mostrar:

```text
Razón social
RUC
Tipo de empresa
Correo de contacto
Número de contacto si existe
Botón Rechazar
Botón Aprobar
```

Cuando el administrador presiona **Aprobar**:

```text
Admin presiona Aprobar
→ Frontend llama endpoint administrativo protegido
→ Backend valida permisos de ADMIN
→ Backend actualiza estado real de Company
→ Empresa pasa a estado aprobada / pendiente de pago
→ registration-status devuelve nextStep = PAYMENT_PENDING
```

Luego, si la empresa consulta su RUC o vuelve a la pantalla de revisión:

```text
Frontend consulta registration-status
→ Backend responde PAYMENT_PENDING
→ Botón Continuar se habilita
→ Usuario continúa a Plan y pago
```

---

### 3.3 Rechazo desde Panel Administrador

Cuando el administrador presiona **Rechazar**:

```text
Admin presiona Rechazar
→ Frontend llama endpoint administrativo protegido
→ Backend valida permisos de ADMIN
→ Backend actualiza estado real de Company
→ Empresa queda rechazada
→ registration-status devuelve nextStep = REJECTED
```

Luego, si la empresa consulta su RUC:

```text
Usuario ingresa RUC
→ Backend detecta estado rechazado
→ Frontend muestra pantalla de rechazo
```

La pantalla debe tener un estilo parecido a la pantalla de revisión, pero con iconografía roja o de alerta.

Mensaje sugerido:

```text
Tu solicitud fue denegada

La solicitud de registro para la empresa [RAZÓN SOCIAL] fue denegada por el equipo administrativo.

Para más información, comunícate con:
admin@ecotacna.com
```

No debe permitir avanzar al pago.

---

## 4. Estados del flujo

Se debe usar la fuente real de la base de datos. No crear estados duplicados si ya existen campos equivalentes.

Estados funcionales esperados:

| Estado funcional | Significado | Acción frontend |
|---|---|---|
| `REVIEW_PENDING` | Empresa registrada, esperando decisión administrativa | Mostrar revisión y botón Continuar deshabilitado |
| `PAYMENT_PENDING` | Empresa aprobada, pendiente de elegir plan/pagar | Habilitar Continuar hacia plan y pago |
| `ACTIVE_LOGIN` | Empresa activa con suscripción o acceso final | Mostrar iniciar sesión |
| `REJECTED` | Empresa rechazada por administrador | Mostrar pantalla de rechazo |
| `NEW_REGISTRATION` | RUC no existe en EcoTacna | Continuar registro normal con ApiPeruDev |
| `UNKNOWN_STATE` | Estado inconsistente o no reconocido | Mostrar error controlado |

El endpoint `registration-status` debe seguir siendo la fuente de verdad para el frontend público.

---

## 5. Diseño backend esperado

### 5.1 Archivos a auditar

Revisar obligatoriamente:

```text
Company.java
User.java
CompanyRepository.java
UserRepository.java
AdminDashboardController.java
AdminDashboardService.java
AuthController.java
AuthService.java
RegistrationStatusResponse.java o equivalente
DuplicateRegistrationException.java
SecurityConfig.java solo si hay bloqueo de permisos
Tests de integración backend
```

También revisar cualquier enum o campo existente:

```text
subscriptionStatus
verificationStatus
status
estado
approved
enabled
active
```

---

### 5.2 Reglas backend

El backend debe implementar la lógica en el **service administrativo**, no directamente en el controller.

El controller solo debe:

```text
recibir request
validar autorización
delegar al service
devolver response
```

El service debe:

```text
buscar empresa por id o ruc
validar que exista
validar que esté pendiente
actualizar estado
guardar cambios
devolver DTO actualizado
```

---

### 5.3 Endpoints administrativos sugeridos

Adaptar rutas al estándar real del proyecto, pero la idea debe ser esta:

```http
POST /api/admin/empresas/{companyId}/approve
```

Uso:

```text
Aprueba una empresa pendiente.
Solo ADMIN.
```

Respuesta esperada:

```json
{
  "success": true,
  "companyId": 21,
  "ruc": "20608026160",
  "razonSocial": "DISTRIBUCIONES Y SERVICIOS NOVA TACNA E.I.R.L.",
  "estado": "APROBADA",
  "nextStep": "PAYMENT_PENDING",
  "message": "Empresa aprobada correctamente."
}
```

Endpoint de rechazo:

```http
POST /api/admin/empresas/{companyId}/reject
```

Request opcional:

```json
{
  "reason": "Información no validada por el administrador."
}
```

Respuesta esperada:

```json
{
  "success": true,
  "companyId": 21,
  "ruc": "20608026160",
  "razonSocial": "DISTRIBUCIONES Y SERVICIOS NOVA TACNA E.I.R.L.",
  "estado": "RECHAZADA",
  "nextStep": "REJECTED",
  "message": "Empresa rechazada correctamente."
}
```

---

### 5.4 Validaciones backend

Antes de aprobar:

```text
La empresa debe existir.
La empresa debe estar pendiente.
El usuario que llama debe ser administrador.
No debe aprobar empresas activas o ya rechazadas sin regla explícita.
No debe crear duplicados.
No debe alterar datos RUC, ApiPeruDev, pagos ni BCrypt.
```

Antes de rechazar:

```text
La empresa debe existir.
La empresa debe estar pendiente.
El usuario que llama debe ser administrador.
Debe actualizar estado real.
Puede guardar motivo si existe columna para ello.
Si no existe columna de motivo, no crearla salvo que encaje con la arquitectura y sea necesario.
```

---

## 6. Diseño frontend esperado

### 6.1 Archivos a auditar

```text
AdminEmpresas.tsx
AdminSolicitudes.tsx
adminApi.ts
types.ts
RegisterCompanyPage.tsx
pantalla “Tu empresa está en revisión”
componente de pasos del registro
pantalla o estado de rechazo
```

---

### 6.2 Panel Administrador

Los botones **Aprobar** y **Rechazar** deben estar habilitados cuando la empresa esté pendiente.

Regla visual:

```text
Estado PENDIENTE:
- botón Aprobar habilitado
- botón Rechazar habilitado

Estado APROBADA / PRUEBA_ACTIVA / ACTIVA:
- botones no deben aparecer o deben quedar deshabilitados con estado claro

Estado RECHAZADA:
- mostrar estado rechazado
- no permitir aprobar/rechazar nuevamente salvo regla explícita
```

Al aprobar:

```text
Click en Aprobar
→ adminApi.approveCompany(companyId)
→ loading en botón
→ actualizar lista
→ mover contador pendientes/verificadas
→ mostrar toast de éxito
```

Al rechazar:

```text
Click en Rechazar
→ opcional confirmar acción
→ adminApi.rejectCompany(companyId)
→ loading en botón
→ actualizar lista
→ empresa queda RECHAZADA
→ mostrar toast de éxito
```

---

### 6.3 Pantalla pública de revisión

Eliminar completamente:

```text
Modo Desarrollo / Pruebas
Simular aprobación administrativa
bloque amarillo
botón de simulación
cualquier referencia a mock o desarrollo
```

Reemplazar por botón:

```text
Continuar
```

Estado pendiente:

```text
Botón visible, verde opaco, deshabilitado.
```

Estado aprobado:

```text
Botón verde normal, habilitado.
Click → ir a plan y pago.
```

Estado rechazado:

```text
Mostrar pantalla de rechazo.
No habilitar continuar.
Mostrar correo de contacto del administrador.
```

---

## 7. Contrato de registration-status

El endpoint ya existente debe seguir manejando la navegación pública.

### 7.1 Empresa pendiente

```json
{
  "exists": true,
  "ruc": "20608026160",
  "companyId": 21,
  "razonSocial": "DISTRIBUCIONES Y SERVICIOS NOVA TACNA E.I.R.L.",
  "tipoEmpresa": "RECOLECTORA",
  "correoContacto": "serviciosnova@gmail.com",
  "verificationStatus": "PENDIENTE",
  "subscriptionStatus": "PENDIENTE",
  "nextStep": "REVIEW_PENDING",
  "message": "Tu empresa está en revisión."
}
```

### 7.2 Empresa aprobada

```json
{
  "exists": true,
  "ruc": "20608026160",
  "companyId": 21,
  "razonSocial": "DISTRIBUCIONES Y SERVICIOS NOVA TACNA E.I.R.L.",
  "tipoEmpresa": "RECOLECTORA",
  "correoContacto": "serviciosnova@gmail.com",
  "verificationStatus": "APROBADA",
  "subscriptionStatus": "PENDIENTE_PAGO",
  "nextStep": "PAYMENT_PENDING",
  "message": "Tu empresa fue aprobada. Continúa con el pago."
}
```

### 7.3 Empresa rechazada

```json
{
  "exists": true,
  "ruc": "20608026160",
  "companyId": 21,
  "razonSocial": "DISTRIBUCIONES Y SERVICIOS NOVA TACNA E.I.R.L.",
  "tipoEmpresa": "RECOLECTORA",
  "correoContacto": "serviciosnova@gmail.com",
  "verificationStatus": "RECHAZADA",
  "subscriptionStatus": "RECHAZADA",
  "nextStep": "REJECTED",
  "message": "Tu solicitud fue denegada. Comunícate con admin@ecotacna.com."
}
```

---

## 8. Seguridad

### 8.1 Público

Debe seguir siendo público:

```http
GET /api/auth/registration-status/{ruc}
```

porque se usa antes del login.

Pero solo debe devolver datos mínimos necesarios.

---

### 8.2 Protegido

Deben estar protegidos por rol administrador:

```http
POST /api/admin/empresas/{companyId}/approve
POST /api/admin/empresas/{companyId}/reject
```

No deben ser públicos.

No deben poder ejecutarse desde la pantalla de registro.

---

### 8.3 Prohibiciones

No hacer:

```text
anyRequest().permitAll()
desactivar Spring Security
aprobar desde pantalla pública
aprobar con localStorage
aprobar con endpoint de desarrollo
crear duplicados
cambiar contraseñas
tocar pagos simulados
tocar ApiPeruDev
```

---

## 9. Prompt para Antigravity

```text
Actúa como desarrollador senior full stack y auditor de arquitectura del proyecto EcoTacna.

Necesito implementar de forma limpia y definitiva el flujo real de aprobación y rechazo administrativo de empresas.

Contexto:
En el Panel Administrador ya aparecen las empresas pendientes y visualmente existen botones Aprobar y Rechazar, pero están deshabilitados o no ejecutan acciones reales. Además, en la pantalla pública “Tu empresa está en revisión” todavía existía un flujo anterior de simulación/desarrollo que debe ser eliminado por completo.

Objetivo:
1. Habilitar aprobación real desde Panel Administrador.
2. Habilitar rechazo real desde Panel Administrador.
3. Eliminar cualquier botón o bloque de simulación/desarrollo en la pantalla pública.
4. Hacer que la pantalla pública dependa del estado real de backend.
5. Si la empresa está pendiente, el botón Continuar aparece verde opaco/deshabilitado.
6. Si el administrador aprueba, el botón Continuar se habilita y lleva a Plan y pago.
7. Si el administrador rechaza, al consultar el RUC se muestra una pantalla de rechazo con mensaje claro y correo del administrador.
8. No crear duplicados.
9. No tocar flujos ya cerrados.

Antes de tocar código, lee obligatoriamente:
- tasks.md
- SSD.md
- spec.md
- architecture.md
- security.md
- walkthrough.md
- README_HANDOFF_ECOTACNA.md si existe
- APIPERUDEV_RUC_ECOTACNA.md si existe

Reglas:
- Primero auditar.
- Identificar causa raíz.
- Respetar arquitectura por capas.
- No hacer parches visuales.
- No hardcodear estados.
- No introducir mocks.
- No aprobar desde pantalla pública.
- No desactivar seguridad.
- No usar anyRequest().permitAll().
- No tocar ApiPeruDev, RucLookup, pagos simulados, BCrypt, login, suscripciones ni variables de entorno.
- Ejecutar pruebas obligatorias.

Backend a revisar:
- Company.java
- User.java
- CompanyRepository.java
- UserRepository.java
- AdminDashboardController.java
- AdminDashboardService.java
- AuthController.java
- AuthService.java
- RegistrationStatusResponse.java o equivalente
- SecurityConfig.java solo si es necesario
- Tests de integración

Frontend a revisar:
- AdminEmpresas.tsx
- AdminSolicitudes.tsx
- adminApi.ts
- types.ts
- RegisterCompanyPage.tsx
- componente/pantalla “Tu empresa está en revisión”
- pantalla o estado de rechazo
- componentes de pasos de registro

Auditoría:
1. Identificar por qué los botones Aprobar/Rechazar están deshabilitados.
2. Identificar si ya existe endpoint real para aprobar/rechazar.
3. Identificar el campo real que representa estado de empresa.
4. Identificar cómo registration-status calcula nextStep.
5. Identificar si existe UI de rechazo o crearla de forma limpia.
6. Confirmar que la aprobación solo se haga desde endpoint admin protegido.

Implementación backend:
1. Crear o corregir endpoint protegido para aprobar empresa:
   POST /api/admin/empresas/{companyId}/approve
2. Crear o corregir endpoint protegido para rechazar empresa:
   POST /api/admin/empresas/{companyId}/reject
3. La lógica debe estar en AdminDashboardService o service administrativo equivalente.
4. Validar que la empresa exista.
5. Validar que esté pendiente.
6. Cambiar estado real de Company.
7. Guardar cambios.
8. Devolver DTO con estado actualizado.
9. registration-status debe devolver:
   - REVIEW_PENDING si sigue pendiente.
   - PAYMENT_PENDING si fue aprobada y debe ir a pago.
   - REJECTED si fue rechazada.
   - ACTIVE_LOGIN si ya está activa.
10. No tocar ApiPeruDevRucService.

Implementación frontend admin:
1. Habilitar botones Aprobar/Rechazar solo para empresas pendientes.
2. Al aprobar:
   - llamar adminApi.approveCompany(companyId)
   - mostrar loading
   - actualizar listado y contadores
   - mostrar éxito
3. Al rechazar:
   - llamar adminApi.rejectCompany(companyId)
   - opcional confirmar acción
   - actualizar listado y contadores
   - mostrar éxito
4. No dejar botones falsos sin acción.
5. No dejar acciones habilitadas para empresas ya activas o rechazadas.

Implementación frontend público:
1. Eliminar bloque “Modo Desarrollo / Pruebas”.
2. Eliminar botón “Simular aprobación administrativa”.
3. Mostrar botón “Continuar”.
4. Si nextStep = REVIEW_PENDING:
   - Continuar deshabilitado
   - verde opaco
   - no avanza
5. Si nextStep = PAYMENT_PENDING:
   - Continuar habilitado
   - verde normal
   - avanza a Plan y pago
6. Si nextStep = REJECTED:
   - mostrar pantalla/mensaje de rechazo
   - icono rojo o alerta
   - mensaje para comunicarse con admin@ecotacna.com
   - no permitir avanzar
7. Si nextStep = ACTIVE_LOGIN:
   - mostrar mensaje para iniciar sesión
8. Consultar estado real al cargar la pantalla y al reintentar/actualizar.

Pruebas backend:
.\mvnw.cmd clean compile
.\mvnw.cmd test

Pruebas frontend:
npm run lint
npx tsc --noEmit
npm run build

Validación manual:
1. Registrar empresa nueva.
2. Confirmar que queda en revisión.
3. Confirmar que pantalla pública no tiene bloque de simulación.
4. Confirmar botón Continuar deshabilitado.
5. Entrar al Panel Administrador.
6. Confirmar botones Aprobar/Rechazar habilitados para pendientes.
7. Aprobar una empresa.
8. Confirmar que registration-status cambia a PAYMENT_PENDING.
9. Confirmar que pantalla pública habilita Continuar.
10. Confirmar que Continuar lleva a Plan y pago.
11. Registrar o usar otra empresa pendiente.
12. Rechazarla desde admin.
13. Consultar RUC desde pantalla pública.
14. Confirmar que muestra pantalla de rechazo con correo admin.
15. Confirmar que no permite avanzar.
16. Confirmar que no se crean duplicados.
17. Confirmar que admin endpoints están protegidos.
18. Confirmar que ApiPeruDev, RucLookup, pagos simulados, login, BCrypt y suscripciones siguen funcionando.

Entregable final:
1. Causa raíz de botones deshabilitados.
2. Archivos revisados.
3. Archivos modificados.
4. Endpoints finales de aprobación/rechazo.
5. Estados reales usados.
6. Contrato final de registration-status para pendiente, aprobado y rechazado.
7. Evidencia de aprobación desde admin.
8. Evidencia de rechazo desde admin.
9. Evidencia de pantalla pública pendiente.
10. Evidencia de pantalla pública aprobada con Continuar habilitado.
11. Evidencia de pantalla pública rechazada.
12. Resultado de compile/test/lint/tsc/build.
13. Confirmación de que no se tocaron ApiPeruDev, RucLookup, pagos simulados, login, BCrypt, suscripciones ni SecurityConfig salvo que fuese necesario.
14. Confirmación de que no se reintrodujeron mocks, Empresa {ruc}, SUNAT funcional ni Andrea Vargas.

Criterio de cierre:
El flujo solo se considera terminado cuando:
- una empresa pendiente puede ser aprobada desde admin;
- una empresa pendiente puede ser rechazada desde admin;
- la pantalla pública reacciona al estado real;
- el botón Continuar solo se habilita tras aprobación;
- el rechazo muestra interfaz roja/informativa;
- no existen simulaciones ni autoaprobación pública;
- no se crean duplicados;
- todo pasa pruebas.
```

---

## 10. Pruebas finales obligatorias

### Backend

```powershell
.\mvnw.cmd clean compile
.\mvnw.cmd test
```

### Frontend

```powershell
npm run lint
npx tsc --noEmit
npm run build
```

### Manual

```text
1. Registro nuevo.
2. Estado pendiente.
3. Botón Continuar deshabilitado.
4. Admin aprueba.
5. Botón Continuar habilitado.
6. Avanza a Plan y pago.
7. Nuevo registro pendiente.
8. Admin rechaza.
9. Consulta RUC rechazado.
10. Pantalla de rechazo.
11. No se crean duplicados.
12. Endpoints privados siguen protegidos.
```

---

## 11. Criterio de cierre final

Este flujo queda solucionado cuando:

```text
La aprobación solo ocurre desde Panel Administrador.
El rechazo solo ocurre desde Panel Administrador.
La pantalla pública no puede autoaprobarse.
La pantalla pública muestra estado real.
El botón Continuar se habilita solo con aprobación real.
La empresa rechazada ve una pantalla clara de rechazo.
El sistema no crea duplicados.
No hay mocks ni botones de desarrollo.
```
