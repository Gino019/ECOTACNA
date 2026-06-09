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
    private AuthService authService;

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
            pickupRequestService.create(generadora, new BigDecimal("100"), LocalDateTime.now().plusDays(1), "dir", "obs", new BigDecimal("2.50"), generadorUser, "127.0.0.1")
        );
        assertTrue(ex.getMessage().contains("suscripci"));
    }

    @Test
    public void testFlujoCompletoSolicitud() {
        // 1. Crear
        PickupRequest request = pickupRequestService.create(generadora, new BigDecimal("500"), LocalDateTime.now().plusDays(1), "dir", "obs", new BigDecimal("2.50"), generadorUser, "127.0.0.1");
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
        assertEquals(PickupRequestStatus.RECOGIDO, request.getStatus());
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
            pickupRequestService.create(recolectora, new BigDecimal("100"), LocalDateTime.now().plusDays(1), "dir", "obs", new BigDecimal("2.50"), recolectorUser, "127.0.0.1")
        );
        assertTrue(ex.getMessage().contains("Solo empresas GENERADORAS pueden crear solicitudes de recojo"));
    }

    @Test
    public void testRegisterRequestPasswordValidation() {
        com.GAKOM_ECOTACNA.ECOTACNA.dto.RegisterRequest req = new com.GAKOM_ECOTACNA.ECOTACNA.dto.RegisterRequest();
        req.setRuc("10203040506");
        req.setEmail("test@company.com");
        req.setFirstName("First");
        req.setLastName("Last");
        req.setRole(Role.GENERADOR);

        // 1. Password too short (less than 8 characters)
        req.setPassword("Short1");
        req.setConfirmPassword("Short1");
        Set<ConstraintViolation<com.GAKOM_ECOTACNA.ECOTACNA.dto.RegisterRequest>> violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("La contraseña debe tener entre 8 y 50 caracteres")));

        // 2. Password lacks letters
        req.setPassword("12345678");
        req.setConfirmPassword("12345678");
        violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("La contraseña debe contener al menos una letra y un número")));

        // 3. Password lacks numbers
        req.setPassword("abcdefgh");
        req.setConfirmPassword("abcdefgh");
        violations = validator.validate(req);
        assertFalse(violations.isEmpty());
        assertTrue(violations.stream().anyMatch(v -> v.getMessage().contains("La contraseña debe contener al menos una letra y un número")));

        // 4. Password valid
        req.setPassword("Ecotacna2026");
        req.setConfirmPassword("Ecotacna2026");
        violations = validator.validate(req);
        assertTrue(violations.isEmpty());
    }

    @Test
    public void testAuthServicePasswordMismatch() {
        BusinessException ex = assertThrows(BusinessException.class, () ->
            authService.registerCompany(
                "12345678901",
                "mismatch@test.com",
                "Ecotacna2026",
                "DifferentPassword1",
                "Admin",
                "Existente",
                "999888777",
                Role.GENERADOR,
                CompanyType.GENERADORA,
                "127.0.0.1"
            )
        );
        assertTrue(ex.getMessage().contains("Las contraseñas no coinciden"));
    }

    @Test
    public void testGeneradorRegistrationAndBcryptLogin() {
        // Register Generador
        User registeredUser = authService.registerCompany(
            "20601234567",
            "restaurante@generador.com",
            "EcoTacna123",
            "EcoTacna123",
            "Admin Generador",
            "Restaurante",
            "999888777",
            Role.GENERADOR,
            CompanyType.GENERADORA,
            "127.0.0.1"
        );

        assertNotNull(registeredUser);
        assertNotNull(registeredUser.getCompany());
        assertEquals(CompanyType.GENERADORA, registeredUser.getCompany().getCompanyType());
        assertEquals(Role.GENERADOR, registeredUser.getRole());
        
        // Confirm users.password is BCrypt and not plain text
        String passwordHash = registeredUser.getPassword();
        assertTrue(passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2y$") || passwordHash.startsWith("$2b$"),
            "La contraseña debe estar hasheada con BCrypt");

        // Authenticate with correct credentials
        User authenticated = authService.authenticate("restaurante@generador.com", "EcoTacna123");
        assertNotNull(authenticated);
        assertEquals(registeredUser.getId(), authenticated.getId());

        // Authenticate with incorrect credentials should fail
        assertThrows(BusinessException.class, () ->
            authService.authenticate("restaurante@generador.com", "WrongPassword")
        );
    }

    @Test
    public void testRecolectorRegistrationAndBcryptLogin() {
        // Register Recolector
        User registeredUser = authService.registerCompany(
            "20607654321",
            "transporte@recolector.com",
            "EcoTacna123",
            "EcoTacna123",
            "Admin Recolector",
            "Transporte",
            "999888777",
            Role.RECOLECTOR,
            CompanyType.RECOLECTORA,
            "127.0.0.1"
        );

        assertNotNull(registeredUser);
        assertNotNull(registeredUser.getCompany());
        assertEquals(CompanyType.RECOLECTORA, registeredUser.getCompany().getCompanyType());
        assertEquals(Role.RECOLECTOR, registeredUser.getRole());

        // Confirm users.password is BCrypt and not plain text
        String passwordHash = registeredUser.getPassword();
        assertTrue(passwordHash.startsWith("$2a$") || passwordHash.startsWith("$2y$") || passwordHash.startsWith("$2b$"),
            "La contraseña debe estar hasheada con BCrypt");

        // Authenticate with correct credentials
        User authenticated = authService.authenticate("transporte@recolector.com", "EcoTacna123");
        assertNotNull(authenticated);
        assertEquals(registeredUser.getId(), authenticated.getId());

        // Authenticate with incorrect credentials should fail
        assertThrows(BusinessException.class, () ->
            authService.authenticate("transporte@recolector.com", "WrongPassword")
        );
    }
}
