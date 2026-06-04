package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.RucLookupResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.dto.ApiPeruDevRucResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ExternalProviderException;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.ResourceNotFoundException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Service
public class ApiPeruDevRucService {

    @Value("${ruc.provider:apiperudev}")
    private String rucProvider;

    @Value("${apiperudev.api.token:}")
    private String apiToken;

    @Value("${apiperudev.api.base-url:https://apiperu.dev/api}")
    private String apiBaseUrl;

    private final RestTemplate restTemplate;

    public ApiPeruDevRucService() {
        this(new RestTemplate());
    }

    ApiPeruDevRucService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public RucLookupResponse consultarRuc(String ruc) {
        validarRuc(ruc);
        if (!isApiMode()) {
            throw new ExternalProviderException("Servicio RUC no configurado. RUC_PROVIDER debe ser apiperudev.");
        }
        return consultarApiPeru(ruc);
    }

    private boolean isApiMode() {
        return rucProvider == null
                || rucProvider.isBlank()
                || "apiperudev".equalsIgnoreCase(rucProvider.trim())
                || "api".equalsIgnoreCase(rucProvider.trim())
                || "real".equalsIgnoreCase(rucProvider.trim());
    }

    private RucLookupResponse consultarApiPeru(String ruc) {
        if (apiToken == null || apiToken.isBlank()) {
            throw new ExternalProviderException("Servicio RUC no configurado. Falta APIPERUDEV_API_TOKEN.");
        }

        String baseUrl = apiBaseUrl == null || apiBaseUrl.isBlank()
                ? "https://apiperu.dev/api"
                : apiBaseUrl.replaceAll("/$", "");
        String url = baseUrl + "/ruc";

        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(apiToken);
        headers.set("Accept", "application/json");
        headers.set("Content-Type", "application/json");

        Map<String, String> requestBody = Map.of("ruc", ruc);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    Map.class
            );
            ApiPeruDevRucResponse providerData = parseProviderResponse(response.getBody());
            if (providerData == null || providerData.getRuc() == null || providerData.getRuc().isBlank()) {
                throw new ResourceNotFoundException("No se encontraron datos para el RUC ingresado.");
            }
            return toLookupResponse(providerData, "APIPERUDEV");
        } catch (HttpClientErrorException.Unauthorized | HttpClientErrorException.Forbidden ex) {
            throw new ExternalProviderException("No se pudo consultar el proveedor RUC. Verifica la configuracion del servicio.");
        } catch (HttpClientErrorException.NotFound ex) {
            throw new ResourceNotFoundException("No se encontraron datos para el RUC ingresado.");
        } catch (HttpClientErrorException.TooManyRequests ex) {
            throw new ExternalProviderException("El servicio externo de RUC alcanzo el limite de consultas. Intenta nuevamente.");
        } catch (HttpClientErrorException | HttpServerErrorException ex) {
            throw new ExternalProviderException("No se pudo consultar el servicio externo de RUC. Intenta nuevamente.");
        } catch (ResourceNotFoundException | ExternalProviderException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ExternalProviderException("No se pudo consultar el servicio externo de RUC. Intenta nuevamente.");
        }
    }

    @SuppressWarnings("unchecked")
    private ApiPeruDevRucResponse parseProviderResponse(Map<String, Object> body) {
        if (body == null || body.isEmpty()) {
            return null;
        }

        Object dataNode = body.get("data");
        Map<String, Object> data = dataNode instanceof Map<?, ?> ? (Map<String, Object>) dataNode : body;

        ApiPeruDevRucResponse response = new ApiPeruDevRucResponse();
        response.setRuc(readString(data, "ruc"));
        response.setNombreORazonSocial(readString(data, "nombre_o_razon_social", "razon_social", "razonSocial"));
        response.setNombreComercial(readString(data, "nombre_comercial", "nombreComercial"));
        response.setDireccion(readString(data, "direccion", "direccionFiscal"));
        response.setDistrito(readString(data, "distrito"));
        response.setProvincia(readString(data, "provincia"));
        response.setDepartamento(readString(data, "departamento"));
        response.setEstado(readString(data, "estado", "estadoContribuyente"));
        response.setCondicion(readString(data, "condicion", "condicionDomicilio"));
        return response;
    }

    private String readString(Map<String, Object> data, String... keys) {
        for (String key : keys) {
            Object value = data.get(key);
            if (value != null) {
                String text = value.toString().trim();
                if (!text.isBlank()) {
                    return text;
                }
            }
        }
        return "";
    }

    private RucLookupResponse toLookupResponse(ApiPeruDevRucResponse data, String fuente) {
        return RucLookupResponse.builder()
                .ruc(data.getRuc())
                .razonSocial(data.getNombreORazonSocial())
                .nombreComercial(data.getNombreComercial())
                .direccionFiscal(data.getDireccion())
                .distrito(data.getDistrito())
                .provincia(data.getProvincia())
                .departamento(data.getDepartamento())
                .estadoContribuyente(data.getEstado())
                .condicionDomicilio(data.getCondicion())
                .fuente(fuente)
                .build();
    }

    private void validarRuc(String ruc) {
        if (ruc == null || !ruc.matches("\\d{11}")) {
            throw new BusinessException("El RUC debe tener 11 digitos numericos.");
        }
    }
}
