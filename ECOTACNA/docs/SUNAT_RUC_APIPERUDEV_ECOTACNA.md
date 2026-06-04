# Consulta RUC real con ApiPeruDev

EcoTacna consulta RUC mediante ApiPeruDev desde el backend. El token se configura con `SUNAT_API_TOKEN`. El frontend no recibe ni conoce el token.

## Endpoint oficial

```http
GET http://localhost:8082/ecotacna/api/sunat/ruc/{ruc}
```

El flujo funcional es:

```text
Frontend React/Vite
-> GET backend /api/sunat/ruc/{ruc}
-> Backend Spring Boot
-> GET https://apiperu.dev/api/ruc/{ruc}
-> Backend normaliza respuesta
-> Frontend autocompleta datos
```

## Variables backend

```env
SUNAT_MODE=api
SUNAT_API_TOKEN=
SUNAT_API_BASE_URL=https://apiperu.dev/api
```

`SUNAT_MODE` asume `api` si no se configura. Si `SUNAT_API_TOKEN` esta vacio, el backend devuelve un error controlado y no inventa datos.

## Variables frontend

```env
VITE_SUNAT_MODE=api
```

`VITE_SUNAT_MODE` solo controla texto visual. El modo real lo decide el backend con `SUNAT_MODE`.

## Respuestas esperadas

RUC invalido:

```json
{
  "success": false,
  "message": "El RUC debe tener 11 dígitos numéricos.",
  "data": null
}
```

Token faltante:

```json
{
  "success": false,
  "message": "Servicio RUC no configurado. Falta SUNAT_API_TOKEN.",
  "data": null
}
```

Proveedor no disponible o sin autorizacion:

```json
{
  "success": false,
  "message": "No se pudo consultar el proveedor RUC. Verifica la configuración del servicio.",
  "data": null
}
```

RUC no encontrado:

```json
{
  "success": false,
  "message": "No se encontraron datos para el RUC ingresado.",
  "data": null
}
```

Exito:

```json
{
  "success": true,
  "message": "Datos encontrados",
  "data": {
    "ruc": "20100055237",
    "razonSocial": "...",
    "nombreComercial": "...",
    "direccionFiscal": "...",
    "distrito": "...",
    "provincia": "...",
    "departamento": "...",
    "estadoContribuyente": "...",
    "condicionDomicilio": "...",
    "fuente": "APIPERU"
  }
}
```

## Seguridad

- El token de ApiPeruDev nunca debe configurarse en variables `VITE_*`.
- El frontend solo llama a `/sunat/ruc/{ruc}`.
- No existe endpoint publico para limpiar datos RUC o borrar registros de base de datos.
- `/api/sunat/**` es publico para permitir el registro sin JWT.
