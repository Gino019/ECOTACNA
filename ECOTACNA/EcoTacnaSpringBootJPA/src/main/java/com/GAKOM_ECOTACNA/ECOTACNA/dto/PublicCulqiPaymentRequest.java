package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PublicCulqiPaymentRequest {
    @NotBlank(message = "El token de Culqi es requerido")
    private String culqiToken;
    
    private String paymentMethod = "CARD";
    
    private String email;
}
