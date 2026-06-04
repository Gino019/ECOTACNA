# Contrato Backend ECO_TACNA MVP

## 1. Base URL
`http://localhost:8082/ecotacna/api`

---

## 2. Autenticación

```http
POST /auth/login
POST /auth/register
Authorization: Bearer <token>
```

---

## 3. Endpoints por rol

### Auth
```http
POST /auth/login
POST /auth/register
```

### Empresa generadora (GENERADOR)
```http
GET  /empresa/perfil
GET  /empresa/resumen
GET  /empresa/solicitudes
POST /empresa/solicitudes
```

### Recolector (RECOLECTOR)
```http
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

### Admin (ADMIN)
```http
GET /admin/resumen
GET /admin/empresas
GET /admin/usuarios
GET /admin/solicitudes
GET /admin/transportes
POST /admin/solicitudes/{id}/asignar
PUT /admin/suscripciones/{empresaId}
```

---

## 4. Estados de solicitud

Estados oficiales del MVP (el flujo operativo regular):
```txt
PENDIENTE
PROGRAMADO
EN_RUTA
COMPLETADO
CANCELADO
```
*(Nota: `RECOGIDO` queda como estado legacy/no usado en el flujo operativo MVP, preservado por compatibilidad en la DB).*

---

## 5. Payloads oficiales

### Crear Solicitud (Generador)
```json
{
  "volumenAproximado": 30,
  "fechaProgramada": "2026-06-01",
  "direccion": "Av. Ejemplo 123",
  "observaciones": "Recojo por la mañana"
}
```

### Asignar Recolector (Admin)
```json
{
  "recolectorId": 3,
  "transporteId": 5
}
```

### Confirmar Recojo (Recolector)
```json
{
  "volumenReal": 28.5
}
```

### Crear/Editar Unidad Vehicular
```json
{
  "placa": "ABC-123",
  "tipo": "CAMIONETA",
  "capacidadLitros": 500,
  "activo": true
}
```

### Actualizar Suscripción
```json
{
  "subscriptionStatus": "ACTIVA"
}
```
