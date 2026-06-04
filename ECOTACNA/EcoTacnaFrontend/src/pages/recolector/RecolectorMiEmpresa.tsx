import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardShell } from "@/components/DashboardShell";
import { getStoredAuth } from "@/services/authStorage";
import { recolectorApi } from "@/services/recolectorApi";
import { recolectorNav } from "./recolectorNav";

const Field = ({ label, value, className = "" }: { label: string; value: string; className?: string }) => (
  <div className={className}>
    <Label>{label}</Label>
    <Input value={value} readOnly />
  </div>
);

export default function RecolectorMiEmpresa() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Recolector", sub: auth?.email || "No autenticado" });
  const [perfil, setPerfil] = useState<any>(null);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadPerfil = async () => {
      try {
        const res = await recolectorApi.getPerfil();
        if (res.success && res.data) {
          setPerfil(res.data);
          setUser({ name: res.data.razonSocial, sub: res.data.correo || `RUC ${res.data.ruc}` });
          return;
        }
        setMessage(res.message || "No se pudo cargar el perfil");
      } catch (error: any) {
        setMessage(error.message || "No se pudo cargar el perfil");
      }
    };
    loadPerfil();
  }, []);

  return (
    <DashboardShell role="Recolector" user={user} nav={recolectorNav}>
      <div className="mb-6">
        <Badge className="bg-accent text-accent-foreground mb-2">Perfil recolector</Badge>
        {message ? <Badge variant="outline" className="ml-2 text-destructive border-destructive">{message}</Badge> : null}
        <h1 className="font-display text-3xl font-bold">Mi empresa</h1>
        <p className="text-sm text-muted-foreground">Datos reales de la empresa recolectora.</p>
      </div>
      {perfil ? (
        <Card className="p-5">
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Razón social" value={perfil.razonSocial || "No registrado"} />
            <Field label="RUC" value={perfil.ruc || "No registrado"} />
            <Field label="Correo operativo" value={perfil.correo || "No registrado"} />
            <Field label="Tipo de empresa" value={perfil.tipoEmpresa || "No registrado"} />
            <Field label="Dirección" value={perfil.direccion || "No registrado"} className="sm:col-span-2" />
          </div>
        </Card>
      ) : (
        <Card className="p-5 text-muted-foreground">{message || "No se pudo cargar el perfil"}</Card>
      )}
    </DashboardShell>
  );
}
