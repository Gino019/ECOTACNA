package com.GAKOM_ECOTACNA.ECOTACNA.repository;

import com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequest;
import com.GAKOM_ECOTACNA.ECOTACNA.model.PickupRequestStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PickupRequestRepository extends JpaRepository<PickupRequest, Long> {

    List<PickupRequest> findByCompanyIdOrderByRequestedAtDesc(Long companyId);

    long countByCompanyIdAndStatusIn(Long companyId, List<PickupRequestStatus> statuses);

    long countByStatus(PickupRequestStatus status);

    @Query("SELECT pr FROM PickupRequest pr JOIN FETCH pr.company ORDER BY pr.requestedAt DESC")
    List<PickupRequest> findAllWithCompany();

    @Query("""
            SELECT pr FROM PickupRequest pr
            WHERE pr.collectorUserId = :collectorUserId
            ORDER BY COALESCE(pr.scheduledAt, pr.requestedAt) DESC
            """)
    List<PickupRequest> findByCollectorUserId(@Param("collectorUserId") Long collectorUserId);
}
