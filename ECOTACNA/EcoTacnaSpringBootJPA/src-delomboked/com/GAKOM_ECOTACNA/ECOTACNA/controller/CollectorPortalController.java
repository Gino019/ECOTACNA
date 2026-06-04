package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.security.UserPrincipal;
import com.GAKOM_ECOTACNA.ECOTACNA.service.CollectorPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class CollectorPortalController {

    private final CollectorPortalService collectorPortalService;

    @Autowired
    public CollectorPortalController(CollectorPortalService collectorPortalService) {
        this.collectorPortalService = collectorPortalService;
    }

    @GetMapping("/api/recolector/perfil")
    public ResponseEntity<ApiResponse<Map<String, Object>>> profile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Perfil recolector",
                collectorPortalService.getProfile(principal.getUser())));
    }

    @GetMapping("/api/recolector/resumen")
    public ResponseEntity<ApiResponse<Map<String, Object>>> summary(
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> data = collectorPortalService.getSummary(principal.getUser().getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Resumen recolector", data));
    }
}
