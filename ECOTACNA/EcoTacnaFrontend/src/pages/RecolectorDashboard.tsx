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
import { recolectorApi } from "@/services/recolectorApi";
import { recolectorNav } from "./recolector/recolectorNav";

const RecolectorDashboard = () => {
  const auth = getStoredAuth();
  const [user, setUser] = useState({
    name: auth?.companyName || "Recolector",
    sub: auth?.email || "No autenticado",
  });
  const [perfil, setPerfil] = useState<any>(null);
  const [resumen, setResumen] = useState<any>(null);
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [recojos, setRecojos] = useState<any[]>([]);
  const [messageSolicitudes, setMessageSolicitudes] = useState<string | null>(null);
  const [messageRecojos, setMessageRecojos] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resPerfil, resResumen, resSolicitudes, resRecojos] = await Promise.all([
          recolectorApi.getPerfil(),
          recolectorApi.getResumen(),
          recolectorApi.getSolicitudes(),
          recolectorApi.getSolicitudes(),
        ]);

        if (resPerfil.success && resPerfil.data) {
          setPerfil(resPerfil.data);
          setUser({
            name: resPerfil.data.razonSocial,
            sub: resPerfil.data.correo || `RUC ${resPerfil.data.ruc}`,
          });
        }

        if (resResumen.success && resResumen.data) {
          setResumen(resResumen.data);
        }

        if (resSolicitudes.success) {
          setSolicitudes(resSolicitudes.data || []);
          if (!resSolicitudes.data?.length) {
            setMessageSolicitudes("No hay solicitudes aceptadas todavia.");
          }
        } else {
          setMessageSolicitudes(resSolicitudes.message || "No hay solicitudes aceptadas todavia.");
        }

        if (resRecojos.success) {
          setRecojos(resRecojos.data || []);
          if (!resRecojos.data?.length) {
            setMessageRecojos("No hay recojos programados para hoy.");
          }
        } else {
          setMessageRecojos(resRecojos.message || "No hay recojos programados para hoy.");
        }
      } catch (error: any) {
        setMessageSolicitudes(error.message || "No hay solicitudes aceptadas todavia.");
        setMessageRecojos(error.message || "No hay recojos programados para hoy.");
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
            {perfil?.ruc ? <Badge variant="outline">RUC {perfil.ruc}</Badge> : null}
          </div>
          <h1 className="font-display text-3xl font-bold">{perfil?.razonSocial || auth?.companyName || "Recolector"}</h1>
          <p className="text-sm text-muted-foreground">{perfil?.direccion || "No autenticado"} · Operaciones del recolector</p>
        </div>
        <Button asChild size="lg" variant="outline" className="h-12">
          <Link to="/recolector/recojos-dia">Ver recojos del dia</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Clock} label="Recojos pendientes" value={String(resumen?.recojosPendientes ?? 0)} tone="warning" />
        <StatCard icon={Truck} label="Recojos vinculados" value={String(recojos.length)} tone="primary" />
        <StatCard icon={Droplets} label="Litros acumulados" value={String(resumen?.litrosRecolectadosHistorico ?? 0)} unit="L" tone="success" />
        <StatCard icon={Package} label="Solicitudes aceptadas" value={String(solicitudes.length)} tone="accent" />
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        <Card className="p-5 lg:col-span-2 flex flex-col items-start justify-center min-h-[320px] bg-muted/20 border-dashed">
          <h3 className="font-display font-bold mb-2">Mapa operativo</h3>
          <p className="text-sm text-muted-foreground max-w-xl">
            El mapa operativo centralizado está disponible en el módulo dedicado y opera
            como mapa referencial de aceptación voluntaria sin GPS ni APIs externas.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/recolector/mapa-operativo">Abrir mapa operativo</Link>
          </Button>
        </Card>

        <Card className="p-5">
          <h3 className="font-display font-bold mb-3">Resumen operativo</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Correo</span><span>{perfil?.correo || auth?.email || "No registrado"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Tipo</span><span>{perfil?.tipoEmpresa || "No registrado"}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Recojos pendientes</span><span>{resumen?.recojosPendientes ?? 0}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Litros historico</span><span>{resumen?.litrosRecolectadosHistorico ?? 0} L</span></div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-bold mb-4">Solicitudes aceptadas</h3>
          {solicitudes.length === 0 ? (
            <div className="text-muted-foreground">{messageSolicitudes || "No hay solicitudes aceptadas todavia."}</div>
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
                  <TableRow key={solicitud.id}>
                    <TableCell className="font-mono text-xs">{solicitud.id}</TableCell>
                    <TableCell>{solicitud.empresa}</TableCell>
                    <TableCell>{solicitud.fechaProgramadaTexto}</TableCell>
                    <TableCell>{solicitud.volumenAproximado.toFixed(2)} L</TableCell>
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
            <div className="text-muted-foreground">{messageRecojos || "No hay recojos programados para hoy."}</div>
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
                  <TableRow key={recojo.recoleccionId}>
                    <TableCell className="font-mono text-xs">{recojo.recoleccionId}</TableCell>
                    <TableCell>{recojo.empresa}</TableCell>
                    <TableCell>{recojo.fechaVisible}</TableCell>
                    <TableCell>{recojo.litrosVisibles.toFixed(2)} L</TableCell>
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
