# DEPLOY_BACKEND_FRONTEND_ECOTACNA.md

# Tarea Antigravity — Desplegar Backend + Frontend ECO_TACNA con Supabase JPA

## Contexto

El proyecto **ECO_TACNA** ya fue limpiado y alineado al MVP.

Estado actual confirmado:

```txt
Backend: Spring Boot + JPA/Hibernate
Frontend: React + Vite
Base de datos: Supabase PostgreSQL limpia
JPA ya creó las tablas automáticamente
No hay scripts SQL legacy
No hay datos demo
No hay mocks productivos
```

El backend debe conectarse a Supabase y el frontend debe consumir el backend real.

---

## Objetivo principal

Dejar el proyecto listo para despliegue y pruebas reales:

1. Backend corriendo conectado a Supabase.
2. Frontend corriendo conectado al backend.
3. Variables de entorno configuradas correctamente.
4. Sin credenciales hardcodeadas.
5. Sin scripts legacy.
6. Sin datos demo.
7. Sin mocks productivos.
8. Build exitoso de backend y frontend.
9. Documentar comandos finales de ejecución local y despliegue cloud.

---

## Restricciones importantes

- No crear datos demo.
- No crear mocks.
- No ejecutar scripts SQL antiguos.
- No insertar registros manuales de relleno.
- No hardcodear contraseñas en archivos versionados.
- No subir credenciales al repositorio.
- No modificar la base con scripts JDBC legacy.
- No cambiar el contrato backend/frontend ya estabilizado.
- No poner credenciales de Supabase en el frontend.
- El frontend solo debe conocer la URL pública del backend.

---

## Datos de base Supabase

Usar Supabase PostgreSQL mediante variables de entorno.

```txt
Host: aws-1-us-east-1.pooler.supabase.com
Puerto: 6543
Database: postgres
Username: postgres.fhdnwwqiraybpakspegx
Password: configurar como variable de entorno, no hardcodear
```

URL JDBC oficial para el backend:

```txt
jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
```

> No escribir el password real dentro de archivos del proyecto.

---

# Fase 1 — Revisar estructura

Revisar las carpetas principales:

```txt
EcoTacnaSpringBootJPA
EcoTacnaFrontend
```

No analizar ni modificar innecesariamente:

```txt
node_modules
target
dist
.git
build
coverage
```

Verificar archivos clave:

```txt
EcoTacnaSpringBootJPA/pom.xml
EcoTacnaSpringBootJPA/src/main/resources/application.properties
EcoTacnaSpringBootJPA/src/main/resources/application-supabase.properties
EcoTacnaFrontend/package.json
EcoTacnaFrontend/.env
EcoTacnaFrontend/.env.local
```

---

# Fase 2 — Configurar backend para despliegue

## 2.1 application.properties

El archivo:

```txt
EcoTacnaSpringBootJPA/src/main/resources/application.properties
```

Debe contener solo configuración común:

```properties
spring.application.name=ecotacna

server.port=${PORT:8082}
server.servlet.context-path=/ecotacna
```

## 2.2 application-supabase.properties

Crear o revisar:

```txt
EcoTacnaSpringBootJPA/src/main/resources/application-supabase.properties
```

Contenido esperado:

```properties
spring.datasource.url=${SUPABASE_DB_URL}
spring.datasource.username=${SUPABASE_DB_USERNAME}
spring.datasource.password=${SUPABASE_DB_PASSWORD}

spring.datasource.driver-class-name=org.postgresql.Driver

spring.jpa.database-platform=org.hibernate.dialect.PostgreSQLDialect
spring.jpa.hibernate.ddl-auto=${JPA_DDL_AUTO:update}
spring.jpa.show-sql=false
spring.jpa.properties.hibernate.format_sql=true

spring.sql.init.mode=never

spring.datasource.hikari.maximum-pool-size=${DB_POOL_MAX_SIZE:3}
spring.datasource.hikari.minimum-idle=${DB_POOL_MIN_IDLE:0}
spring.datasource.hikari.idle-timeout=30000
spring.datasource.hikari.connection-timeout=30000
spring.datasource.hikari.max-lifetime=1800000
```

Confirmar que el puerto use variable de entorno:

```properties
server.port=${PORT:8082}
```

---

# Fase 3 — Verificar que no haya legacy activo

Ejecutar desde la raíz del proyecto:

```bash
rg "schema.sql|data.sql|import.sql|CommandLineRunner|ApplicationRunner|DataSeeder|Seeder|Bootstrap|AdminBootstrap|demo|generador@demo|recolector@demo|pagos|certificados|liquidaciones|codigos_acceso|solicitudes_recojo|recolecciones|JdbcTemplate|jdbcTemplate" EcoTacnaSpringBootJPA
```

Validar:

- No hay scripts SQL legacy activos.
- No hay seeders demo activos.
- No se insertan datos automáticamente.
- No se crean usuarios demo.
- No se crean empresas demo.
- No se crean solicitudes demo.
- No se usan tablas antiguas como `empresas`, `usuarios`, `recolecciones`, `pagos`, `certificados`, etc.

Mantener siempre:

```properties
spring.sql.init.mode=never
```

---

# Fase 4 — Variables de entorno backend local

## Windows PowerShell

```powershell
$env:SPRING_PROFILES_ACTIVE="supabase"
$env:SUPABASE_DB_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
$env:SUPABASE_DB_USERNAME="postgres.fhdnwwqiraybpakspegx"
$env:SUPABASE_DB_PASSWORD="<CONFIGURAR_PASSWORD_LOCALMENTE>"
$env:JPA_DDL_AUTO="update"
$env:DB_POOL_MAX_SIZE="3"
$env:DB_POOL_MIN_IDLE="0"
```

## Linux/macOS

```bash
export SPRING_PROFILES_ACTIVE=supabase
export SUPABASE_DB_URL="jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0"
export SUPABASE_DB_USERNAME="postgres.fhdnwwqiraybpakspegx"
export SUPABASE_DB_PASSWORD="<CONFIGURAR_PASSWORD_LOCALMENTE>"
export JPA_DDL_AUTO=update
export DB_POOL_MAX_SIZE=3
export DB_POOL_MIN_IDLE=0
```

---

# Fase 5 — Compilar backend

Entrar a la carpeta:

```bash
cd EcoTacnaSpringBootJPA
```

## Windows

```powershell
.\mvnw.cmd clean package -DskipTests
```

## Linux/macOS

```bash
./mvnw clean package -DskipTests
```

Resultado esperado:

```txt
BUILD SUCCESS
```

---

# Fase 6 — Ejecutar backend local contra Supabase

Desde:

```bash
EcoTacnaSpringBootJPA
```

## Windows

```powershell
.\mvnw.cmd spring-boot:run
```

## Linux/macOS

```bash
./mvnw spring-boot:run
```

Resultado esperado:

```txt
Tomcat started on port 8082 with context path '/ecotacna'
Started EcotacnaApplication
```

Backend local:

```txt
http://localhost:8082/ecotacna
```

Base API:

```txt
http://localhost:8082/ecotacna/api
```

Validación rápida:

```bash
curl http://localhost:8082/ecotacna/api/auth/login
```

Es aceptable recibir error por método si el endpoint espera `POST`.

Lo importante:

- No debe decir `connection refused`.
- No debe fallar por conexión a Supabase.
- No debe fallar por credenciales hardcodeadas faltantes.

---

# Fase 7 — Verificar tablas en Supabase

No ejecutar scripts SQL de creación.

En Supabase SQL Editor, ejecutar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
```

Tablas esperadas según entidades JPA:

```txt
companies
users
pickup_requests
transport_units
audit_logs
```

Verificar que no existan tablas legacy:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'empresas',
    'usuarios',
    'solicitudes_recojo',
    'recolecciones',
    'transportes',
    'pagos',
    'certificados',
    'codigos_acceso'
  );
```

Resultado esperado:

```txt
0 filas
```

---

# Fase 8 — Configurar frontend

Revisar o crear:

```txt
EcoTacnaFrontend/.env.local
```

Para local debe contener:

```env
VITE_API_BASE_URL=http://localhost:8082/ecotacna/api
```

Reglas importantes:

- No poner credenciales de Supabase en el frontend.
- No poner URL JDBC en el frontend.
- No poner usuario ni password de PostgreSQL en el frontend.
- El frontend solo debe consumir la API del backend.

---

# Fase 9 — Compilar frontend

Entrar a la carpeta:

```bash
cd EcoTacnaFrontend
```

Ejecutar:

```bash
npm install
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

Resultado esperado:

```txt
Frontend compila sin errores.
TypeScript sin errores.
```

---

# Fase 10 — Ejecutar frontend local

Desde:

```bash
EcoTacnaFrontend
```

Ejecutar:

```bash
npm run dev
```

URL esperada:

```txt
http://localhost:5173
```

En DevTools > Network, verificar que las llamadas salgan a:

```txt
http://localhost:8082/ecotacna/api
```

---

# Fase 11 — Prueba funcional mínima

Probar desde la app:

1. Abrir frontend.
2. Intentar registro real si el flujo lo permite.
3. Intentar login.
4. Crear datos reales desde la app.
5. Verificar en Supabase que se guardan.
6. Confirmar que no se crean datos demo automáticamente.

No crear datos demo.

Si no existe forma de crear el primer admin real, reportar bloqueo y proponer una solución segura:

```txt
Crear flujo seguro para primer administrador
```

o

```txt
Crear bootstrap opcional controlado por variables de entorno
```

Ese bootstrap debe estar desactivado por defecto y nunca insertar datos demo sin autorización explícita.

---

# Fase 12 — Despliegue cloud backend

Variables de entorno backend:

```env
SPRING_PROFILES_ACTIVE=supabase
SUPABASE_DB_URL=jdbc:postgresql://aws-1-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require&prepareThreshold=0
SUPABASE_DB_USERNAME=postgres.fhdnwwqiraybpakspegx
SUPABASE_DB_PASSWORD=<CONFIGURAR_EN_PANEL_DEL_HOSTING>
JPA_DDL_AUTO=update
DB_POOL_MAX_SIZE=3
DB_POOL_MIN_IDLE=0
```

Build command:

```bash
./mvnw clean package -DskipTests
```

Start command:

```bash
java -jar target/*.jar
```

Si el proveedor usa `PORT`, confirmar que Spring lo toma desde:

```properties
server.port=${PORT:8082}
```

---

# Fase 13 — Despliegue cloud frontend

Variable de entorno frontend:

```env
VITE_API_BASE_URL=<URL_PUBLICA_BACKEND>/ecotacna/api
```

Build command:

```bash
npm install && npm run build
```

Output directory:

```txt
dist
```

Validar que el frontend desplegado consuma el backend cloud, no localhost.

---

# Fase 14 — CORS producción

Cuando se tenga la URL pública del frontend, agregarla al CORS del backend.

Permitir orígenes:

```txt
http://localhost:5173
http://localhost:8081
http://localhost:3000
<URL_PUBLICA_FRONTEND>
```

Métodos permitidos:

```txt
GET
POST
PUT
PATCH
DELETE
OPTIONS
```

Headers permitidos:

```txt
Authorization
Content-Type
Accept
```

Validar que en producción no aparezca error CORS en consola del navegador.

---

# Fase 15 — Checklist final

## Backend

- [ ] `application.properties` solo tiene configuración común.
- [ ] `application-supabase.properties` usa variables de entorno.
- [ ] No hay password hardcodeado.
- [ ] `spring.sql.init.mode=never`.
- [ ] No hay scripts SQL legacy activos.
- [ ] No hay seeders demo activos.
- [ ] Backend compila con `BUILD SUCCESS`.
- [ ] Backend inicia con perfil `supabase`.
- [ ] Backend se conecta a Supabase.
- [ ] Backend expone API en `/ecotacna/api`.

## Supabase

- [ ] Existen tablas JPA esperadas.
- [ ] No existen tablas legacy.
- [ ] No se insertaron datos demo.
- [ ] La base está limpia para datos reales.

## Frontend

- [ ] `.env.local` usa `VITE_API_BASE_URL`.
- [ ] No hay credenciales de Supabase en frontend.
- [ ] No hay URL JDBC en frontend.
- [ ] `npm run build` pasa.
- [ ] TypeScript pasa con `npx tsc --noEmit -p tsconfig.app.json`.
- [ ] `npm run dev` abre en `http://localhost:5173`.
- [ ] Network apunta al backend real.

## Producción

- [ ] Backend cloud tiene variables de entorno.
- [ ] Frontend cloud tiene `VITE_API_BASE_URL` correcto.
- [ ] CORS permite la URL pública del frontend.
- [ ] No hay credenciales en repositorio.
- [ ] No hay mocks productivos.
- [ ] No hay datos demo.

---

# Comandos rápidos de verificación

## Buscar legacy en backend

```bash
rg "schema.sql|data.sql|import.sql|CommandLineRunner|ApplicationRunner|DataSeeder|Seeder|Bootstrap|AdminBootstrap|demo|generador@demo|recolector@demo|pagos|certificados|liquidaciones|codigos_acceso|solicitudes_recojo|recolecciones|JdbcTemplate|jdbcTemplate" EcoTacnaSpringBootJPA
```

## Compilar backend

```bash
cd EcoTacnaSpringBootJPA
./mvnw clean package -DskipTests
```

En Windows:

```powershell
cd EcoTacnaSpringBootJPA
.\mvnw.cmd clean package -DskipTests
```

## Ejecutar backend

```bash
./mvnw spring-boot:run
```

En Windows:

```powershell
.\mvnw.cmd spring-boot:run
```

## Compilar frontend

```bash
cd EcoTacnaFrontend
npm install
npm run build
npx tsc --noEmit -p tsconfig.app.json
```

## Ejecutar frontend

```bash
npm run dev
```

---

# Entregable esperado de Antigravity

Antigravity debe entregar un resumen final con este formato:

```md
## Resumen

Despliegue backend + frontend preparado para ECO_TACNA.

## Backend

Compilación:
Ejecución:
Perfil activo:
Base conectada:
Tablas JPA verificadas:

## Frontend

Compilación:
TypeScript:
Ejecución:
API configurada:

## Variables de entorno usadas

Backend:
- SPRING_PROFILES_ACTIVE
- SUPABASE_DB_URL
- SUPABASE_DB_USERNAME
- SUPABASE_DB_PASSWORD
- JPA_DDL_AUTO

Frontend:
- VITE_API_BASE_URL

## Validaciones realizadas

- validación 1
- validación 2
- validación 3

## Riesgos o bloqueos

- ...

## Estado final

Listo para pruebas reales / Requiere ajustes
```

---

# Nota final

No crear datos demo.  
No usar scripts antiguos.  
No exponer credenciales.  
No poner variables de base de datos en el frontend.  
El despliegue debe quedar listo para que los datos reales se creen desde la aplicación.

