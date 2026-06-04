package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.dto.RucLookupResponse;
import com.GAKOM_ECOTACNA.ECOTACNA.exception.BusinessException;

import java.util.HashMap;
import java.util.Map;

public class MockRucLookupService implements RucLookupService {

    private final Map<String, RucLookupResponse> mockData;

    public MockRucLookupService() {
        mockData = new HashMap<>();

        mockData.put("20605432198", RucLookupResponse.builder()
                .ruc("20605432198")
                .razonSocial("Pollería El Sabor Tacneño S.A.C.")
                .nombreComercial("El Sabor Tacneño")
                .direccionFiscal("Av. Bolognesi 1247")
                .distrito("Tacna")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());

        mockData.put("20123456789", RucLookupResponse.builder()
                .ruc("20123456789")
                .razonSocial("Cevichería El Puerto S.A.C.")
                .nombreComercial("Cevichería El Puerto")
                .direccionFiscal("Av. San Martín 850")
                .distrito("Tacna")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());

        mockData.put("20543210987", RucLookupResponse.builder()
                .ruc("20543210987")
                .razonSocial("Recolectora Verde Tacna S.R.L.")
                .nombreComercial("Recolectora Verde Tacna")
                .direccionFiscal("Av. Industrial 220")
                .distrito("Coronel Gregorio Albarracín Lanchipa")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());

        // 3 Nuevas empresas generadoras
        mockData.put("20611111111", RucLookupResponse.builder()
                .ruc("20611111111")
                .razonSocial("Pollería La Tacneñita S.A.C.")
                .nombreComercial("La Tacneñita")
                .direccionFiscal("Av. Leguía 456")
                .distrito("Tacna")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());

        mockData.put("20622222222", RucLookupResponse.builder()
                .ruc("20622222222")
                .razonSocial("Restaurante Don Aceite S.A.C.")
                .nombreComercial("Don Aceite")
                .direccionFiscal("Av. Industrial 780")
                .distrito("Tacna")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());

        mockData.put("20633333333", RucLookupResponse.builder()
                .ruc("20633333333")
                .razonSocial("Cevichería Mar Verde S.A.C.")
                .nombreComercial("Mar Verde")
                .direccionFiscal("Av. San Martín 920")
                .distrito("Tacna")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());

        // 2 Nuevas empresas recolectoras
        mockData.put("20555555555", RucLookupResponse.builder()
                .ruc("20555555555")
                .razonSocial("Recolectora Sur Verde S.R.L.")
                .nombreComercial("Sur Verde")
                .direccionFiscal("Av. Circunvalación 300")
                .distrito("Gregorio Albarracín")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());

        mockData.put("20566666666", RucLookupResponse.builder()
                .ruc("20566666666")
                .razonSocial("EcoRecolectores Tacna S.A.C.")
                .nombreComercial("EcoRecolectores Tacna")
                .direccionFiscal("Av. Municipal 150")
                .distrito("Tacna")
                .provincia("Tacna")
                .departamento("Tacna")
                .estadoContribuyente("ACTIVO")
                .condicionDomicilio("HABIDO")
                .fuente("MOCK")
                .build());
    }

    @Override
    public RucLookupResponse lookupRuc(String ruc) {
        if (ruc == null || !ruc.matches("\\d{11}")) {
            throw new BusinessException("El RUC debe tener exactamente 11 dígitos numéricos.");
        }

        RucLookupResponse response = mockData.get(ruc);
        if (response == null) {
            throw new BusinessException("RUC no encontrado o no válido en la base de datos de simulación.");
        }

        return response;
    }
}
