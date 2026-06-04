package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.controller.PublicCheckoutController.PublicMockPaymentResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.CulqiPaymentConfirmRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PaymentResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.HttpEntity;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;
import java.util.Map;
import java.util.HashMap;
import java.util.List;
import java.util.Optional;

@Service
public class CulqiPaymentService {

    @Value("${payments.culqi.secret-key:}")
    private String culqiSecretKey;

    @Value("${payments.mode:mock}")
    private String paymentsMode;

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository planRepository;

    @Autowired
    public CulqiPaymentService(PaymentRepository paymentRepository,
                               SubscriptionRepository subscriptionRepository,
                               CompanyRepository companyRepository,
                               AuditLogService auditLogService,
                               UserRepository userRepository,
                               SubscriptionPlanRepository planRepository) {
        this.paymentRepository = paymentRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
        this.userRepository = userRepository;
        this.planRepository = planRepository;
    }

    @Transactional
    public PaymentResponse confirmCulqiPayment(User user, CulqiPaymentConfirmRequest request) {
        Payment payment = paymentRepository.findById(request.getPaymentId())
                .orElseThrow(() -> new BusinessException("Pago no encontrado."));

        if (payment.getStatus() != PaymentStatus.PENDIENTE) {
            throw new BusinessException("El pago ya fue procesado.");
        }

        // Simulación de validación con API Culqi
        if (request.getTokenId() == null || request.getTokenId().isEmpty()) {
            throw new BusinessException("Token ID requerido para procesar Culqi.");
        }

        boolean simulateCulqiSuccess = !request.getTokenId().equals("fail_token");

        if (simulateCulqiSuccess) {
            payment.setStatus(PaymentStatus.APROBADO);
            payment.setConfirmedAt(LocalDateTime.now());
            payment.setProvider(PaymentProvider.CULQI);
            payment.setProviderChargeId("chr_" + UUID.randomUUID().toString());
            payment.setProviderTokenId(request.getTokenId());
            
            Subscription sub = payment.getSubscription();
            sub.setStatus(SubscriptionStatus.ACTIVA);
            sub.setStartDate(LocalDate.now());
            sub.setCurrentPeriodStart(LocalDate.now());
            sub.setCurrentPeriodEnd(LocalDate.now().plusMonths(1));
            sub.setNextBillingDate(LocalDate.now().plusMonths(1));
            subscriptionRepository.save(sub);

            Company company = payment.getCompany();
            company.setSubscriptionStatus(SubscriptionStatus.ACTIVA);
            companyRepository.save(company);

            auditLogService.log(user, user.getEmail(), "PAYMENT_APPROVED", "Pago Culqi sandbox aprobado", "");
            auditLogService.log(user, user.getEmail(), "SUBSCRIPTION_ACTIVATED", "Suscripción activada via Culqi", "");
        } else {
            payment.setStatus(PaymentStatus.RECHAZADO);
            payment.setProvider(PaymentProvider.CULQI);
            auditLogService.log(user, user.getEmail(), "PAYMENT_REJECTED", "Pago Culqi sandbox rechazado", "");
        }

        paymentRepository.save(payment);

        return PaymentResponse.builder()
                .id(payment.getId())
                .amount(payment.getAmount())
                .currency(payment.getCurrency())
                .status(payment.getStatus())
                .confirmedAt(payment.getConfirmedAt())
                .build();
    }

    @Transactional
    public PublicMockPaymentResponse confirmPublicCulqiPayment(
            Long companyId,
            String culqiToken,
            String emailRequest
    ) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException("No se encontró la empresa."));

        Optional<SubscriptionPlan> planOpt = planRepository.findAll().stream()
                .filter(p -> p.getCompanyType() == company.getCompanyType() && p.getActive())
                .findFirst();

        if (planOpt.isEmpty()) {
            throw new BusinessException("No se encontró plan activo para este tipo de empresa.");
        }

        SubscriptionPlan plan = planOpt.get();
        int trialDays = plan.getTrialDays() != null ? plan.getTrialDays() : 0;
        BigDecimal todayAmount = trialDays > 0 ? BigDecimal.ZERO : plan.getMonthlyAmount();

        SubscriptionStatus nextStatus = trialDays > 0 ? SubscriptionStatus.PRUEBA_ACTIVA : SubscriptionStatus.ACTIVA;

        // 1. Obtener email del usuario asociado para la transacción Culqi
        String customerEmail = emailRequest;
        if (customerEmail == null || customerEmail.trim().isEmpty()) {
            List<User> companyUsers = userRepository.findByCompanyId(companyId);
            if (!companyUsers.isEmpty()) {
                customerEmail = companyUsers.get(0).getEmail();
            } else {
                customerEmail = "contacto@" + company.getRuc() + ".ecotacna.test";
            }
        }

        // 2. Si hay cobro (> 0.00), procesar llamada Sandbox de Culqi
        String chargeId = null;
        boolean isDummyKey = culqiSecretKey == null || culqiSecretKey.trim().isEmpty() || culqiSecretKey.equals("sk_test_dummy");
        if (isDummyKey || "mock".equalsIgnoreCase(paymentsMode)) {
            throw new BusinessException("Falta configurar CULQI_SECRET_KEY real en el backend para usar Culqi.");
        }

        if (todayAmount.compareTo(BigDecimal.ZERO) > 0) {
            // Realizar petición real a la API Culqi charges
                RestTemplate restTemplate = new RestTemplate();
                String url = "https://api.culqi.com/v2/charges";

                // Culqi amount debe ser un entero en céntimos
                int amountInCents = todayAmount.multiply(new BigDecimal(100)).intValue();

                Map<String, Object> body = new HashMap<>();
                body.put("amount", amountInCents);
                body.put("currency_code", "PEN");
                body.put("email", customerEmail);
                body.put("source_id", culqiToken);

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.set("Authorization", "Bearer " + culqiSecretKey);

                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

                try {
                    ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);
                    if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                        Map<String, Object> resBody = response.getBody();
                        chargeId = (String) resBody.get("id");
                    } else {
                        throw new BusinessException("La respuesta de Culqi no fue exitosa. Código: " + response.getStatusCode());
                    }
                } catch (org.springframework.web.client.HttpClientErrorException e) {
                    String errorMsg = e.getResponseBodyAsString();
                    throw new BusinessException("Pago rechazado por Culqi: " + parseCulqiError(errorMsg));
                } catch (Exception e) {
                    throw new BusinessException("Error al conectar con la pasarela de pagos Culqi: " + e.getMessage());
                }
        } else {
            // Si el monto es S/ 0.00 (Prueba gratis), sólo comprobamos que venga un token válido
            if (culqiToken == null || culqiToken.trim().isEmpty()) {
                throw new BusinessException("Token de Culqi es requerido para validar el método de renovación.");
            }
        }

        // 3. Crear o actualizar Subscription
        Subscription subscription = Subscription.builder()
                .company(company)
                .plan(plan)
                .status(nextStatus)
                .startDate(LocalDate.now())
                .trialEndsAt(trialDays > 0 ? LocalDate.now().plusDays(trialDays) : null)
                .currentPeriodStart(LocalDate.now())
                .currentPeriodEnd(trialDays > 0 ? LocalDate.now().plusDays(trialDays) : LocalDate.now().plusMonths(1))
                .nextBillingDate(trialDays > 0 ? LocalDate.now().plusDays(trialDays) : LocalDate.now().plusMonths(1))
                .provider("CULQI")
                .build();
        subscription = subscriptionRepository.save(subscription);

        // 4. Crear registro Payment culqi
        Payment payment = Payment.builder()
                .subscription(subscription)
                .company(company)
                .amount(todayAmount)
                .currency(plan.getCurrency())
                .status(PaymentStatus.APROBADO)
                .provider(PaymentProvider.CULQI)
                .mode(PaymentMode.valueOf("SANDBOX")) // sandbox mode
                .description("Pago Culqi Sandbox en registro público para plan " + plan.getName())
                .confirmedAt(LocalDateTime.now())
                .providerTokenId(culqiToken)
                .providerChargeId(chargeId)
                .build();
        paymentRepository.save(payment);

        // 5. Actualizar Company
        company.setSubscriptionStatus(nextStatus);
        companyRepository.save(company);

        // 6. Registrar en bitácora sin usuario autenticado (System audit)
        auditLogService.log(null, customerEmail, "CULQI_PAYMENT_CONFIRMED", 
                "Suscripción pública activada via Culqi Sandbox para plan " + plan.getName() + " (Estado: " + nextStatus + ")", "");

        // 7. Responder con los datos de confirmación esperados
        String successMessage = trialDays > 0 
                ? "Prueba gratuita activada correctamente con validación de tarjeta Culqi." 
                : "Pago Sandbox aprobado via Culqi y acceso activado correctamente.";

        return PublicMockPaymentResponse.builder()
                .companyId(company.getId())
                .companyName(company.getBusinessName())
                .companyType(company.getCompanyType().name())
                .planName(plan.getName())
                .subscriptionStatus(nextStatus.name())
                .trialDays(trialDays)
                .todayAmount(todayAmount)
                .monthlyAmount(plan.getMonthlyAmount())
                .message(successMessage)
                .build();
    }

    private String parseCulqiError(String errorJson) {
        try {
            if (errorJson.contains("\"user_message\"")) {
                int idx = errorJson.indexOf("\"user_message\"");
                int start = errorJson.indexOf("\"", idx + 14) + 1;
                int end = errorJson.indexOf("\"", start);
                if (start > 0 && end > start) {
                    return errorJson.substring(start, end);
                }
            }
        } catch (Exception e) {}
        return "El pago no pudo procesarse. Por favor, verifica los datos de tu tarjeta.";
    }
}
