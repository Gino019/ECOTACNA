# Integración de Culqi — ECO_TACNA

> Documento técnico completo de la integración de la pasarela de pagos Culqi en el sistema ECO_TACNA.
> Generado el 03/06/2026.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Arquitectura General del Flujo de Pagos](#2-arquitectura-general-del-flujo-de-pagos)
3. [Archivos Creados y Modificados](#3-archivos-creados-y-modificados)
4. [Backend — Detalle de Implementación](#4-backend--detalle-de-implementación)
5. [Frontend — Detalle de Implementación](#5-frontend--detalle-de-implementación)
6. [Configuración de Entorno](#6-configuración-de-entorno)
7. [Seguridad — Reglas Críticas](#7-seguridad--reglas-críticas)
8. [Modos de Operación: Mock vs Live](#8-modos-de-operación-mock-vs-live)
9. [Flujo Completo Paso a Paso](#9-flujo-completo-paso-a-paso)
10. [Modelos de Datos Involucrados](#10-modelos-de-datos-involucrados)
11. [Guía de Pruebas](#11-guía-de-pruebas)
12. [Migración a Producción](#12-migración-a-producción)

---

## 1. Resumen Ejecutivo

Se implementó la integración completa de la pasarela de pagos **Culqi** en el sistema ECO_TACNA, abarcando:

- **Backend (Spring Boot)**: Servicio `CulqiService` que encapsula la comunicación segura con la API de Culqi, controlador `PaymentProcessController` con el endpoint `POST /api/pagos/procesar`, y actualización del `SubscriptionService` para activar suscripciones tras el pago.
- **Frontend (React/Vite)**: Servicio `culqiService.ts` para tokenización PCI-DSS compliant, integración in-page del formulario de tarjeta dentro del stepper de registro (`RegisterCompanyPage`), gestión de estados de carga/error y vista de confirmación.

**Principio rector de seguridad**: La `SECRET_KEY` de Culqi **nunca** viaja al frontend ni se hardcodea en el código fuente. Solo existe como variable de entorno en el servidor backend.

---

## 2. Arquitectura General del Flujo de Pagos

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND                                   │
│                         (React / Vite / :8081)                          │
│                                                                         │
│  ┌───────────────────┐    ┌──────────────────┐    ┌──────────────────┐  │
│  │  RegisterCompany   │    │  culqiService.ts  │    │  paymentApi.ts   │  │
│  │  Page.tsx          │───▶│  tokenizeCard()   │───▶│ procesarPago     │  │
│  │  (Formulario de    │    │                    │    │ Publico()        │  │
│  │   tarjeta)         │    │  Llama a Culqi     │    │                  │  │
│  └───────────────────┘    │  con PUBLIC_KEY    │    │  POST al backend │  │
│                            └──────────────────┘    └──────────────────┘  │
│                                    │                        │            │
│                                    ▼                        ▼            │
│                          secure.culqi.com          localhost:8082        │
│                          /v2/tokens                /ecotacna/api         │
│                          (tokenId)                 /pagos/procesar       │
└────────────────────────────┼────────────────────────────┼───────────────┘
                             │                            │
                             │ tokenId                    │ { companyId,
                             │ (efímero, ~5 min)          │   culqiToken,
                             │                            │   email }
                             │                            ▼
┌────────────────────────────┼───────────────────────────────────────────┐
│                              BACKEND                                    │
│                      (Spring Boot / :8082)                               │
│                                                                         │
│  ┌──────────────────────┐    ┌──────────────────┐    ┌──────────────┐  │
│  │ PaymentProcess       │    │   CulqiService    │    │ Subscription │  │
│  │ Controller           │───▶│                    │───▶│ Service      │  │
│  │                      │    │ charge()           │    │              │  │
│  │ POST /api/pagos/     │    │ Usa SECRET_KEY     │    │ activate     │  │
│  │      procesar        │    │ del entorno        │    │ Subscription │  │
│  └──────────────────────┘    └──────────────────┘    └──────────────┘  │
│                                       │                      │          │
│                                       ▼                      ▼          │
│                              api.culqi.com          Base de Datos       │
│                              /v2/charges            (Supabase PG)       │
│                              (chargeId)             - subscriptions     │
│                                                     - payments          │
│                                                     - companies         │
│                                                     - audit_logs        │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Archivos Creados y Modificados

### 3.1 Archivos Nuevos

| Archivo | Capa | Descripción |
|---------|------|-------------|
| `dto/CulqiProcessPaymentRequest.java` | Backend | DTO de entrada para `POST /api/pagos/procesar` |
| `dto/PaymentProcessResponse.java` | Backend | DTO de respuesta con estado de suscripción y montos |
| `service/CulqiService.java` | Backend | Servicio de integración con la API de Culqi (charge) |
| `controller/PaymentProcessController.java` | Backend | Controlador del endpoint de procesamiento de pago |
| `services/culqiService.ts` | Frontend | Servicio de tokenización PCI-DSS con Culqi |

### 3.2 Archivos Modificados

| Archivo | Capa | Cambio |
|---------|------|--------|
| `service/SubscriptionService.java` | Backend | Agregado método `activateSubscription()` |
| `security/SecurityConfig.java` | Backend | Añadido `/api/pagos/**` a rutas públicas |
| `.env` (backend) | Config | Agregadas variables `CULQI_*` y `PAYMENTS_MODE` |
| `application.properties` | Config | Ya existían las propiedades `payments.culqi.*` |
| `services/paymentApi.ts` | Frontend | Agregado método `procesarPagoPublico()` |
| `pages/RegisterCompanyPage.tsx` | Frontend | Integración del formulario de pago in-page, paso 4 de confirmación |

---

## 4. Backend — Detalle de Implementación

### 4.1 `CulqiProcessPaymentRequest.java`

**Ruta**: `src/main/java/com/GAKOM_ECOTACNA/ECOTACNA/dto/CulqiProcessPaymentRequest.java`

```java
@Data
public class CulqiProcessPaymentRequest {
    @NotNull  private Long companyId;
    @NotBlank private String culqiToken;   // Token efímero de Culqi.js
    @Email    private String email;
    private String paymentMethod = "CARD";
}
```

**Decisión de diseño**: El frontend **solo** envía el `culqiToken` (generado por Culqi.js) junto con el `companyId` y el `email`. Nunca envía datos de tarjeta al backend propio.

---

### 4.2 `PaymentProcessResponse.java`

**Ruta**: `src/main/java/com/GAKOM_ECOTACNA/ECOTACNA/dto/PaymentProcessResponse.java`

Campos de respuesta:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `companyId` | `Long` | ID de la empresa |
| `companyName` | `String` | Razón social |
| `companyType` | `String` | `GENERADORA` o `RECOLECTORA` |
| `planName` | `String` | Nombre del plan contratado |
| `subscriptionStatus` | `String` | `ACTIVA` o `PRUEBA_ACTIVA` |
| `trialDays` | `int` | Días de prueba (0 si no aplica) |
| `amountCharged` | `BigDecimal` | Monto cobrado hoy (S/ 0.00 si prueba) |
| `monthlyAmount` | `BigDecimal` | Monto de renovación mensual |
| `chargeId` | `String` | ID del cargo en Culqi (null si prueba) |
| `message` | `String` | Mensaje de confirmación para el usuario |

---

### 4.3 `CulqiService.java`

**Ruta**: `src/main/java/com/GAKOM_ECOTACNA/ECOTACNA/service/CulqiService.java`

Este es el **único punto del sistema** que usa la `SECRET_KEY` de Culqi.

#### Métodos públicos:

| Método | Descripción |
|--------|-------------|
| `charge(token, amount, email, company)` | Realiza un cargo directo contra `api.culqi.com/v2/charges` |
| `isMockMode()` | Retorna `true` si el modo es `mock`, la clave está vacía o es `sk_test_dummy` |

#### Flujo interno de `charge()`:

1. Valida que la `SECRET_KEY` esté configurada (no mock).
2. Convierte el monto de soles a céntimos (`amount * 100`).
3. Construye el body JSON: `{ amount, currency_code: "PEN", email, source_id: token }`.
4. Agrega el header `Authorization: Bearer {SECRET_KEY}`.
5. Hace `POST` a `https://api.culqi.com/v2/charges`.
6. Si la respuesta es `2xx`, extrae y retorna el `chargeId`.
7. Si Culqi rechaza, extrae el `user_message` del JSON de error para mostrar un mensaje legible al usuario.

#### Configuración inyectada:

```java
@Value("${payments.culqi.secret-key:}")
private String secretKey;

@Value("${payments.mode:mock}")
private String paymentsMode;
```

---

### 4.4 `SubscriptionService.java` — Método `activateSubscription()`

**Ruta**: `src/main/java/com/GAKOM_ECOTACNA/ECOTACNA/service/SubscriptionService.java`

#### Parámetros:

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `company` | `Company` | Empresa que contrata |
| `plan` | `SubscriptionPlan` | Plan elegido |
| `amountCharged` | `BigDecimal` | Monto cobrado (0 si prueba) |
| `culqiChargeId` | `String` | ID del cargo de Culqi |
| `culqiToken` | `String` | Token original (trazabilidad) |
| `ipAddress` | `String` | IP del solicitante (auditoría) |

#### Lógica de estado:

```
Si plan.trialDays > 0 AND amountCharged == 0:
    estado = PRUEBA_ACTIVA
    periodEnd = hoy + trialDays días
Else:
    estado = ACTIVA
    periodEnd = hoy + 1 mes
```

#### Operaciones en una sola transacción (`@Transactional`):

1. **Busca o crea** la `Subscription` de la empresa.
2. **Actualiza** los campos: `plan`, `status`, `startDate`, `trialEndsAt`, `currentPeriodStart`, `currentPeriodEnd`, `nextBillingDate`, `provider = "CULQI"`.
3. **Guarda** la suscripción en la tabla `subscriptions`.
4. **Actualiza** `company.subscriptionStatus` en la tabla `companies`.
5. **Registra** un `Payment` con:
   - `status = APROBADO`
   - `provider = CULQI`
   - `mode = LIVE`
   - `providerChargeId` y `providerTokenId` para trazabilidad.
6. **Audita** el evento `SUBSCRIPTION_ACTIVATED` vía `AuditLogService`.

---

### 4.5 `PaymentProcessController.java`

**Ruta**: `src/main/java/com/GAKOM_ECOTACNA/ECOTACNA/controller/PaymentProcessController.java`

**Endpoint**: `POST /api/pagos/procesar`
**Acceso**: Público (`permitAll` en `SecurityConfig`) — la empresa aún no tiene JWT al momento de pagar.

#### Flujo del controlador:

```
1. Recibir CulqiProcessPaymentRequest { companyId, culqiToken, email }
2. Validar empresa (companyRepository.findById)
3. Buscar plan activo para el tipo de empresa
4. Determinar si es prueba gratis (trialDays > 0 → todayAmount = S/ 0.00)
5. Si modo MOCK:
     → chargeId = "chr_mock_{ruc}_{timestamp}"
   Si modo LIVE y todayAmount > 0:
     → chargeId = culqiService.charge(token, amount, email, company)
   Si modo LIVE y todayAmount == 0 (prueba):
     → chargeId = null (no se cobra)
6. subscriptionService.activateSubscription(...)
7. Retornar PaymentProcessResponse con estado, montos y mensaje
```

---

### 4.6 `SecurityConfig.java` — Cambio

**Línea agregada:**

```java
.requestMatchers("/api/pagos/**").permitAll()
```

Esto permite que el endpoint de pago sea accesible sin JWT, ya que la empresa se registra y paga antes de tener una sesión autenticada.

---

## 5. Frontend — Detalle de Implementación

### 5.1 `culqiService.ts`

**Ruta**: `src/services/culqiService.ts`

Servicio que encapsula la tokenización segura de tarjeta con la API REST de Culqi.

#### Método `tokenizeCard()`:

```typescript
tokenizeCard(data: CulqiCardData, publicKey: string): Promise<string>
```

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `data.cardNumber` | `string` | Número de tarjeta (se limpia de espacios) |
| `data.cvv` | `string` | Código de seguridad (3-4 dígitos) |
| `data.expirationMonth` | `number` | Mes de expiración (1-12) |
| `data.expirationYear` | `number` | Año de expiración (ej. 2028) |
| `data.email` | `string` | Correo del pagador |
| `publicKey` | `string` | Llave pública de Culqi (`pk_test_...`) |

**Flujo**:

1. Limpia y valida formato de tarjeta (13-19 dígitos), CVV (3-4), mes (1-12), año (≥ actual).
2. Hace `POST` a `https://secure.culqi.com/v2/tokens` con header `Authorization: Bearer {PUBLIC_KEY}`.
3. Si la respuesta es exitosa, retorna `resBody.id` (el tokenId).
4. Si hay error, extrae `user_message` o `merchant_message` de Culqi.

---

### 5.2 `paymentApi.ts` — Método agregado

```typescript
procesarPagoPublico(data: {
  companyId: number;
  culqiToken: string;
  email: string;
  paymentMethod?: string;
}): Promise<any>
```

Invoca `POST /api/pagos/procesar` del backend usando el `apiClient` existente del proyecto.

---

### 5.3 `RegisterCompanyPage.tsx` — Modificaciones

#### Estados nuevos:

| Estado | Tipo | Propósito |
|--------|------|-----------|
| `selectedPlanDetails` | `object \| null` | Plan seleccionado (name, amount, trialDays, code) |
| `paymentFormActive` | `boolean` | Controla si se muestra el formulario de tarjeta |
| `isProcessing` | `boolean` | Bloquea botones durante el procesamiento |
| `paymentError` | `string \| null` | Mensaje de error amigable para el usuario |
| `cardName` | `string` | Titular de la tarjeta |
| `cardEmail` | `string` | Correo de confirmación |
| `cardNumber` | `string` | Número de tarjeta |
| `cardExpiry` | `string` | Fecha de vencimiento (MM/AA) |
| `cardCvv` | `string` | Código CVV |
| `paymentResult` | `any` | Respuesta del backend tras el pago exitoso |

#### Funciones nuevas:

| Función | Descripción |
|---------|-------------|
| `handleSelectPlan(type)` | Registra el plan seleccionado y abre el formulario de pago |
| `handlePayment(e)` | Tokeniza con Culqi (si no es mock), envía al backend y gestiona éxito/error |
| `handleFinishAndNavigate()` | Redirige al dashboard correspondiente (`/empresa` o `/recolector`) |

#### Stepper actualizado:

| Paso | Nombre | Contenido |
|------|--------|-----------|
| 1 | Registro de empresa | RUC + datos auxiliares + reCAPTCHA |
| 2 | Verificación | Revisión administrativa (mock) |
| 3 | Plan y pago | Selección de plan → Formulario de tarjeta in-page |
| 4 | Confirmación | Resumen visual de suscripción activada |
| 5 | Acceso al sistema | Botón "Ir al Panel de Control" → redirección |

#### Comportamiento del formulario de pago (Paso 3):

- Al seleccionar un plan, se despliega un formulario premium con campos de tarjeta.
- El email y nombre del titular se prellenan con los datos del registro.
- Si hay un error, se muestra un componente `<Alert variant="destructive">` con el mensaje.
- Durante el procesamiento, el botón muestra un spinner animado y se bloquean todos los inputs.
- Si `VITE_PAYMENTS_MODE=mock`, se genera un token ficticio y se simula la transacción.

---

## 6. Configuración de Entorno

### 6.1 Backend — `.env`

```env
# Pasarela de pagos Culqi
PAYMENTS_MODE=mock              # mock | live
PAYMENTS_PROVIDER=mock          # mock | culqi

# Llaves de Culqi (reemplazar en producción)
CULQI_PUBLIC_KEY=pk_test_dummy
CULQI_SECRET_KEY=sk_test_dummy
CULQI_WEBHOOK_SECRET=
```

### 6.2 Backend — `application.properties`

```properties
payments.enabled=${PAYMENTS_ENABLED:true}
payments.provider=${PAYMENTS_PROVIDER:mock}
payments.mode=${PAYMENTS_MODE:mock}

payments.culqi.public-key=${CULQI_PUBLIC_KEY:pk_test_dummy}
payments.culqi.secret-key=${CULQI_SECRET_KEY:sk_test_dummy}
payments.culqi.webhook-secret=${CULQI_WEBHOOK_SECRET:}
```

### 6.3 Frontend — `.env.local`

```env
VITE_API_BASE_URL=http://localhost:8082/ecotacna/api
VITE_PAYMENTS_MODE=mock
VITE_CULQI_PUBLIC_KEY=pk_test_dummy
```

---

## 7. Seguridad — Reglas Críticas

| # | Regla | Implementación |
|---|-------|----------------|
| 1 | La `SECRET_KEY` **NUNCA** va al frontend | Solo se lee en `CulqiService.java` desde `@Value("${payments.culqi.secret-key}")` |
| 2 | La `SECRET_KEY` **NUNCA** se hardcodea | Se inyecta desde la variable de entorno `CULQI_SECRET_KEY` |
| 3 | Los datos de tarjeta **NUNCA** tocan el backend propio | El frontend tokeniza directo con `secure.culqi.com/v2/tokens` usando la `PUBLIC_KEY` |
| 4 | El backend solo recibe el `tokenId` efímero | Token de ~5 minutos de vida, uso único, generado por Culqi |
| 5 | Los datos sensibles se limpian del estado tras el uso | `setCardNumber("")`, `setCvv("")`, etc. |
| 6 | El endpoint `/api/pagos/**` es público | Necesario porque la empresa aún no tiene JWT al registrarse |
| 7 | Toda transacción se audita | `AuditLogService.log()` con IP, plan, monto y chargeId |

---

## 8. Modos de Operación: Mock vs Live

### 8.1 Modo Mock (Desarrollo)

**Activación**: `PAYMENTS_MODE=mock` o `CULQI_SECRET_KEY=sk_test_dummy`

| Componente | Comportamiento |
|------------|----------------|
| Frontend | Genera un token ficticio `tkn_mock_dev_xxxxx` |
| Backend | No llama a `api.culqi.com`. Genera `chr_mock_{ruc}_{timestamp}` |
| Suscripción | Se activa normalmente en BD |
| Payment | Se registra con `provider=CULQI`, `mode=LIVE`, `status=APROBADO` |

### 8.2 Modo Live (Producción / Sandbox real)

**Activación**: `PAYMENTS_MODE=live` + `CULQI_SECRET_KEY=sk_test_xxxx` (o `sk_live_xxxx`)

| Componente | Comportamiento |
|------------|----------------|
| Frontend | Tokeniza contra `secure.culqi.com/v2/tokens` con la `PUBLIC_KEY` real |
| Backend | Llama a `api.culqi.com/v2/charges` con la `SECRET_KEY` real |
| Suscripción | Se activa solo si Culqi confirma el cargo |
| Payment | Se registra con el `chargeId` real de Culqi |

### 8.3 Detección automática

El `CulqiService.isMockMode()` retorna `true` si:

```java
"mock".equalsIgnoreCase(paymentsMode)
    || secretKey == null
    || secretKey.trim().isEmpty()
    || "sk_test_dummy".equals(secretKey.trim());
```

El frontend detecta modo mock si:

```typescript
const isMock = paymentsMode === "mock" || culqiPublicKey === "pk_test_dummy";
```

---

## 9. Flujo Completo Paso a Paso

```
USUARIO                     FRONTEND                      CULQI API                 BACKEND ECO_TACNA
───────                     ────────                      ─────────                 ─────────────────
1. Completa formulario
   de tarjeta
        ────────────────▶
                          2. Valida inputs locales
                             (cardNumber, CVV, fecha)

                          3. [Si modo LIVE]
                             POST secure.culqi.com
                             /v2/tokens
                             {card_number, cvv,
                              exp_month, exp_year,
                              email}
                             Authorization: Bearer pk_test_...
                                    ─────────────────▶
                                                        4. Culqi valida y
                                                           retorna tokenId
                                    ◀─────────────────
                                                           (tkn_live_xxxx)

                          5. [Si modo MOCK]
                             token = "tkn_mock_dev_xxx"

                          6. POST localhost:8082
                             /ecotacna/api/pagos/procesar
                             { companyId, culqiToken,
                               email, paymentMethod }
                                                                          ────────────────▶
                                                                          7. Valida Company
                                                                          8. Busca SubscriptionPlan

                                                                          9. [Si modo LIVE y monto > 0]
                                                                             POST api.culqi.com
                                                                             /v2/charges
                                                                             Authorization: Bearer sk_test_...
                                                                             { amount, currency_code,
                                                                               email, source_id: token }
                                                                                    ─────────────────▶
                                                                                                      10. Culqi cobra
                                                                                                          y retorna
                                                                                                          chargeId
                                                                                    ◀─────────────────

                                                                          11. [Si modo MOCK]
                                                                              chargeId = "chr_mock_..."

                                                                          12. activateSubscription()
                                                                              - Crea/actualiza Subscription
                                                                              - Actualiza Company.status
                                                                              - Registra Payment
                                                                              - Audita evento

                                                                          13. Retorna PaymentProcessResponse
                                                                          ◀────────────────
                          14. Muestra paso 4:
                              "¡Activación Exitosa!"
                              con resumen del plan,
                              monto cobrado y
                              botón "Ir al Panel"
◀────────────────────────

15. Click "Ir al Panel"
        ────────────────▶
                          16. navigate("/empresa")
                              o navigate("/recolector")
```

---

## 10. Modelos de Datos Involucrados

### 10.1 Tabla `subscriptions`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `BIGINT` | PK auto-incremental |
| `company_id` | `BIGINT FK` | Empresa propietaria |
| `plan_id` | `BIGINT FK` | Plan contratado |
| `status` | `VARCHAR(30)` | `ACTIVA`, `PRUEBA_ACTIVA`, `PENDIENTE`, etc. |
| `start_date` | `DATE` | Fecha de inicio |
| `trial_ends_at` | `DATE` | Fin del periodo de prueba (null si no aplica) |
| `current_period_start` | `DATE` | Inicio del periodo actual |
| `current_period_end` | `DATE` | Fin del periodo actual |
| `next_billing_date` | `DATE` | Próxima fecha de facturación |
| `provider` | `VARCHAR(50)` | `CULQI` |

### 10.2 Tabla `payments`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id` | `BIGINT` | PK auto-incremental |
| `subscription_id` | `BIGINT FK` | Suscripción asociada |
| `company_id` | `BIGINT FK` | Empresa que pagó |
| `amount` | `DECIMAL(10,2)` | Monto cobrado |
| `currency` | `VARCHAR(3)` | `PEN` |
| `status` | `ENUM` | `APROBADO`, `PENDIENTE`, `RECHAZADO`, `ERROR`, `EXPIRADO` |
| `provider` | `ENUM` | `CULQI`, `MOCK` |
| `mode` | `ENUM` | `MOCK`, `SANDBOX`, `LIVE` |
| `provider_charge_id` | `VARCHAR(100)` | ID del cargo en Culqi |
| `provider_token_id` | `VARCHAR(100)` | Token de Culqi (trazabilidad) |
| `description` | `VARCHAR(255)` | Descripción del pago |

### 10.3 Tabla `companies` (campo modificado)

| Columna | Tipo | Uso |
|---------|------|-----|
| `subscription_status` | `VARCHAR` | Se actualiza a `ACTIVA` o `PRUEBA_ACTIVA` tras el pago |

### 10.4 Enums relevantes

```java
public enum SubscriptionStatus {
    PENDIENTE, PENDIENTE_PAGO, PRUEBA_ACTIVA, ACTIVA,
    VENCIDA, SUSPENDIDA, CANCELADA
}

public enum PaymentStatus { PENDIENTE, APROBADO, RECHAZADO, EXPIRADO, ERROR }
public enum PaymentProvider { MOCK, CULQI }
public enum PaymentMode { MOCK, SANDBOX, LIVE }
```

---

## 11. Guía de Pruebas

### 11.1 Prueba Local (Modo Mock)

1. Levantar el backend: `mvn spring-boot:run "-Dspring-boot.run.profiles=supabase"` en `:8082`.
2. Levantar el frontend: `npm run dev` en `:8081`.
3. Navegar a `http://localhost:8081/registro`.
4. Buscar RUC `20123456789`.
5. Completar datos auxiliares y captcha.
6. Simular aprobación administrativa.
7. Seleccionar plan y llenar formulario de tarjeta con datos ficticios:
   - Tarjeta: `4111 2222 3333 4444`
   - Vencimiento: `12/28`
   - CVV: `123`
8. Confirmar → el sistema activará la suscripción sin llamar a Culqi.

### 11.2 Prueba con Culqi Sandbox

1. Obtener llaves de prueba de Culqi:
   - `pk_test_xxxxxxxxxxxx` (pública)
   - `sk_test_xxxxxxxxxxxx` (secreta)
2. Configurar en el backend `.env`:
   ```
   PAYMENTS_MODE=live
   CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
   CULQI_SECRET_KEY=sk_test_xxxxxxxxxxxx
   ```
3. Configurar en el frontend `.env.local`:
   ```
   VITE_PAYMENTS_MODE=culqi
   VITE_CULQI_PUBLIC_KEY=pk_test_xxxxxxxxxxxx
   ```
4. Usar tarjeta de prueba de Culqi: `4111 1111 1111 1111`, vencimiento futuro, CVV `123`.

### 11.3 Tests del Backend

```bash
mvn test
# Resultado esperado: Tests run: 7, Failures: 0, Errors: 0
```

### 11.4 Build del Frontend

```bash
npm run build
# Resultado esperado: ✓ built in ~3s sin errores de TypeScript
```

---

## 12. Migración a Producción

### Checklist de despliegue:

- [ ] Obtener llaves de producción de Culqi (`pk_live_...`, `sk_live_...`)
- [ ] Configurar en el servidor (NO en código):
  ```
  PAYMENTS_MODE=live
  CULQI_PUBLIC_KEY=pk_live_xxxxxxxxxxxx
  CULQI_SECRET_KEY=sk_live_xxxxxxxxxxxx
  ```
- [ ] Configurar `CULQI_WEBHOOK_SECRET` si se usa el endpoint de webhooks
- [ ] Verificar que `.env` y `.env.local` están en `.gitignore`
- [ ] Confirmar que `sk_live_*` **NUNCA** aparece en el repositorio Git
- [ ] Habilitar HTTPS en producción (requerido por Culqi para pagos reales)
- [ ] Configurar CORS en `SecurityConfig` para el dominio de producción
- [ ] Deshabilitar el modo bootstrap del admin: `ecotacna.bootstrap.enabled=false`
- [ ] Revisar el límite del pool de conexiones de Supabase para carga de producción

---

> **Documento generado como referencia técnica del equipo de desarrollo de ECO_TACNA.**
> Para dudas sobre la integración, consultar los archivos fuente referenciados en cada sección.
