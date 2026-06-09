package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.CaptchaResponseDto;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class CaptchaServiceTest {

    private CaptchaService captchaService;

    @BeforeEach
    void setUp() {
        captchaService = new CaptchaService();
        ReflectionTestUtils.setField(captchaService, "captchaEnabled", true);
    }

    @Test
    void validateToken_InexistentToken_Fails() {
        assertFalse(captchaService.validateToken("inexistent-token"));
    }

    @Test
    void validateToken_GeneratedButNotVerified_Fails() {
        CaptchaResponseDto challenge = captchaService.generateChallenge();
        assertFalse(captchaService.validateToken(challenge.getCaptchaToken()));
    }

    @Test
    void verifyChallenge_IncorrectUserX_Fails() {
        CaptchaResponseDto challenge = captchaService.generateChallenge();
        int wrongX = challenge.getY(); // It's extremely unlikely Y is exactly targetX
        // Since we don't know targetX from DTO, we can't easily guess it.
        // Let's pass an impossible X to fail.
        assertFalse(captchaService.verifyChallenge(challenge.getCaptchaToken(), 1000));
    }

    @Test
    void verifyAndValidate_CorrectFlow() throws Exception {
        CaptchaResponseDto challenge = captchaService.generateChallenge();
        String token = challenge.getCaptchaToken();

        // Extraer targetX con reflection
        java.util.Map<String, Object> activeChallenges = (java.util.Map<String, Object>) ReflectionTestUtils.getField(captchaService, "activeChallenges");
        Object internalChallenge = activeChallenges.get(token);
        int targetX = (int) ReflectionTestUtils.getField(internalChallenge, "targetX");

        // 4. userX correcto verifica
        assertTrue(captchaService.verifyChallenge(token, targetX));

        // 5. Token verificado valida una vez
        assertTrue(captchaService.validateToken(token));

        // 6. Token consumido no valida dos veces
        assertFalse(captchaService.validateToken(token));
    }

    @Test
    void verifyChallenge_WithinTolerance_Verifies() throws Exception {
        CaptchaResponseDto challenge = captchaService.generateChallenge();
        String token = challenge.getCaptchaToken();

        java.util.Map<String, Object> activeChallenges = (java.util.Map<String, Object>) ReflectionTestUtils.getField(captchaService, "activeChallenges");
        Object internalChallenge = activeChallenges.get(token);
        int targetX = (int) ReflectionTestUtils.getField(internalChallenge, "targetX");

        // Tolerancia es +/- 8
        assertTrue(captchaService.verifyChallenge(token, targetX + 8));
        assertTrue(captchaService.validateToken(token));
    }

    @Test
    void validateToken_ExpiredToken_Fails() throws Exception {
        CaptchaResponseDto challenge = captchaService.generateChallenge();
        String token = challenge.getCaptchaToken();

        // Extraer y forzar expiración
        java.util.Map<String, Object> activeChallenges = (java.util.Map<String, Object>) ReflectionTestUtils.getField(captchaService, "activeChallenges");
        Object internalChallenge = activeChallenges.get(token);
        ReflectionTestUtils.setField(internalChallenge, "expiryTime", System.currentTimeMillis() - 1000);

        // 7. Token expirado falla
        assertFalse(captchaService.validateToken(token));
    }

    @Test
    void validateToken_CaptchaDisabled_Bypass() {
        ReflectionTestUtils.setField(captchaService, "captchaEnabled", false);
        // 8. captcha.enabled=false permite bypass
        assertTrue(captchaService.validateToken("any-random-token"));
        assertTrue(captchaService.verifyChallenge("any-random-token", 123));
    }
}
