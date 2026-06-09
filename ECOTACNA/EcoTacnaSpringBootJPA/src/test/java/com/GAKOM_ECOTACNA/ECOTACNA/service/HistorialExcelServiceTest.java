package com.GAKOM_ECOTACNA.ECOTACNA.service;

import com.GAKOM_ECOTACNA.ECOTACNA.model.*;
import org.junit.jupiter.api.Test;
import java.io.FileOutputStream;
import java.io.File;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertTrue;

class HistorialExcelServiceTest {

    @Test
    void testGenerateExcelFiles() throws Exception {
        HistorialExcelService excelService = new HistorialExcelService();

        Company company = new Company();
        company.setId(1L);
        company.setBusinessName("Mi Empresa SAC");
        company.setRuc("20123456789");
        company.setAddress("Av. Prueba 123");

        Company collectorCompany = new Company();
        collectorCompany.setId(2L);
        collectorCompany.setBusinessName("Recolector EIRL");
        collectorCompany.setRuc("10123456789");

        User collectorUser = new User();
        collectorUser.setId(10L);
        collectorUser.setFirstName("Juan");
        collectorUser.setLastName("Perez");
        collectorUser.setCompany(collectorCompany);

        TransportUnit unit = new TransportUnit();
        unit.setBrand("Volvo");
        unit.setModel("FH16");
        unit.setPlate("ABC-123");
        unit.setCollectorCompany(collectorCompany);

        PickupRequest pr = new PickupRequest();
        pr.setId(100L);
        pr.setCompany(company);
        pr.setRequestedAt(LocalDateTime.now());
        pr.setScheduledAt(LocalDateTime.now().plusDays(1));
        pr.setStatus(PickupRequestStatus.COMPLETADO);
        pr.setEstadoPago("PAGADO");
        pr.setApproximateVolumeLiters(new BigDecimal("50.0"));
        pr.setPrecioOfertadoPorLitro(new BigDecimal("2.50"));
        pr.setActualVolumeLiters(new BigDecimal("52.0"));
        pr.setPrecioPorLitro(new BigDecimal("2.50"));
        pr.setMontoTotal(new BigDecimal("130.00"));
        pr.setFechaConfirmacionPago(LocalDateTime.now());
        pr.setTransportUnit(unit);
        pr.setCollectorUserId(10L);

        List<PickupRequest> requests = new ArrayList<>();
        requests.add(pr);

        byte[] empresaExcel = excelService.generateCompanyExcel(requests, company, "2026-06-01", "2026-06-30");
        File empresaFile = new File("historial-empresa-test.xlsx");
        try (FileOutputStream fos = new FileOutputStream(empresaFile)) {
            fos.write(empresaExcel);
        }
        assertTrue(empresaFile.length() > 0);
        System.out.println("Empresa Excel Size: " + empresaFile.length() + " bytes");

        byte[] recolectorExcel = excelService.generateCollectorExcel(requests, collectorUser, "2026-06-01", "2026-06-30");
        File recolectorFile = new File("historial-recolector-test.xlsx");
        try (FileOutputStream fos = new FileOutputStream(recolectorFile)) {
            fos.write(recolectorExcel);
        }
        assertTrue(recolectorFile.length() > 0);
        System.out.println("Recolector Excel Size: " + recolectorFile.length() + " bytes");
    }
}
