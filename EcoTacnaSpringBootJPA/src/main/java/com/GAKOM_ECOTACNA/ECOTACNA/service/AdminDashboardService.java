package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class AdminDashboardService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PickupRequestRepository pickupRequestRepository;

    @Autowired
    public AdminDashboardService(CompanyRepository companyRepository,
            UserRepository userRepository,
            PickupRequestRepository pickupRequestRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.pickupRequestRepository = pickupRequestRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getResumen() {
        Map<String, Object> resumen = new HashMap<>();
        resumen.put("totalEmpresas", companyRepository.count());
        resumen.put("totalUsuarios", userRepository.count());
        resumen.put("totalSolicitudes", pickupRequestRepository.count());
        resumen.put("solicitudesPendientes",
                pickupRequestRepository.countByStatus(PickupRequestStatus.PENDIENTE));
        return resumen;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmpresas() {
        // Solo retorna empresas GENERADORAS
        return companyRepository.findByCompanyTypeOrderByCreatedAtDesc(CompanyType.GENERADORA)
                .stream()
                .map(c -> buildCompanyMap(c))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEmpresasRecolectoras() {
        // Solo retorna empresas RECOLECTORAS
        return companyRepository.findByCompanyTypeOrderByCreatedAtDesc(CompanyType.RECOLECTORA)
                .stream()
                .map(c -> buildCompanyMap(c))
                .collect(Collectors.toList());
    }

    private Map<String, Object> buildCompanyMap(Company c) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.getId());
        m.put("ruc", c.getRuc());
        m.put("razonSocial", c.getBusinessName());
        m.put("tipoEmpresa", c.getCompanyType().name());
        m.put("direccion", c.getAddress());
        String correoContacto = null;
        String numeroContacto = null;
        List<User> users = userRepository.findByCompanyId(c.getId());
        if (!users.isEmpty()) {
            User u = users.get(0);
            if (u.getEmail() != null) correoContacto = u.getEmail();
            if (u.getPhone() != null && !u.getPhone().isBlank()) numeroContacto = u.getPhone();
        }
        m.put("correoContacto", correoContacto != null ? correoContacto : "Información no disponible");
        m.put("numeroContacto", numeroContacto != null ? numeroContacto : "Información no disponible");
        m.put("totalLiters", 0);
        m.put("estado", c.getSubscriptionStatus() != null ? c.getSubscriptionStatus().name() : "PENDIENTE");
        return m;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSolicitudes() {
        return pickupRequestRepository.findAllWithCompany().stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("empresaId", s.getCompany().getId());
            m.put("ruc", s.getCompany().getRuc());
            m.put("razonSocial", s.getCompany().getBusinessName());
            m.put("tipoEmpresa", s.getCompany().getCompanyType().name());
            m.put("volumenAproximado", s.getApproximateVolumeLiters());
            m.put("estado", s.getStatus().name());
            m.put("fechaSolicitud", s.getRequestedAt());
            
            // Resolve contact info
            String correoContacto = "Información no disponible";
            String numeroContacto = "Información no disponible";
            List<User> users = userRepository.findByCompanyId(s.getCompany().getId());
            if (!users.isEmpty()) {
                User u = users.get(0);
                if (u.getEmail() != null) {
                    correoContacto = u.getEmail();
                }
                if (u.getPhone() != null && !u.getPhone().isBlank()) {
                    numeroContacto = u.getPhone();
                }
            }
            m.put("correoContacto", correoContacto);
            m.put("numeroContacto", numeroContacto);
            
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getUsuarios() {
        return userRepository.findAll().stream().map(u -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", u.getId());
            m.put("correo", u.getEmail());
            m.put("rol", u.getRole().name());
            m.put("empresaId", u.getCompany() != null ? u.getCompany().getId() : null);
            m.put("habilitado", u.isEnabled());
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> approveCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException("Empresa no encontrada con ID: " + companyId));

        if (company.getSubscriptionStatus() != SubscriptionStatus.PENDIENTE) {
            throw new BusinessException("La empresa no está pendiente de aprobación.");
        }

        company.setSubscriptionStatus(SubscriptionStatus.PENDIENTE_PAGO);
        companyRepository.save(company);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("companyId", company.getId());
        response.put("ruc", company.getRuc());
        response.put("razonSocial", company.getBusinessName());
        response.put("estado", company.getSubscriptionStatus().name());
        response.put("nextStep", "PAYMENT_PENDING");
        response.put("message", "Empresa aprobada correctamente.");
        return response;
    }

    @Transactional
    public Map<String, Object> rejectCompany(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException("Empresa no encontrada con ID: " + companyId));

        if (company.getSubscriptionStatus() != SubscriptionStatus.PENDIENTE) {
            throw new BusinessException("La empresa no está pendiente de aprobación.");
        }

        company.setSubscriptionStatus(SubscriptionStatus.CANCELADA);
        companyRepository.save(company);

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("companyId", company.getId());
        response.put("ruc", company.getRuc());
        response.put("razonSocial", company.getBusinessName());
        response.put("estado", company.getSubscriptionStatus().name());
        response.put("nextStep", "REJECTED");
        response.put("message", "Empresa rechazada correctamente.");
        return response;
    }
}
