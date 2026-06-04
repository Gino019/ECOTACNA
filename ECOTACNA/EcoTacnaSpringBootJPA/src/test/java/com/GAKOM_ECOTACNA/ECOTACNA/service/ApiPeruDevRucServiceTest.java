package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.RucLookupResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ExternalProviderException;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ResourceNotFoundException;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.lang.reflect.Field;
import java.nio.charset.StandardCharsets;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ApiPeruDevRucServiceTest {

    @Test
    void consultarRucUsesApiModeByDefault() {
        ApiPeruDevRucService service = newService(null, "test-token", new SuccessRestTemplate());

        RucLookupResponse response = service.consultarRuc("20100055237");

        assertEquals("20100055237", response.getRuc());
        assertEquals("EMPRESA REAL DE PRUEBA S.A.C.", response.getRazonSocial());
        assertEquals("APIPERUDEV", response.getFuente());
    }

    @Test
    void consultarRucRejectsInvalidFormat() {
        ApiPeruDevRucService service = newService("api", "test-token", new SuccessRestTemplate());

        assertThrows(BusinessException.class, () -> service.consultarRuc("123"));
    }

    @Test
    void consultarRucInApiModeFallsBackToMockWhenTokenIsEmpty() {
        ApiPeruDevRucService service = newService("api", "", new FailingRestTemplate());

        RucLookupResponse response = service.consultarRuc("20100055237");
        assertEquals("20100055237", response.getRuc());
        assertEquals("EMPRESA REAL DE PRUEBA S.A.C.", response.getRazonSocial());
        assertEquals("SUNAT / apiperu.dev (FALLBACK/MOCK)", response.getFuente());
    }

    @Test
    void consultarRucUsesSimulatedMockWhenModeIsMock() {
        ApiPeruDevRucService service = newService("mock", "", new FailingRestTemplate());

        RucLookupResponse response = service.consultarRuc("20100055237");
        assertEquals("20100055237", response.getRuc());
        assertEquals("EMPRESA REAL DE PRUEBA S.A.C.", response.getRazonSocial());
        assertEquals("SUNAT / apiperu.dev (FALLBACK/MOCK)", response.getFuente());
    }

    @Test
    void consultarRucConvertsProviderForbiddenToCleanError() {
        ApiPeruDevRucService service = newService("api", "test-token", new ForbiddenRestTemplate());

        ExternalProviderException exception = assertThrows(
                ExternalProviderException.class,
                () -> service.consultarRuc("20100055237")
        );
        assertEquals(
                "No se pudo consultar el proveedor RUC. Verifica la configuracion del servicio.",
                exception.getMessage()
        );
    }

    @Test
    void consultarRucConvertsProviderNotFoundToResourceNotFound() {
        ApiPeruDevRucService service = newService("api", "test-token", new NotFoundRestTemplate());

        assertThrows(ResourceNotFoundException.class, () -> service.consultarRuc("20999999999"));
    }

    @Test
    void consultarRucVerifiesHttpMethodAndUrlAndBody() {
        class VerifyingRestTemplate extends RestTemplate {
            private boolean called = false;
            @Override
            @SuppressWarnings("unchecked")
            public <T> ResponseEntity<T> exchange(
                    String url,
                    HttpMethod method,
                    HttpEntity<?> requestEntity,
                    Class<T> responseType,
                    Object... uriVariables
            ) {
                called = true;
                assertEquals("https://apiperu.dev/api/ruc", url);
                assertEquals(HttpMethod.POST, method);
                
                Map<String, String> body = (Map<String, String>) requestEntity.getBody();
                assertEquals("20100055237", body.get("ruc"));
                assertEquals("application/json", requestEntity.getHeaders().getFirst("Accept"));
                assertEquals("application/json", requestEntity.getHeaders().getFirst("Content-Type"));
                
                Map<String, Object> providerBody = Map.of(
                        "data", Map.of(
                                "ruc", "20100055237",
                                "nombre_o_razon_social", "EMPRESA REAL DE PRUEBA S.A.C.",
                                "estado", "ACTIVO",
                                "condicion", "HABIDO"
                        )
                );
                return new ResponseEntity<>(responseType.cast(providerBody), HttpStatus.OK);
            }
        }

        VerifyingRestTemplate restTemplate = new VerifyingRestTemplate();
        ApiPeruDevRucService service = newService("api", "test-token", restTemplate);
        service.consultarRuc("20100055237");
        assertEquals(true, restTemplate.called);
    }

    @Test
    void consultarRucConvertsProviderUnauthorizedToCleanError() {
        class UnauthorizedRestTemplate extends RestTemplate {
            @Override
            public <T> ResponseEntity<T> exchange(
                    String url,
                    HttpMethod method,
                    HttpEntity<?> requestEntity,
                    Class<T> responseType,
                    Object... uriVariables
            ) {
                throw HttpClientErrorException.create(
                        HttpStatus.UNAUTHORIZED,
                        "Unauthorized",
                        HttpHeaders.EMPTY,
                        new byte[0],
                        StandardCharsets.UTF_8
                );
            }
        }
        ApiPeruDevRucService service = newService("api", "test-token", new UnauthorizedRestTemplate());

        ExternalProviderException exception = assertThrows(
                ExternalProviderException.class,
                () -> service.consultarRuc("20100055237")
        );
        assertEquals(
                "No se pudo consultar el proveedor RUC. Verifica la configuracion del servicio.",
                exception.getMessage()
        );
    }

    private ApiPeruDevRucService newService(String mode, String token, RestTemplate restTemplate) {
        ApiPeruDevRucService service = new ApiPeruDevRucService(restTemplate);
        setField(service, "rucProvider", mode);
        setField(service, "apiToken", token);
        setField(service, "apiBaseUrl", "https://apiperu.dev/api");
        return service;
    }

    private void setField(Object target, String fieldName, String value) {
        try {
            Field field = target.getClass().getDeclaredField(fieldName);
            field.setAccessible(true);
            field.set(target, value);
        } catch (ReflectiveOperationException ex) {
            throw new AssertionError(ex);
        }
    }

    private static class SuccessRestTemplate extends RestTemplate {
        @Override
        public <T> ResponseEntity<T> exchange(
                String url,
                HttpMethod method,
                HttpEntity<?> requestEntity,
                Class<T> responseType,
                Object... uriVariables
        ) {
            Map<String, Object> providerBody = Map.of(
                    "data", Map.of(
                            "ruc", "20100055237",
                            "nombre_o_razon_social", "EMPRESA REAL DE PRUEBA S.A.C.",
                            "nombre_comercial", "EMPRESA REAL",
                            "direccion", "AV. PRUEBA 123",
                            "distrito", "LIMA",
                            "provincia", "LIMA",
                            "departamento", "LIMA",
                            "estado", "ACTIVO",
                            "condicion", "HABIDO"
                    )
            );
            return new ResponseEntity<>(responseType.cast(providerBody), HttpStatus.OK);
        }
    }

    private static class FailingRestTemplate extends RestTemplate {
        @Override
        public <T> ResponseEntity<T> exchange(
                String url,
                HttpMethod method,
                HttpEntity<?> requestEntity,
                Class<T> responseType,
                Object... uriVariables
        ) {
            throw new AssertionError("External provider should not be called in this test.");
        }
    }

    private static class ForbiddenRestTemplate extends RestTemplate {
        @Override
        public <T> ResponseEntity<T> exchange(
                String url,
                HttpMethod method,
                HttpEntity<?> requestEntity,
                Class<T> responseType,
                Object... uriVariables
        ) {
            throw HttpClientErrorException.create(
                    HttpStatus.FORBIDDEN,
                    "Forbidden",
                    HttpHeaders.EMPTY,
                    new byte[0],
                    StandardCharsets.UTF_8
            );
        }
    }

    private static class NotFoundRestTemplate extends RestTemplate {
        @Override
        public <T> ResponseEntity<T> exchange(
                String url,
                HttpMethod method,
                HttpEntity<?> requestEntity,
                Class<T> responseType,
                Object... uriVariables
        ) {
            throw HttpClientErrorException.create(
                    HttpStatus.NOT_FOUND,
                    "Not Found",
                    HttpHeaders.EMPTY,
                    new byte[0],
                    StandardCharsets.UTF_8
            );
        }
    }
}
