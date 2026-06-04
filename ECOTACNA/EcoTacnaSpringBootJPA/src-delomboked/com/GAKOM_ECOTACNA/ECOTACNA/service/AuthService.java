package com.GAKOM_ECOTACNA.ECOTACNA.service;

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

@Service
public class AuthService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AuthService(CompanyRepository companyRepository,
                       UserRepository userRepository,
                       AuditLogService auditLogService,
                       PasswordEncoder passwordEncoder) {
        this.companyRepository = companyRepository;
        this.userRepository = userRepository;
        this.auditLogService = auditLogService;
        this.passwordEncoder = passwordEncoder;
    }

    /**
     * Registra una empresa formal B2B y crea su usuario administrador inicial.
     * Valida previamente el RUC de forma formal.
     */
    @Transactional
    public User registerCompany(String ruc, String email, String password,
                                 String firstName, String lastName, Role role,
                                 CompanyType companyType, String ipAddress) {
        if (role == Role.ADMIN) {
            throw new BusinessException("El rol ADMIN no puede registrarse por este endpoint.");
        }
        // 1. Validaciones previas de unicidad
        if (companyRepository.findByRuc(ruc).isPresent()) {
            throw new BusinessException("La empresa con RUC " + ruc + " ya se encuentra registrada en el sistema.");
        }
        if (userRepository.findByEmail(email).isPresent()) {
            throw new BusinessException("El email corporativo " + email + " ya está registrado.");
        }

        CompanyType resolvedType = PickupRequestService.resolveCompanyType(role, companyType);
        Company company = Company.builder()
                .ruc(ruc)
                .businessName("Empresa " + ruc)
                .address("Dirección " + ruc)
                .companyType(resolvedType)
                .build();
        company = companyRepository.save(company);

        // 4. Crear y guardar Usuario Administrador de Empresa
        User user = User.builder()
                .email(email)
                .password(passwordEncoder.encode(password))
                .firstName(firstName)
                .lastName(lastName)
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
}
