package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.exception.ResourceNotFoundException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequestStatus;
import com.GAKOM_ECOTACNA.ECOTACNA.model.User;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.PickupRequestRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class CollectorPortalService {

    private final PickupRequestRepository pickupRequestRepository;

    @Autowired
    public CollectorPortalService(PickupRequestRepository pickupRequestRepository) {
        this.pickupRequestRepository = pickupRequestRepository;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getProfile(User collector) {
        if (collector.getCompany() == null) {
            throw new ResourceNotFoundException("Recolector sin empresa asociada.");
        }
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", collector.getId());
        profile.put("correo", collector.getEmail());
        profile.put("rol", collector.getRole().name());
        profile.put("empresa_id", collector.getCompany().getId());
        profile.put("razon_social", collector.getCompany().getBusinessName());
        profile.put("tipo_empresa", collector.getCompany().getCompanyType().name());
        return profile;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary(Long collectorUserId) {
        long total = pickupRequestRepository.findByCollectorUserId(collectorUserId).size();
        long completadas = pickupRequestRepository.findByCollectorUserId(collectorUserId).stream()
                .filter(r -> r.getStatus() == PickupRequestStatus.COMPLETADO || r.getStatus() == PickupRequestStatus.RECOGIDO)
                .count();
        long enRuta = pickupRequestRepository.findByCollectorUserId(collectorUserId).stream()
                .filter(r -> r.getStatus() == PickupRequestStatus.EN_RUTA || r.getStatus() == PickupRequestStatus.PROGRAMADO)
                .count();

        Map<String, Object> summary = new HashMap<>();
        summary.put("total_recojos", total);
        summary.put("completadas", completadas);
        summary.put("pendientes", enRuta);
        return summary;
    }
}
