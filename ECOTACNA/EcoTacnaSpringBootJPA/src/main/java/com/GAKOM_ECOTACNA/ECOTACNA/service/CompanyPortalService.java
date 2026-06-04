package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.CompanySummaryResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ResourceNotFoundException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.Company;
import com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequestStatus;
import com.GAKOM_ECOTACNA.ECOTACNA.model.User;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.CompanyRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.PickupRequestRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CompanyPortalService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final PickupRequestRepository pickupRequestRepository;

    @Autowired
    public CompanyPortalService(CompanyRepository companyRepository,
                                UserRepository userRepository,
                                PickupRequestRepository pickupRequestRepository) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.pickupRequestRepository = pickupRequestRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfile(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada."));
        User user = userRepository.findByCompanyIdAndRole(companyId, com.GAKOM_ECOTACNA.ECOTACNA.model.Role.GENERADOR)
                .stream().findFirst()
                .or(() -> userRepository.findByCompanyId(companyId).stream().findFirst())
                .orElse(null);

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", company.getId());
        profile.put("ruc", company.getRuc());
        profile.put("razonSocial", company.getBusinessName());
        profile.put("direccion", company.getAddress());
        profile.put("tipoEmpresa", company.getCompanyType().name());

        if (user != null) {
            profile.put("correo", user.getEmail());
            profile.put("rol", user.getRole().name());
        }
        return profile;
    }

    @Transactional(readOnly = true)
    public CompanySummaryResponse getSummary(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Empresa no encontrada."));

        long totalRequests = pickupRequestRepository.findByCompanyIdOrderByRequestedAtDesc(companyId).size();

        CompanySummaryResponse summary = new CompanySummaryResponse();
        summary.setEmpresaId(companyId);
        summary.setRazonSocial(company.getBusinessName());
        summary.setTotalSolicitudes(totalRequests);
        summary.setTotalLitrosReciclados(BigDecimal.ZERO);
        summary.setSolicitudesPendientes(pickupRequestRepository.countByCompanyIdAndStatusIn(companyId,
                List.of(PickupRequestStatus.PENDIENTE, PickupRequestStatus.PROGRAMADO, PickupRequestStatus.EN_RUTA)));
        summary.setSolicitudesCompletadas(pickupRequestRepository.countByCompanyIdAndStatusIn(companyId,
                List.of(PickupRequestStatus.RECOGIDO, PickupRequestStatus.COMPLETADO)));
        return summary;
    }
}
