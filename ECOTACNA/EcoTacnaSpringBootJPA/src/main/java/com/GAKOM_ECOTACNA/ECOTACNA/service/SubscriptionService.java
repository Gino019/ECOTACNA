package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.SubscriptionResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.SubscriptionStatusResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.CompanyRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.SubscriptionPlanRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.Optional;

@Service
public class SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final SubscriptionPlanRepository planRepository;
    private final CompanyRepository companyRepository;
    private final AuditLogService auditLogService;
    private final SubscriptionValidator validator;

    @Autowired
    public SubscriptionService(SubscriptionRepository subscriptionRepository,
                               SubscriptionPlanRepository planRepository,
                               CompanyRepository companyRepository,
                               AuditLogService auditLogService,
                               SubscriptionValidator validator) {
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.companyRepository = companyRepository;
        this.auditLogService = auditLogService;
        this.validator = validator;
    }

    @Transactional(readOnly = true)
    public SubscriptionStatusResponse getMySubscriptionStatus(User user) {
        if (user.getCompany() == null) {
            throw new BusinessException("El usuario no tiene una empresa asociada.");
        }
        Company company = user.getCompany();

        Optional<Subscription> optSub = subscriptionRepository.findTopByCompanyIdOrderByCreatedAtDesc(company.getId());
        
        SubscriptionStatusResponse.SubscriptionStatusResponseBuilder builder = SubscriptionStatusResponse.builder()
                .companyName(company.getBusinessName())
                .companyType(company.getCompanyType())
                .status(company.getSubscriptionStatus());

        boolean canOperate = false;
        if (company.getCompanyType() == CompanyType.GENERADORA) {
            canOperate = company.getSubscriptionStatus() == SubscriptionStatus.ACTIVA || company.getSubscriptionStatus() == SubscriptionStatus.PRUEBA_ACTIVA;
        } else if (company.getCompanyType() == CompanyType.RECOLECTORA) {
            canOperate = company.getSubscriptionStatus() == SubscriptionStatus.ACTIVA;
        }
        builder.canOperate(canOperate);

        if (optSub.isPresent()) {
            Subscription sub = optSub.get();
            builder.planName(sub.getPlan().getName())
                   .monthlyAmount(sub.getPlan().getMonthlyAmount())
                   .currency(sub.getPlan().getCurrency())
                   .trialEndsAt(sub.getTrialEndsAt())
                   .currentPeriodEnd(sub.getCurrentPeriodEnd());
        }

        return builder.build();
    }


}
