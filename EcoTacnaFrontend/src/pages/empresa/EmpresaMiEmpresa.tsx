import { useEffect, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { empresaApi } from "@/services/empresaApi";
import { ApiError } from "@/services/apiClient";
import { getStoredAuth } from "@/services/authStorage";
import { empresaNav } from "./empresaNav";

const Field = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className={className}>
    <Label>{label}</Label>
    <Input value={value} readOnly />
  </div>
);
interface PerfilEmpresa {
  razonSocial: string;
  ruc: string;
  correo?: string;
  tipoEmpresa: string;
  direccion: string;
  creadoEn?: string;
}

export default function EmpresaMiEmpresa() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Empresa", sub: auth?.email || "No autenticado" });
  const [perfil, setPerfil] = useState<PerfilEmpresa | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPerfil = async () => {
      try {
        const res = await empresaApi.getPerfil();
        if (res.success && res.data) {
          setPerfil(res.data);
          setUser({ name: res.data.razonSocial, sub: res.data.correo || `RUC ${res.data.ruc}` });
          return;
        }
        setMessage(res.message || "Perfil no encontrado en backend");
      } catch (error: unknown) {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            setMessage("Sesión expirada");
            return;
          }
          if (error.status === 403) {
            setMessage("No autorizado");
            return;
          }
        }
        setMessage(error instanceof Error ? error.message : "Error de red");
      }
    };

    loadPerfil();
  }, []);

  return (
    <DashboardShell role="Empresa" user={user} nav={empresaNav}>
      <div className="mb-6">
        <Badge className="bg-primary text-primary-foreground mb-2">Perfil empresarial</Badge>
        {message ? <Badge variant="outline" className="ml-2 text-destructive border-destructive">{message}</Badge> : null}
        <h1 className="font-display text-3xl font-bold">Mi empresa</h1>
        <p className="text-sm text-muted-foreground">Datos reales leídos desde backend.</p>
      </div>

      {perfil ? (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-display font-bold">{perfil.razonSocial}</h3>
              <p className="text-xs text-muted-foreground">RUC {perfil.ruc}</p>
            </div>
            <Badge className="bg-success text-success-foreground">
              <ShieldCheck className="h-3 w-3 mr-1" /> {perfil.tipoEmpresa}
            </Badge>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Razón social" value={perfil.razonSocial} />
            <Field label="RUC" value={perfil.ruc} />
            <Field label="Correo operativo" value={perfil.correo || "No registrado"} />
            <Field label="Tipo de empresa" value={perfil.tipoEmpresa} />
            <Field label="Dirección operativa" value={perfil.direccion} className="sm:col-span-2" />
            <Field label="Creado en" value={perfil.creadoEn ? new Date(perfil.creadoEn).toLocaleString("es-PE") : "No registrado"} className="sm:col-span-2" />
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-muted-foreground">{message === "Perfil no encontrado" ? "Perfil no encontrado en backend" : (message || "Perfil no encontrado en backend")}</Card>
      )}
    </DashboardShell>
  );
}
