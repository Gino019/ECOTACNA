package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CulqiPaymentConfirmRequest {
    @NotNull
    private Long paymentId;
    
    @NotBlank
    private String tokenId;
}
