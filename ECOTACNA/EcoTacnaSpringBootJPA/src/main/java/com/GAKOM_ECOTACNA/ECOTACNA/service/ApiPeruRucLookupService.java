package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.RucLookupResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;

/**
 * Servicio real que consulta el RUC en apiperu.dev usando token Bearer.
 * Se activa automáticamente cuando la variable APIPERU_TOKEN está presente.
 */
@Service
public class ApiPeruRucLookupService implements RucLookupService {

    private static final String API_URL = "https://apiperu.dev/api/ruc/";

    private final String token;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient;
    private final MockRucLookupService mockFallback;

    public ApiPeruRucLookupService(@Value("${apiperu.token:}") String token) {
        this.token = token;
        this.objectMapper = new ObjectMapper();
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.mockFallback = new MockRucLookupService();
    }

    @Override
    public RucLookupResponse lookupRuc(String ruc) {
        if (ruc == null || !ruc.matches("\\d{11}")) {
            throw new BusinessException("El RUC debe tener exactamente 11 dígitos numéricos.");
        }

        if (token == null || token.trim().isEmpty()) {
            return mockFallback.lookupRuc(ruc);
        }

        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(API_URL + ruc))
                    .timeout(Duration.ofSeconds(15))
                    .header("Authorization", "Bearer " + token)
                    .header("Accept", "application/json")
                    .GET()
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 404) {
                throw new BusinessException("RUC " + ruc + " no encontrado en los registros de SUNAT.");
            }
            if (response.statusCode() != 200) {
                throw new BusinessException("Error al consultar SUNAT. Código: " + response.statusCode());
            }

            JsonNode root = objectMapper.readTree(response.body());

            // apiperu.dev devuelve los datos directamente o dentro de "data"
            JsonNode data = root.has("data") ? root.get("data") : root;

            if (data == null || data.isNull()) {
                throw new BusinessException("RUC " + ruc + " no encontrado en los registros de SUNAT.");
            }

            return RucLookupResponse.builder()
                    .ruc(getText(data, "ruc", ruc))
                    .razonSocial(getText(data, "nombre_o_razon_social", getText(data, "razonSocial", "")))
                    .nombreComercial(getText(data, "nombre_comercial", getText(data, "nombreComercial", "")))
                    .direccionFiscal(getText(data, "direccion", getText(data, "direccionFiscal", "")))
                    .distrito(getText(data, "distrito", ""))
                    .provincia(getText(data, "provincia", ""))
                    .departamento(getText(data, "departamento", ""))
                    .estadoContribuyente(getText(data, "estado_contribuyente", getText(data, "estado", "ACTIVO")))
                    .condicionDomicilio(getText(data, "condicion_domicilio", getText(data, "condicion", "HABIDO")))
                    .fuente("SUNAT / apiperu.dev")
                    .build();

        } catch (BusinessException e) {
            throw e;
        } catch (Exception e) {
            throw new BusinessException("No se pudo consultar el RUC en este momento. Intente nuevamente. Detalle: " + e.getMessage());
        }
    }

    private String getText(JsonNode node, String field, String fallback) {
        if (node == null) return fallback;
        JsonNode f = node.get(field);
        if (f == null || f.isNull()) return fallback;
        String val = f.asText("").trim();
        return val.isEmpty() ? fallback : val;
    }
}
