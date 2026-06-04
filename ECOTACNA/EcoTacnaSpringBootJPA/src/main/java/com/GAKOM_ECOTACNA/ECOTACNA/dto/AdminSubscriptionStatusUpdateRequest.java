package com.GAKOM_ECOTACNA.ECOTACNA.dto;

import com.GAKOM_ECOTACNA.ECOTACNA.model.SubscriptionStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminSubscriptionStatusUpdateRequest {
    @NotNull
    private SubscriptionStatus status;
}
