package com.GAKOM_ECOTACNA.ECOTACNA;

import com.GAKOM_ECOTACNA.ECOTACNA.model.TransportUnit;
import com.GAKOM_ECOTACNA.ECOTACNA.repository.TransportUnitRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class CleanDBTest {

    @Autowired
    private TransportUnitRepository transportUnitRepository;

    @Test
    public void cleanDbData() {
        System.out.println("--- INICIANDO LIMPIEZA DE BD ---");
        List<TransportUnit> units = transportUnitRepository.findAll();
        
        for (TransportUnit u : units) {
            String obs = u.getObservations() != null ? u.getObservations().toLowerCase() : "";
            String plate = u.getPlate() != null ? u.getPlate().toLowerCase() : "";
            
            boolean isTest = obs.contains("codex") || obs.contains("prueba") || obs.contains("demo") || 
                             obs.contains("mock") || obs.contains("test") || plate.contains("test");
                             
            if (isTest) {
                System.out.println("ELIMINANDO: Placa=" + u.getPlate() + ", Obs=" + u.getObservations());
                transportUnitRepository.delete(u);
            }
        }
        System.out.println("--- FIN LIMPIEZA DE BD ---");
    }
}
