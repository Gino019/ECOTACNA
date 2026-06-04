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
        return companyRepository.findAll().stream().map(c -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", c.getId());
            m.put("ruc", c.getRuc());
            m.put("razonSocial", c.getBusinessName());
            m.put("tipoEmpresa", c.getCompanyType().name());
            m.put("direccion", c.getAddress());
            return m;
        }).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getSolicitudes() {
        return pickupRequestRepository.findAllWithCompany().stream().map(s -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", s.getId());
            m.put("empresaId", s.getCompany().getId());
            m.put("razonSocial", s.getCompany().getBusinessName());
            m.put("volumenAproximado", s.getApproximateVolumeLiters());
            m.put("estado", s.getStatus().name());
            m.put("fechaSolicitud", s.getRequestedAt());
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
}
