import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Building2, Truck, Receipt, FileCheck2, Droplets, Award,
  AlertCircle, Check, X, Eye, Download, Filter, Settings, MapPin, BarChart3, PieChart
} from "lucide-react";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/services/adminApi";
import { adminNav, adminUser } from "./admin/adminNav";

const AdminDashboard = () => {
  const navigate = useNavigate();

  // ─── estados ──────────────────────────────────────────────────────────────
  const [kpis, setKpis] = useState<any>(null);
  
  // tablas
  const [empresasList, setEmpresasList] = useState<any[]>([]);
  const [solicitudesPendientes, setSolicitudesPendientes] = useState<any[]>([]);
  const [recolectoresPendientes, setRecolectoresPendientes] = useState<any[]>([]);

  // flags de carga por sección
  const [loadingResumen, setLoadingResumen] = useState(true);
  const [loadingEmpresas, setLoadingEmpresas] = useState(true);

  // ─── carga paralela ───────────────────────────────────────────────────────
  useEffect(() => {
    let authFailed = false;
    const handleAuthError = () => {
      if (!authFailed) { authFailed = true; toast.error("Sesión expirada. Redirigiendo al login..."); navigate("/login"); }
    };

    // 1) KPIs
    adminApi.getResumen()
      .then(res => {
        const d = res.data;
        if (!d) return;
        setKpis({
          litros:       d.litros       ?? 0,
          empresas:     d.empresas     ?? 0,
          recolectores: d.recolectores ?? 0,
          pendientes:   d.pendientes   ?? 0,
          pagos:        d.pagos        ?? 0,
          certificados: d.certificados ?? 0,
        });
      })
      .catch(err => {
        if (err.isAuthError) handleAuthError();
        else toast.error("Error al cargar KPIs generales");
      })
      .finally(() => setLoadingResumen(false));

    // 2) Empresas
    adminApi.getEmpresas()
      .then(res => { if (Array.isArray(res.data)) setEmpresasList(res.data); })
      .catch(err => { if (err.isAuthError) handleAuthError(); })
      .finally(() => setLoadingEmpresas(false));

    // 3) Liquidaciones removidas en MVP

    // 4) Solicitudes pendientes
    adminApi.getSolicitudes()
      .then(res => {
        if (Array.isArray(res.data))
          setSolicitudesPendientes(res.data.filter((s:any) => s.estado?.toString().toUpperCase() === "PENDIENTE"));
      })
      .catch(err => { if (err.isAuthError) handleAuthError(); });

    // 5) Recolectores pendientes
    adminApi.getUsuarios()
      .then(res => {
        if (Array.isArray(res.data)) {
          const recs = res.data.filter((u:any) => ["RECOLECTOR","REC"].includes(u.rol?.toString().toUpperCase() ?? "") && u.estado?.toString().toUpperCase() === "PENDIENTE");
          setRecolectoresPendientes(recs);
        }
      })
      .catch(err => { if (err.isAuthError) handleAuthError(); });

  }, [navigate]);

  return (
    <DashboardShell role="Administrador" user={adminUser} nav={adminNav}>

      {/* Encabezado */}
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge className="bg-secondary text-secondary-foreground">Administración general</Badge>
          </div>
          <h1 className="font-display text-3xl font-bold">Panel de control institucional</h1>
          <p className="text-sm text-muted-foreground">
            Monitoreo en tiempo real de la operación EcoTacna en la región Tacna.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled title="Pendiente de integración"><Filter className="h-4 w-4 mr-1.5"/> Filtros</Button>
          <Button size="sm" className="bg-gradient-eco" disabled title="Pendiente de integración"><Download className="h-4 w-4 mr-1.5"/> Exportar reporte</Button>
        </div>
      </div>

      {/* KPIs — fuente: GET /api/admin/resumen */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {loadingResumen
          ? Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-4 space-y-2 animate-pulse">
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-7 bg-muted rounded w-1/2" />
            </div>
          ))
          : <>
            <StatCard icon={Droplets}    label="Litros recolectados"    value={(kpis?.litros ?? 0).toLocaleString()} unit="L" tone="primary" />
            <StatCard icon={Building2}   label="Empresas activas"       value={kpis?.empresas ?? 0}                  tone="success" />
            <StatCard icon={Truck}       label="Recolectores"           value={kpis?.recolectores ?? 0}              tone="accent"  />
            <StatCard icon={AlertCircle} label="Solicitudes pendientes" value={kpis?.pendientes ?? 0}                tone="warning" />
            <StatCard icon={Receipt}     label="Pagos procesados"       value={`S/ ${(kpis?.pagos ?? 0).toLocaleString()}`} tone="info" />
            <StatCard icon={Award}       label="Certificados emitidos"  value={kpis?.certificados ?? 0}              tone="primary" />
          </>
        }
      </div>

      {/* Gráficos — Pendientes de integración backend */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2 flex flex-col items-center justify-center text-center bg-muted/20 min-h-[300px]">
          <BarChart3 className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-display font-bold text-muted-foreground">Litros recolectados por distrito</h3>
          <p className="text-sm text-muted-foreground mt-1">Pendiente de integración backend</p>
        </Card>

        <Card className="p-5 flex flex-col items-center justify-center text-center bg-muted/20 min-h-[300px]">
          <PieChart className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-display font-bold text-muted-foreground">Solicitudes por estado</h3>
          <p className="text-sm text-muted-foreground mt-1">Pendiente de integración backend</p>
        </Card>
      </div>

      {/* Mapa + recojos por mes — Pendientes de integración backend */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2 flex flex-col items-center justify-center text-center bg-muted/20 min-h-[300px]">
          <MapPin className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-display font-bold text-muted-foreground">Mapa operativo territorial</h3>
          <p className="text-sm text-muted-foreground mt-1">Mapa operativo referencial · Sin GPS ni geolocalización real</p>
        </Card>

        <Card className="p-5 flex flex-col items-center justify-center text-center bg-muted/20 min-h-[300px]">
          <BarChart3 className="h-8 w-8 text-muted-foreground mb-3 opacity-50" />
          <h3 className="font-display font-bold text-muted-foreground">Recolecciones por mes</h3>
          <p className="text-sm text-muted-foreground mt-1">Pendiente de integración backend</p>
        </Card>
      </div>

      {/* Tablas pendientes: fuente: GET /api/admin/solicitudes + GET /api/admin/usuarios */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Solicitudes pendientes de recojo</h3>
            <Badge variant="outline">{solicitudesPendientes.length}</Badge>
          </div>
          <div className="space-y-3">
            {solicitudesPendientes.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                <div>
                  <div className="font-semibold text-sm">{s.empresa || s.razon || s.nombre}</div>
                  <div className="text-xs text-muted-foreground">
                    {s.distrito} · {s.litros ?? 0} L · {s.fecha ?? ""}
                  </div>
                </div>
                <div className="flex items-center text-right">
                  <span className="text-[11px] text-muted-foreground italic leading-tight max-w-[100px]">
                    Disponible para aceptación voluntaria
                  </span>
                </div>
              </div>
            ))}
            {solicitudesPendientes.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">Sin solicitudes pendientes</div>
            )}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold">Recolectores pendientes</h3>
            <Badge variant="outline">{recolectoresPendientes.length}</Badge>
          </div>
          <div className="space-y-3">
            {recolectoresPendientes.map((r: any) => (
              <div key={r.id ?? r.correo} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border border-border">
                <div>
                  <div className="font-semibold text-sm">{r.empresa ?? r.nombre ?? r.correo}</div>
                  <div className="text-xs text-muted-foreground">
                    {r.responsable ?? ""}{Array.isArray(r.cobertura) ? ` · ${r.cobertura.join(", ")}` : ""}
                  </div>
                </div>
                <div className="flex gap-1.5">
                  <Button size="sm" variant="outline" className="h-8"
                    onClick={() => toast.error("Pendiente de integración backend")} disabled>
                    <X className="h-3.5 w-3.5"/>
                  </Button>
                  <Button size="sm" className="h-8 bg-success hover:bg-success/90 text-success-foreground"
                    onClick={() => toast.success("Pendiente de integración backend")} disabled>
                    <Check className="h-3.5 w-3.5 mr-1"/> Autorizar
                  </Button>
                </div>
              </div>
            ))}
            {recolectoresPendientes.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-6">Sin recolectores pendientes</div>
            )}
          </div>

          <div className="mt-5 pt-4 border-t border-border space-y-2">
            <div className="text-xs text-muted-foreground mb-2">Acciones rápidas</div>
            <div className="grid grid-cols-2 gap-2">
              <Button size="sm" variant="outline" className="justify-start" disabled title="Pendiente de integración">
                <Settings className="h-3.5 w-3.5 mr-1.5"/> Precio por litro
              </Button>
              <Button size="sm" variant="outline" className="justify-start" disabled title="Pendiente de integración">
                <FileCheck2 className="h-3.5 w-3.5 mr-1.5"/> Auditoría
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Empresas registradas — fuente: GET /api/admin/empresas */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-display font-bold">Empresas registradas</h3>
            <p className="text-xs text-muted-foreground">Listado general de generadores activos</p>
          </div>
          <Button size="sm" variant="outline" onClick={() => navigate('/admin/empresas')}><Eye className="h-4 w-4 mr-1.5"/> Ver todas</Button>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[180px]">Empresa</TableHead>
                <TableHead className="min-w-[110px]">RUC</TableHead>
                <TableHead className="min-w-[90px]">Distrito</TableHead>
                <TableHead className="min-w-[130px]">Responsable</TableHead>
                <TableHead className="text-right min-w-[80px]">Litros</TableHead>
                <TableHead className="min-w-[100px]">Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingEmpresas
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>{Array.from({ length: 7 }).map((__, j) => <TableCell key={j}><div className="h-4 bg-muted animate-pulse rounded" /></TableCell>)}</TableRow>
                ))
                : empresasList.length === 0
                  ? <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No hay registros para mostrar</TableCell></TableRow>
                  : empresasList.slice(0, 5).map((e: any) => (
                    <TableRow key={e.id}>
                      <TableCell className="max-w-[200px]">
                        <div className="font-medium text-sm truncate" title={e.nombre}>{e.nombre || "—"}</div>
                        {e.tipo && <div className="text-xs text-muted-foreground truncate">{e.tipo}</div>}
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap">{e.ruc}</TableCell>
                      <TableCell className="whitespace-nowrap">{e.distrito}</TableCell>
                      <TableCell className="whitespace-nowrap text-muted-foreground text-sm">{e.responsable}</TableCell>
                      <TableCell className="text-right font-mono whitespace-nowrap">{Number(e.litros ?? 0).toLocaleString()} L</TableCell>
                      <TableCell><Badge className="bg-muted text-muted-foreground">{e.estado || "—"}</Badge></TableCell>
                      <TableCell><Button size="sm" variant="ghost" disabled><Eye className="h-4 w-4"/></Button></TableCell>
                    </TableRow>
                  ))
              }
            </TableBody>
          </Table>
        </div>
      </Card>

    </DashboardShell>
  );
};

export default AdminDashboard;
