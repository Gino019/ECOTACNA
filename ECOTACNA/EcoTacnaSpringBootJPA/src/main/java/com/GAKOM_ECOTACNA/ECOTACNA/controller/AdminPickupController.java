package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupRequestResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupAssignmentRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.mapper.ModelMapper;
import com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.security.UserPrincipal;
import com.GAKOM_ECOTACNA.ECOTACNA.service.PickupRequestService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/solicitudes")
public class AdminPickupController {

    private final PickupRequestService pickupRequestService;

    @Autowired
    public AdminPickupController(PickupRequestService pickupRequestService) {
        this.pickupRequestService = pickupRequestService;
    }

    @PostMapping("/{id}/asignar")
    public ResponseEntity<ApiResponse<PickupRequestResponse>> assign(
            @PathVariable Long id,
            @Valid @RequestBody PickupAssignmentRequest request,
            @AuthenticationPrincipal UserPrincipal principal,
            HttpServletRequest servletRequest) {
        PickupRequest collection = pickupRequestService.assignToCollector(
                id, request, principal.getUser(), servletRequest.getRemoteAddr());
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitud asignada al recolector",
                ModelMapper.toPickupRequestResponse(collection)));
    }
}
