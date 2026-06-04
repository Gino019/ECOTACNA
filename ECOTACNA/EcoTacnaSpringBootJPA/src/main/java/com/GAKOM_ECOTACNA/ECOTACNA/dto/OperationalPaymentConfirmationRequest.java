package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;

public class OperationalPaymentConfirmationRequest {

    @NotNull(message = "litrosConfirmados es obligatorio")
    @DecimalMin(value = "0.01", message = "litrosConfirmados debe ser mayor a 0")
    private BigDecimal litrosConfirmados;

    @NotNull(message = "precioPorLitro es obligatorio")
    @DecimalMin(value = "0.00", message = "precioPorLitro debe ser mayor o igual a 0")
    private BigDecimal precioPorLitro;

    private String observacionPago;

    public BigDecimal getLitrosConfirmados() {
        return litrosConfirmados;
    }

    public void setLitrosConfirmados(BigDecimal litrosConfirmados) {
        this.litrosConfirmados = litrosConfirmados;
    }

    public BigDecimal getPrecioPorLitro() {
        return precioPorLitro;
    }

    public void setPrecioPorLitro(BigDecimal precioPorLitro) {
        this.precioPorLitro = precioPorLitro;
    }

    public String getObservacionPago() {
        return observacionPago;
    }

    public void setObservacionPago(String observacionPago) {
        this.observacionPago = observacionPago;
    }
}
