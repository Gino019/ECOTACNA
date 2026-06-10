# API de Pagos Simulada EcoTacna - Postman

Base local:

`http://localhost:8082/ecotacna`

## Token aprobado

POST `http://localhost:8082/ecotacna/api/public/payments/simulated/tokens`

```json
{
  "cardNumber": "4111111111111111",
  "cvv": "123",
  "expiry": "09/30",
  "email": "demo@ecotacna.test",
  "cardholderName": "Carlos Mamani"
}
```

Respuesta esperada: HTTP 200 con `data.id` tipo `tkn_sim_xxx`.

## Confirmar pago

POST `http://localhost:8082/ecotacna/api/public/payments/simulated/company/{companyId}/confirm`

```json
{
  "paymentMethod": "CARD",
  "simulatedToken": "tkn_sim_xxx",
  "email": "demo@ecotacna.test"
}
```

Respuesta esperada: HTTP 200, `subscriptionStatus` `PRUEBA_ACTIVA` para generador o `ACTIVA` para recolector.

## Tarjeta rechazada

POST `http://localhost:8082/ecotacna/api/public/payments/simulated/tokens`

```json
{
  "cardNumber": "4000000000000002",
  "cvv": "123",
  "expiry": "09/30",
  "email": "demo@ecotacna.test",
  "cardholderName": "Carlos Mamani"
}
```

Respuesta esperada: HTTP 400 con mensaje claro, sin activar suscripcion.

## Tarjetas de prueba

`4111111111111111` y `4111222233334444`: aprobadas.

`4000000000000002`: pago simulado rechazado.

`4000000000009995`: fondos insuficientes.

`4000000000000069`: tarjeta vencida.

`4000000000000127`: CVV invalido.

El sistema no guarda numero completo de tarjeta, CVV ni vencimiento completo; solo registra `cardLast4`, `providerTokenId` y `providerChargeId`.
