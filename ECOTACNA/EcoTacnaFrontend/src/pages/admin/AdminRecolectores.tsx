import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck, Check, Download, Eye, Filter, Search, ShieldCheck, X } from "lucide-react";
import { adminNav, adminUser } from "./adminNav";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/services/adminApi";

const SkeletonRow = ({ cols = 6 }: { cols?: number }) => (
  <TableRow>
    {Array.from({ length: cols }).map((_, i) => (
      <TableCell key={i}><div className="h-4 bg-muted animate-pulse rounded-md" /></TableCell>
    ))}
  </TableRow>
);

export default function AdminRecolectores() {
  const navigate = useNavigate();
  const [data, setData]       = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getEmpresas()
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const recolectores = res.data.filter((e: any) => e.tipo?.toString().toUpperCase() === "RECOLECTOR");
          setData(recolectores);
        }
        else setData([]);
      })
      .catch(err => {
        if (err.isAuthError) { toast.error("Sesión expirada"); navigate("/login"); }
        else { setData([]); toast.error("Error al cargar recolectores"); }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  const pendientes = data.filter((e: any) => !e.verificada || e.estado?.toString().toUpperCase() === "PENDIENTE");
  const activas    = data.filter((e: any) => e.verificada || ["ACTIVA", "ACTIVO", "REGISTRADA", "REGISTRADO"].includes(e.estado?.toString().toUpperCase()));

  return (
    <DashboardShell role="Administrador" user={adminUser} nav={adminNav}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-secondary text-secondary-foreground">Módulo administrativo</Badge>
            <Badge variant="outline" className="border-eco/40 text-eco"><ShieldCheck className="h-3 w-3 mr-1"/> Registro validado</Badge>
          </div>
          <h1 className="font-display text-3xl font-bold">Empresas Recolectoras</h1>
          <p className="text-sm text-muted-foreground">Alta, validación y seguimiento de empresas de recolección.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled title="Funcionalidad diferida"><Filter className="h-4 w-4 mr-1.5"/> Filtrar</Button>
          <Button size="sm" className="bg-gradient-eco" disabled title="Funcionalidad diferida"><Download className="h-4 w-4 mr-1.5"/> Exportar</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        <StatCard icon={Truck}       label="Recolectores totales" value={loading ? "—" : data.length}             tone="primary" />
        <StatCard icon={ShieldCheck} label="Verificados"          value={loading ? "—" : activas.length}          tone="success" />
        <StatCard icon={Search}      label="Pendientes"           value={loading ? "—" : pendientes.length}       tone="warning" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-display font-bold">Listado de recolectores</h3>
              <p className="text-xs text-muted-foreground">Empresas recolectoras registradas en el sistema.</p>
            </div>
            <Button size="sm" variant="outline" disabled title="Alta manual diferida">Nuevo recolector</Button>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[180px]">Empresa / Razón social</TableHead>
                  <TableHead className="min-w-[110px]">RUC</TableHead>
                  <TableHead className="min-w-[100px]">Distrito</TableHead>
                  <TableHead className="min-w-[130px]">Responsable</TableHead>
                  <TableHead className="min-w-[100px]">Estado</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} cols={6} />)
                  : data.length === 0
                    ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Sin recolectores registrados</TableCell></TableRow>
                    : data.map((e: any) => (
                      <TableRow key={e.id}>
                        <TableCell className="max-w-[200px]">
                          <div className="font-semibold text-sm truncate" title={e.nombre}>{e.nombre}</div>
                          {e.tipo && <div className="text-xs text-muted-foreground truncate">{e.tipo}</div>}
                        </TableCell>
                        <TableCell className="font-mono text-xs whitespace-nowrap">{e.ruc}</TableCell>
                        <TableCell className="text-sm whitespace-nowrap">{e.distrito}</TableCell>
                        <TableCell className="text-sm text-muted-foreground whitespace-nowrap">{e.responsable}</TableCell>
                        <TableCell>
                          <Badge className="bg-muted text-muted-foreground">
                            {e.estado || "—"}
                          </Badge>
                        </TableCell>
                        <TableCell><Button size="sm" variant="ghost"><Eye className="h-4 w-4"/></Button></TableCell>
                      </TableRow>
                    ))
                }
              </TableBody>
            </Table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold mb-1">Pendientes de aprobación</h3>
          <p className="text-xs text-muted-foreground mb-4">Recolectores pendientes según estado registrado.</p>
          <div className="space-y-3">
            {loading
              ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="p-3 rounded-xl bg-muted/40 border border-border space-y-2 animate-pulse">
                  <div className="h-4 bg-muted rounded w-3/4" /><div className="h-3 bg-muted rounded w-1/2" />
                </div>
              ))
              : pendientes.length === 0
                ? <div className="text-sm text-muted-foreground text-center py-6">Sin recolectores pendientes</div>
                : pendientes.map((e: any) => (
                  <div key={e.id} className="p-3 rounded-xl bg-muted/40 border border-border">
                    <div className="font-semibold text-sm truncate" title={e.razon}>{e.razon}</div>
                    <div className="text-xs text-muted-foreground mb-3">RUC {e.ruc} · {e.distrito}</div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1" disabled title="Aprobación diferida"><X className="h-3.5 w-3.5 mr-1"/> Rechazar</Button>
                      <Button size="sm" className="flex-1 bg-success text-success-foreground opacity-50 cursor-not-allowed" disabled title="Aprobación diferida"><Check className="h-3.5 w-3.5 mr-1"/> Aprobar</Button>
                    </div>
                  </div>
                ))
            }
          </div>
        </Card>
      </div>
    </DashboardShell>
  );
}
