package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.SubscriptionResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.SubscriptionStatusResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.model.User;
import com.GAKOM_ECOTACNA.ECOTACNA.service.SubscriptionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/subscriptions")
public class SubscriptionController {

    private final SubscriptionService subscriptionService;

    @Autowired
    public SubscriptionController(SubscriptionService subscriptionService) {
        this.subscriptionService = subscriptionService;
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SubscriptionStatusResponse>> getMySubscriptionStatus(@AuthenticationPrincipal User user) {
        SubscriptionStatusResponse response = subscriptionService.getMySubscriptionStatus(user);
        return ResponseEntity.ok(new ApiResponse<>(true, "Estado de suscripción", response));
    }

}
