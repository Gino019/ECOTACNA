package com.GAKOM_ECOTACNA.ECOTACNA.repository;

import com.GAKOM_ECOTACNA.ECOTACNA.model.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, Long> {

    Optional<Subscription> findTopByCompanyIdOrderByCreatedAtDesc(Long companyId);

    Optional<Subscription> findByProviderSubscriptionId(String providerSubscriptionId);
}
