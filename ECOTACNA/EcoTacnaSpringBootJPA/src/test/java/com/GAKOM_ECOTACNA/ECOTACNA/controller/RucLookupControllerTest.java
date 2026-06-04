package com.GAKOM_ECOTACNA.ECOTACNA.controller;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.RucLookupResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ExternalProviderException;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ResourceNotFoundException;
import com.GAKOM_ECOTACNA.ECOTACNA.service.ApiPeruDevRucService;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class RucLookupControllerTest {

    @Test
    void consultarRucReturnsProviderCompanyData() {
        RucLookupController controller = new RucLookupController(new StubApiPeruDevRucService("success"));

        ResponseEntity<ApiResponse<RucLookupResponse>> response = controller.consultarRuc("20100055237");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isSuccess());
        assertNotNull(response.getBody().getData());
        assertEquals("20100055237", response.getBody().getData().getRuc());
        assertEquals("APIPERUDEV", response.getBody().getData().getFuente());
    }

    @Test
    void consultarRucRejectsInvalidFormat() {
        RucLookupController controller = new RucLookupController(new StubApiPeruDevRucService("invalid"));

        ResponseEntity<ApiResponse<RucLookupResponse>> response = controller.consultarRuc("123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("El RUC debe tener 11 digitos numericos.", response.getBody().getMessage());
    }

    @Test
    void consultarRucReturnsNotFoundForUnknownRuc() {
        RucLookupController controller = new RucLookupController(new StubApiPeruDevRucService("not-found"));

        ResponseEntity<ApiResponse<RucLookupResponse>> response = controller.consultarRuc("20999999999");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("No se encontraron datos para el RUC ingresado.", response.getBody().getMessage());
    }

    @Test
    void consultarRucReturnsBadGatewayForMissingToken() {
        RucLookupController controller = new RucLookupController(new StubApiPeruDevRucService("missing-token"));

        ResponseEntity<ApiResponse<RucLookupResponse>> response = controller.consultarRuc("20100055237");

        assertEquals(HttpStatus.BAD_GATEWAY, response.getStatusCode());
        assertNotNull(response.getBody());
        assertFalse(response.getBody().isSuccess());
        assertEquals("Servicio RUC no configurado. Falta APIPERUDEV_API_TOKEN.", response.getBody().getMessage());
    }

    private static class StubApiPeruDevRucService extends ApiPeruDevRucService {
        private final String scenario;

        private StubApiPeruDevRucService(String scenario) {
            this.scenario = scenario;
        }

        @Override
        public RucLookupResponse consultarRuc(String ruc) {
            return switch (scenario) {
                case "invalid" -> throwException(new BusinessException("El RUC debe tener 11 digitos numericos."));
                case "not-found" -> throwException(new ResourceNotFoundException("No se encontraron datos para el RUC ingresado."));
                case "missing-token" -> throwException(new ExternalProviderException("Servicio RUC no configurado. Falta APIPERUDEV_API_TOKEN."));
                default -> RucLookupResponse.builder()
                        .ruc("20100055237")
                        .razonSocial("EMPRESA REAL DE PRUEBA S.A.C.")
                        .nombreComercial("EMPRESA REAL")
                        .direccionFiscal("AV. PRUEBA 123")
                        .distrito("LIMA")
                        .provincia("LIMA")
                        .departamento("LIMA")
                        .estadoContribuyente("ACTIVO")
                        .condicionDomicilio("HABIDO")
                        .fuente("APIPERUDEV")
                        .build();
            };
        }

        private RucLookupResponse throwException(RuntimeException exception) {
            throw exception;
        }
    }
}
