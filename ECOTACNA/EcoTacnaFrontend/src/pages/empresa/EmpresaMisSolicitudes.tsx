import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, QrCode } from "lucide-react";
import { empresaApi } from "@/services/empresaApi";
import { ApiError } from "@/services/apiClient";
import { getStoredAuth } from "@/services/authStorage";
import { empresaNav } from "./empresaNav";
import { toast } from "sonner";
import { formatDateTime, formatDate } from "@/utils/date";

export default function EmpresaMisSolicitudes() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Empresa", sub: auth?.email || "No autenticado" });
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);



  useEffect(() => {
    const loadData = async () => {
      try {
        const [resPerfil, resSolicitudes] = await Promise.all([
          empresaApi.getPerfil(),
          empresaApi.getSolicitudes(),
        ]);

        if (resPerfil.success && resPerfil.data) {
          setUser({ name: resPerfil.data.razonSocial, sub: resPerfil.data.correo || `RUC ${resPerfil.data.ruc}` });
        }

        if (resSolicitudes.success) {
          setSolicitudes(resSolicitudes.data || []);
        } else {
          setMessage(resSolicitudes.message || "No se pudieron cargar las solicitudes");
        }
      } catch (error: any) {
        setMessage(error.message || "Error de red");
      }
    };

    loadData();
  }, []);

  return (
    <DashboardShell role="Empresa" user={user} nav={empresaNav}>
      <div className="mb-6">
        <Badge className="bg-primary text-primary-foreground mb-2">Operaciones</Badge>
        {message ? <Badge variant="outline" className="ml-2 text-destructive border-destructive">{message}</Badge> : null}
        <h1 className="font-display text-3xl font-bold">Mis solicitudes</h1>
        <p className="text-sm text-muted-foreground">Historial real de solicitudes de la empresa.</p>
      </div>

      <Card className="p-5">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Fecha solicitud</TableHead>
              <TableHead>Fecha programada</TableHead>
              <TableHead>Volumen</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Dirección</TableHead>
              <TableHead>Observaciones</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {message ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No se pudieron cargar las solicitudes: {message}</TableCell></TableRow>
            ) : solicitudes.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center text-muted-foreground py-6">No hay solicitudes registradas.</TableCell></TableRow>
            ) : (
              solicitudes.map((solicitud) => (
                <TableRow key={solicitud.id}>
                  <TableCell className="font-mono text-xs">{solicitud.id}</TableCell>
                  <TableCell>{formatDateTime(solicitud.fechaSolicitud)}</TableCell>
                  <TableCell>{formatDate(solicitud.fechaProgramada)}</TableCell>
                  <TableCell className="font-mono">{solicitud.volumenAproximado.toFixed(2)} L</TableCell>
                  <TableCell>{solicitud.estado}</TableCell>
                  <TableCell>{solicitud.direccionRecojo || "No registrado"}</TableCell>
                  <TableCell>{solicitud.observaciones || "No asignado"}</TableCell>
                  <TableCell className="flex gap-2">
                    <span className="text-xs text-muted-foreground">Solo lectura</span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>


    </DashboardShell>
  );
}
