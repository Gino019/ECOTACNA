import { DashboardShell } from "@/components/DashboardShell";
import { MapMock } from "@/components/MapMock";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPinned } from "lucide-react";
import { recolectorNav } from "./recolectorNav";
import { getStoredAuth } from "@/services/authStorage";
import { useState, useEffect } from "react";
import { empresaApi } from "@/services/empresaApi";

export default function RecolectorMapaOperativo() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Recolector", sub: auth?.email || "No autenticado" });

  useEffect(() => {
    empresaApi.getPerfil().then((res) => {
      if (res.success && res.data) {
        setUser({ name: res.data.razonSocial, sub: res.data.correo || `RUC ${res.data.ruc}` });
      }
    }).catch(() => {});
  }, []);

  const pins = [
    { id: "1", label: "Central de Acopio", sub: "Base de operaciones", x: 45, y: 60, type: "recolector" as const },
    { id: "2", label: "Punto de recojo A", sub: "Restaurante Central", x: 30, y: 50, type: "empresa" as const },
    { id: "3", label: "Punto de recojo B", sub: "Pollería El Rey", x: 60, y: 40, type: "empresa" as const },
  ];

  return (
    <DashboardShell role="Recolector" user={user} nav={recolectorNav}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-accent text-accent-foreground">Logística</Badge>
          <Badge variant="outline" className="border-info text-info"><MapPinned className="h-3 w-3 mr-1"/> En vivo</Badge>
        </div>
        <h1 className="font-display text-3xl font-bold">Mapa Operativo</h1>
        <p className="text-sm text-muted-foreground">Monitoreo y geolocalización de los puntos de recolección asignados.</p>
      </div>

      <Card className="p-5">
        <div className="mb-4">
          <h3 className="font-display font-bold">Ruta aproximada</h3>
          <p className="text-xs text-muted-foreground">El mapa muestra los puntos de recolección planificados para el día de hoy.</p>
        </div>
        
        <MapMock 
          pins={pins}
          showRoute={true}
          showLegend={true}
          title="Ruta de Recolección"
          height="h-[450px]"
        />
      </Card>
    </DashboardShell>
  );
}
