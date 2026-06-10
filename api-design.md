# Diseño de la API (api-design.md)

**Proyecto**: ECO_TACNA
**Versión**: 1.1.0-MVP (Basado en el estado final de la Fase 10)

Esta documentación refleja el backend real. Todas las rutas antiguas relacionadas con B2B, compras, SUNAT o marketplace han sido removidas.

---

## 1. Módulo de Autenticación (`/api/auth`)

Rutas públicas para registro e inicio de sesión. Devuelven tokens JWT.

### 1.1. Registro de Empresa
- **Método**: `POST`
- **Ruta**: `/api/auth/register`
- **Body**: `AuthRequest` (email, password, ruc, businessName, address, companyType)
- **Acción**: Crea una nueva empresa y usuario administrador inicial.

### 1.2. Inicio de Sesión
- **Método**: `POST`
- **Ruta**: `/api/auth/login`
- **Body**: `LoginRequest` (email, password)
- **Respuesta**: `AuthResponse` (token, role, email, companyName, companyId, userId, companyType, subscriptionStatus)

---

## 2. Módulo de Empresa Generadora (`/api/empresa`)

Accesible solo para usuarios con rol `GENERADOR` cuya empresa tenga suscripción `ACTIVA`.

### 2.1. Listar Solicitudes Propias
- **Método**: `GET`
- **Ruta**: `/api/empresa/solicitudes`
- **Respuesta**: `List<PickupRequestResponse>` (solicitudes realizadas por la empresa).

### 2.2. Crear Solicitud de Recojo
- **Método**: `POST`
- **Ruta**: `/api/empresa/solicitudes`
- **Body**: `PickupRequestRequest` (volumenAproximado, fechaSolicitada, direccion, observaciones)
- **Respuesta**: `PickupRequestResponse` (estado inicial `PENDIENTE`).

---

## 3. Módulo del Recolector (`/api/recolector`)

Accesible solo para usuarios con rol `RECOLECTOR` cuya empresa tenga suscripción `ACTIVA`.

### 3.1. Listar Solicitudes Asignadas
- **Método**: `GET`
- **Ruta**: `/api/recolector/solicitudes`
- **Respuesta**: `List<PickupRequestResponse>` (solicitudes donde `collectorUserId` es el usuario actual).

### 3.2. Cambiar Solicitud a EN_RUTA
- **Método**: `PUT`
- **Ruta**: `/api/recolector/recojos/{id}/en-ruta`
- **Acción**: Actualiza el estado de `PROGRAMADO` a `EN_RUTA`. Valida que la solicitud le pertenezca.

### 3.3. Confirmar Recojo
- **Método**: `PUT`
- **Ruta**: `/api/recolector/recojos/{id}/confirmar`
- **Body**: `PickupConfirmationRequest` (volumenReal)
- **Acción**: Actualiza de `EN_RUTA` a `RECOGIDO` y registra el volumen real recogido.

### 3.4. Gestionar Unidades Vehiculares
- **Listar**: `GET /api/recolector/transportes` (o alias `/api/recolector/unidades`)
- **Crear**: `POST /api/recolector/unidades` -> Body: `TransportUnitRequest` (placa, marca, modelo, capacidadLitros, tipoUnidad, estado, observaciones).
- **Modificar**: `PUT /api/recolector/unidades/{id}` -> Body: `TransportUnitRequest`.
- **Restricción**: Valida que la placa sea única y que la unidad pertenezca a la empresa del recolector.

---

## 4. Módulo de Administración (`/api/admin`)

Accesible solo para rol `ADMIN`. No restringe por estado de suscripción.

### 4.1. Resumen de Dashboard
- **Método**: `GET`
- **Ruta**: `/api/admin/resumen`

### 4.2. Listados Maestros
- **Listar Empresas**: `GET /api/admin/empresas`
- **Listar Todas las Solicitudes**: `GET /api/admin/solicitudes`
- **Listar Todos los Usuarios**: `GET /api/admin/usuarios`
- **Listar Unidades (Transportes)**: `GET /api/admin/transportes`

### 4.3. Gestionar Suscripciones
- **Método**: `PUT`
- **Ruta**: `/api/admin/suscripciones/{empresaId}`
- **Body**: `SubscriptionUpdateRequest` (nuevoEstado: `ACTIVA`, `PENDIENTE`, `VENCIDA`, `SUSPENDIDA`)
- **Acción**: Actualiza el estado de suscripción de cualquier empresa registrada.

---

## DTOs Principales Expuestos

- `PickupRequestResponse`: expone `estado`, `volumenAproximado`, `volumenReal`, `fechaSolicitud`, `fechaProgramada`, `fechaRecoleccion`, `transportePlaca`, `recolectorAsignado`, `direccion`, `observaciones`.
- `TransportUnitResponse`: expone `placa`, `marca`, `modelo`, `capacidadLiters`, `tipoUnidad`, `estado`, `observaciones`.
