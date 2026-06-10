# SUPABASE_JPA_DATABASE_DEPLOYMENT_PLAN.md

# Plan Antigravity — Conectar ECO_TACNA JPA a Supabase limpio y preparar pruebas reales

## Contexto

El proyecto ECO_TACNA ya fue migrado a una arquitectura backend basada en Spring Boot + JPA/Hibernate.

El backend actual ya fue validado como contrato oficial del MVP:

```txt
Backend: EcoTacnaSpringBootJPA
Base API esperada: http://localhost:8082/ecotacna/api
JPA/Hibernate será responsable de crear las tablas según las entidades actuales.
```

La base de datos anterior fue eliminada o ya no debe usarse.

Ahora se usará una base limpia en Supabase.

---

# Objetivo principal

Configurar el backend `EcoTacnaSpringBootJPA` para conectarse a la nueva base PostgreSQL limpia de Supabase, permitir que JPA cree el esquema actual y eliminar cualquier rastro de configuración, script o inicialización relacionada con la base antigua o la arquitectura JDBC anterior.

---

# Decisión técnica

No se hará migración de datos antiguos.

No se ejecutarán los scripts SQL legacy.

No se crearán datos de prueba, datos demo, mocks ni relleno.

La nueva base debe quedar vacía inicialmente y solo debe recibir:

```txt
1. Tablas generadas por JPA/Hibernate.
2. Datos reales que el sistema vaya creando mediante sus endpoints.
```

---

# Datos de conexión Supabase

Usar la conexión PostgreSQL provista por Supabase.

Datos conocidos:

```txt
Host: aws-1-us-east-1.pooler.supabase.com
Puerto: 6543
Base de datos: postgres
Usuario: postgres.fhdnwwqiraybpakspegx
Password: usar variable de entorno, no hardcodear
```

IMPORTANTE:

No escribir la contraseña directamente en archivos versionados.

No subir credenciales al repositorio.

No poner credenciales en el frontend.

El frontend nunca debe tener acceso a la URL de PostgreSQL.

---

# ¿Necesitamos script SQL?

## Para crear tablas

No.

Como la base está limpia y el backend usa JPA, no se debe crear un script SQL manual para tablas.

JPA/Hibernate debe crear el esquema a partir de las entidades actuales.

## Para insertar datos

No.

El usuario solicitó explícitamente no crear datos de prueba, datos demo, mocks ni relleno.

No crear:

```txt
DataSeeder
data.sql con inserts
import.sql
usuarios demo
empresas demo
solicitudes demo
unidades demo
```

## Para limpiar base antigua

No.

La nueva base Supabase ya está limpia.

No ejecutar scripts de limpieza antiguos.

No ejecutar scripts DROP antiguos.

No ejecutar scripts JDBC antiguos.

---

# Archivos que deben revisarse

Revisar especialmente:

```txt
EcoTacnaSpringBootJPA/src/main/resources/application.properties
EcoTacnaSpringBootJPA/src/main/resources/application-*.properties
EcoTacnaSpringBootJPA/src/main/resources/schema.sql
EcoTacnaSpringBootJPA/src/main/resources/data.sql
EcoTacnaSpringBootJPA/src/main/resources/import.sql
EcoTacnaSpringBootJPA/src/main/java/**/DataSeeder*.java
EcoTacnaSpringBootJPA/src/main/java/**/Seeder*.java
EcoTacnaSpringBootJPA/src/main/java/**/Bootstrap*.java
EcoTacnaSpringBootJPA/src/main/java/**/AdminBootstrap*.java
EcoTacnaSpringBootJPA/src/main/java/**/CommandLineRunner*.java
EcoTacnaSpringBootJPA/src/main/java/**/ApplicationRunner*.java
```

También buscar rastros de la base anterior:

```txt
empresas
usuarios
solicitudes_recojo
recolecciones
transportes
pagos
certificados
codigos_acceso
liquidaciones
trazabilidad
otp
codigo_acceso
JDBC
jdbcTemplate
```

---

# Fase 1 — Revisar configuración actual de base de datos

Buscar en el backend:

```bash
rg "spring.datasource|ddl-auto|data.sql|schema.sql|import.sql|JdbcTemplate|jdbcTemplate|codigos_acceso|solicitudes_recojo|recolecciones|pagos|certificados|liquidaciones|trazabilidad|otp|codigo" EcoTacnaSpringBootJPA
```

Objetivo:

```txt
1. Identificar URL antigua de base de datos.
2. Identificar scripts SQL automáticos.
3. Identificar seeders o bootstraps automáticos.
4. Identificar cualquier dependencia activa del modelo JDBC anterior.
```

---

# Fase 2 — Crear perfil seguro para Supabase

Crear o actualizar un perfil separado:

```txt
EcoTacnaSpringBootJPA/src/main/resources/application-supabase.properties
```

Contenido recomendado:

```properties
# ============================================================
# ECO_TACNA - Supabase PostgreSQL Profile
# ============================================================

spring.datasource.url=${SUPABASE_DB_URL}
spring.datasource.username=${SUPABASE_DB_USERNAME}
spring.datasource.password=${SUPABASE_DB_PASSWORD}

spring.datasource.driver-class-name=org.postgresql.Driver

# JPA / Hibernate
spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=${JPA_DDL_AUTO:update}
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

# SQL init must stay disabled. No schema.sql/data.sql/import.sql.
spring.sql.init.mode=never

# HikariCP - keep pool small for Supabase pooler
spring.datasource.hikari.maximum-pool-size=${DB_POOL_MAX_SIZE:3}
spring.datasource.hikari.minimum-idle=${DB_POOL_MIN_IDLE:0}
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.max-lifetime=1800000

# Server
server.port=8082
server.servlet.context-path=/ecotacna
```

---

# Fase 3 — Definir variables de entorno

No guardar contraseña en `application.properties`.

Usar variables de entorno.

## Windows PowerShell local

```powershell
$env:SPRING_PROFILES_ACTIVE="supabase"
$env:SUPABASE_DB_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
$env:SUPABASE_DB_USERNAME="postgres.fhdnwwqiraybpakspegx"
$env:SUPABASE_DB_PASSWORD="<COLOCAR_PASSWORD_LOCALMENTE>"
$env:JPA_DDL_AUTO="update"
```

## Linux/macOS local o servidor

```bash
export SPRING_PROFILES_ACTIVE=supabase
export SUPABASE_DB_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
export SUPABASE_DB_USERNAME="postgres.fhdnwwqiraybpakspegx"
export SUPABASE_DB_PASSWORD="<COLOCAR_PASSWORD_LOCALMENTE>"
export JPA_DDL_AUTO=update
```

IMPORTANTE:

El valor real de `SUPABASE_DB_PASSWORD` debe configurarse localmente o en el panel del proveedor de despliegue.

No escribir la contraseña real en el repositorio.

---

# Fase 4 — Revisar configuración base `application.properties`

El archivo principal:

```txt
EcoTacnaSpringBootJPA/src/main/resources/application.properties
```

debe quedar limpio.

Debe contener solo configuración común no sensible, por ejemplo:

```properties
spring.application.name=ecotacna

server.port=8082
server.servlet.context-path=/ecotacna
```

Si actualmente contiene una URL vieja de PostgreSQL o una base que ya no existe, eliminarla o moverla al perfil correspondiente.

No debe quedar hardcodeado:

```txt
localhost viejo
nombre de base antigua
usuario viejo
password viejo
scripts SQL legacy
```

---

# Fase 5 — Desactivar o eliminar scripts SQL automáticos

Revisar si existen:

```txt
src/main/resources/schema.sql
src/main/resources/data.sql
src/main/resources/import.sql
```

Si existen y pertenecen al modelo anterior, hacer una de estas opciones:

## Opción recomendada

Moverlos a una carpeta legacy fuera de `resources`, por ejemplo:

```txt
database/legacy_jdbc_scripts/
```

## Opción alternativa

Eliminar si ya no se necesitan.

Además, asegurar:

```properties
spring.sql.init.mode=never
```

No debe ejecutarse automáticamente ningún SQL legacy al iniciar el backend.

---

# Fase 6 — Eliminar seeders, datos demo o bootstraps no deseados

Buscar clases que inserten datos automáticamente:

```bash
rg "CommandLineRunner|ApplicationRunner|DataSeeder|Seeder|Bootstrap|AdminBootstrap|save\(|insert|demo|Demo|generador@demo|recolector@demo|admin@demo" EcoTacnaSpringBootJPA/src/main/java
```

Regla:

```txt
No crear datos demo.
No crear usuarios demo.
No crear empresas demo.
No crear solicitudes demo.
No crear unidades demo.
```

Si existe una clase como `AdminBootstrapConfig` y crea un usuario automáticamente, revisar si es realmente necesaria.

Para esta fase, lo ideal es:

```txt
No insertar ningún dato automáticamente.
```

Si el proyecto necesita un primer usuario admin para operar, no crearlo como demo. Documentar una de estas alternativas:

```txt
1. Crear admin real mediante endpoint /api/auth/register si el flujo lo permite.
2. Crear admin real manualmente desde un endpoint administrativo seguro si existe.
3. Crear admin inicial solo mediante variables de entorno explícitas, nunca con valores demo hardcodeados.
```

Si se mantiene un bootstrap de admin, debe cumplir:

```txt
- Estar desactivado por defecto.
- Activarse solo con variable de entorno.
- No usar correos demo.
- No usar contraseñas hardcodeadas.
- No crear datos de relleno.
```

Ejemplo aceptable:

```properties
ecotacna.bootstrap.enabled=false
```

---

# Fase 7 — Verificar dependencias de PostgreSQL

Revisar `pom.xml`.

Debe existir el driver PostgreSQL:

```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
</dependency>
```

Si ya existe, no duplicar.

---

# Fase 8 — Ejecutar compilación

Desde `EcoTacnaSpringBootJPA`:

```bash
./mvnw clean package -DskipTests
```

En Windows:

```powershell
.\mvnw.cmd clean package -DskipTests
```

Debe terminar con:

```txt
BUILD SUCCESS
```

---

# Fase 9 — Levantar backend contra Supabase

Con variables de entorno configuradas, ejecutar:

## Windows

```powershell
.\mvnw.cmd spring-boot:run
```

## Linux/macOS

```bash
./mvnw spring-boot:run
```

Debe levantar en:

```txt
http://localhost:8082/ecotacna
```

Base API:

```txt
http://localhost:8082/ecotacna/api
```

---

# Fase 10 — Confirmar creación automática de tablas

Al iniciar el backend contra la base limpia, Hibernate debe crear las tablas según las entidades JPA actuales.

Desde Supabase SQL Editor, verificar que existan las tablas del modelo actual.

Ejemplo esperado según el backend JPA actual:

```txt
companies
users
pickup_requests
transport_units
audit_logs
```

La lista exacta debe depender de las entidades reales del proyecto.

No deben aparecer tablas legacy nuevas como:

```txt
empresas
usuarios
solicitudes_recojo
recolecciones
pagos
certificados
codigos_acceso
```

Si aparecen, significa que algún script viejo o configuración legacy se ejecutó.

---

# Fase 11 — Validar que la base inicia vacía

Ejecutar en Supabase SQL Editor:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

Luego validar conteos de las tablas principales:

```sql
SELECT COUNT(*) FROM companies;
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM pickup_requests;
SELECT COUNT(*) FROM transport_units;
```

Resultado esperado inicial:

```txt
0 filas en tablas de negocio, salvo que el usuario ya haya creado datos reales por endpoint.
```

No debe haber registros demo.

---

# Fase 12 — Probar endpoints sin datos demo

Probar que el backend responde aunque no existan datos.

Endpoints públicos:

```txt
POST /api/auth/register
POST /api/auth/login
```

Endpoints protegidos requerirán un usuario real creado por el flujo de registro/login.

No insertar usuarios mediante SQL legacy.

No usar mocks.

No usar data.sql.

---

# Fase 13 — Prueba real mínima

Como no se crearán datos demo, la prueba real debe hacerse desde la aplicación:

```txt
1. Registrar o crear un usuario real según el flujo permitido.
2. Iniciar sesión.
3. Crear empresa/usuario si el flujo lo permite.
4. Crear solicitud real desde frontend o endpoint.
5. Verificar que se guarda en Supabase.
```

Si el flujo actual no permite crear el primer admin sin seed, reportarlo claramente como bloqueo funcional.

No resolverlo insertando datos demo.

Proponer una solución controlada:

```txt
Crear endpoint/flujo seguro para primer admin
o bootstrap controlado por variables de entorno
```

---

# Fase 14 — Preparar despliegue

Para despliegue, configurar las mismas variables de entorno en el proveedor:

```txt
SPRING_PROFILES_ACTIVE=supabase
SUPABASE_DB_URL=jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
SUPABASE_DB_USERNAME=postgres.fhdnwwqiraybpakspegx
SUPABASE_DB_PASSWORD=<password en variable segura>
JPA_DDL_AUTO=update
DB_POOL_MAX_SIZE=3
DB_POOL_MIN_IDLE=0
```

No subir credenciales al repositorio.

No poner `SUPABASE_DB_PASSWORD` en frontend.

---

# Fase 15 — Recomendación post-creación de esquema

Después de que JPA cree las tablas correctamente por primera vez, considerar cambiar:

```txt
JPA_DDL_AUTO=update
```

a:

```txt
JPA_DDL_AUTO=validate
```

en entornos más estables.

Para desarrollo inicial puede permanecer en:

```txt
update
```

No usar `create-drop` porque borraría datos al apagar.

No usar `create` si ya se van a conservar datos reales.

---

# Riesgo técnico con puerto 6543

El puerto 6543 de Supabase corresponde al pooler en modo transaccional.

Para aplicaciones Spring Boot persistentes, puede funcionar, pero si Hibernate tiene problemas al crear o actualizar esquema, hacer esto:

```txt
1. No cambiar entidades.
2. No ejecutar scripts legacy.
3. Probar con la conexión directa o session pooler que Supabase indique en su panel.
4. Crear el esquema inicial con esa conexión.
5. Volver al pooler si corresponde para tráfico de aplicación.
```

Mantener en JDBC URL:

```txt
sslmode=require
prepareThreshold=0
```

---

# Validaciones finales

La tarea se considera terminada cuando:

```txt
1. No quedan URLs de la base antigua en application.properties.
2. No quedan scripts SQL legacy ejecutándose automáticamente.
3. No quedan seeders demo activos.
4. No se crean datos de relleno.
5. El backend compila con BUILD SUCCESS.
6. El backend inicia usando perfil supabase.
7. Hibernate crea las tablas JPA en Supabase.
8. Supabase no contiene tablas legacy nuevas.
9. La base queda lista para recibir datos reales desde endpoints.
10. La configuración queda preparada para despliegue mediante variables de entorno.
```

---

# Entregable esperado de Antigravity

Responder con este formato:

```md
## Resumen

Backend configurado para usar Supabase PostgreSQL limpio mediante perfil JPA.

## Archivos modificados

- archivo 1
- archivo 2
- archivo 3

## Archivos eliminados o movidos

- archivo legacy 1
- archivo legacy 2

## Configuración final

Perfil activo:

Datasource:

DDL auto:

SQL init:

## Seeders o scripts automáticos

Estado:

## Compilación

Comando ejecutado:

Resultado:

## Ejecución contra Supabase

Comando ejecutado:

Resultado:

## Tablas creadas por JPA

- tabla 1
- tabla 2
- tabla 3

## Tablas legacy detectadas

- ninguna
o
- tabla legacy encontrada y acción tomada

## Datos iniciales

Confirmar:

No se insertaron datos demo.

## Riesgos o bloqueos

- ...

## Estado final

Listo para pruebas reales / Requiere ajuste
```

---

# Nota final

No ejecutar los scripts antiguos.

No crear datos demo.

No crear mocks.

No insertar registros manuales de relleno.

La nueva base Supabase debe quedar gobernada por JPA y por los datos reales que cree el sistema.

