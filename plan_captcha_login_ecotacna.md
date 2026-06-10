Necesito corregir la configuración actual de Google reCAPTCHA v2 Checkbox en EcoTacna para quitar el mensaje rojo de “testing purposes only”.

No cambies la lógica principal del login ni refactorices componentes. La integración visual ya está colocada correctamente. Solo valida y ajusta configuración, variables de entorno y documentación.

Objetivo:
- Mantener Google reCAPTCHA v2 Checkbox.
- Quitar las claves de prueba de Google.
- Dejar el sistema preparado para usar claves reales de desarrollo y producción.
- Mantener el CAPTCHA solo en login: administrador, empresa y recolector.

Tareas:

1. Revisar que no estén hardcodeadas estas claves de prueba:
   - Site key: 6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI
   - Secret key: 6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe

2. Si aparecen hardcodeadas en frontend, backend, application.properties, .env, .env.example o archivos similares, reemplazarlas por variables de entorno:
   - Frontend: VITE_RECAPTCHA_SITE_KEY
   - Backend: RECAPTCHA_SECRET_KEY

3. En el frontend, confirmar que Login.tsx o el componente de CAPTCHA lea únicamente:
   - import.meta.env.VITE_RECAPTCHA_SITE_KEY

4. En el backend, confirmar que CaptchaService.java lea únicamente:
   - RECAPTCHA_SECRET_KEY
   - CAPTCHA_ENABLED
   - CAPTCHA_PROVIDER=recaptcha_v2

5. Agregar o corregir .env.example del frontend:
   VITE_RECAPTCHA_SITE_KEY=colocar_site_key_real_de_recaptcha_v2_checkbox

6. Agregar o corregir application.properties.example, .env.example o la documentación del backend:
   CAPTCHA_ENABLED=true
   CAPTCHA_PROVIDER=recaptcha_v2
   RECAPTCHA_SECRET_KEY=colocar_secret_key_real_de_recaptcha_v2_checkbox

7. No colocar claves reales directamente en el repositorio.
   Las claves reales deben ir solo en archivos locales .env o variables del entorno.

8. Agregar una nota en la documentación:
   Para quitar el mensaje rojo de pruebas, crear claves reales en Google reCAPTCHA Admin Console usando:
   - Tipo: reCAPTCHA v2
   - Variante: Checkbox / “I'm not a robot”
   - Dominios de desarrollo: localhost y 127.0.0.1
   - Dominio de producción: el dominio real de EcoTacna cuando exista

9. Confirmar que el backend sigue validando el token antes de validar credenciales.

10. Probar:
   - Con claves de prueba: aparece advertencia roja, pero valida.
   - Con claves reales de desarrollo: no debe aparecer advertencia roja.
   - Login sin captchaToken: debe fallar.
   - Login con captcha válido y credenciales correctas: debe ingresar.
   - Login con captcha válido y contraseña incorrecta: debe fallar por credenciales.

Restricciones:
- No volver a Turnstile.
- No usar reCAPTCHA v3.
- No usar CAPTCHA invisible.
- No crear CAPTCHA casero.
- No mover el widget de su ubicación actual.
- No cambiar el diseño del login.
- No tocar módulos ajenos al login.