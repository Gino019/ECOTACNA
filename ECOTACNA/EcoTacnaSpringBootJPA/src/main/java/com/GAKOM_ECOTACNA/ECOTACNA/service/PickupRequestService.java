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
    private final CollectorRejectedRequestRepository rejectedRequestRepository;

    @Autowired
    public PickupRequestService(PickupRequestRepository pickupRequestRepository,
                                UserRepository userRepository,
                                TransportUnitRepository transportUnitRepository,
                                CompanyRepository companyRepository,
                                AuditLogService auditLogService,
                                SubscriptionValidator subscriptionValidator,
                                CollectorRejectedRequestRepository rejectedRequestRepository) {
        this.pickupRequestRepository = pickupRequestRepository;
        this.userRepository = userRepository;
        this.transportUnitRepository = transportUnitRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
        this.subscriptionValidator = subscriptionValidator;
        this.rejectedRequestRepository = rejectedRequestRepository;
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
        request.setStatus(PickupRequestStatus.RECOGIDO);
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

    @Transactional(readOnly = true)
    public List<PickupRequest> getAvailableRequests(Company collectorCompany) {
        subscriptionValidator.validateActiveSubscription(collectorCompany);
        if (collectorCompany.getCompanyType() != CompanyType.RECOLECTORA) {
            throw new BusinessException("Solo empresas RECOLECTORAS pueden ver solicitudes disponibles.");
        }
        return pickupRequestRepository.findAvailableRequests(collectorCompany.getId(), PickupRequestStatus.PENDIENTE);
    }

    @Transactional
    public PickupRequest acceptRequest(Long id, User collector, Company collectorCompany, String ipAddress) {
        subscriptionValidator.validateActiveSubscription(collectorCompany);
        if (collectorCompany.getCompanyType() != CompanyType.RECOLECTORA) {
            throw new BusinessException("Solo empresas RECOLECTORAS pueden aceptar solicitudes.");
        }

        boolean tieneRecojoActivo = pickupRequestRepository.existsActiveRequestByCollectorCompanyId(
                collectorCompany.getId(),
                List.of(PickupRequestStatus.PROGRAMADO, PickupRequestStatus.EN_RUTA, PickupRequestStatus.RECOGIDO)
        );
        if (tieneRecojoActivo) {
            throw new BusinessException("Ya tienes un recojo en curso. Finaliza el actual antes de aceptar otro.");
        }

        PickupRequest request = getById(id);
        if (request.getStatus() != PickupRequestStatus.PENDIENTE) {
            throw new BusinessException("La solicitud ya no está disponible.");
        }
        if (request.getCollectorUserId() != null) {
            throw new BusinessException("Esta solicitud ya fue tomada por otro recolector.");
        }

        request.setCollectorUserId(collector.getId());
        request.setStatus(PickupRequestStatus.PROGRAMADO);
        if (request.getScheduledAt() == null) {
            request.setScheduledAt(LocalDateTime.now());
        }
        request = pickupRequestRepository.save(request);

        auditLogService.log(collector, collector.getEmail(), "SOLICITUD_ACEPTADA",
                "Solicitud #" + id + " aceptada por recolector.", ipAddress);
        return request;
    }

    @Transactional
    public void rejectRequest(Long id, Company collectorCompany) {
        PickupRequest request = getById(id);
        
        boolean alreadyRejected = rejectedRequestRepository.existsByPickupRequestIdAndCollectorCompanyId(id, collectorCompany.getId());
        if (!alreadyRejected) {
            CollectorRejectedRequest rejection = CollectorRejectedRequest.builder()
                .pickupRequest(request)
                .collectorCompany(collectorCompany)
                .build();
            rejectedRequestRepository.save(rejection);
        }
    }

    @Transactional(readOnly = true)
    public PickupRequest getActiveRequest(Long collectorUserId) {
        return pickupRequestRepository.findFirstActiveRequest(collectorUserId, 
            List.of(PickupRequestStatus.PROGRAMADO, PickupRequestStatus.EN_RUTA, PickupRequestStatus.RECOGIDO));
    }

    @Transactional(readOnly = true)
    public com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse getTrackingForGenerator(Long companyId) {
        PickupRequest active = pickupRequestRepository.findFirstActiveRequestByCompanyId(companyId, 
            List.of(PickupRequestStatus.PROGRAMADO, PickupRequestStatus.EN_RUTA, PickupRequestStatus.RECOGIDO));
        if (active == null) {
            return null;
        }
        return buildTrackingResponse(active);
    }

    public com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse buildTrackingResponse(PickupRequest active) {
        if (active == null) {
            return null;
        }
        com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse.PickupTrackingResponseBuilder builder = 
            com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse.builder()
                .solicitudId(active.getId())
                .estado(active.getStatus().name())
                .empresaGeneradora(active.getCompany().getBusinessName())
                .direccion(active.getDireccion())
                .volumenAproximado(active.getApproximateVolumeLiters())
                .fechaSolicitud(active.getRequestedAt())
                .fechaProgramada(active.getScheduledAt())
                .observaciones(active.getObservaciones())
                .litrosConfirmados(active.getLitrosConfirmados())
                .precioPorLitro(active.getPrecioPorLitro())
                .montoTotal(active.getMontoTotal())
                .estadoPago(active.getEstadoPago())
                .fechaConfirmacionPago(active.getFechaConfirmacionPago())
                .observacionPago(active.getObservacionPago());

        if (active.getCollectorUserId() != null) {
            userRepository.findById(active.getCollectorUserId()).ifPresent(user -> {
                Company recolectorCompany = user.getCompany();
                builder.recolector(com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse.RecolectorInfo.builder()
                        .empresaRecolectoraId(recolectorCompany.getId())
                        .razonSocial(recolectorCompany.getBusinessName())
                        .ruc(recolectorCompany.getRuc())
                        .correo(user.getEmail())
                        .telefono(user.getPhone())
                        .build());
            });
        }

        if (active.getTransportUnit() != null) {
            TransportUnit unit = active.getTransportUnit();
            builder.unidad(com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupTrackingResponse.UnidadInfo.builder()
                    .placa(unit.getPlate())
                    .marca(unit.getBrand())
                    .modelo(unit.getModel())
                    .tipoUnidad(unit.getUnitType())
                    .capacidadLitros(unit.getCapacityLiters())
                    .build());
        }

        return builder.build();
    }

    @Transactional
    public PickupRequest confirmarPago(Long id, Company company, User generatorUser,
                                      BigDecimal litrosConfirmados, BigDecimal precioPorLitro,
                                      String observacionPago, String ipAddress) {
        PickupRequest request = getById(id);
        
        if (!request.getCompany().getId().equals(company.getId())) {
            throw new BusinessException("La solicitud no pertenece a su empresa.");
        }
        if (request.getCollectorUserId() == null) {
            throw new BusinessException("La solicitud no tiene un recolector asignado.");
        }
        if (request.getStatus() == PickupRequestStatus.COMPLETADO || "PAGADO".equalsIgnoreCase(request.getEstadoPago())) {
            throw new BusinessException("La solicitud ya ha sido completada y pagada.");
        }
        if (request.getStatus() == PickupRequestStatus.CANCELADO) {
            throw new BusinessException("La solicitud está cancelada.");
        }
        if (request.getStatus() != PickupRequestStatus.PROGRAMADO 
                && request.getStatus() != PickupRequestStatus.EN_RUTA 
                && request.getStatus() != PickupRequestStatus.RECOGIDO) {
            throw new BusinessException("La solicitud no está en un estado activo para confirmar pago.");
        }
        
        if (litrosConfirmados == null || litrosConfirmados.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BusinessException("Los litros confirmados deben ser mayores a 0.");
        }
        if (precioPorLitro == null || precioPorLitro.compareTo(BigDecimal.ZERO) < 0) {
            throw new BusinessException("El precio por litro debe ser mayor o igual a 0.");
        }
        
        BigDecimal montoTotal = litrosConfirmados.multiply(precioPorLitro);
        
        request.setLitrosConfirmados(litrosConfirmados);
        request.setPrecioPorLitro(precioPorLitro);
        request.setMontoTotal(montoTotal);
        request.setEstadoPago("PAGADO");
        request.setFechaConfirmacionPago(LocalDateTime.now(java.time.ZoneId.of("America/Lima")));
        request.setObservacionPago(observacionPago);
        request.setStatus(PickupRequestStatus.COMPLETADO);
        
        request = pickupRequestRepository.save(request);
        
        auditLogService.log(generatorUser, generatorUser.getEmail(), "PAGO_OPERATIVO_CONFIRMADO",
                "Solicitud #" + id + " completada y pagada. Litros: " + litrosConfirmados + ", Total: S/ " + montoTotal, ipAddress);
                
        return request;
    }
}
