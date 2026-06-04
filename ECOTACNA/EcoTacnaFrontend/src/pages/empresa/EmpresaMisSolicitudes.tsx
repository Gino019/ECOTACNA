import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/DashboardShell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Download } from "lucide-react";
import { empresaApi } from "@/services/empresaApi";
import { getStoredAuth } from "@/services/authStorage";
import { empresaNav } from "./empresaNav";
import { toast } from "sonner";

const statusColor: Record<string, string> = {
  PENDIENTE: "bg-muted text-muted-foreground border-muted-foreground/30",
  PROGRAMADO: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
  EN_RUTA: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
  RECOGIDO: "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
  COMPLETADO: "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
  CANCELADO: "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800",
};

const statusLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PROGRAMADO: "Programado",
  EN_RUTA: "En ruta",
  RECOGIDO: "Recogido",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("es-PE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function formatVolume(val: number | null | undefined): string {
  if (val == null) return "—";
  return `${Number(val).toFixed(2)} L`;
}

function formatCurrency(val: number | null | undefined): string {
  if (val == null) return "—";
  return `S/ ${Number(val).toFixed(2)}`;
}

export default function EmpresaMisSolicitudes() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Empresa", sub: auth?.email || "No autenticado" });
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
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
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleDescargar = async (id: number) => {
    setDownloadingId(id);
    try {
      const blob = await empresaApi.descargarConstancia(id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `constancia_${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Constancia PDF descargada correctamente");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Error al descargar la constancia");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <DashboardShell role="Empresa" user={user} nav={empresaNav}>
      <div className="mb-6">
        <Badge className="bg-primary text-primary-foreground mb-2">Operaciones</Badge>
        {message ? <Badge variant="outline" className="ml-2 text-destructive border-destructive">{message}</Badge> : null}
        <h1 className="font-display text-3xl font-bold">Mis solicitudes</h1>
        <p className="text-sm text-muted-foreground">Historial real de solicitudes y constancias de la empresa.</p>
      </div>

      <Card className="p-5 overflow-x-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando historial...</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Fecha Solicitud</TableHead>
                <TableHead>Fecha Programada</TableHead>
                <TableHead>Vol. Estimado</TableHead>
                <TableHead>Vol. Real</TableHead>
                <TableHead>Monto Pago</TableHead>
                <TableHead>Estado Recojo</TableHead>
                <TableHead>Estado Pago</TableHead>
                <TableHead>Dirección</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {solicitudes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-muted-foreground py-6">
                    No hay solicitudes registradas.
                  </TableCell>
                </TableRow>
              ) : (
                solicitudes.map((solicitud) => {
                  const isCompletado = solicitud.estado === "COMPLETADO" && solicitud.estadoPago === "PAGADO";
                  return (
                    <TableRow key={solicitud.id}>
                      <TableCell className="font-mono text-xs">{solicitud.id}</TableCell>
                      <TableCell>{formatDateTime(solicitud.fechaSolicitud)}</TableCell>
                      <TableCell>{formatDateTime(solicitud.fechaProgramada)}</TableCell>
                      <TableCell className="font-mono">{formatVolume(solicitud.volumenAproximado)}</TableCell>
                      <TableCell className="font-mono">{formatVolume(solicitud.litrosConfirmados || solicitud.volumenReal)}</TableCell>
                      <TableCell className="font-mono font-semibold">{formatCurrency(solicitud.montoTotal)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`${statusColor[solicitud.estado] || "bg-muted text-muted-foreground"} font-medium`}>
                          {statusLabel[solicitud.estado] || solicitud.estado}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {solicitud.estadoPago === "PAGADO" ? (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900 font-medium">
                            Pagado
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900 font-medium">
                            Pendiente
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={solicitud.direccion}>
                        {solicitud.direccion || "No registrado"}
                      </TableCell>
                      <TableCell className="text-right">
                        {isCompletado ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="inline-flex items-center gap-1.5 border-primary text-primary hover:bg-primary/10"
                            disabled={downloadingId === solicitud.id}
                            onClick={() => handleDescargar(solicitud.id)}
                          >
                            {downloadingId === solicitud.id ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <Download className="h-3.5 w-3.5" />
                            )}
                            Constancia PDF
                          </Button>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sin constancia</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardShell>
  );
}
