import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { BarChart3, CalendarClock, Droplets, Filter, Route } from "lucide-react";
import { adminNav, adminUser } from "./adminNav";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/services/adminApi";

const SkeletonRow = ({ cols = 6 }: { cols?: number }) => (
  <TableRow>{Array.from({ length: cols }).map((_, i) => <TableCell key={i}><div className="h-4 bg-muted animate-pulse rounded-md" /></TableCell>)}</TableRow>
);

const ESTADO_COLOR: Record<string, string> = {
  PENDIENTE: "bg-destructive/10 text-destructive border-destructive/20",
  PROGRAMADO: "bg-info/10 text-info border-info/20",
  EN_RUTA: "bg-warning/10 text-warning border-warning/20",
  RECOGIDO: "bg-success/10 text-success border-success/20",
  CANCELADO: "bg-muted text-muted-foreground border-border",
  LIQUIDADO: "bg-primary/10 text-primary border-primary/20"
};

export default function AdminSolicitudes() {
  const navigate = useNavigate();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = () => {
    setLoading(true);
    adminApi.getSolicitudes()
      .then(res => { setData(Array.isArray(res.data) && res.data.length > 0 ? res.data : []); })
      .catch(err => {
        if (err.isAuthError) { toast.error("Sesión expirada"); navigate("/login"); }
        else { setData([]); toast.error(err.message || "Error al cargar solicitudes"); }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [navigate]);

  const pendientes  = data.filter((s: any) => s.estado?.toString().toUpperCase() === "PENDIENTE").length;
  const programadas = data.filter((s: any) => ["PROGRAMADO","PROGRAMADA"].includes(s.estado?.toString().toUpperCase())).length;
  const litros      = data.reduce((sum: number, s: any) => sum + Number(s.litros ?? 0), 0);



  return (
    <DashboardShell role="Administrador" user={adminUser} nav={adminNav}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-secondary text-secondary-foreground">Control operativo</Badge>
          </div>
          <h1 className="font-display text-3xl font-bold">Solicitudes de recojo</h1>
          <p className="text-sm text-muted-foreground">Seguimiento de solicitudes pendientes, programadas, en ruta y cerradas.</p>
        </div>
        <div className="flex gap-2">

          <Button variant="outline"><Filter className="h-4 w-4 mr-1.5"/> Filtrar solicitudes</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={BarChart3}     label="Solicitudes"      value={loading ? "—" : data.length} tone="primary" />
        <StatCard icon={CalendarClock} label="Pendientes"       value={loading ? "—" : pendientes}  tone="warning" />
        <StatCard icon={Route}         label="Programadas"      value={loading ? "—" : programadas} tone="info"    />
        <StatCard icon={Droplets}      label="Litros estimados" value={loading ? "—" : litros} unit="L" tone="success" />
      </div>

      <Card className="p-5">
        <h3 className="font-display font-bold mb-4">Listado de solicitudes</h3>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[110px]">Código</TableHead>
                <TableHead className="min-w-[180px]">Empresa</TableHead>
                <TableHead className="min-w-[140px]">Fecha programada</TableHead>
                <TableHead className="text-right min-w-[80px]">Litros</TableHead>
                <TableHead className="min-w-[100px]">Estado</TableHead>
                <TableHead className="text-right min-w-[180px]">Acciones / Detalle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i}/>)
                : data.length === 0
                  ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin solicitudes registradas</TableCell></TableRow>
                  : data.map((s: any) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{s.id}</TableCell>
                      <TableCell><div className="truncate text-sm font-medium max-w-[180px]" title={s.empresa}>{s.empresa}</div></TableCell>
                      <TableCell className="text-sm whitespace-nowrap">{s.fecha}</TableCell>
                      <TableCell className="text-right font-mono text-sm whitespace-nowrap">{s.litros} L</TableCell>
                      <TableCell><Badge variant="outline" className={ESTADO_COLOR[s.estado] ?? "bg-muted text-muted-foreground"}>{s.estado}</Badge></TableCell>
                      <TableCell className="text-right">
                        {s.estado === "PENDIENTE" ? (
                           <span className="text-xs text-muted-foreground italic">Disponible para aceptación voluntaria</span>
                        ) : s.estado === "PROGRAMADO" || s.estado === "PROGRAMADA" ? (
                          <span className="text-xs text-success italic">Programada</span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">—</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </div>
      </Card>
    </DashboardShell>
  );
}
