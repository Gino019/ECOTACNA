import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  MapPinned,
  CheckCircle2,
  Truck,
  Droplets,
  AlertCircle,
  Loader2,
  DollarSign,
  CalendarCheck,
  ClipboardCheck,
} from "lucide-react";
import { empresaNav } from "./empresaNav";
import { getStoredAuth } from "@/services/authStorage";
import { useState, useEffect, useMemo, useCallback } from "react";
import { empresaApi } from "@/services/empresaApi";
import { toast } from "sonner";

/* ────────── helpers ────────── */

const ACTIVE_STATUSES = ["PROGRAMADO", "EN_RUTA", "RECOGIDO"];

const statusLabel: Record<string, string> = {
  PENDIENTE: "Pendiente",
  PROGRAMADO: "Programado",
  EN_RUTA: "En ruta",
  RECOGIDO: "Recogido",
  COMPLETADO: "Completado",
  CANCELADO: "Cancelado",
};

const statusColor: Record<string, string> = {
  PENDIENTE: "bg-muted text-muted-foreground",
  PROGRAMADO: "bg-info/15 text-info border-info/30",
  EN_RUTA: "bg-warning/15 text-warning border-warning/30",
  RECOGIDO: "bg-accent/15 text-accent-foreground border-accent/30",
  COMPLETADO: "bg-success/15 text-success border-success/30",
  CANCELADO: "bg-destructive/15 text-destructive border-destructive/30",
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

function formatCurrency(val: number | null | undefined): string {
  if (val == null) return "S/ 0.00";
  return `S/ ${Number(val).toFixed(2)}`;
}

/* ────────── Componente principal ────────── */

export default function EmpresaSeguimiento() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({
    name: auth?.companyName || "Empresa",
    sub: auth?.email || "No autenticado",
  });

  /* ── data state ── */
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── modal state ── */
  const [modalOpen, setModalOpen] = useState(false);
  const [litros, setLitros] = useState("");
  const [precio, setPrecio] = useState("");
  const [observacion, setObservacion] = useState("");
  const [submitting, setSubmitting] = useState(false);

  /* ── derivados ── */
  const activePickup = useMemo(
    () =>
      solicitudes.find(
        (s: any) =>
          ACTIVE_STATUSES.includes(s.estado) && s.recolectorAsignado
      ) ?? null,
    [solicitudes]
  );

  const completedPaidPickup = useMemo(() => {
    if (activePickup) return null;
    return (
      solicitudes.find(
        (s: any) => s.estado === "COMPLETADO" && s.estadoPago === "PAGADO"
      ) ?? null
    );
  }, [solicitudes, activePickup]);

  const montoPreview = useMemo(() => {
    const l = parseFloat(litros) || 0;
    const p = parseFloat(precio) || 0;
    return (l * p).toFixed(2);
  }, [litros, precio]);

  const canSubmit = useMemo(() => {
    const l = parseFloat(litros);
    const p = parseFloat(precio);
    return l > 0 && p >= 0 && !submitting;
  }, [litros, precio, submitting]);

  /* ── load data ── */
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resPerfil, resSolicitudes] = await Promise.all([
        empresaApi.getPerfil(),
        empresaApi.getSolicitudes(),
      ]);

      if (resPerfil.success && resPerfil.data) {
        setUser({
          name: resPerfil.data.razonSocial,
          sub: resPerfil.data.correo || `RUC ${resPerfil.data.ruc}`,
        });
      }

      if (resSolicitudes.success) {
        setSolicitudes(resSolicitudes.data || []);
      } else {
        setError(resSolicitudes.message || "No se pudieron cargar las solicitudes");
      }
    } catch (err: any) {
      setError(err.message || "Error de red");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ── handlers ── */
  const openModal = () => {
    setLitros(activePickup?.volumenAproximado?.toString() || "");
    setPrecio("2.50");
    setObservacion("");
    setModalOpen(true);
  };

  const handleConfirmar = async () => {
    const litrosNum = parseFloat(litros);
    const precioNum = parseFloat(precio);

    if (!litrosNum || litrosNum <= 0) {
      toast.error("Los litros deben ser mayor a 0.");
      return;
    }
    if (isNaN(precioNum) || precioNum < 0) {
      toast.error("El precio por litro debe ser mayor o igual a 0.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await empresaApi.confirmarPagoOperativo(activePickup.id, {
        litrosConfirmados: litrosNum,
        precioPorLitro: precioNum,
        observacionPago: observacion || undefined,
      });

      if (res.success) {
        toast.success("Recojo completado y pago confirmado.");
        setModalOpen(false);
        await loadData();
      } else {
        toast.error(res.message || "Error al confirmar pago.");
        if (res.message?.includes("ya fue confirmado")) {
          setModalOpen(false);
          await loadData();
        }
      }
    } catch (err: any) {
      toast.error(err.message || "Error al confirmar pago operativo.");
      if (err.message?.includes("ya fue confirmado")) {
        setModalOpen(false);
        await loadData();
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* ── RENDER ── */
  return (
    <DashboardShell role="Empresa" user={user} nav={empresaNav}>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <Badge className="bg-primary text-primary-foreground">
            Logística
          </Badge>
          <Badge
            variant="outline"
            className="border-info text-info"
          >
            <MapPinned className="h-3 w-3 mr-1" />
            Seguimiento
          </Badge>
        </div>
        <h1 className="font-display text-3xl font-bold">
          Seguimiento de Recojo
        </h1>
        <p className="text-sm text-muted-foreground">
          Estado operativo del recojo activo y confirmación de pago al
          recolector.
        </p>
      </div>

      {/* ── Loading ── */}
      {loading && (
        <Card className="p-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Cargando seguimiento…</p>
        </Card>
      )}

      {/* ── Error ── */}
      {!loading && error && (
        <Card className="p-6 border-destructive/40">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
            <div>
              <h3 className="font-semibold text-destructive">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
              <Button variant="outline" size="sm" className="mt-3" onClick={loadData}>
                Reintentar
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* ── Sin recojo activo ni completado reciente ── */}
      {!loading && !error && !activePickup && !completedPaidPickup && (
        <Card className="p-10 text-center">
          <Truck className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
          <h3 className="font-display font-bold text-lg mb-1">
            Sin recojo activo
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto">
            No hay solicitudes con recolector asignado en este momento.
            Cuando un recolector acepte una solicitud, aparecerá aquí el
            seguimiento y la opción de confirmar el pago operativo.
          </p>
        </Card>
      )}

      {/* ═══ RECOJO ACTIVO ═══ */}
      {!loading && !error && activePickup && (
        <div className="space-y-4">
          {/* Info Card */}
          <Card className="p-6 border-l-4 border-l-info">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <div>
                <h3 className="font-display font-bold text-lg flex items-center gap-2">
                  <Truck className="h-5 w-5 text-info" />
                  Recojo activo — Solicitud #{activePickup.id}
                </h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Un recolector ha sido asignado a tu solicitud.
                </p>
              </div>
              <Badge
                variant="outline"
                className={statusColor[activePickup.estado] || ""}
              >
                {statusLabel[activePickup.estado] || activePickup.estado}
              </Badge>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div className="bg-gradient-soft rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Volumen aproximado
                </p>
                <p className="text-lg font-bold font-mono">
                  {Number(activePickup.volumenAproximado).toFixed(1)} L
                </p>
              </div>
              <div className="bg-gradient-soft rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Recolector asignado
                </p>
                <p className="text-lg font-bold">
                  ID #{activePickup.recolectorAsignado}
                </p>
              </div>
              <div className="bg-gradient-soft rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Unidad vehicular
                </p>
                <p className="text-lg font-bold">
                  {activePickup.transportePlaca || "Sin placa"}
                </p>
              </div>
              <div className="bg-gradient-soft rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Fecha programada
                </p>
                <p className="text-sm font-semibold">
                  {formatDateTime(activePickup.fechaProgramada)}
                </p>
              </div>
            </div>

            {activePickup.direccion && (
              <div className="bg-muted/50 rounded-lg p-3 mb-5 text-sm">
                <span className="font-semibold">Dirección:</span>{" "}
                {activePickup.direccion}
              </div>
            )}

            {/* ── Botón confirmar ── */}
            <Button
              id="btn-confirmar-recojo-pago"
              size="lg"
              className="w-full sm:w-auto bg-gradient-eco shadow-eco hover:shadow-glow transition-all duration-300 h-12 text-base font-semibold"
              onClick={openModal}
            >
              <CheckCircle2 className="h-5 w-5 mr-2" />
              Confirmar recojo y pago
            </Button>
          </Card>
        </div>
      )}

      {/* ═══ RECOJO COMPLETADO + PAGADO ═══ */}
      {!loading && !error && !activePickup && completedPaidPickup && (
        <div className="space-y-4">
          <Card className="p-6 border-l-4 border-l-success">
            {/* Success banner */}
            <div className="flex items-center gap-3 p-4 mb-5 rounded-xl bg-success/10 border border-success/20">
              <CheckCircle2 className="h-8 w-8 text-success flex-shrink-0" />
              <div>
                <p className="font-display font-bold text-success">
                  Recojo completado y pago confirmado
                </p>
                <p className="text-xs text-muted-foreground">
                  Solicitud #{completedPaidPickup.id} · El recolector ha sido
                  liberado para atender otros recojos.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
              <h3 className="font-display font-bold text-lg flex items-center gap-2">
                <ClipboardCheck className="h-5 w-5 text-success" />
                Resumen de recojo — Solicitud #{completedPaidPickup.id}
              </h3>
              <div className="flex gap-2">
                <Badge
                  variant="outline"
                  className={statusColor.COMPLETADO}
                >
                  {statusLabel.COMPLETADO}
                </Badge>
                <Badge
                  variant="outline"
                  className="bg-success/15 text-success border-success/30"
                >
                  <DollarSign className="h-3 w-3 mr-1" />
                  Pagado
                </Badge>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
              <div className="bg-gradient-soft rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  <Droplets className="h-3 w-3 inline mr-1" />
                  Litros confirmados
                </p>
                <p className="text-xl font-bold font-mono text-primary">
                  {Number(completedPaidPickup.litrosConfirmados).toFixed(2)} L
                </p>
              </div>
              <div className="bg-gradient-soft rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  Precio por litro
                </p>
                <p className="text-xl font-bold font-mono">
                  {formatCurrency(completedPaidPickup.precioPorLitro)}
                </p>
              </div>
              <div className="bg-gradient-soft rounded-xl p-4 border border-success/20">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  <DollarSign className="h-3 w-3 inline mr-1" />
                  Monto total
                </p>
                <p className="text-xl font-bold font-mono text-success">
                  {formatCurrency(completedPaidPickup.montoTotal)}
                </p>
              </div>
              <div className="bg-gradient-soft rounded-xl p-4">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                  <CalendarCheck className="h-3 w-3 inline mr-1" />
                  Fecha confirmación
                </p>
                <p className="text-sm font-semibold">
                  {formatDateTime(completedPaidPickup.fechaConfirmacionPago)}
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <span className="font-semibold">Recolector:</span>{" "}
                ID #{completedPaidPickup.recolectorAsignado}
              </div>
              <div className="bg-muted/50 rounded-lg p-3 text-sm">
                <span className="font-semibold">Unidad:</span>{" "}
                {completedPaidPickup.transportePlaca || "Sin placa"}
              </div>
              {completedPaidPickup.observacionPago && (
                <div className="bg-muted/50 rounded-lg p-3 text-sm">
                  <span className="font-semibold">Observación:</span>{" "}
                  {completedPaidPickup.observacionPago}
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {/* ═══ MODAL CONFIRMAR PAGO ═══ */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              Confirmar recojo y pago
            </DialogTitle>
            <DialogDescription>
              Registra los litros recolectados y el precio acordado con el
              recolector. Este es el pago operativo por el aceite recolectado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Litros */}
            <div className="space-y-1.5">
              <Label htmlFor="litros-confirmados">Litros recolectados *</Label>
              <Input
                id="litros-confirmados"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="Ej: 30"
                value={litros}
                onChange={(e) => setLitros(e.target.value)}
              />
            </div>

            {/* Precio por litro */}
            <div className="space-y-1.5">
              <Label htmlFor="precio-por-litro">Precio por litro (S/) *</Label>
              <Input
                id="precio-por-litro"
                type="number"
                min="0"
                step="0.01"
                placeholder="Ej: 2.50"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>

            {/* Monto total calculado */}
            <div className="rounded-xl bg-gradient-soft border border-primary/20 p-4 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
                Monto total a pagar
              </p>
              <p className="text-2xl font-bold font-mono text-primary">
                S/ {montoPreview}
              </p>
              <p className="text-[10px] text-muted-foreground mt-1">
                Calculado: {litros || "0"} L × S/ {precio || "0.00"}
              </p>
            </div>

            {/* Observación opcional */}
            <div className="space-y-1.5">
              <Label htmlFor="observacion-pago">
                Observación{" "}
                <span className="text-muted-foreground font-normal">
                  (opcional)
                </span>
              </Label>
              <Textarea
                id="observacion-pago"
                placeholder="Ej: Pago confirmado por recojo completado"
                value={observacion}
                onChange={(e) => setObservacion(e.target.value)}
                rows={2}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancelar
            </Button>
            <Button
              id="btn-confirmar-pago-submit"
              className="bg-gradient-eco shadow-eco"
              onClick={handleConfirmar}
              disabled={!canSubmit}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Confirmando…
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Confirmar
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
