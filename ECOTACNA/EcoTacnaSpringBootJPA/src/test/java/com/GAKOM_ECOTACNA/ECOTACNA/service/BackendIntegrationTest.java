package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.PickupAssignmentRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.TransportUnitRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.CompanyRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.junit.jupiter.api.AfterEach;
import org.springframework.test.context.ActiveProfiles;

import jakarta.validation.ConstraintViolation;
import jakarta.validation.Validation;
import jakarta.validation.Validator;
import jakarta.validation.ValidatorFactory;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
public class BackendIntegrationTest {

    @Autowired
    private TransportUnitService transportUnitService;

    @Autowired
    private PickupRequestService pickupRequestService;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private com.GAKOM_ECOTACNA.ECOTACNA.repository.UserRepository userRepository;

    @Autowired
    private com.GAKOM_ECOTACNA.ECOTACNA.repository.AuditLogRepository auditLogRepository;

    @Autowired
    private com.GAKOM_ECOTACNA.ECOTACNA.repository.PickupRequestRepository pickupRequestRepository;

    @Autowired
    private com.GAKOM_ECOTACNA.ECOTACNA.repository.TransportUnitRepository transportUnitRepository;

    private Validator validator;

    private Company generadora;
    private Company recolectora;
    private User generadorUser;
    private User recolectorUser;
    private User adminUser;

    @BeforeEach
    public void setup() {
        ValidatorFactory factory = Validation.buildDefaultValidatorFactory();
        validator = factory.getValidator();

        generadora = companyRepository.save(Company.builder()
                .ruc("11111111111")
                .businessName("Test Gen")
                .address("Direccion")
                .companyType(CompanyType.GENERADORA)
                .subscriptionStatus(SubscriptionStatus.ACTIVA)
                .build());

        recolectora = companyRepository.save(Company.builder()
                .ruc("22222222222")
                .businessName("Test Rec")
                .address("Direccion")
                .companyType(CompanyType.RECOLECTORA)
                .subscriptionStatus(SubscriptionStatus.ACTIVA)
                .build());

        generadorUser = userRepository.save(User.builder()
                .email("gen@test.com")
                .password("pass")
                .firstName("Gen")
                .lastName("Test")
                .role(Role.GENERADOR)
                .company(generadora)
                .enabled(true)
                .build());

        recolectorUser = userRepository.save(User.builder()
                .email("rec@test.com")
                .password("pass")
                .firstName("Rec")
                .lastName("Test")
                .role(Role.RECOLECTOR)
                .company(recolectora)
                .enabled(true)
                .build());

        adminUser = userRepository.save(User.builder()
                .email("admin@test.com")
                .password("pass")
                .firstName("Admin")
                .lastName("Test")
                .role(Role.ADMIN)
                .enabled(true)
                .build());
    }

    @AfterEach
    public void cleanup() {
        auditLogRepository.deleteAll();
        pickupRequestRepository.deleteAll();
        transportUnitRepository.deleteAll();
        userRepository.deleteAll();
        companyRepository.deleteAll();
    }

    @Test
    public void testPlacaUnica() {
        TransportUnitRequest req1 = new TransportUnitRequest();
        req1.setPlaca("ABC-123");
        req1.setCapacidadLitros(new BigDecimal("1000"));
        transportUnitService.createForCollector(recolectora, recolectorUser, req1, "127.0.0.1");

        TransportUnitRequest req2 = new TransportUnitRequest();
        req2.setPlaca("abc-123");
        req2.setCapacidadLitros(new BigDecimal("500"));
        
        BusinessException ex = assertThrows(BusinessException.class, () -> 
            transportUnitService.createForCollector(recolectora, recolectorUser, req2, "127.0.0.1")
        );
        assertTrue(ex.getMessage().contains("Ya existe un transporte con la placa ABC-123"));
    }

    @Test
    public void testCapacidadMayorACero() {
        TransportUnitRequest req = new TransportUnitRequest();
        req.setPlaca("XYZ-999");
        req.setCapacidadLitros(BigDecimal.ZERO);
        
        Set<ConstraintViolation<TransportUnitRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("La capacidad debe ser mayor a 0")));
    }

    @Test
    public void testSuscripcionNoActiva() {
        generadora.setSubscriptionStatus(SubscriptionStatus.PENDIENTE);
        companyRepository.save(generadora);

        BusinessException ex = assertThrows(BusinessException.class, () ->
            pickupRequestService.create(generadora, new BigDecimal("100"), LocalDateTime.now().plusDays(1), "dir", "obs", generadorUser, "127.0.0.1")
        );
        assertTrue(ex.getMessage().contains("suscripci"));
    }

    @Test
    public void testFlujoCompletoSolicitud() {
        // 1. Crear
        PickupRequest request = pickupRequestService.create(generadora, new BigDecimal("500"), LocalDateTime.now().plusDays(1), "dir", "obs", generadorUser, "127.0.0.1");
        assertEquals(PickupRequestStatus.PENDIENTE, request.getStatus());

        // 2. Asignar
        PickupAssignmentRequest assignReq = new PickupAssignmentRequest();
        assignReq.setRecolectorId(recolectorUser.getId());
        request = pickupRequestService.assignToCollector(request.getId(), assignReq, adminUser, "127.0.0.1");
        assertEquals(PickupRequestStatus.PROGRAMADO, request.getStatus());

        // 3. En Ruta
        request = pickupRequestService.markAsEnRuta(request.getId(), recolectora, recolectorUser, "127.0.0.1");
        assertEquals(PickupRequestStatus.EN_RUTA, request.getStatus());

        // 4. Confirmar
        request = pickupRequestService.confirmPickup(request.getId(), recolectora, recolectorUser, new BigDecimal("490"), "127.0.0.1");
        assertEquals(PickupRequestStatus.COMPLETADO, request.getStatus());
        assertEquals(new BigDecimal("490"), request.getActualVolumeLiters());
    }

    @Test
    public void testUnidadVinculadaARecolectorAutenticado() {
        TransportUnitRequest req = new TransportUnitRequest();
        req.setPlaca("TEST-1");
        req.setCapacidadLitros(new BigDecimal("100"));
        TransportUnit unit = transportUnitService.createForCollector(recolectora, recolectorUser, req, "127.0.0.1");

        Company otraRecolectora = companyRepository.save(Company.builder()
                .ruc("33333333333")
                .businessName("Test Rec 2")
                .address("Direccion")
                .companyType(CompanyType.RECOLECTORA)
                .subscriptionStatus(SubscriptionStatus.ACTIVA)
                .build());

        User otroRecolectorUser = userRepository.save(User.builder()
                .email("rec2@test.com")
                .password("pass")
                .firstName("Rec2")
                .lastName("Test")
                .role(Role.RECOLECTOR)
                .company(otraRecolectora)
                .enabled(true)
                .build());

        TransportUnitRequest updateReq = new TransportUnitRequest();
        updateReq.setPlaca("TEST-1-MOD");
        updateReq.setCapacidadLitros(new BigDecimal("100"));

        BusinessException ex = assertThrows(BusinessException.class, () ->
            transportUnitService.updateForCollector(unit.getId(), otraRecolectora, otroRecolectorUser, updateReq, "127.0.0.1")
        );
        assertTrue(ex.getMessage().contains("No puede modificar una unidad que no pertenece a su empresa"));
    }

    @Test
    public void testRBACNoGeneradoraNoPuedeCrearSolicitud() {
        BusinessException ex = assertThrows(BusinessException.class, () ->
            pickupRequestService.create(recolectora, new BigDecimal("100"), LocalDateTime.now().plusDays(1), "dir", "obs", recolectorUser, "127.0.0.1")
        );
        assertTrue(ex.getMessage().contains("Solo empresas GENERADORAS pueden crear solicitudes de recojo"));
    }
}
