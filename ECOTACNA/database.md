# Diseño de Base de Datos (database.md)

**Proyecto**: ECO_TACNA
**Versión**: 1.1.0-MVP (Basado en el estado final de la Fase 10)

Este documento describe el modelo de base de datos relacional para el MVP orientado exclusivamente al recojo de aceite usado y gestión operativa de unidades vehiculares, libre de módulos B2B.

## Tablas Principales

### 1. `companies` (Empresas)
Registra a las empresas generadoras y recolectoras.

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY | Identificador de la empresa. |
| `ruc` | VARCHAR | UNIQUE, NOT NULL | RUC de 11 dígitos. |
| `business_name` | VARCHAR | NOT NULL | Razón social. |
| `address` | VARCHAR | NOT NULL | Dirección fiscal o principal. |
| `company_type` | VARCHAR | NOT NULL | `GENERADORA` o `RECOLECTORA`. |
| `subscription_status` | VARCHAR | NOT NULL | Estado de la suscripción (`ACTIVA`, `PENDIENTE`, `VENCIDA`, `SUSPENDIDA`). |
| `created_at` | TIMESTAMP | NOT NULL | Fecha de creación. |
| `updated_at` | TIMESTAMP | NOT NULL | Fecha de última actualización. |

### 2. `users` (Usuarios)
Usuarios que acceden al sistema (Admin, Generador, Recolector).

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY | Identificador del usuario. |
| `company_id` | BIGINT | FOREIGN KEY | Referencia a `companies` (Nulo para ADMIN). |
| `email` | VARCHAR | UNIQUE, NOT NULL | Correo electrónico y credencial de acceso. |
| `password` | VARCHAR | NOT NULL | Hash de la contraseña. |
| `first_name` | VARCHAR | NOT NULL | Nombre(s). |
| `last_name` | VARCHAR | NOT NULL | Apellidos. |
| `role` | VARCHAR | NOT NULL | `ADMIN`, `GENERADOR`, `RECOLECTOR`. |
| `enabled` | BOOLEAN | NOT NULL | Si el usuario está activo. |
| `created_at` | TIMESTAMP | NOT NULL | Fecha de creación. |
| `updated_at` | TIMESTAMP | NOT NULL | Fecha de actualización. |

### 3. `transport_units` (Unidades Vehiculares)
Vehículos registrados por las empresas recolectoras para realizar recojos.

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY | Identificador de la unidad. |
| `collector_company_id` | BIGINT | FOREIGN KEY, NOT NULL | Empresa RECOLECTORA dueña. |
| `plate` | VARCHAR | UNIQUE, NOT NULL | Placa de rodaje. |
| `brand` | VARCHAR | NOT NULL | Marca del vehículo. |
| `model` | VARCHAR | NOT NULL | Modelo del vehículo. |
| `capacity_liters` | DECIMAL | NOT NULL | Capacidad en litros (> 0). |
| `unit_type` | VARCHAR | NOT NULL | Tipo de vehículo (Ej. Cisterna, Furgón). |
| `status` | VARCHAR | NOT NULL | `ACTIVO`, `INACTIVO`, `EN_MANTENIMIENTO`, etc. |
| `observations` | VARCHAR | | Notas sobre el vehículo. |
| `created_at` | TIMESTAMP | NOT NULL | Fecha de creación. |
| `updated_at` | TIMESTAMP | NOT NULL | Fecha de actualización. |

### 4. `pickup_requests` (Solicitudes de Recojo)
El corazón operativo del sistema. Representa una solicitud desde su creación hasta su cierre.

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY | Identificador de la solicitud. |
| `company_id` | BIGINT | FOREIGN KEY, NOT NULL | Empresa GENERADORA. |
| `approximate_volume_liters` | DECIMAL | NOT NULL | Volumen estimado indicado por generador. |
| `actual_volume_liters` | DECIMAL | | Volumen real verificado tras el recojo. |
| `requested_at` | TIMESTAMP | NOT NULL | Fecha deseada de recojo. |
| `scheduled_at` | TIMESTAMP | | Fecha asignada por el sistema/recolector. |
| `collected_at` | TIMESTAMP | | Fecha en que se efectuó físicamente. |
| `status` | VARCHAR | NOT NULL | `PENDIENTE`, `PROGRAMADO`, `EN_RUTA`, `RECOGIDO`, `COMPLETADO`. |
| `direccion` | TEXT | NOT NULL | Dirección específica para el recojo. |
| `observaciones` | TEXT | | Notas, referencias o indicaciones. |
| `collector_user_id` | BIGINT | FOREIGN KEY | Usuario recolector asignado (rol RECOLECTOR). |
| `transport_unit_id` | BIGINT | FOREIGN KEY | Unidad vehicular que realiza el recojo. |
| `created_at` | TIMESTAMP | NOT NULL | Fecha de creación de la solicitud. |
| `updated_at` | TIMESTAMP | NOT NULL | Última modificación. |

### 5. `audit_logs` (Registro de Auditoría)
Registro de acciones y transiciones importantes.

| Columna | Tipo | Restricción | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | BIGINT | PRIMARY KEY | Identificador del log. |
| `user_id` | BIGINT | FOREIGN KEY | Usuario que originó la acción. |
| `email` | VARCHAR | NOT NULL | Email del usuario en el momento de la acción. |
| `action` | VARCHAR | NOT NULL | Código de acción (Ej. `SOLICITUD_CREADA`). |
| `details` | TEXT | NOT NULL | Descripción de lo ocurrido. |
| `ip_address` | VARCHAR | NOT NULL | IP desde donde se ejecutó la acción. |
| `timestamp` | TIMESTAMP | NOT NULL | Fecha y hora de la auditoría. |

## Notas
- Todas las tablas hacen uso de una base JPA estándar (PostgreSQL en producción, H2 en pruebas).
- La validación transaccional se realiza en la capa de servicio para prevenir cruces de información o cambios de estado inválidos.
