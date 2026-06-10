import { DashboardShell } from "@/components/DashboardShell";
import { MapMock } from "@/components/MapMock";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { MapPinned, User, Phone, Navigation, Clock, Droplet, CheckCircle, Mail, Truck } from "lucide-react";
import { recolectorNav } from "./recolectorNav";
import { getStoredAuth } from "@/services/authStorage";
import { useState, useEffect } from "react";
import { recolectorApi } from "@/services/recolectorApi";
import type { PickupRequest, TransportUnit } from "@/types";

type RecolectorProfile = {
  razonSocial?: string;
  ruc?: string;
  correo?: string;
  telefono?: string;
};

export default function RecolectorMapaOperativo() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Recolector", sub: auth?.email || "No autenticado" });
  const [activeRequest, setActiveRequest] = useState<PickupRequest | null>(null);
  const [profile, setProfile] = useState<RecolectorProfile | null>(null);
  const [assignedUnit, setAssignedUnit] = useState<TransportUnit | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [perfilResult, activoResult, unidadesResult] = await Promise.allSettled([
        recolectorApi.getPerfil(),
        recolectorApi.getRecojoActivo(),
        recolectorApi.getUnidades(),
      ]);

      try {
        const perfilRes = perfilResult.status === "fulfilled" ? perfilResult.value : null;
        if (perfilRes?.success && perfilRes.data) {
          const data = perfilRes.data as RecolectorProfile;
          setProfile(data);
          setUser({ name: data.razonSocial || "Recolector", sub: data.correo || `RUC ${data.ruc || "No registrado"}` });
        }

        const activoRes = activoResult.status === "fulfilled" ? activoResult.value : null;
        const unidadesRes = unidadesResult.status === "fulfilled" ? unidadesResult.value : null;
        const request = activoRes?.success && activoRes.data ? activoRes.data : null;
        const unidades = unidadesRes?.success && unidadesRes.data ? unidadesRes.data : [];
        setActiveRequest(request);

        if (request && unidades.length > 0) {
          const unitFromRequest = request.transportePlaca
            ? unidades.find((unit) => unit.placa === request.transportePlaca)
            : null;
          setAssignedUnit(unitFromRequest || unidades.find((unit) => unit.estado === "ACTIVO") || unidades[0]);
        } else {
          setAssignedUnit(null);
        }
      } catch {
        setActiveRequest(null);
        setAssignedUnit(null);
      } finally {
        setLoading(false);
      }
    };

    loadData();
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
        <p className="text-sm text-muted-foreground">Integración futura con Google Maps.</p>
      </div>

      <Card className="p-5 mb-6 opacity-70">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold">Mapa Operativo (Simulación)</h3>
            <p className="text-xs text-muted-foreground">La geolocalización real se integrará en fases posteriores.</p>
          </div>
          <Badge variant="secondary">Próximamente</Badge>
        </div>
        
        <MapMock 
          pins={pins}
          showRoute={true}
          showLegend={true}
          title="Ruta de Recolección"
          height="h-[300px]"
        />
      </Card>

      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Navigation className="h-5 w-5 text-primary" /> Recojo en curso
      </h2>

      {loading ? (
        <Card className="p-8 animate-pulse bg-muted/50 h-40" />
      ) : activeRequest ? (
        <Card className="overflow-hidden border-primary/20 shadow-md">
          <div className="bg-primary/5 p-4 border-b border-border flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg text-primary">{activeRequest.empresaRazonSocial || "Restaurante"}</h3>
            </div>
            <Badge className="bg-primary hover:bg-primary">
              {activeRequest.estado?.replace("_", " ") || "ACTIVO"}
            </Badge>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Dirección de Recojo</p>
                <div className="flex items-start gap-2">
                  <MapPinned className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <p className="font-medium">{activeRequest.direccion || "No especificada"}</p>
                </div>
              </div>
              
              <div className="mb-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Contacto</p>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm">Datos de la empresa (ver RUC para contacto)</p>
                </div>
              </div>

              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Datos del carro</p>
                {assignedUnit ? (
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div>
                      <p className="font-mono text-sm font-semibold bg-muted px-2 py-0.5 rounded inline-block">
                        {assignedUnit.placa}
                      </p>
                      <p className="text-sm mt-1">
                        {assignedUnit.marca || "Marca no registrada"} {assignedUnit.modelo || ""}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {assignedUnit.tipoUnidad || "Tipo no registrado"} · {assignedUnit.capacidadLitros?.toLocaleString("es-PE") || "0"} L
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Truck className="h-4 w-4 text-muted-foreground shrink-0" />
                    <p className="text-sm text-muted-foreground">Unidad pendiente de registro o asignacion</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 md:border-l md:border-border md:pl-6">
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Detalles Operativos</p>
                <div className="flex items-center gap-2 mb-2">
                  <Droplet className="h-4 w-4 text-blue-500 shrink-0" />
                  <p className="text-sm font-medium">{activeRequest.volumenAproximado?.toLocaleString('es-PE')} L <span className="text-muted-foreground font-normal">estimados</span></p>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                  <p className="text-sm">Creada: {activeRequest.fechaSolicitud ? new Date(activeRequest.fechaSolicitud).toLocaleDateString('es-PE', { hour: '2-digit', minute: '2-digit'}) : "Sin fecha"}</p>
                </div>
                {activeRequest.transportePlaca && (
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
                    <p className="text-sm">Unidad: <span className="font-mono bg-muted px-1 py-0.5 rounded text-xs">{activeRequest.transportePlaca}</span></p>
                  </div>
                )}
                
                <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20 text-sm">
                  <p className="font-semibold text-primary mb-1">Oferta del restaurante</p>
                  {activeRequest.precioOfertadoPorLitro != null ? (
                    <>
                      <p className="text-foreground/90">S/ {Number(activeRequest.precioOfertadoPorLitro).toFixed(2)} por litro</p>
                      <p className="text-muted-foreground font-medium">
                        Estimado: S/ {activeRequest.montoEstimado != null ? Number(activeRequest.montoEstimado).toFixed(2) : "0.00"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground italic">Precio no registrado</p>
                      <p className="text-muted-foreground italic">Monto no disponible</p>
                    </>
                  )}
                </div>
              </div>
              
              {activeRequest.observaciones && (
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Observaciones</p>
                  <p className="text-sm italic text-muted-foreground bg-muted/30 p-2 rounded border border-border/50">"{activeRequest.observaciones}"</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed">
          <CheckCircle className="h-10 w-10 text-emerald-500/50 mb-3" />
          <p className="text-lg font-medium text-foreground">No tienes recojos en curso actualmente.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Ve a "Recojos del día" para aceptar nuevas solicitudes.
          </p>
        </Card>
      )}
    </DashboardShell>
  );
}
