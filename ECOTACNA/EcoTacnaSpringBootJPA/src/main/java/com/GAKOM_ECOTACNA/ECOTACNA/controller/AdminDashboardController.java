package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.service.AdminDashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @Autowired
    public AdminDashboardController(AdminDashboardService adminDashboardService) {
        this.adminDashboardService = adminDashboardService;
    }

    @GetMapping("/resumen")
    public ResponseEntity<ApiResponse<Map<String, Object>>> resumen() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Resumen administrativo",
                adminDashboardService.getResumen()));
    }

    @GetMapping("/empresas")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> empresas() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Empresas registradas",
                adminDashboardService.getEmpresas()));
    }

    @GetMapping("/solicitudes")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> solicitudes() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Solicitudes de recojo",
                adminDashboardService.getSolicitudes()));
    }

    @GetMapping("/usuarios")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> usuarios() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Usuarios del sistema",
                adminDashboardService.getUsuarios()));
    }

    @GetMapping("/recolectores")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> recolectores() {
        return ResponseEntity.ok(new ApiResponse<>(true, "Empresas recolectoras",
                adminDashboardService.getEmpresasRecolectoras()));
    }

    @PostMapping("/empresas/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveCompany(@PathVariable Long id) {
        return ResponseEntity.ok(adminDashboardService.approveCompany(id));
    }

    @PostMapping("/empresas/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectCompany(@PathVariable Long id) {
        return ResponseEntity.ok(adminDashboardService.rejectCompany(id));
    }

    @PostMapping("/recolectores/{id}/approve")
    public ResponseEntity<Map<String, Object>> approveRecolectora(@PathVariable Long id) {
        return ResponseEntity.ok(adminDashboardService.approveCompany(id));
    }

    @PostMapping("/recolectores/{id}/reject")
    public ResponseEntity<Map<String, Object>> rejectRecolectora(@PathVariable Long id) {
        return ResponseEntity.ok(adminDashboardService.rejectCompany(id));
    }
}
