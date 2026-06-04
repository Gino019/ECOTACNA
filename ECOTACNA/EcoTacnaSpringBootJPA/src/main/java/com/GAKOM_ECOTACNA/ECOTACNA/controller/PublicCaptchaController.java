package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.CaptchaResponseDto;
import com.GAKOM_ECOTACNA.ECOTACNA.service.CaptchaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/public/captcha")
public class PublicCaptchaController {

    private final CaptchaService captchaService;

    public PublicCaptchaController(CaptchaService captchaService) {
        this.captchaService = captchaService;
    }

    @GetMapping("/challenge")
    public ResponseEntity<ApiResponse<CaptchaResponseDto>> getChallenge() {
        CaptchaResponseDto challenge = captchaService.generateChallenge();
        return ResponseEntity.ok(new ApiResponse<>(true, "Desafío generado correctamente", challenge));
    }
}
