package com.GAKOM_ECOTACNA.ECOTACNA;

import com.GAKOM_ECOTACNA.ECOTACNA.model.Company;
import com.GAKOM_ECOTACNA.ECOTACNA.model.Payment;
import com.GAKOM_ECOTACNA.ECOTACNA.model.Subscription;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.CompanyRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.PaymentRepository;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.SubscriptionRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@SpringBootTest
@ActiveProfiles("supabase")
public class DbDumpTest {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    @Autowired
    private PaymentRepository paymentRepository;

    @Test
    @Transactional
    public void dumpRecolectoras() {
        System.out.println("=== INICIO DUMP BD PETROFIL Y RECOLECTORAS ===");
        List<Company> companies = companyRepository.findAll();
        for (Company c : companies) {
            if (c.getBusinessName() != null && c.getBusinessName().toUpperCase().contains("PETROFIL") || 
                c.getCompanyType() != null && c.getCompanyType().name().equals("RECOLECTORA")) {
                
                System.out.println("COMPANY: id=" + c.getId() + ", ruc=" + c.getRuc() + 
                                   ", name=" + c.getBusinessName() + ", type=" + c.getCompanyType() + ", status=" + c.getSubscriptionStatus());
                
                List<Subscription> subs = subscriptionRepository.findAll().stream()
                        .filter(s -> s.getCompany() != null && s.getCompany().getId().equals(c.getId()))
                        .toList();
                
                for (Subscription s : subs) {
                    System.out.println("  SUBSCRIPTION: id=" + s.getId() + ", status=" + s.getStatus() + 
                                       ", plan=" + (s.getPlan() != null ? s.getPlan().getName() : "null"));
                }
                
                List<Payment> payments = paymentRepository.findAll().stream()
                        .filter(p -> p.getCompany() != null && p.getCompany().getId().equals(c.getId()))
                        .toList();
                        
                for (Payment p : payments) {
                    System.out.println("  PAYMENT: id=" + p.getId() + ", amount=" + p.getAmount() + 
                                       ", status=" + p.getStatus() + ", confirmedAt=" + p.getConfirmedAt());
                }
            }
        }
        System.out.println("=== FIN DUMP BD PETROFIL Y RECOLECTORAS ===");
    }
}
