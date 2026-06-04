package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.RucLookupResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.service.RucLookupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public")
public class RucLookupController {

    private final RucLookupService rucLookupService;

    @Autowired
    public RucLookupController(RucLookupService rucLookupService) {
        this.rucLookupService = rucLookupService;
    }

    @GetMapping("/ruc/{ruc}")
    public ResponseEntity<ApiResponse<RucLookupResponse>> lookupRuc(@PathVariable String ruc) {
        RucLookupResponse response = rucLookupService.lookupRuc(ruc);
        return ResponseEntity.ok(new ApiResponse<>(true, "Datos encontrados", response));
    }

    @Autowired
    private org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/ruc/clear")
    public String clearDb() {
        jdbcTemplate.execute("DELETE FROM audit_logs;");
        jdbcTemplate.execute("DELETE FROM users;");
        jdbcTemplate.execute("DELETE FROM companies;");
        return "Base de datos limpiada correctamente.";
    }
}
