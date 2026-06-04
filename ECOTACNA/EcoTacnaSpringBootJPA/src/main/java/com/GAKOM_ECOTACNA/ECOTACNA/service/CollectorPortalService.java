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
        // camelCase keys for frontend compatibility
        profile.put("correo", collector.getEmail());
        profile.put("rol", collector.getRole().name());
        profile.put("companyId", collector.getCompany().getId());
        profile.put("razonSocial", collector.getCompany().getBusinessName());
        profile.put("ruc", collector.getCompany().getRuc());
        profile.put("tipoEmpresa", collector.getCompany().getCompanyType().name());
        profile.put("direccion", collector.getCompany().getAddress());
        profile.put("estado", collector.getCompany().getSubscriptionStatus() != null
                ? collector.getCompany().getSubscriptionStatus().name() : "DESCONOCIDO");
        return profile;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getSummary(Long collectorUserId) {
        List<com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequest> recojos =
                pickupRequestRepository.findByCollectorUserId(collectorUserId);
        long total = recojos.size();
        long completadas = recojos.stream()
                .filter(r -> r.getStatus() == PickupRequestStatus.COMPLETADO || r.getStatus() == PickupRequestStatus.RECOGIDO)
                .count();
        long enRuta = recojos.stream()
                .filter(r -> r.getStatus() == PickupRequestStatus.EN_RUTA || r.getStatus() == PickupRequestStatus.PROGRAMADO)
                .count();
        double litrosHistorico = recojos.stream()
                .filter(r -> r.getActualVolumeLiters() != null)
                .mapToDouble(r -> r.getActualVolumeLiters().doubleValue())
                .sum();

        Map<String, Object> summary = new HashMap<>();
        summary.put("total_recojos", total);
        summary.put("recojosPendientes", enRuta);
        summary.put("completadas", completadas);
        summary.put("litrosRecolectadosHistorico", litrosHistorico);
        return summary;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getDashboard(User collector) {
        if (collector.getCompany() == null) {
            throw new ResourceNotFoundException("Recolector sin empresa asociada.");
        }
        Map<String, Object> dashboard = new HashMap<>();
        // Identity
        dashboard.put("companyId", collector.getCompany().getId());
        dashboard.put("ruc", collector.getCompany().getRuc());
        dashboard.put("razonSocial", collector.getCompany().getBusinessName());
        dashboard.put("tipoEmpresa", collector.getCompany().getCompanyType().name());
        dashboard.put("correo", collector.getEmail());
        dashboard.put("telefono", collector.getPhone());
        dashboard.put("estado", collector.getCompany().getSubscriptionStatus() != null
                ? collector.getCompany().getSubscriptionStatus().name() : "DESCONOCIDO");
        dashboard.put("subscriptionStatus", collector.getCompany().getSubscriptionStatus() != null
                ? collector.getCompany().getSubscriptionStatus().name() : "DESCONOCIDO");

        // Metrics
        List<com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequest> recojos =
                pickupRequestRepository.findByCollectorUserId(collector.getId());
        long pending = recojos.stream()
                .filter(r -> r.getStatus() == PickupRequestStatus.EN_RUTA || r.getStatus() == PickupRequestStatus.PROGRAMADO)
                .count();
        long accepted = recojos.size();
        double liters = recojos.stream()
                .filter(r -> r.getActualVolumeLiters() != null)
                .mapToDouble(r -> r.getActualVolumeLiters().doubleValue())
                .sum();

        dashboard.put("recojosPendientes", pending);
        dashboard.put("recojosVinculados", accepted);
        dashboard.put("litrosAcumulados", liters);
        dashboard.put("solicitudesAceptadas", accepted);
        dashboard.put("solicitudesAceptadasDetalle", List.of());
        dashboard.put("recojosDelDia", List.of());
        return dashboard;
    }
}
