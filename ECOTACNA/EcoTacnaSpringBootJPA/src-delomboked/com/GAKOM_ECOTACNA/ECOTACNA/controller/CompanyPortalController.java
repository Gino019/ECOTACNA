package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.CompanySummaryResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.security.UserPrincipal;
import com.GAKOM_ECOTACNA.ECOTACNA.service.CompanyPortalService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class CompanyPortalController {

    private final CompanyPortalService companyPortalService;

    @Autowired
    public CompanyPortalController(CompanyPortalService companyPortalService) {
        this.companyPortalService = companyPortalService;
    }

    @GetMapping("/api/empresa/perfil")
    public ResponseEntity<ApiResponse<Map<String, Object>>> profile(
            @AuthenticationPrincipal UserPrincipal principal) {
        Map<String, Object> data = companyPortalService.getProfile(principal.getCompany().getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Datos de empresa", data));
    }

    @GetMapping("/api/empresa/resumen")
    public ResponseEntity<ApiResponse<CompanySummaryResponse>> summary(
            @AuthenticationPrincipal UserPrincipal principal) {
        CompanySummaryResponse data = companyPortalService.getSummary(principal.getCompany().getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Resumen empresa", data));
    }
}
