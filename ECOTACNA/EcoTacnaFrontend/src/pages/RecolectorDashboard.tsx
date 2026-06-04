import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Clock, Droplets, Package, ShieldCheck, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { getStoredAuth } from "@/services/authStorage";
import { ApiError } from "@/services/apiClient";
import { recolectorApi } from "@/services/recolectorApi";
import { recolectorNav } from "./recolector/recolectorNav";

const emptySolicitudes = "No hay solicitudes aceptadas todavia.";
const emptyRecojos = "No hay recojos programados para hoy.";

const asNumber = (value: unknown) => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : 0;
};

const formatDate = (value: unknown) => {
  if (!value) return "Sin fecha";
  const date = new Date(String(value));
  return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleString("es-PE");
};

const normalizeSolicitud = (item: any) => ({
  ...item,
  rowId: item.id ?? item.solicitudId ?? item.recoleccionId,
  empresa: item.empresa ?? item.empresaRazonSocial ?? "No registrado",
  fecha: item.fechaProgramadaTexto ?? item.fechaVisible ?? formatDate(item.fechaProgramada ?? item.fechaSolicitud),
  volumen: asNumber(item.volumenAproximado ?? item.litrosVisibles),
  estado: item.estado ?? "PENDIENTE",
});

const RecolectorDashboard = () => {
  const auth = getStoredAuth();
  const [user, setUser] = useState({
    name: auth?.companyName || auth?.email || "Cargando...",
    sub: auth?.email || "Cargando...",
  });
  const [dashboard, setDashboard] = useState<any>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [recojos, setRecojos] = useState<any[]>([]);
  const [messageSolicitudes, setMessageSolicitudes] = useState<string | null>(null);
  const [messageRecojos, setMessageRecojos] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const resDashboard = await recolectorApi.getDashboard();
        if (resDashboard.success && resDashboard.data) {
          const d = resDashboard.data as Record<string, any>;
          setDashboard(d);
          setUser({
            name: d.razonSocial || auth?.companyName || "Sin nombre",
            sub: d.correo || auth?.email || "Sin correo",
          });
          
          if (auth && d.estado && auth.subscriptionStatus !== d.estado) {
            import("@/services/authStorage").then(({ saveAuth }) => {
              saveAuth({ ...auth, subscriptionStatus: d.estado });
            });
          }
        }
      } catch (error: any) {
        const message = error instanceof ApiError && error.isAuthError
          ? "No autorizado. Vuelve a iniciar sesion."
          : (error.message || "No se pudo cargar el dashboard.");
        setMessageSolicitudes(message);
        setMessageRecojos(message);
      }

      try {
        const resSolicitudes = await recolectorApi.getSolicitudesAceptadas();
        if (resSolicitudes.success) {
          const rows = (resSolicitudes.data || []).map(normalizeSolicitud);
          setSolicitudes(rows);
          setRecojos(rows);
          setMessageSolicitudes(rows.length ? null : emptySolicitudes);
          setMessageRecojos(rows.length ? null : emptyRecojos);
          return;
        }

        setSolicitudes([]);
        setRecojos([]);
        setMessageSolicitudes(resSolicitudes.message || emptySolicitudes);
        setMessageRecojos(resSolicitudes.message || emptyRecojos);
      } catch (error: any) {
        const message = error instanceof ApiError && error.isAuthError
          ? "No autorizado. Vuelve a iniciar sesion."
          : (error.message || emptySolicitudes);
        setSolicitudes([]);
        setRecojos([]);
        setMessageSolicitudes(message);
        setMessageRecojos(message === emptySolicitudes ? emptyRecojos : message);
      }
    };

    loadData();
  }, []);

  return (
    <DashboardShell role="Recolector" user={user} nav={recolectorNav}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-success text-success-foreground">
              <ShieldCheck className="h-3 w-3 mr-1" /> Recolector autorizado
            </Badge>
            {dashboard?.ruc ? <Badge variant="outline">RUC {dashboard.ruc}</Badge> : null}
          </div>
          <h1 className="font-display text-3xl font-bold">{dashboard?.razonSocial || auth?.companyName || "Cargando..."}</h1>
          <p className="text-sm text-muted-foreground">{dashboard?.correo || auth?.email || ""} · Operaciones del recolector</p>
        </div>
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link to="/recolector/recojos-dia">Ver recojos del dia</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Clock} label="Recojos pendientes" value={String(dashboard?.recojosPendientes ?? 0)} tone="warning" />
        <StatCard icon={Truck} label="Recojos vinculados" value={String(dashboard?.recojosVinculados ?? recojos.length)} tone="primary" />
        <StatCard icon={Droplets} label="Litros acumulados" value={String(dashboard?.litrosAcumulados ?? 0)} unit="L" tone="success" />
        <StatCard icon={Package} label="Solicitudes aceptadas" value={String(dashboard?.solicitudesAceptadas ?? solicitudes.length)} tone="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2 flex flex-col items-start justify-center min-h-[320px] bg-muted/20 border-dashed">
          <h3 className="font-display font-bold mb-2">Mapa operativo</h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            El mapa operativo centralizado esta disponible en el modulo dedicado y opera
            como mapa referencial de aceptacion voluntaria sin GPS ni APIs externas.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/recolector/mapa-operativo">Abrir mapa operativo</Link>
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold mb-3">Resumen operativo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Correo</span><span>{dashboard?.correo || auth?.email || "No registrado"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{dashboard?.tipoEmpresa || "RECOLECTORA"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">RUC</span><span>{dashboard?.ruc || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Estado</span><span>{dashboard?.estado || "-"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Recojos pendientes</span><span>{dashboard?.recojosPendientes ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Litros historico</span><span>{dashboard?.litrosAcumulados ?? 0} L</span></div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-bold mb-4">Solicitudes aceptadas</h3>
          {solicitudes.length === 0 ? (
            <div className="text-muted-foreground">{messageSolicitudes || emptySolicitudes}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Volumen</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {solicitudes.map((solicitud) => (
                  <TableRow key={solicitud.rowId}>
                    <TableCell className="font-mono text-xs">{solicitud.rowId}</TableCell>
                    <TableCell>{solicitud.empresa}</TableCell>
                    <TableCell>{solicitud.fecha}</TableCell>
                    <TableCell>{solicitud.volumen.toFixed(2)} L</TableCell>
                    <TableCell>{solicitud.estado === "ASIGNADA" ? "ACEPTADA" : solicitud.estado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold mb-4">Recojos del dia</h3>
          {recojos.length === 0 ? (
            <div className="text-muted-foreground">{messageRecojos || emptyRecojos}</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Recoleccion</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Litros</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recojos.map((recojo) => (
                  <TableRow key={recojo.rowId}>
                    <TableCell className="font-mono text-xs">{recojo.rowId}</TableCell>
                    <TableCell>{recojo.empresa}</TableCell>
                    <TableCell>{recojo.fecha}</TableCell>
                    <TableCell>{recojo.volumen.toFixed(2)} L</TableCell>
                    <TableCell>{recojo.estado}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </div>
    </DashboardShell>
  );
};

export default RecolectorDashboard;
