package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class PickupRequestResponse {
    private Long id;
    private Long empresaId;
    private String empresaRazonSocial;
    private BigDecimal volumenAproximado;
    private BigDecimal volumenReal;
    private String estado;
    private LocalDateTime fechaSolicitud;
    private LocalDateTime fechaProgramada;
    private LocalDateTime fechaRecoleccion;
    private String transportePlaca;
    private String recolectorAsignado;
    private String direccion;
    private String observaciones;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private BigDecimal litrosConfirmados;
    private BigDecimal precioPorLitro;
    private BigDecimal montoTotal;
    private String estadoPago;
    private LocalDateTime fechaConfirmacionPago;
    private String observacionPago;
}
