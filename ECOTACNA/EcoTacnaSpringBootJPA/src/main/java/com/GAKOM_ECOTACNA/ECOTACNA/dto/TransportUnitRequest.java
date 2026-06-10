package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class TransportUnitRequest {
    private Long empresaRecolectoraId;

    @NotBlank(message = "La placa es obligatoria")
    private String placa;

    private String marca;
    private String modelo;

    @NotNull(message = "capacidadLitros es obligatorio")
    @DecimalMin(value = "0.01", message = "La capacidad debe ser mayor a 0")
    private BigDecimal capacidadLitros;

    private String tipoUnidad;
    private String estado;
    private String observaciones;
}
