# SSD-MVP-ECO-TACNA.md

## Propósito del documento

Este documento (System Specification Document - SSD) tiene como propósito fundamental establecer las directrices de diseño de software, lineamientos arquitectónicos, restricciones y el stack técnico base para el sistema **ECO_TACNA**. Funciona como un documento de gobernanza tecnológica para el desarrollo del MVP, asegurando que todos los desarrollos y la documentación relacionada guarden coherencia con el alcance definido.

## Objetivo del MVP

Construir e implementar un sistema web transaccional que centralice y digitalice el flujo operativo del recojo de aceite vegetal usado en la ciudad de Tacna, Perú. El sistema debe interconectar de forma fluida a las empresas generadoras de aceite (restaurantes) con las empresas recolectoras/recicladoras debidamente autorizadas, operando bajo un modelo de suscripción mensual y con el control y supervisión del Administrador del Sistema.

## Contexto del proyecto

Actualmente en la región de Tacna, la gestión de residuos de aceite vegetal usado en el sector gastronómico se lleva a cabo mediante canales de coordinación altamente informales (mensajería instantánea por WhatsApp, llamadas telefónicas directas o visitas presenciales esporádicas). Esta informalidad impide mantener un seguimiento operativo claro del recojo, genera ineficiencia logística para las empresas recolectoras y limita la capacidad de control por parte del administrador del sistema. **ECO_TACNA** nace para mitigar esta problemática proveyendo un canal digital centralizado, formalizado, con seguimiento operativo y control de unidades vehiculares.

## Alcance actual

El núcleo funcional del MVP se concentra exclusivamente en:
* **Gestión de Roles y Accesos**: Autenticación y autorización basada en tres roles principales: Administrador (`ROLE_ADMIN`), Empresa Generadora (`ROLE_GENERADOR`) y Empresa Recolectora (`ROLE_RECOLECTOR`).
* **Módulo de Recojo**: Flujo completo de solicitudes de recojo que incluye su creación por el generador (con volumen aproximado, fecha programada y dirección textual), asignación o habilitación operativa, y el correspondiente cierre y confirmación por parte del recolector (registrando el volumen real recolectado).
* **Módulo de Unidades Vehiculares**: Capacidad autónoma para que las empresas recolectoras registren, actualicen y controlen el estado de sus propias unidades vehiculares dentro de su panel ("Mis unidades"), garantizando que las unidades queden debidamente vinculadas a su organización.
* **Modelo de Suscripción Mensual**: Control lógico del estado de suscripción de las empresas generadoras y recolectoras (`ACTIVA`, `PENDIENTE`, `VENCIDA`, `SUSPENDIDA`) para habilitar, restringir o suspender la capacidad de operar en la plataforma.
* **Seguimiento Operativo y Estados**: Seguimiento del estado de las solicitudes a lo largo del flujo operativo (`PENDIENTE`, `PROGRAMADO`, `EN_RUTA`, `RECOGIDO`, `COMPLETADO`, `CANCELADO`).
* **Auditoría del Sistema**: Generación de registros inmutables de auditoría básica (`AuditLog`) para acciones operativas y administrativas de alto impacto (registros de empresas, cambios de estado de solicitud, creación de vehículos, cambios de suscripción).

## Fuera de alcance

Quedan expresamente excluidos de este MVP los siguientes aspectos:
* **Comercio B2B y Marketplace**: Funcionalidades de comercio mayorista de aceite, compra y venta de lotes comerciales, control de stock comercial, catálogos públicos de lotes y roles transaccionales de venta/compra (`ROLE_SELLER` / `ROLE_BUYER`).
* **Pasarelas de Pago**: Integración externa con pasarelas de pago reales (como Culqi, Niubiz o Stripe). En este MVP, el estado de las suscripciones se registrará y gestionará internamente en el sistema, sin conexión con servicios externos de cobro.
* **Integración con APIs Externas**: Validaciones de estado actualizado con servicios de SUNAT, geolocalización o mapas interactivos (Google Maps). Para este MVP, estos componentes se reemplazarán por control manual, datos locales o gestión interna dentro del sistema.
* **Liquidaciones Financieras y Facturación**: Procesos contables avanzados o emisión de comprobantes electrónicos regulados por SUNAT.

## Restricciones del entregable

* **Independencia Operativa (Offline/Local)**: El sistema debe poder probarse y operar localmente en su totalidad sin depender obligatoriamente de conectividad con servidores o APIs de terceros para completar sus flujos críticos.
* **Transaccionalidad en Operaciones Críticas**: Toda actualización de estados en las solicitudes de recojo, confirmación de volúmenes y registro de unidades vehiculares debe protegerse a nivel transaccional para garantizar rollbacks exitosos ante excepciones.
* **Integridad de Datos Rigurosa**: No se tolerarán placas de vehículos duplicadas en el sistema, capacidades de vehículos iguales o menores a cero, ni volúmenes de recojo negativos o nulos. Las placas deben normalizarse obligatoriamente a mayúsculas.

## Arquitectura obligatoria

El sistema backend debe estructurarse obligatoriamente bajo el patrón **MVC (Model-View-Controller)** y diseño por capas utilizando **Spring Boot**:
1. **Capa de Controladores (Controller)**: Exposición de endpoints REST o interfaces de usuario, validación básica de entrada de datos y control de accesos por rol.
2. **Capa de Servicios (Service)**: Aislamiento completo de las reglas de negocio, lógica de control, transacciones y coordinación entre entidades.
3. **Capa de Repositorios (Repository)**: Interfaces que extienden Spring Data JPA para la abstracción de operaciones en la base de datos relacional.
4. **Capa de Modelos (Model)**: Definición estricta de las entidades JPA, mapeo relacional y enums del dominio.
5. **Capa de Transferencia de Datos (DTO)**: Objetos especializados para la salida e ingreso de datos, garantizando que el modelo de persistencia no se exponga directamente hacia el exterior.

## Stack técnico

* **Lenguaje**: Java 17+
* **Framework Base**: Spring Boot 3.x
* **Gestión de Dependencias**: Maven
* **Persistencia**: Spring Data JPA / Hibernate
* **Motor de Base de Datos**: PostgreSQL / H2 (para ambientes de desarrollo o testing)
* **Seguridad**: Spring Security + JSON Web Token (JWT)

## Estructura base del proyecto

El código fuente en Java debe organizarse respetando estrictamente el siguiente esquema de paquetes:

```text
src/main/java/com/proyecto
│
├── controller      # Controladores que exponen endpoints REST
├── service         # Capa de lógica de negocio y lógica de servicio
├── repository      # Repositorios JPA (Spring Data)
├── model           # Entidades JPA y enums de dominio
├── dto             # Clases DTO (Data Transfer Objects)
├── mapper          # Clases/Interfaces para el mapeo modelo <-> DTO
├── security        # Configuración de seguridad, filtros JWT y cifrado
├── config          # Configuraciones generales del sistema (CORS, beans, etc.)
├── exception       # Manejo de excepciones personalizadas y global Handler
├── util            # Clases de soporte y utilitarios comunes
└── validation      # Anotaciones y validadores personalizados
```

## Documentos relacionados

Para garantizar la consistencia, el proyecto mantendrá y consultará de forma sistemática los siguientes archivos de documentación:
* **spec.md**: Especificación detallada de requerimientos funcionales, actores, reglas del recojo, suscripción mensual y unidades vehiculares.
* **architecture.md**: Diseño técnico de la arquitectura MVC, capas Spring Boot, persistencia JPA y flujo transaccional.
* **security.md**: Esquema de autenticación, autorización, roles y control de acceso del sistema.
* **tasks.md**: Roadmap y lista de tareas de desarrollo.
* **progress.md**: Estado de avance del proyecto y próximos pasos.
* **database.md**: Documento pendiente de actualización para reflejar el nuevo modelo de recojo, unidades vehiculares y suscripción.
* **api-design.md**: Documento pendiente de actualización para reflejar endpoints del flujo de recojo y eliminar rutas comerciales B2B.

## Criterios generales para actualizar la documentación

* **Consistencia de Alcance**: Queda prohibido introducir en cualquier documento de diseño (arquitectura, base de datos o requerimientos) elementos relativos a compra/venta comercial, mercados mayoristas o pasarelas de pago reales.
* **Coherencia Transversal**: Cualquier cambio de estado, entidad o regla de negocio modificado en la especificación (`spec.md`) debe sincronizarse de manera inmediata en el esquema de base de datos (`database.md`) y en los lineamientos del SSD.
* **Foco en el MVP**: Las actualizaciones deben ser concisas y centradas exclusivamente en resolver las problemáticas operativas del recojo de aceite usado y la suscripción sin sobrediseñar soluciones futuras.
* **Seguimiento operativo**: El avance de una solicitud debe documentarse como estado actual e historial de estados, no como un módulo independiente.