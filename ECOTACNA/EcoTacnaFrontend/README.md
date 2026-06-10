# EcoTacna - Frontend Activo

Este proyecto representa el frontend operativo y oficial para la plataforma **EcoTacna**, construido utilizando React, Vite y TypeScript con estilos en Vanilla CSS/Tailwind.

---

## 🛠️ Stack Tecnológico
- **Core**: React 18, Vite 5, TypeScript.
- **Servidor de Desarrollo**: Corre en el puerto **8081** (`http://localhost:8081`).
- **Consumo de API Backend**: Conectado al backend activo Spring Boot en `http://localhost:8082/ecotacna/api` (configurable mediante la variable de entorno `VITE_API_BASE_URL`).

---

## 📂 Características de la Segunda Unidad
Para esta fase de entrega académica, el frontend se alinea al 100% con los principios de blindaje funcional del proyecto:
1. **Flujo de Aceptación Voluntaria**: Los recolectores visualizan y aceptan solicitudes de recojo de forma voluntaria. Flujo: `DISPONIBLE -> ACEPTADA -> EN_CAMINO -> RECOGIDA`. No existe asignación automática en la interfaz.
2. **Placeholder de Mapa**: La visualización geográfica emplea un placeholder interactivo referencial. Google Maps e integraciones satelitales en tiempo real quedan diferidos por falta de API Keys.
3. **Módulo de SUNAT Diferido**: Las validaciones e ingresos de datos RUC se simulan o se manejan de manera diferida, eliminando llamadas externas ficticias.
4. **Módulo de Pago Interno**: La sección de pagos representa liquidaciones e importes monetarios calculados de forma interna a partir del volumen real, sin pasarelas de pago reales.
5. **No Legacy**: Este es el frontend React oficial y activo. No se utiliza para conversiones a JSP ni tiene relación operativa con el histórico de JavaWeb/Jakarta.

---

## 🚀 Cómo Ejecutar

1. Instalar dependencias:
   ```bash
   npm install
   ```
2. Levantar el servidor en desarrollo (puerto 8081):
   ```bash
   npm run dev
   ```
3. Compilar para producción:
   ```bash
   npm run build
   ```
