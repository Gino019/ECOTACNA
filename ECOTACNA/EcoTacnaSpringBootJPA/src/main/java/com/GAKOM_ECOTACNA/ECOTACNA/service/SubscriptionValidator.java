package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.model.Company;
import com.GAKOM_ECOTACNA.ECOTACNA.model.SubscriptionStatus;
import org.springframework.stereotype.Component;

@Component
public class SubscriptionValidator {

    public void validateActiveSubscription(Company company) {
        if (company == null) {
            throw new BusinessException("No se encontró información de la empresa.");
        }
        
        if (company.getCompanyType() == com.GAKOM_ECOTACNA.ECOTACNA.model.CompanyType.GENERADORA) {
            if (company.getSubscriptionStatus() != SubscriptionStatus.ACTIVA && company.getSubscriptionStatus() != SubscriptionStatus.PRUEBA_ACTIVA) {
                throw new BusinessException("Tu suscripción no permite registrar solicitudes. Activa o renueva tu plan.");
            }
        } else if (company.getCompanyType() == com.GAKOM_ECOTACNA.ECOTACNA.model.CompanyType.RECOLECTORA) {
            if (company.getSubscriptionStatus() != SubscriptionStatus.ACTIVA) {
                throw new BusinessException("Tu acceso como recolector requiere una suscripción activa.");
            }
        } else {
             if (company.getSubscriptionStatus() != SubscriptionStatus.ACTIVA) {
                throw new BusinessException("La empresa no tiene una suscripción activa para realizar esta operación.");
            }
        }
    }
}
