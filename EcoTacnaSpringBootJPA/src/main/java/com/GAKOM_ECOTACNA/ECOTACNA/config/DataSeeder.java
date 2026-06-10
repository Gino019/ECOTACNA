package com.GAKOM_ECOTACNA.ECOTACNA.config;

import com.GAKOM_ECOTACNA.ECOTACNA.model.CompanyType;
import com.GAKOM_ECOTACNA.ECOTACNA.model.SubscriptionPlan;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.SubscriptionPlanRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;

@Configuration
public class DataSeeder {

    @Bean
    public CommandLineRunner seedSubscriptionPlans(SubscriptionPlanRepository planRepository) {
        return args -> {
            if (planRepository.count() == 0) {
                SubscriptionPlan generadorPlan = SubscriptionPlan.builder()
                        .code("PLAN_GEN_01")
                        .name("Plan Generador Básico")
                        .companyType(CompanyType.GENERADORA)
                        .monthlyAmount(new BigDecimal("20.00"))
                        .currency("PEN")
                        .trialDays(7)
                        .active(true)
                        .build();

                SubscriptionPlan recolectorPlan = SubscriptionPlan.builder()
                        .code("PLAN_REC_01")
                        .name("Plan Recolector Pro")
                        .companyType(CompanyType.RECOLECTORA)
                        .monthlyAmount(new BigDecimal("250.00"))
                        .currency("PEN")
                        .trialDays(0)
                        .active(true)
                        .build();

                planRepository.save(generadorPlan);
                planRepository.save(recolectorPlan);
                System.out.println("====== DB SEEDED: Subscription Plans created ======");
            }
        };
    }
}
