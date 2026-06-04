package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.fasterxml.jackson.annotation.JsonProperty;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class CaptchaService {

    private static final Logger logger = LoggerFactory.getLogger(CaptchaService.class);

    @Value("${captcha.enabled:true}")
    private boolean captchaEnabled;

    @Value("${captcha.recaptcha.secret:}")
    private String recaptchaSecretKey;

    private static final String SITE_VERIFY_URL = "https://www.google.com/recaptcha/api/siteverify";

    private final RestTemplate restTemplate;

    public CaptchaService() {
        this.restTemplate = new RestTemplate();
    }

    public boolean validateToken(String token) {
        if (!captchaEnabled) {
            return true;
        }

        if (token == null || token.isEmpty()) {
            logger.warn("El token del captcha está vacío o es nulo.");
            return false;
        }

        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

            MultiValueMap<String, String> map = new LinkedMultiValueMap<>();
            map.add("secret", recaptchaSecretKey);
            map.add("response", token);

            HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(map, headers);

            RecaptchaResponse response = restTemplate.postForObject(SITE_VERIFY_URL, request, RecaptchaResponse.class);

            if (response != null && response.isSuccess()) {
                return true;
            } else {
                logger.warn("Validación del token de captcha falló.");
                return false;
            }
        } catch (Exception e) {
            logger.error("Error al conectar con Google reCAPTCHA: ", e);
            return false;
        }
    }

    private static class RecaptchaResponse {
        @JsonProperty("success")
        private boolean success;

        @JsonProperty("challenge_ts")
        private String challengeTs;

        @JsonProperty("hostname")
        private String hostname;

        public boolean isSuccess() {
            return success;
        }

        public void setSuccess(boolean success) {
            this.success = success;
        }
    }
}
