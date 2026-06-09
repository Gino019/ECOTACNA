import { DashboardShell } from "@/components/DashboardShell";
import { StatCard } from "@/components/StatCard";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MailCheck, Plus, Shield, Users, Save } from "lucide-react";
import { toast } from "sonner";
import { adminNav, adminUser } from "./adminNav";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "@/services/adminApi";

const INSTITUTIONAL_DOMAIN = "@virtual.upt.pe";

const SkeletonRow = () => (
  <TableRow>
    {Array.from({ length: 6 }).map((_, i) => (
      <TableCell key={i}><div className="h-4 bg-muted animate-pulse rounded-md w-full" /></TableCell>
    ))}
  </TableRow>
);

interface AdminUsuario {
  id?: string | number;
  nombre?: string;
  correo: string;
  rol?: string;
  empresa?: string;
  acceso?: string;
  estado?: string;
  creadoEn?: string;
}

export default function AdminUsuarios() {
  const navigate = useNavigate();
  const [data, setData]       = useState<AdminUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getUsuarios()
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setData(res.data);
        } else {
          setData([]);
        }
      })
      .catch(err => {
        if (err.isAuthError) {
          toast.error("Sesión expirada");
          navigate("/login");
        } else {
          setData([]);
          toast.error("Error al cargar usuarios");
        }
      })
      .finally(() => setLoading(false));
  }, [navigate]);

  return (
    <DashboardShell role="Administrador" user={adminUser} nav={adminNav}>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-secondary text-secondary-foreground">Seguridad</Badge>
          </div>
          <h1 className="font-display text-3xl font-bold">Usuarios administradores</h1>
          <p className="text-sm text-muted-foreground">Correos institucionales autorizados para acceso al panel. Dominio permitido: <strong>{INSTITUTIONAL_DOMAIN}</strong>.</p>
        </div>
        <Button className="bg-gradient-eco" disabled title="Alta de administradores diferida para una fase posterior">
          <Plus className="h-4 w-4 mr-1.5"/> Agregar correo
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard icon={Users}    label="Usuarios"  value={loading ? "—" : data.length} tone="primary" />
        <StatCard icon={Shield}   label="Activos"   value={loading ? "—" : data.filter((a) => a.estado?.toString().toUpperCase() === "ACTIVO").length} tone="success" />
        <StatCard icon={MailCheck} label="Con OTP"  value={loading ? "—" : data.length} tone="info"    />
        <StatCard icon={Shield}   label="Permitidos" value="5 máx."                     tone="accent"  />
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold">Correos institucionales autorizados</h3>
          <Badge variant="outline">Tabla: administradores_autorizados</Badge>
        </div>
          <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[160px]">Nombre</TableHead>
              <TableHead className="min-w-[200px]">Correo</TableHead>
              <TableHead className="min-w-[90px]">Rol</TableHead>
              <TableHead className="min-w-[170px]">Empresa</TableHead>
              <TableHead className="min-w-[100px]">Estado</TableHead>
              <TableHead className="min-w-[140px]">Registrado</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading
              ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
              : data.length === 0
                ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                      Sin usuarios registrados
                    </TableCell>
                  </TableRow>
                )
                : data.map((a) => (
                  <TableRow key={a.correo ?? a.id}>
                    <TableCell>
                      <div className="font-semibold text-sm">{a.nombre || "Sin nombre registrado"}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap">{a.correo}</TableCell>
                    <TableCell><Badge className="bg-secondary text-secondary-foreground">{a.rol}</Badge></TableCell>
                    <TableCell className="text-sm">
                      <div className="truncate max-w-[170px]" title={a.empresa}>{a.empresa || a.acceso || "—"}</div>
                    </TableCell>
                    <TableCell>
                      <Badge className={a.estado?.toString().toUpperCase() === "ACTIVO"
                        ? "bg-success/15 text-success border-success/30"
                        : "bg-warning/15 text-warning border-warning/30"}>
                        {a.estado || "—"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{a.creadoEn || "—"}</TableCell>
                    <TableCell><Button size="sm" variant="outline" disabled title="Edición diferida para una fase posterior">Editar</Button></TableCell>
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

const AgregarCorreoDialog = () => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="bg-gradient-eco"><Plus className="h-4 w-4 mr-1.5"/> Agregar correo</Button>
    </DialogTrigger>
    <DialogContent className="max-w-xl">
      <DialogHeader>
        <DialogTitle>Agregar administrador autorizado</DialogTitle>
        <DialogDescription>
          Este formulario representa el registro que luego se guardará en PostgreSQL, tabla administradores_autorizados.
        </DialogDescription>
      </DialogHeader>
      <div className="grid sm:grid-cols-2 gap-4 py-2">
        <div className="space-y-1.5">
          <Label>Nombre completo</Label>
          <Input placeholder="Ej. Juan Pérez" />
        </div>
        <div className="space-y-1.5">
          <Label>Cargo / área</Label>
          <Input placeholder="Ej. Administrador EcoTacna" />
        </div>
        <div className="space-y-1.5 sm:col-span-2">
          <Label>Correo institucional</Label>
          <Input type="email" placeholder={`nombre.apellido${INSTITUTIONAL_DOMAIN}`} pattern={`.*\\${INSTITUTIONAL_DOMAIN.replace(".", "\\.")}$`} />
          <p className="text-[11px] text-muted-foreground">Solo se aceptan correos terminados en {INSTITUTIONAL_DOMAIN}.</p>
        </div>
        <div className="space-y-1.5">
          <Label>Rol</Label>
          <Select defaultValue="ADMIN"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ADMIN">ADMIN</SelectItem></SelectContent></Select>
        </div>
        <div className="space-y-1.5">
          <Label>Estado inicial</Label>
          <Select defaultValue="ACTIVO"><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIVO">Activo</SelectItem><SelectItem value="PENDIENTE">Pendiente</SelectItem></SelectContent></Select>
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline">Cancelar</Button>
        <Button className="bg-gradient-eco" onClick={() => toast.success("Correo institucional preparado para guardar en administradores_autorizados")}><Save className="h-4 w-4 mr-1.5"/> Guardar correo</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
