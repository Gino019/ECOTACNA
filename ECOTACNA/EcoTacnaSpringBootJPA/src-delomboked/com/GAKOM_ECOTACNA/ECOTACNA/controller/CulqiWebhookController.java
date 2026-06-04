package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api/webhooks/culqi")
public class CulqiWebhookController {

    @PostMapping
    public ResponseEntity<String> handleWebhook(@RequestBody Map<String, Object> payload) {
        // En una implementación real de sandbox, validar la firma del webhook
        // y actualizar el estado de suscripciones o pagos
        System.out.println("Webhook recibido desde Culqi: " + payload);
        return ResponseEntity.ok("Webhook procesado");
    }
}
