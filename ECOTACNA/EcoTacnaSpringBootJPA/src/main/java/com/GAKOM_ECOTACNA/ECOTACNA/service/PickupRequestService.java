package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupAssignmentRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ResourceNotFoundException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PickupRequestService {

    private final PickupRequestRepository pickupRequestRepository;
    private final UserRepository userRepository;
    private final TransportUnitRepository transportUnitRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;
    private final SubscriptionValidator subscriptionValidator;
    private final ConstanciaPdfService constanciaPdfService;

    @Autowired
    public PickupRequestService(PickupRequestRepository pickupRequestRepository,
                                UserRepository userRepository,
                                TransportUnitRepository transportUnitRepository,
                                CompanyRepository companyRepository,
                                AuditLogService auditLogService,
                                SubscriptionValidator subscriptionValidator,
                                ConstanciaPdfService constanciaPdfService) {
        this.pickupRequestRepository = pickupRequestRepository;
        this.userRepository = userRepository;
        this.transportUnitRepository = transportUnitRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
        this.subscriptionValidator = subscriptionValidator;
        this.constanciaPdfService = constanciaPdfService;
    }

    @Transactional
    public PickupRequest create(Company company, BigDecimal volume, LocalDateTime scheduledAt,
                                String direccion, String observaciones,
                                User creator, String ipAddress) {
        subscriptionValidator.validateActiveSubscription(company);

        if (company.getCompanyType() != CompanyType.GENERADORA) {
            throw new BusinessException("Solo empresas GENERADORAS pueden crear solicitudes de recojo.");
        }
        if (volume == null || volume.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El volumen aproximado debe ser mayor a 0.");
        }

        PickupRequest request = PickupRequest.builder()
                .company(company)
                .approximateVolumeLiters(volume)
                .scheduledAt(scheduledAt)
                .direccion(direccion)
                .observaciones(observaciones)
                .status(PickupRequestStatus.PENDIENTE)
                .build();
        request = pickupRequestRepository.save(request);

        auditLogService.log(creator, creator.getEmail(), "SOLICITUD_RECOJO_CREADA",
                "Solicitud #" + request.getId() + " por " + volume + " litros.", ipAddress);
        return request;
    }

    @Transactional
    public PickupRequest markAsEnRuta(Long id, Company collectorCompany, User collector, String ipAddress) {
        subscriptionValidator.validateActiveSubscription(collectorCompany);
        
        PickupRequest request = getById(id);
        if (!collector.getId().equals(request.getCollectorUserId())) {
            throw new BusinessException("No puede modificar una solicitud que no le ha sido asignada.");
        }
        if (request.getStatus() != PickupRequestStatus.PROGRAMADO) {
            throw new BusinessException("La solicitud debe estar en estado PROGRAMADO para cambiar a EN_RUTA.");
        }

        request.setStatus(PickupRequestStatus.EN_RUTA);
        request = pickupRequestRepository.save(request);

        auditLogService.log(collector, collector.getEmail(), "SOLICITUD_EN_RUTA",
                "Solicitud #" + id + " marcada como EN_RUTA", ipAddress);
        return request;
    }

    @Transactional
    public PickupRequest confirmPickup(Long id, Company collectorCompany, User collector, BigDecimal actualVolume, String ipAddress) {
        subscriptionValidator.validateActiveSubscription(collectorCompany);
        
        PickupRequest request = getById(id);
        if (!collector.getId().equals(request.getCollectorUserId())) {
            throw new BusinessException("No puede modificar una solicitud que no le ha sido asignada.");
        }
        if (request.getStatus() != PickupRequestStatus.EN_RUTA) {
            throw new BusinessException("La solicitud debe estar EN_RUTA para poder confirmarla.");
        }
        if (actualVolume == null || actualVolume.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("El volumen real recogido debe ser mayor a 0.");
        }

        request.setActualVolumeLiters(actualVolume);
        request.setCollectedAt(LocalDateTime.now());
        request.setStatus(PickupRequestStatus.COMPLETADO);
        request = pickupRequestRepository.save(request);

        auditLogService.log(collector, collector.getEmail(), "SOLICITUD_RECOGIDA",
                "Solicitud #" + id + " recogida. Volumen real: " + actualVolume + " litros.", ipAddress);
        return request;
    }

    @Transactional(readOnly = true)
    public List<PickupRequest> listByCompany(Long companyId) {
        return pickupRequestRepository.findByCompanyIdOrderByRequestedAtDesc(companyId);
    }

    @Transactional(readOnly = true)
    public List<PickupRequest> listByCollector(Long collectorUserId) {
        return pickupRequestRepository.findByCollectorUserId(collectorUserId);
    }

    @Transactional
    public PickupRequest assignToCollector(Long pickupRequestId, PickupAssignmentRequest assignment,
                                           User admin, String ipAddress) {
        PickupRequest request = pickupRequestRepository.findById(pickupRequestId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de recojo no encontrada."));

        if (request.getStatus() != PickupRequestStatus.PENDIENTE
                && request.getStatus() != PickupRequestStatus.PROGRAMADO) {
            throw new BusinessException("La solicitud no está en estado asignable.");
        }

        User collector = userRepository.findById(assignment.getRecolectorId())
                .orElseThrow(() -> new ResourceNotFoundException("Recolector no encontrado."));
        if (collector.getRole() != Role.RECOLECTOR) {
            throw new BusinessException("El usuario indicado no tiene rol RECOLECTOR.");
        }

        TransportUnit transportUnit = null;
        if (assignment.getTransporteId() != null) {
            transportUnit = transportUnitRepository.findById(assignment.getTransporteId())
                    .orElseThrow(() -> new ResourceNotFoundException("Unidad vehicular no encontrada."));
            
            if (!transportUnit.getCollectorCompany().getId().equals(collector.getCompany().getId())) {
                throw new BusinessException("La unidad vehicular no pertenece a la empresa del recolector asignado.");
            }
            if (transportUnit.getStatus() != TransportStatus.ACTIVO) {
                throw new BusinessException("La unidad vehicular no está activa.");
            }
        }

        request.setCollectorUserId(collector.getId());
        request.setTransportUnit(transportUnit);
        request.setStatus(PickupRequestStatus.PROGRAMADO);
        if (request.getScheduledAt() == null) {
            request.setScheduledAt(LocalDateTime.now().plusDays(1));
        }
        request = pickupRequestRepository.save(request);

        auditLogService.log(admin, admin.getEmail(), "SOLICITUD_ASIGNADA",
                "Solicitud #" + pickupRequestId + " asignada al recolector " + collector.getEmail(), ipAddress);
        return request;
    }

    @Transactional(readOnly = true)
    public PickupRequest getById(Long id) {
        return pickupRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitud de recojo no encontrada."));
    }

    @Transactional
    public PickupRequest confirmarPagoOperativo(Long solicitudId, Long companyId,
                                                 BigDecimal litrosConfirmados, BigDecimal precioPorLitro,
                                                 String observacionPago, User user, String ipAddress) {
        PickupRequest request = getById(solicitudId);

        // 1. La solicitud debe pertenecer a la empresa autenticada
        if (!request.getCompany().getId().equals(companyId)) {
            throw new BusinessException("La solicitud no pertenece a su empresa.");
        }

        // 2. Debe tener recolector asignado
        if (request.getCollectorUserId() == null) {
            throw new BusinessException("La solicitud no tiene recolector asignado.");
        }

        // 3. Debe estar en estado activo (no COMPLETADO ni CANCELADO)
        if (request.getStatus() != PickupRequestStatus.PROGRAMADO
                && request.getStatus() != PickupRequestStatus.EN_RUTA
                && request.getStatus() != PickupRequestStatus.RECOGIDO) {
            throw new BusinessException("La solicitud no está en un estado válido para confirmar pago. Estado actual: " + request.getStatus());
        }

        // 4. No permitir si ya fue pagada
        if ("PAGADO".equals(request.getEstadoPago())) {
            throw new BusinessException("El pago operativo ya fue confirmado para esta solicitud.");
        }

        // 5. Validar litros > 0
        if (litrosConfirmados == null || litrosConfirmados.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Los litros confirmados deben ser mayor a 0.");
        }

        // 6. Validar precio >= 0
        if (precioPorLitro == null || precioPorLitro.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("El precio por litro debe ser mayor o igual a 0.");
        }

        // 7. Calcular monto total en backend
        BigDecimal montoTotal = litrosConfirmados.multiply(precioPorLitro);

        // 8. Guardar datos de pago operativo
        request.setLitrosConfirmados(litrosConfirmados);
        request.setPrecioPorLitro(precioPorLitro);
        request.setMontoTotal(montoTotal);
        request.setEstadoPago("PAGADO");
        request.setFechaConfirmacionPago(LocalDateTime.now());
        if (observacionPago != null && !observacionPago.isBlank()) {
            request.setObservacionPago(observacionPago);
        }

        // 9. Marcar recojo como COMPLETADO → libera al recolector
        request.setStatus(PickupRequestStatus.COMPLETADO);
        if (request.getCollectedAt() == null) {
            request.setCollectedAt(LocalDateTime.now());
        }

        request = pickupRequestRepository.save(request);

        auditLogService.log(user, user.getEmail(), "PAGO_OPERATIVO_CONFIRMADO",
                "Solicitud #" + solicitudId + " – Pago operativo: "
                        + litrosConfirmados + " L × S/" + precioPorLitro
                        + " = S/" + montoTotal, ipAddress);

        return request;
    }

    @Transactional(readOnly = true)
    public byte[] generarConstanciaPdf(Long solicitudId, Long companyId) {
        PickupRequest request = getById(solicitudId);

        // El usuario autenticado debe ser la empresa dueña de la solicitud
        if (!request.getCompany().getId().equals(companyId)) {
            throw new BusinessException("La solicitud no pertenece a su empresa.");
        }

        // Solo permitir si el pago operativo está PAGADO y el recojo completado
        if (!"PAGADO".equals(request.getEstadoPago()) || request.getStatus() != PickupRequestStatus.COMPLETADO) {
            throw new BusinessException("La constancia no está disponible porque el recojo no se encuentra completado y pagado.");
        }

        // Obtener datos del recolector
        User collector = null;
        Company recolectora = null;
        if (request.getCollectorUserId() != null) {
            collector = userRepository.findById(request.getCollectorUserId()).orElse(null);
            if (collector != null) {
                recolectora = collector.getCompany();
            }
        }

        TransportUnit transportUnit = request.getTransportUnit();

        // Generar un código único de constancia (CONST-000XXX)
        String codigoConstancia = String.format("CONST-%06d", request.getId());

        return constanciaPdfService.generarConstancia(request, request.getCompany(), collector, recolectora, transportUnit, codigoConstancia);
    }

    public static CompanyType resolveCompanyType(Role role, CompanyType requestedType) {
        if (requestedType != null) {
            return requestedType;
        }
        return switch (role) {
            case GENERADOR -> CompanyType.GENERADORA;
            case RECOLECTOR -> CompanyType.RECOLECTORA;
            default -> throw new IllegalArgumentException("Invalid role for company mapping");
        };
    }
}
