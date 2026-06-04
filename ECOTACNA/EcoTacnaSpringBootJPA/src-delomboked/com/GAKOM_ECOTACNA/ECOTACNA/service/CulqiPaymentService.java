package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.CulqiPaymentConfirmRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.PaymentResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.CompanyRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.PaymentRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class CulqiPaymentService {

    @Value("${payments.culqi.secret-key:}")
    private String culqiSecretKey;

    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;

    @Autowired
    public CulqiPaymentService(PaymentRepository paymentRepository,
                               SubscriptionRepository subscriptionRepository,
                               CompanyRepository companyRepository,
                               AuditLogService auditLogService) {
        this.paymentRepository = paymentRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
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
}
