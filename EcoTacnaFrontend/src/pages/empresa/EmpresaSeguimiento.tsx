import { DashboardShell } from "@/components/DashboardShell";
import { MapMock } from "@/components/MapMock";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPinned, Truck, User, Phone, Mail, Clock, MapPin, Droplets, Info } from "lucide-react";
import { empresaNav } from "./empresaNav";
import { getStoredAuth } from "@/services/authStorage";
import { useState, useEffect } from "react";
import { empresaApi } from "@/services/empresaApi";
import type { PickupTrackingResponse } from "@/types";

export default function EmpresaSeguimiento() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Empresa", sub: auth?.email || "No autenticado" });
  const [tracking, setTracking] = useState<PickupTrackingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmarPago = async () => {
    if (!tracking || tracking.precioOfertadoPorLitro == null) return;

    setIsConfirming(true);
    try {
      const res = await empresaApi.confirmarPago(tracking.solicitudId, {
        litrosConfirmados: tracking.volumenAproximado,
      });
      if (res.success && res.data) {
        setTracking(res.data);
      } else {
        console.error(res.message || "No se pudo confirmar el pago.");
      }
    } catch (error: unknown) {
      console.error(error);
    } finally {
      setIsConfirming(false);
    }
  };

  useEffect(() => {
    empresaApi.getPerfil().then((res) => {
      if (res.success && res.data) {
        setUser({ name: res.data.razonSocial, sub: res.data.correo || `RUC ${res.data.ruc}` });
      }
    }).catch(() => {});

    empresaApi.getSeguimientoActivo().then((res) => {
      if (res.success && res.data) {
        setTracking(res.data);
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const pins = [
    { id: "1", label: "Mi Empresa", sub: "Punto de recojo", x: 30, y: 50, type: "empresa" as const },
    { id: "2", label: "Recolector asignado", sub: "En camino", x: 45, y: 60, type: "recolector" as const },
  ];

  return (
    <DashboardShell role="Empresa" user={user} nav={empresaNav}>
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-primary text-primary-foreground">Logística</Badge>
          <Badge variant="outline" className="border-info text-info"><MapPinned className="h-3 w-3 mr-1"/> Tiempo real</Badge>
        </div>
        <h1 className="font-display text-3xl font-bold">Seguimiento de Recojo</h1>
        <p className="text-sm text-muted-foreground">Monitoreo en tiempo real de la unidad de transporte asignada.</p>
      </div>

      <Card className="p-5 mb-6">
        <div className="mb-4">
          <h3 className="font-display font-bold">Ubicación aproximada</h3>
          <p className="text-xs text-muted-foreground">El mapa muestra la última ubicación reportada por el recolector.</p>
        </div>
        
        <MapMock 
          pins={pins}
          showRoute={true}
          showLegend={true}
          title="Seguimiento GPS"
          height="h-[300px]"
        />
      </Card>

      <h2 className="font-display text-2xl font-bold mb-4 flex items-center gap-2">
        <Truck className="h-6 w-6 text-primary" /> Recolector asignado
      </h2>

      {loading ? (
        <Card className="p-8 animate-pulse bg-muted/50 h-40" />
      ) : tracking ? (
        <Card className="overflow-hidden border-primary/20 shadow-md">
          <div className="bg-primary/5 p-4 border-b border-border flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="font-bold text-lg text-primary">
                {tracking.estado === "COMPLETADO" ? "Recojo Completado" : "Tu recojo fue aceptado"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {tracking.estado === "COMPLETADO" 
                  ? "El proceso ha concluido exitosamente." 
                  : "El recolector está en camino o preparándose para la recolección."}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="bg-primary hover:bg-primary">
                {tracking.estado.replace("_", " ")}
              </Badge>
              {tracking.estado === "RECOGIDO" && tracking.precioOfertadoPorLitro != null && (
                <Button onClick={handleConfirmarPago} size="sm" disabled={isConfirming}>
                  {isConfirming ? "Procesando..." : `Confirmar recojo y pago S/ ${(tracking.precioOfertadoPorLitro * tracking.volumenAproximado).toFixed(2)}`}
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
            <CardContent className="p-6">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Datos del Recolector</h4>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">{tracking.recolector?.razonSocial || "Empresa Recolectora"}</p>
                    <p className="text-sm text-muted-foreground">RUC: {tracking.recolector?.ruc || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">{tracking.recolector?.correo || "No registrado"}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <p className="text-sm">{tracking.recolector?.telefono || "No registrado"}</p>
                </div>
              </div>

              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mt-6 mb-4">Unidad de Transporte</h4>
              {tracking.unidad ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Truck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium bg-muted px-2 py-0.5 rounded text-sm inline-block mb-1">{tracking.unidad.placa}</p>
                      <p className="text-sm text-muted-foreground">{tracking.unidad.marca} {tracking.unidad.modelo} ({tracking.unidad.tipoUnidad})</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-muted/50 p-3 rounded border border-dashed flex items-center gap-2">
                  <Info className="h-4 w-4 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Unidad pendiente de asignación</p>
                </div>
              )}
            </CardContent>

            <CardContent className="p-6 md:border-l md:border-border bg-muted/10">
              <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Detalles del Pedido</h4>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Dirección de recojo</p>
                    <p className="text-sm font-medium">{tracking.direccion || "No especificada"}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Droplets className="h-5 w-5 text-blue-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Volumen aproximado</p>
                    <p className="text-sm font-medium">{tracking.volumenAproximado?.toLocaleString('es-PE')} Litros</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-emerald-500 mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Fecha programada</p>
                    <p className="text-sm font-medium">{tracking.fechaProgramada ? new Date(tracking.fechaProgramada).toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' }) : "Lo antes posible"}</p>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20 text-sm">
                  <p className="font-semibold text-primary mb-1">Tu oferta</p>
                  {tracking.precioOfertadoPorLitro != null ? (
                    <>
                      <p className="text-foreground/90">S/ {Number(tracking.precioOfertadoPorLitro).toFixed(2)} por litro</p>
                      <p className="text-muted-foreground font-medium">
                        Estimado: S/ {tracking.montoEstimado != null ? Number(tracking.montoEstimado).toFixed(2) : "0.00"}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-muted-foreground italic">Precio no registrado</p>
                      <p className="text-muted-foreground italic">Monto no disponible</p>
                    </>
                  )}
                </div>

                {tracking.observaciones && (
                  <div className="mt-4 p-3 bg-background rounded border border-border">
                    <p className="text-xs font-semibold text-muted-foreground mb-1">Observaciones:</p>
                    <p className="text-sm italic">"{tracking.observaciones}"</p>
                  </div>
                )}
              </div>
            </CardContent>
          </div>
        </Card>
      ) : (
        <Card className="p-8 flex flex-col items-center justify-center text-center border-dashed">
          <Info className="h-10 w-10 text-muted-foreground/50 mb-3" />
          <p className="text-lg font-medium text-foreground">Aún no tienes un recojo aceptado por un recolector.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Cuando un recolector acepte tu solicitud, sus datos aparecerán aquí.
          </p>
        </Card>
      )}

    </DashboardShell>
  );
}
