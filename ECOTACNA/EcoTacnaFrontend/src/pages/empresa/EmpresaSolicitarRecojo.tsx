import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Droplets, MapPinned, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/DashboardShell";
import { MapMock } from "@/components/MapMock";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { empresaApi } from "@/services/empresaApi";
import { getStoredAuth } from "@/services/authStorage";
import { empresaNav } from "./empresaNav";

export default function EmpresaSolicitarRecojo() {
  const auth = getStoredAuth();
  const navigate = useNavigate();
  const [user, setUser] = useState({ name: auth?.companyName || "Empresa", sub: auth?.email || "No autenticado" });
  const [loading, setLoading] = useState(false);
  const [volumen, setVolumen] = useState("35");
  const [direccion, setDireccion] = useState("Av. San Martin 123, Tacna");
  const [fecha, setFecha] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [precioOfertado, setPrecioOfertado] = useState("2.50");
  const [montoEstimado, setMontoEstimado] = useState(0);

  useEffect(() => {
    const vol = Number(volumen);
    const precio = Number(precioOfertado);
    if (!isNaN(vol) && !isNaN(precio) && vol > 0 && precio > 0) {
      setMontoEstimado(vol * precio);
    } else {
      setMontoEstimado(0);
    }
  }, [volumen, precioOfertado]);

  useEffect(() => {
    const loadPerfil = async () => {
      try {
        const resPerfil = await empresaApi.getPerfil();
        if (resPerfil.success && resPerfil.data) {
          setUser({ name: resPerfil.data.razonSocial, sub: resPerfil.data.correo || `RUC ${resPerfil.data.ruc}` });
          if (resPerfil.data.direccion && resPerfil.data.direccion !== "No registrado") {
            setDireccion(resPerfil.data.direccion);
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }
    };

    loadPerfil();
  }, []);

  const handleSubmit = async () => {
    const volNum = Number(volumen);
    if (volNum <= 0) {
      toast.error("El volumen debe ser mayor a 0");
      return;
    }
    if (!fecha) {
      toast.error("La fecha es obligatoria");
      return;
    }

    const precioNum = Number(precioOfertado);
    if (isNaN(precioNum) || precioNum < 2.0 || precioNum > 3.0) {
      toast.error("El precio ofertado debe estar entre S/ 2.00 y S/ 3.00");
      return;
    }

    setLoading(true);
    try {
      const res = await empresaApi.crearSolicitud({
        volumenAproximado: volNum,
        direccion: direccion,
        fechaProgramada: `${fecha}T00:00:00`,
        observaciones,
        precioOfertadoPorLitro: precioNum,
      });

      if (!res.success) {
        toast.error(res.message || "No se pudo registrar la solicitud");
        return;
      }

      toast.success(res.message || "Solicitud creada exitosamente");
      navigate("/empresa/mis-solicitudes");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardShell role="Empresa" user={user} nav={empresaNav}>
      <div className="mb-6">
        <Badge className="bg-primary text-primary-foreground mb-2">Nueva operación</Badge>
        <h1 className="font-display text-3xl font-bold">Solicitar recojo</h1>
        <p className="text-sm text-muted-foreground">Crea tu solicitud de recojo registrando litros estimados y fecha disponible.</p>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1.5"><Label>Litros estimados</Label><Input type="number" value={volumen} onChange={(e) => setVolumen(e.target.value)} /></div>
            <div className="space-y-1.5"><Label>Fecha disponible</Label><Input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} /></div>
            
            <div className="space-y-1.5 sm:col-span-2">
              <Label>Precio ofertado por litro (S/)</Label>
              <Input 
                type="number" 
                step="0.10"
                min="2.00"
                max="3.00"
                value={precioOfertado} 
                onChange={(e) => setPrecioOfertado(e.target.value)} 
              />
              <p className="text-xs text-muted-foreground mt-1">
                Indica cuánto pagarás por cada litro de aceite recolectado. Rango permitido: S/ 2.00 a S/ 3.00.
              </p>
            </div>

            <div className="space-y-1.5 sm:col-span-2"><Label>Dirección de recojo</Label><Input value={direccion} onChange={(e) => setDireccion(e.target.value)} /></div>
            <div className="space-y-1.5 sm:col-span-2"><Label>Observaciones</Label><Textarea rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} /></div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Button variant="outline" onClick={() => { setVolumen("35"); setObservaciones(""); }}>Limpiar</Button>
            <Button className="bg-gradient-eco" onClick={handleSubmit} disabled={loading}>
              <Send className="h-4 w-4 mr-1.5" /> {loading ? "Enviando..." : "Crear solicitud"}
            </Button>
          </div>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2">
            Ubicación de recojo
            <Badge variant="outline" className="text-[10px] text-warning border-warning">Mapa referencial</Badge>
          </h3>
          <MapMock height="h-64" title="Mi local" pins={[{ id: "1", label: user.name, sub: direccion || "Ubicación referencial", x: 50, y: 50, type: "destacado" }]} />
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-center gap-2"><MapPinned className="h-4 w-4 text-primary" /> Punto de recojo referencial</div>
            <div className="flex items-center gap-2"><Droplets className="h-4 w-4 text-primary" /> Volumen estimado: {volumen || "0"} L</div>
            <div className="flex items-center gap-2"><Calendar className="h-4 w-4 text-primary" /> Fecha solicitada: {fecha || "Sin definir"}</div>
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-foreground">Monto estimado:</span>
                <span className="font-bold text-primary text-lg">S/ {montoEstimado.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground text-right mt-1">
                {volumen || "0"} L x S/ {Number(precioOfertado) ? Number(precioOfertado).toFixed(2) : "0.00"}
              </p>
            </div>
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
