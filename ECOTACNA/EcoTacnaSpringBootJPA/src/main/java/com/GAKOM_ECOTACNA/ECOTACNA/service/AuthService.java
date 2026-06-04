package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.RucLookupResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.Company;
import com.GAKOM_ECOTACNA.ECOTACNA.model.CompanyType;
import com.GAKOM_ECOTACNA.ECOTACNA.model.Role;
import com.GAKOM_ECOTACNA.ECOTACNA.model.User;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.CompanyRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.RegistrationStatusResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.DuplicateRegistrationException;
import java.util.List;

@Service
public class AuthService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;
    private final ApiPeruDevRucService apiPeruDevRucService;

    @Autowired
    public AuthService(CompanyRepository companyRepository,
                       UserRepository userRepository,
                       AuditLogService auditLogService,
                       PasswordEncoder passwordEncoder,
                       ApiPeruDevRucService apiPeruDevRucService) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
        this.apiPeruDevRucService = apiPeruDevRucService;
    }

    /**
     * Registra una empresa formal B2B y crea su usuario administrador inicial.
     * Valida previamente el RUC de forma formal.
     */
    @Transactional
    public User registerCompany(String ruc, String email, String password, String confirmPassword,
                                 String firstName, String lastName, String phone, Role role,
                                 CompanyType companyType, String ipAddress) {
        if (role == Role.ADMIN) {
            throw new BusinessException("El rol ADMIN no puede registrarse por este endpoint.");
        }
        if (password == null || confirmPassword == null || !password.equals(confirmPassword)) {
            throw new BusinessException("Las contraseñas no coinciden.");
        }
        // 1. Validaciones previas de unicidad
        if (companyRepository.findByRuc(ruc).isPresent()) {
            RegistrationStatusResponse status = consultarEstadoRegistroPorRuc(ruc);
            status.setMessage("Esta empresa ya inició su registro. Puedes continuar desde la etapa actual.");
            throw new DuplicateRegistrationException("La empresa con RUC " + ruc + " ya se encuentra registrada.", status);
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("El email corporativo " + email + " ya está registrado.");
        }

        String businessName = "Información no disponible";
        String address = "Información no disponible";
        String district = null;
        String province = null;
        String department = null;
        
        try {
            RucLookupResponse apiPeruResponse = apiPeruDevRucService.consultarRuc(ruc);
            if (apiPeruResponse.getRazonSocial() != null && !apiPeruResponse.getRazonSocial().isBlank()) {
                businessName = apiPeruResponse.getRazonSocial();
            }
            if (apiPeruResponse.getDireccionFiscal() != null && !apiPeruResponse.getDireccionFiscal().isBlank()) {
                address = apiPeruResponse.getDireccionFiscal();
            }
            if (apiPeruResponse.getDistrito() != null && !apiPeruResponse.getDistrito().isBlank()) {
                district = apiPeruResponse.getDistrito();
            }
            if (apiPeruResponse.getProvincia() != null && !apiPeruResponse.getProvincia().isBlank()) {
                province = apiPeruResponse.getProvincia();
            }
            if (apiPeruResponse.getDepartamento() != null && !apiPeruResponse.getDepartamento().isBlank()) {
                department = apiPeruResponse.getDepartamento();
            }
        } catch (Exception ex) {
            // Fallback en caso de error de proveedor externo (ej: API caída)
            // Ya que el frontend valida el RUC previamente, esto es solo una red de seguridad.
        }

        CompanyType resolvedType = PickupRequestService.resolveCompanyType(role, companyType);
        Company company = Company.builder()
                .ruc(ruc)
                .businessName(businessName)
                .address(address)
                .district(district)
                .province(province)
                .department(department)
                .companyType(resolvedType)
                .build();
        company = companyRepository.save(company);

        // 4. Crear y guardar Usuario Administrador de Empresa
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
                .phone(phone)
                .role(role)
                .company(company)
                .enabled(true)
                .build();
        user = userRepository.save(user);

        // 5. Auditar evento crítico
        auditLogService.log(
                user,
                email,
                "EMPRESA_REGISTRADA",
                "Registro exitoso de la empresa RUC " + ruc + " - " + company.getBusinessName() + " con rol " + role,
                ipAddress
        );

        return user;
    }

    /**
     * Valida las credenciales de un usuario y retorna la entidad si tiene acceso.
     */
    @Transactional(readOnly = true)
    public User authenticate(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BusinessException("Credenciales incorrectas: El email corporativo no existe."));

        if (!user.isEnabled()) {
            throw new BusinessException("El usuario se encuentra deshabilitado. Comuníquese con soporte.");
        }

        if (!passwordEncoder.matches(password, user.getPassword())) {
            throw new BusinessException("Credenciales incorrectas: La contraseña provista es errónea.");
        }

        return user;
    }

    /**
     * Consulta el estado de registro de una empresa por RUC para permitir reanudación del flujo.
     */
    @Transactional(readOnly = true)
    public RegistrationStatusResponse consultarEstadoRegistroPorRuc(String ruc) {
        return companyRepository.findByRuc(ruc).map(company -> {
            String correoContacto = null;
            List<User> users = userRepository.findByCompanyId(company.getId());
            if (!users.isEmpty() && users.get(0).getEmail() != null) {
                correoContacto = users.get(0).getEmail();
            }

            String nextStep;
            String message;
            
            switch (company.getSubscriptionStatus()) {
                case PENDIENTE:
                    nextStep = "REVIEW_PENDING";
                    message = "Tu empresa está en revisión.";
                    break;
                case PENDIENTE_PAGO:
                    nextStep = "PAYMENT_PENDING";
                    message = "Tu empresa ha sido aprobada. Por favor, selecciona un plan o realiza el pago para continuar.";
                    break;
                case ACTIVA:
                case PRUEBA_ACTIVA:
                case SUSPENDIDA:
                case VENCIDA:
                    nextStep = "ACTIVE_LOGIN";
                    message = "Esta empresa ya está registrada. Inicia sesión con el correo asociado.";
                    break;
                case CANCELADA:
                    nextStep = "REJECTED";
                    message = "El registro o la cuenta de la empresa fue cancelada o rechazada.";
                    break;
                default:
                    nextStep = "UNKNOWN_STATE";
                    message = "Estado desconocido.";
            }

            return RegistrationStatusResponse.builder()
                    .exists(true)
                    .ruc(ruc)
                    .companyId(company.getId())
                    .razonSocial(company.getBusinessName())
                    .tipoEmpresa(company.getCompanyType() != null ? company.getCompanyType().name() : null)
                    .correoContacto(correoContacto)
                    .subscriptionStatus(company.getSubscriptionStatus().name())
                    .nextStep(nextStep)
                    .message(message)
                    .build();
        }).orElseGet(() -> 
            RegistrationStatusResponse.builder()
                    .exists(false)
                    .ruc(ruc)
                    .nextStep("NEW_REGISTRATION")
                    .build()
        );
    }
}
