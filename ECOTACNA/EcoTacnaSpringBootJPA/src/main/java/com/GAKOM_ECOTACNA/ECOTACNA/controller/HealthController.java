package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @GetMapping
    public ResponseEntity<ApiResponse<Map<String, String>>> health() {
        return ResponseEntity.ok(new ApiResponse<>(true, "ECO_TACNA API operativa",
                Map.of("status", "UP", "service", "ECOTACNA")));
    }

    @org.springframework.web.bind.annotation.GetMapping("/delete-test-user")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<String> deleteTestUser(
            @org.springframework.beans.factory.annotation.Autowired com.GAKOM_ECOTACNA.ECOTACNA.repository.UserRepository userRepo,
            @org.springframework.beans.factory.annotation.Autowired com.GAKOM_ECOTACNA.ECOTACNA.repository.CompanyRepository compRepo,
            @org.springframework.beans.factory.annotation.Autowired com.GAKOM_ECOTACNA.ECOTACNA.repository.AuditLogRepository audit,
            @org.springframework.beans.factory.annotation.Autowired com.GAKOM_ECOTACNA.ECOTACNA.repository.SubscriptionRepository subRepo
    ) {
        userRepo.findByEmail("gerencia@sabor.com").ifPresent(user -> {
            audit.deleteAll(); // Delete all audits to prevent FK constraints
            if (user.getCompany() != null) {
                subRepo.findTopByCompanyIdOrderByCreatedAtDesc(user.getCompany().getId()).ifPresent(subRepo::delete);
            }
            userRepo.delete(user);
            if (user.getCompany() != null) {
                compRepo.delete(user.getCompany());
            }
        });
        
        compRepo.findByRuc("20605432198").ifPresent(comp -> {
            subRepo.findTopByCompanyIdOrderByCreatedAtDesc(comp.getId()).ifPresent(subRepo::delete);
            compRepo.delete(comp);
        });

        return ResponseEntity.ok("Usuario y empresa de prueba eliminados exitosamente.");
    }

}
