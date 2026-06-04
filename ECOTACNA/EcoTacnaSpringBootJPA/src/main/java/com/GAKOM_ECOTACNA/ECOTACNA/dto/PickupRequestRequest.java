package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PickupRequestRequest {
    @NotNull(message = "volumenAproximado es obligatorio")
    @DecimalMin(value = "0.01", message = "El volumen aproximado debe ser mayor a 0")
    private BigDecimal volumenAproximado;

    private LocalDateTime fechaProgramada;

    private String direccion;

    private String observaciones;
}
