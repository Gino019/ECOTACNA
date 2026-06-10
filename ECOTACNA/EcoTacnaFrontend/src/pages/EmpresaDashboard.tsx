import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { Droplets, Package, ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { empresaApi } from "@/services/empresaApi";
import { getStoredAuth } from "@/services/authStorage";
import { empresaNav } from "./empresa/empresaNav";


export default function EmpresaDashboard() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({
    name: auth?.companyName || "Información no disponible",
    sub: auth?.email || "No autenticado",
  });
  const [perfil, setPerfil] = useState<any>(null);
  const [resumen, setResumen] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resPerfil, resResumen] = await Promise.all([
          empresaApi.getPerfil(),
          empresaApi.getResumen()
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

        if (resResumen.success) {
          setResumen(resResumen.data);
        } else if (!resResumen.success) {
          setError((prev) => prev || resResumen.message || "No se pudo cargar el resumen");
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
          <h1 className="font-display text-3xl font-bold">{perfil?.razonSocial || auth?.companyName || "Información no disponible"}</h1>
          <p className="text-sm text-muted-foreground">{perfil?.direccion || "No autenticado"} · Panel de empresa generadora</p>
        </div>
        <Button asChild size="lg" className="bg-gradient-eco shadow-eco h-12">
          <Link to="/empresa/solicitar-recojo">Solicitar recojo</Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-2 gap-4 mb-6">
        <StatCard icon={Droplets} label="Litros reciclados" value={String(totalLitrosReciclados)} unit="L" tone="primary" />
        <StatCard icon={Package} label="Solicitudes" value={String(totalSolicitudes)} tone="warning" />
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5">
          <h3 className="font-display font-bold mb-2">Información</h3>
          <p className="text-sm text-muted-foreground">Panel de empresa generadora de aceite usado.</p>
        </Card>
      </div>
    </DashboardShell>
  );
}
