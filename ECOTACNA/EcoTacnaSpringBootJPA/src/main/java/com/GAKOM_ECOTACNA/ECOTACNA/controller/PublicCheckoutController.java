package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PublicCheckoutResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PublicCulqiPaymentRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.*;
import com.GAKOM_ECOTACNA.ECOTACNA.service.CulqiPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;
import lombok.*;
import jakarta.validation.Valid;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/public/checkout")
public class PublicCheckoutController {

    private final CompanyRepository companyRepository;
    private final SubscriptionPlanRepository planRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final PaymentRepository paymentRepository;
    private final CulqiPaymentService culqiPaymentService;

    @Autowired
    public PublicCheckoutController(CompanyRepository companyRepository, 
                                    SubscriptionPlanRepository planRepository,
                                    SubscriptionRepository subscriptionRepository,
                                    PaymentRepository paymentRepository,
                                    CulqiPaymentService culqiPaymentService) {
        this.companyRepository = companyRepository;
        this.planRepository = planRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.paymentRepository = paymentRepository;
        this.culqiPaymentService = culqiPaymentService;
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<ApiResponse<PublicCheckoutResponse>> getCompanyCheckoutSummary(@PathVariable Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new BusinessException("No se encontró la empresa aprobada."));

        Optional<SubscriptionPlan> planOpt = planRepository.findAll().stream()
                .filter(p -> p.getCompanyType() == company.getCompanyType() && p.getActive())
                .findFirst();

        if (planOpt.isEmpty()) {
            throw new BusinessException("No se encontró plan activo para este tipo de empresa.");
        }

        SubscriptionPlan plan = planOpt.get();
        BigDecimal todayAmount = plan.getTrialDays() != null && plan.getTrialDays() > 0 
                ? BigDecimal.ZERO 
                : plan.getMonthlyAmount();

        PublicCheckoutResponse response = PublicCheckoutResponse.builder()
                .companyId(company.getId())
                .companyName(company.getBusinessName())
                .companyType(company.getCompanyType().name())
                .planId(plan.getId())
                .planCode(plan.getCode())
                .planName(plan.getName())
                .monthlyAmount(plan.getMonthlyAmount())
                .currency(plan.getCurrency())
                .trialDays(plan.getTrialDays())
                .todayAmount(todayAmount)
                .status(company.getSubscriptionStatus() != null ? company.getSubscriptionStatus().name() : "APROBADA")
                .build();

        return ResponseEntity.ok(new ApiResponse<>(true, "Resumen de checkout cargado exitosamente", response));
    }

    @PostMapping("/company/{companyId}/confirm-mock-payment")
    @Transactional
    public ResponseEntity<ApiResponse<PublicMockPaymentResponse>> confirmMockPayment(
            @PathVariable Long companyId, 
            @RequestBody PublicMockPaymentRequest request) {

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

        // 1. Crear o actualizar Subscription
        Subscription subscription = Subscription.builder()
                .company(company)
                .plan(plan)
                .status(nextStatus)
                .startDate(LocalDate.now())
                .trialEndsAt(trialDays > 0 ? LocalDate.now().plusDays(trialDays) : null)
                .currentPeriodStart(LocalDate.now())
                .currentPeriodEnd(trialDays > 0 ? LocalDate.now().plusDays(trialDays) : LocalDate.now().plusMonths(1))
                .nextBillingDate(trialDays > 0 ? LocalDate.now().plusDays(trialDays) : LocalDate.now().plusMonths(1))
                .provider("MOCK")
                .build();
        subscription = subscriptionRepository.save(subscription);

        // 2. Crear registro Payment mock
        Payment payment = Payment.builder()
                .subscription(subscription)
                .company(company)
                .amount(todayAmount)
                .currency(plan.getCurrency())
                .status(PaymentStatus.APROBADO)
                .provider(PaymentProvider.MOCK)
                .mode(PaymentMode.MOCK)
                .description("Pago mock de registro público para plan " + plan.getName())
                .confirmedAt(LocalDateTime.now())
                .build();
        paymentRepository.save(payment);

        // 3. Actualizar Company
        company.setSubscriptionStatus(nextStatus);
        companyRepository.save(company);

        // 4. Responder con los datos de confirmación esperados
        String successMessage = trialDays > 0 
                ? "Prueba gratuita activada correctamente." 
                : "Pago aprobado y acceso activado correctamente.";

        PublicMockPaymentResponse response = PublicMockPaymentResponse.builder()
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

        return ResponseEntity.ok(new ApiResponse<>(true, successMessage, response));
    }

    @PostMapping("/company/{companyId}/confirm-culqi-payment")
    public ResponseEntity<ApiResponse<PublicMockPaymentResponse>> confirmCulqiPayment(
            @PathVariable Long companyId, 
            @Valid @RequestBody PublicCulqiPaymentRequest request) {

        PublicMockPaymentResponse response = culqiPaymentService.confirmPublicCulqiPayment(
                companyId,
                request.getCulqiToken(),
                request.getEmail()
        );

        return ResponseEntity.ok(new ApiResponse<>(true, response.getMessage(), response));
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PublicMockPaymentRequest {
        private String paymentMethod;
        private String cardholderName;
        private String email;
        private String cardLast4;
    }

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class PublicMockPaymentResponse {
        private Long companyId;
        private String companyName;
        private String companyType;
        private String planName;
        private String subscriptionStatus;
        private Integer trialDays;
        private BigDecimal todayAmount;
        private BigDecimal monthlyAmount;
        private String message;
    }
}
