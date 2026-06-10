import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Check, X, MapPin, Calendar, Droplet, User, Phone } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { getStoredAuth } from "@/services/authStorage";
import { recolectorApi } from "@/services/recolectorApi";
import { recolectorNav } from "./recolectorNav";
import type { PickupRequest } from "@/types";

export default function RecolectorRecojosDia() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Recolector", sub: auth?.email || "No autenticado" });
  const [recojos, setRecojos] = useState<PickupRequest[]>([]);
  const [activeRequest, setActiveRequest] = useState<PickupRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState<number | null>(null);
  const [isStartingRoute, setIsStartingRoute] = useState(false);
  const [isConfirmingPickup, setIsConfirmingPickup] = useState(false);
  const [litrosRecolectados, setLitrosRecolectados] = useState<number | "">("");
  const [pickupError, setPickupError] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [resPerfil, resActivo] = await Promise.all([
        recolectorApi.getPerfil(),
        recolectorApi.getRecojoActivo(),
      ]);

      if (resPerfil.success && resPerfil.data) {
        setUser({ name: resPerfil.data.razonSocial, sub: resPerfil.data.correo || `RUC ${resPerfil.data.ruc}` });
      }

      if (resActivo.success && resActivo.data) {
        setActiveRequest(resActivo.data);
      } else {
        const resRecojos = await recolectorApi.getSolicitudesDisponibles();
        if (resRecojos.success && resRecojos.data) {
          setRecojos(resRecojos.data);
        } else {
          setRecojos([]);
        }
      }
    } catch (error: unknown) {
      setRecojos([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAceptar = async (id: number) => {
    setIsAccepting(id);
    try {
      const res = await recolectorApi.aceptarSolicitud(id);
      if (res.success && res.data) {
        toast.success("Solicitud aceptada. Recojo en curso.");
        setActiveRequest(res.data);
        setRecojos([]);
      } else {
        toast.error(res.message || "Error al aceptar solicitud");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Esta solicitud ya fue tomada por otro recolector.");
      loadData();
    } finally {
      setIsAccepting(null);
    }
  };

  const handleRechazar = async (id: number) => {
    try {
      const res = await recolectorApi.rechazarSolicitud(id);
      if (res.success) {
        toast.success("Solicitud descartada para tu empresa.");
        setRecojos((prev) => prev.filter((r) => r.id !== id));
      } else {
        toast.error(res.message || "Error al rechazar solicitud");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al rechazar solicitud.");
    }
  };

  const handleIniciarRuta = async () => {
    if (!activeRequest) return;
    setIsStartingRoute(true);
    try {
      const res = await recolectorApi.iniciarRuta(activeRequest.id);
      if (res.success && res.data) {
        toast.success("Recojo marcado como EN_RUTA.");
        setActiveRequest(res.data);
      } else {
        toast.error(res.message || "Error al iniciar ruta.");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al iniciar ruta.");
      loadData();
    } finally {
      setIsStartingRoute(false);
    }
  };

  const handleConfirmarRecojo = async () => {
    if (!activeRequest || typeof litrosRecolectados !== "number" || litrosRecolectados <= 0) {
      setPickupError("Ingresa litros válidos mayores a 0.");
      return;
    }

    setPickupError("");
    setIsConfirmingPickup(true);
    try {
      const res = await recolectorApi.confirmarRecojo(activeRequest.id, litrosRecolectados);
      if (res.success && res.data) {
        toast.success("Recojo confirmado. Puedes tomar otra solicitud.");
        setActiveRequest(null);
        setRecojos([]);
        setLitrosRecolectados("");
        loadData();
      } else {
        toast.error(res.message || "Error al confirmar recojo.");
      }
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : "Error al confirmar recojo.");
      loadData();
    } finally {
      setIsConfirmingPickup(false);
    }
  };

  return (
    <DashboardShell role="Recolector" user={user} nav={recolectorNav}>
      <div className="mb-6">
        <h1 className="font-display text-3xl font-bold">Recojos disponibles</h1>
        <p className="text-sm text-muted-foreground">Solicitudes pendientes de restaurantes y generadores.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} className="p-5 h-48 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : activeRequest ? (
        <div className="max-w-2xl mx-auto">
          <Card className="flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden border-primary/20 shadow-md">
            <div className="bg-primary/5 p-4 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-bold text-lg text-primary">Ya aceptaste este recojo</h3>
                <p className="text-sm text-muted-foreground">Dirígete al punto de recolección según la fecha programada.</p>
              </div>
              <Badge className="bg-primary hover:bg-primary">
                {activeRequest.estado?.replace("_", " ") || "EN CURSO"}
              </Badge>
            </div>
            
            <div className="p-5">
              <h3 className="font-bold text-lg leading-tight line-clamp-2 mb-4">
                {activeRequest.empresaRazonSocial || "Restaurante"}
              </h3>
              
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span className="text-foreground/90 text-base">{activeRequest.direccion || "Dirección no provista"}</span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Droplet className="h-5 w-5 text-blue-500 shrink-0" />
                  <span className="font-medium text-foreground/90 text-base">{activeRequest.volumenAproximado?.toLocaleString("es-PE")} L <span className="text-muted-foreground font-normal">aprox.</span></span>
                </div>
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground shrink-0" />
                  <span className="text-muted-foreground text-base">
                    {activeRequest.fechaProgramada ? new Date(activeRequest.fechaProgramada).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Sin fecha programada"}
                  </span>
                </div>
                
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
                
                {activeRequest.observaciones && (
                  <div className="mt-4 p-4 bg-muted/50 rounded-md text-sm italic text-muted-foreground border border-border/50">
                    "{activeRequest.observaciones}"
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 bg-muted/30 border-t border-border">
              {activeRequest.estado === "PROGRAMADO" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Marca la ruta como iniciada cuando salgas hacia el recojo.</p>
                  <Button
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                    onClick={handleIniciarRuta}
                    disabled={isStartingRoute}
                  >
                    {isStartingRoute ? "Iniciando ruta..." : "Marcar como EN_RUTA"}
                  </Button>
                </div>
              ) : activeRequest.estado === "EN_RUTA" ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Confirma el recojo cuando el aceite haya sido cargado.</p>
                  {pickupError && <p className="text-sm text-destructive">{pickupError}</p>}
                  <div className="grid gap-3">
                    <div>
                      <Label htmlFor="litros-recolectados">Litros recolectados</Label>
                      <Input
                        id="litros-recolectados"
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="Ej. 35"
                        value={litrosRecolectados}
                        onChange={(e) => setLitrosRecolectados(e.target.value === "" ? "" : Number(e.target.value))}
                      />
                    </div>
                    <Button
                      className="w-full bg-success text-success-foreground hover:bg-success/90"
                      onClick={handleConfirmarRecojo}
                      disabled={isConfirmingPickup}
                    >
                      {isConfirmingPickup ? "Confirmando..." : "Confirmar recojo"}
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">El recojo ya fue registrado. Espera la actualización para ver nuevas solicitudes.</p>
              )}
            </div>
          </Card>
        </div>
      ) : recojos.length === 0 ? (
        <Card className="p-10 flex flex-col items-center justify-center text-center">
          <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">
            No hay recojos disponibles actualmente.
          </p>
          <p className="text-sm text-muted-foreground/70 mt-1">
            Revisa más tarde para nuevas solicitudes.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {recojos.map((recojo) => (
            <Card key={recojo.id} className="flex flex-col h-full hover:shadow-md transition-shadow overflow-hidden">
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-bold text-lg leading-tight line-clamp-2">
                      {recojo.empresaRazonSocial || "Restaurante"}
                    </h3>
                  </div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    PENDIENTE
                  </Badge>
                </div>

                <div className="space-y-2 mt-4 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                    <span className="line-clamp-2 text-foreground/90">{recojo.direccion || "Dirección no provista"}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-blue-500 shrink-0" />
                    <span className="font-medium text-foreground/90">{recojo.volumenAproximado?.toLocaleString("es-PE")} L <span className="text-muted-foreground font-normal">aprox.</span></span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-muted-foreground">
                      {recojo.fechaSolicitud ? new Date(recojo.fechaSolicitud).toLocaleDateString('es-PE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : "Sin fecha"}
                    </span>
                  </div>
                  
                  <div className="mt-4 p-3 bg-primary/5 rounded-md border border-primary/20 text-sm">
                    <p className="font-semibold text-primary mb-1">Oferta del restaurante</p>
                    {recojo.precioOfertadoPorLitro != null ? (
                      <>
                        <p className="text-foreground/90">S/ {Number(recojo.precioOfertadoPorLitro).toFixed(2)} por litro</p>
                        <p className="text-muted-foreground font-medium">
                          Estimado: S/ {recojo.montoEstimado != null ? Number(recojo.montoEstimado).toFixed(2) : "0.00"}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-muted-foreground italic">Precio no registrado</p>
                        <p className="text-muted-foreground italic">Monto no disponible</p>
                      </>
                    )}
                  </div>
                  
                  {recojo.observaciones && (
                    <div className="mt-4 p-3 bg-muted/50 rounded-md text-xs italic text-muted-foreground">
                      "{recojo.observaciones}"
                    </div>
                  )}
                </div>
              </div>
              
              <div className="p-4 bg-muted/30 border-t border-border flex gap-3">
                <Button 
                  variant="outline" 
                  className="flex-1 text-destructive hover:bg-destructive hover:text-destructive-foreground border-destructive/30"
                  onClick={() => handleRechazar(recojo.id)}
                  disabled={isAccepting !== null}
                >
                  <X className="h-4 w-4 mr-1.5" /> Rechazar
                </Button>
                <Button 
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => handleAceptar(recojo.id)}
                  disabled={isAccepting !== null}
                >
                  {isAccepting === recojo.id ? (
                    <span className="flex items-center"><Check className="h-4 w-4 mr-1.5 animate-pulse" /> Aceptando...</span>
                  ) : (
                    <span className="flex items-center"><Check className="h-4 w-4 mr-1.5" /> Aceptar</span>
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </DashboardShell>
  );
}
