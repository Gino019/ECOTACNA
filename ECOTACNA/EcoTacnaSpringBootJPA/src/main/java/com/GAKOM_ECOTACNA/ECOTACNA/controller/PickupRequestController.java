package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupRequestRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupRequestResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.mapper.ModelMapper;
import com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.security.UserPrincipal;
import com.GAKOM_ECOTACNA.ECOTACNA.service.PickupRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
public class PickupRequestController {

    private final PickupRequestService pickupRequestService;

    @Autowired
    public PickupRequestController(PickupRequestService pickupRequestService) {
        this.pickupRequestService = pickupRequestService;
    }

    @GetMapping("/api/empresa/solicitudes")
    public ResponseEntity<ApiResponse<List<PickupRequestResponse>>> listByCompany(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PickupRequestResponse> data = pickupRequestService
                .listByCompany(principal.getCompany().getId()).stream()
                .map(ModelMapper::toPickupRequestResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Listado de solicitudes", data));
    }

    @PostMapping("/api/empresa/solicitudes")
    public ResponseEntity<ApiResponse<PickupRequestResponse>> create(
            @Valid @RequestBody PickupRequestRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        PickupRequest created = pickupRequestService.create(
                principal.getCompany(),
                request.getVolumenAproximado(),
                request.getFechaProgramada(),
                request.getDireccion(),
                request.getObservaciones(),
                principal.getUser(),
                servletRequest.getRemoteAddr());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Solicitud creada exitosamente",
                        ModelMapper.toPickupRequestResponse(created)));
    }

    @GetMapping({"/api/recolector/solicitudes", "/api/recolector/solicitudes-aceptadas", "/api/recolector/recojos-dia"})
    public ResponseEntity<ApiResponse<List<PickupRequestResponse>>> listByCollector(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PickupRequestResponse> data = pickupRequestService
                .listByCollector(principal.getUser().getId()).stream()
                .map(ModelMapper::toPickupRequestResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitudes del recolector", data));
    }

    @PutMapping("/api/recolector/recojos/{id}/en-ruta")
    public ResponseEntity<ApiResponse<PickupRequestResponse>> markAsEnRuta(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        PickupRequest updated = pickupRequestService.markAsEnRuta(id, principal.getCompany(), principal.getUser(), servletRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitud marcada en ruta", ModelMapper.toPickupRequestResponse(updated)));
    }

    @PutMapping("/api/recolector/recojos/{id}/confirmar")
    public ResponseEntity<ApiResponse<PickupRequestResponse>> confirmPickup(
            @PathVariable Long id,
            @Valid @RequestBody com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupConfirmationRequest requestDto,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        PickupRequest updated = pickupRequestService.confirmPickup(id, principal.getCompany(), principal.getUser(), requestDto.getVolumenReal(), servletRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitud confirmada", ModelMapper.toPickupRequestResponse(updated)));
    }

    @GetMapping("/api/recolector/solicitudes-disponibles")
    public ResponseEntity<ApiResponse<List<PickupRequestResponse>>> getAvailableRequests(
            @AuthenticationPrincipal UserPrincipal principal) {
        List<PickupRequestResponse> data = pickupRequestService
                .getAvailableRequests(principal.getCompany()).stream()
                .map(ModelMapper::toPickupRequestResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitudes disponibles", data));
    }

    @PostMapping("/api/recolector/solicitudes/{id}/aceptar")
    public ResponseEntity<ApiResponse<PickupRequestResponse>> acceptRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        PickupRequest updated = pickupRequestService.acceptRequest(id, principal.getUser(), principal.getCompany(), servletRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitud aceptada", ModelMapper.toPickupRequestResponse(updated)));
    }

    @PostMapping("/api/recolector/solicitudes/{id}/rechazar")
    public ResponseEntity<ApiResponse<Void>> rejectRequest(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal principal) {
        pickupRequestService.rejectRequest(id, principal.getCompany());
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitud rechazada exitosamente", null));
    }

    @GetMapping("/api/recolector/recojo-activo")
    public ResponseEntity<ApiResponse<PickupRequestResponse>> getActiveRequest(
            @AuthenticationPrincipal UserPrincipal principal) {
        PickupRequest active = pickupRequestService.getActiveRequest(principal.getUser().getId());
        if (active == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "No hay recojo activo", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Recojo activo encontrado", ModelMapper.toPickupRequestResponse(active)));
    }

    @GetMapping("/api/empresa/seguimiento-activo")
    public ResponseEntity<ApiResponse<com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse>> getActiveTrackingForCompany(
            @AuthenticationPrincipal UserPrincipal principal) {
        com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse active = pickupRequestService.getTrackingForGenerator(principal.getCompany().getId());
        if (active == null) {
            return ResponseEntity.ok(new ApiResponse<>(true, "No hay recojo activo", null));
        }
        return ResponseEntity.ok(new ApiResponse<>(true, "Seguimiento activo", active));
    }

    @PostMapping("/api/empresa/solicitudes/{solicitudId}/confirmar-pago")
    public ResponseEntity<ApiResponse<com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse>> confirmarPago(
            @PathVariable Long solicitudId,
            @Valid @RequestBody com.GAKOM_ECOTACNA.ECOTACNA.dto.OperationalPaymentConfirmationRequest requestDto,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        PickupRequest updated = pickupRequestService.confirmarPago(
                solicitudId,
                principal.getCompany(),
                principal.getUser(),
                requestDto.getLitrosConfirmados(),
                requestDto.getPrecioPorLitro(),
                requestDto.getObservacionPago(),
                servletRequest.getRemoteAddr()
        );
        com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse responseDto = pickupRequestService.buildTrackingResponse(updated);
        return ResponseEntity.ok(new ApiResponse<>(true, "Pago operativo confirmado y recojo completado exitosamente", responseDto));
    }
}
