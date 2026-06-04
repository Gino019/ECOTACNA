# Guía de Integración API - EcoTacnaFrontend

Este documento identifica los endpoints finales del backend (Fase 12 completada) que deben consumirse desde el frontend de React. Los archivos en `src/services/*Api.ts` deben ajustarse para apuntar a estos endpoints y eliminar las rutas comerciales/B2B deprecadas.

## 1. authApi.ts

### Endpoints Vigentes
- **`POST /api/auth/login`**: Para iniciar sesión. El body recibe `email` y `password`. Devuelve `token`, `role`, `companyName`, `companyType`, `subscriptionStatus`.
- **`POST /api/auth/register`**: Para registrar una nueva empresa.

### Tareas
- Adaptar las interfaces de respuesta en `authApi.ts` para capturar `subscriptionStatus` y `companyType`.

## 2. empresaApi.ts

### Endpoints Vigentes
- **`GET /api/empresa/solicitudes`**: Lista el historial de solicitudes de la empresa generadora.
- **`POST /api/empresa/solicitudes`**: Crea una nueva solicitud de recojo. (Payload: `volumenAproximado`, `fechaSolicitada`, `direccion`, `observaciones`).

### Rutas a Eliminar
- `GET /empresa/perfil` (Eliminado del backend).
- `GET /empresa/resumen` (Eliminado del backend temporalmente, el frontend debe calcularlo de las solicitudes o remover el componente).
- `GET /empresa/documentos` (Deprecado).
- `GET /empresa/liquidaciones` (Deprecado).
- `GET /trazabilidad/detalle` (Deprecado).
- `POST /empresa/solicitudes/{id}/cancelar` (Pendiente de implementación en backend, puede comentarse o manejarse con un estado dummy).

## 3. recolectorApi.ts

### Endpoints Vigentes
- **`GET /api/recolector/solicitudes`**: Lista solicitudes asignadas.
- **`PUT /api/recolector/recojos/{id}/en-ruta`**: Inicia el recojo.
- **`PUT /api/recolector/recojos/{id}/confirmar`**: Finaliza el recojo, requiere `volumenReal`.
- **`GET /api/recolector/transportes`** (o `/unidades`): Lista las unidades del recolector.
- **`POST /api/recolector/unidades`**: Crea unidad vehicular. (Payload: `placa`, `marca`, `modelo`, `capacidadLitros`, `tipoUnidad`, `estado`, `observaciones`).
- **`PUT /api/recolector/unidades/{id}`**: Modifica la unidad vehicular.

### Rutas a Eliminar
- Rutas relacionadas a lotes (`/lotes`), órdenes (`/ordenes`), marketplace, o liquidaciones.

## 4. adminApi.ts

### Endpoints Vigentes
- **`GET /api/admin/empresas`**: Lista todas las empresas registradas.
- **`GET /api/admin/solicitudes`**: Lista todas las solicitudes.
- **`GET /api/admin/transportes`**: Lista todas las unidades vehiculares de los recolectores.
- **`PUT /api/admin/suscripciones/{empresaId}`**: Para cambiar el estado de la suscripción (Payload: `nuevoEstado`).

### Rutas a Eliminar
- Aprobaciones de SUNAT (`/api/admin/empresas/{id}/aprobar`).
- Accesos a trazabilidad.

## Siguientes Pasos (Para Frontend Developers)
1. Abrir `src/services/` y limpiar las llamadas a endpoints deprecados.
2. Actualizar los nombres de los atributos de los payloads para que coincidan con los DTOs definidos en `api-design.md`.
3. Implementar la sección "Mis Unidades" en el panel del recolector conectada a `/api/recolector/unidades`.
