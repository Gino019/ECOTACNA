package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class PickupConfirmationRequest {

    @NotNull(message = "volumenReal es obligatorio")
    @DecimalMin(value = "0.01", message = "volumenReal debe ser mayor a 0")
    private BigDecimal volumenReal;

    public BigDecimal getVolumenReal() {
        return volumenReal;
    }

    public void setVolumenReal(BigDecimal volumenReal) {
        this.volumenReal = volumenReal;
    }
}
