import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Award, Droplets, Package, Receipt, ShieldCheck, Truck } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { MapMock } from "@/components/MapMock";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { empresaApi } from "@/services/empresaApi";
import { getStoredAuth } from "@/services/authStorage";
import { empresaNav } from "./empresa/empresaNav";

const timeline = [
  { label: "Pendiente", done: true },
  { label: "Programado", done: true },
  { label: "En ruta", done: true },
  { label: "Recogido", done: false },
  { label: "Liquidado", done: false },
  { label: "Certificado", done: false },
];

export default function EmpresaDashboard() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({
    name: auth?.companyName || "Empresa",
    sub: auth?.email || "No autenticado",
  });
  const [perfil, setPerfil] = useState<any>(null);
  const [resumen, setResumen] = useState<any>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resPerfil, resResumen, resSolicitudes] = await Promise.all([
          empresaApi.getPerfil(),
          empresaApi.getResumen(),
          empresaApi.getSolicitudes(),
        ]);

        if (resPerfil.success && resPerfil.data) {
          setPerfil(resPerfil.data);
          setUser({
            name: resPerfil.data.razonSocial,
            sub: resPerfil.data.correo || `RUC ${resPerfil.data.ruc}`,
          });
        } else if (!resPerfil.success) {
          setError(resPerfil.message || "Perfil no encontrado en backend");
        }

        if (resResumen.success && resResumen.data) {
          setResumen(resResumen.data);
        } else if (!resResumen.success) {
          setError((prev) => prev || resResumen.message || "No se pudo cargar el resumen");
        }

        if (resSolicitudes.success) {
          setSolicitudes(resSolicitudes.data || []);
        } else {
          setError((prev) => prev || resSolicitudes.message || "No se pudieron cargar las solicitudes");
        }
      } catch (err: any) {
        setError(err.message || "Error de red");
      }
    };

    loadData();
  }, []);

  const totalLitrosReciclados = Number(
    resumen?.totalLitrosReciclados ??
    resumen?.total_litros_reciclados ??
    resumen?.totalLitros ??
    resumen?.total_litros ??
    0
  );

  const totalSolicitudes = Number(
    resumen?.totalSolicitudes ??
    resumen?.total_solicitudes ??
    0
  );

  const totalIngresos = Number(
    resumen?.totalIngresos ??
    resumen?.total_ingresos ??
    resumen?.totalLiquidado ??
    resumen?.total_liquidado ??
    0
  );

  const solicitudesCompletadas = Number(
    resumen?.solicitudesCompletadas ??
    resumen?.solicitudes_completadas ??
    0
  );

  return (
    <DashboardShell role="Empresa" user={user} nav={empresaNav}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <Badge className="bg-success text-success-foreground">
              <ShieldCheck className="h-3 w-3 mr-1" /> Empresa verificada
            </Badge>
            {perfil?.ruc ? <Badge variant="outline">RUC {perfil.ruc}</Badge> : null}
            {error ? <Badge variant="outline" className="text-destructive border-destructive">{error}</Badge> : null}
          </div>
          <h1 className="font-display text-3xl font-bold">{perfil?.razonSocial || auth?.companyName || "Empresa"}</h1>
          <p className="text-sm text-muted-foreground">{perfil?.direccion || "No autenticado"} · Panel de empresa generadora</p>
        </div>
        <Button asChild size="lg" className="bg-gradient-eco shadow-eco h-12">
          <Link to="/empresa/solicitar-recojo">Solicitar recojo</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Droplets} label="Litros reciclados" value={String(totalLitrosReciclados)} unit="L" tone="primary" />
        <StatCard icon={Package} label="Solicitudes" value={String(totalSolicitudes)} tone="warning" />
        <StatCard icon={Receipt} label="Ingresos" value={`S/ ${totalIngresos.toFixed(2)}`} tone="success" />
        <StatCard icon={Award} label="Completadas" value={String(solicitudesCompletadas)} tone="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold flex items-center gap-2">
                Seguimiento de recojo
                <Badge variant="outline" className="text-[10px] text-warning border-warning">Mapa referencial</Badge>
              </h3>
              <p className="text-xs text-muted-foreground">Mapa visual de referencia. No representa un recolector real mientras el backend de seguimiento no exista.</p>
            </div>
            <Badge variant="outline">Referencial</Badge>
          </div>

          <MapMock
            height="h-[300px]"
            showRoute
            title="Seguimiento referencial"
            pins={[
              { id: "1", label: "Referencia visual", sub: "Visual de referencia", x: 25, y: 65, type: "recolector" },
              { id: "2", label: perfil?.razonSocial || auth?.companyName || "Mi empresa", sub: "Punto de recojo", x: 50, y: 45, type: "destacado" },
            ]}
          />

          <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-2">
            {timeline.map((item, index) => (
              <div key={item.label} className="text-center">
                <div className={`mx-auto w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold mb-1.5 ${item.done ? "bg-gradient-eco text-primary-foreground shadow-eco" : "bg-muted text-muted-foreground"}`}>
                  {index + 1}
                </div>
                <div className={`text-[10px] ${item.done ? "font-semibold" : "text-muted-foreground"}`}>{item.label}</div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold mb-4 flex items-center gap-2">
            Próxima entrega
            <Badge variant="outline" className="text-[10px] text-warning border-warning">Pendiente backend</Badge>
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 p-3 bg-gradient-soft rounded-lg">
              <Truck className="h-8 w-8 text-primary" />
              <div>
                <div className="font-semibold">Sin recolector aceptado</div>
                <div className="text-xs text-muted-foreground">Solicitud en cola para aceptación voluntaria</div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <Card className="p-5 mb-6">
        <h3 className="font-display font-bold mb-4">Solicitudes recientes</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha solicitud</TableHead>
              <TableHead>Fecha programada</TableHead>
              <TableHead>Volumen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Dirección</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {solicitudes.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-6">No hay solicitudes registradas.</TableCell></TableRow>
            ) : (
              solicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-mono text-xs">{solicitud.id}</TableCell>
                  <TableCell>{solicitud.fechaSolicitudTexto}</TableCell>
                  <TableCell>{solicitud.fechaProgramadaTexto}</TableCell>
                  <TableCell className="font-mono">{solicitud.volumenAproximado.toFixed(2)} L</TableCell>
                  <TableCell>{solicitud.estado}</TableCell>
                  <TableCell>{solicitud.direccionRecojo || "No registrado"}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-bold mb-2">Liquidaciones</h3>
          <p className="text-sm text-muted-foreground">Pendiente de integración backend.</p>
        </Card>
        <Card className="p-5">
          <h3 className="font-display font-bold mb-2">Documentos</h3>
          <p className="text-sm text-muted-foreground">Pendiente de integración backend.</p>
        </Card>
      </div>
    </DashboardShell>
  );
}
