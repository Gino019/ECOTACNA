import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check } from "lucide-react";
import { DashboardShell } from "@/components/DashboardShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { getStoredAuth } from "@/services/authStorage";
import { recolectorApi } from "@/services/recolectorApi";
import { recolectorNav } from "./recolectorNav";

export default function RecolectorRecojosDia() {
  const auth = getStoredAuth();
  const [user, setUser] = useState({ name: auth?.companyName || "Recolector", sub: auth?.email || "No autenticado" });
  const [recojos, setRecojos] = useState<any[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [resPerfil, resRecojos] = await Promise.all([
        recolectorApi.getPerfil(),
        recolectorApi.getSolicitudes(),
      ]);

      if (resPerfil.success && resPerfil.data) {
        setUser({ name: resPerfil.data.razonSocial, sub: resPerfil.data.correo || `RUC ${resPerfil.data.ruc}` });
      }

      if (resRecojos.success) {
        setRecojos(resRecojos.data || []);
        setMessage(resRecojos.data?.length ? null : "No hay recojos programados para hoy.");
      } else {
        setRecojos([]);
        setMessage(resRecojos.message || "No hay recojos programados para hoy.");
      }
    } catch (error: any) {
      setRecojos([]);
      setMessage(error.message || "No hay recojos programados para hoy.");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleConfirmar = async (recojo: any, volumenReal: number, observaciones: string, close: () => void) => {
    try {
      const res = await recolectorApi.confirmarRecojo(
        recojo.solicitudId,
        volumenReal
      );

      if (!res.success) {
        toast.error(res.message || "Pendiente backend");
        return;
      }

      toast.success(res.message || "Recolección confirmada");
      close();
      await loadData();
    } catch (error: any) {
      toast.error(error.message || "Pendiente backend");
    }
  };

  return (
    <DashboardShell role="Recolector" user={user} nav={recolectorNav}>
      <div className="mb-6">
        <Badge className="bg-accent text-accent-foreground mb-2">Hoy</Badge>
        {message ? <Badge variant="outline" className="ml-2 text-muted-foreground">{message}</Badge> : null}
        <h1 className="font-display text-3xl font-bold">Recojos del día</h1>
        <p className="text-sm text-muted-foreground">Recolecciones reales vinculadas al recolector actual.</p>
      </div>
      <Card className="p-5">
        {recojos.length === 0 ? (
          <div className="text-muted-foreground">{message || "No hay recojos programados para hoy."}</div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Recolección</TableHead>
                <TableHead>Solicitud</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Litros</TableHead>
                <TableHead>Transporte</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {recojos.map((recojo) => (
                <TableRow key={recojo.recoleccionId}>
                  <TableCell className="font-mono text-xs">{recojo.recoleccionId}</TableCell>
                  <TableCell className="font-mono text-xs">{recojo.solicitudId}</TableCell>
                  <TableCell>{recojo.empresa}</TableCell>
                  <TableCell>{recojo.fechaVisible}</TableCell>
                  <TableCell>{recojo.litrosVisibles.toFixed(2)} L</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono">{recojo.transportePlaca}</Badge></TableCell>
                  <TableCell>{recojo.estado}</TableCell>
                  <TableCell>
                    {(recojo.estado === "EN_RUTA" || recojo.estado === "PROGRAMADA") ? (
                      <ConfirmarDialog recojo={recojo} onConfirm={handleConfirmar} />
                    ) : (
                      <span className="text-xs text-muted-foreground">Solo lectura</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
    </DashboardShell>
  );
}

function ConfirmarDialog({ recojo, onConfirm }: { recojo: any; onConfirm: (recojo: any, volumenReal: number, observaciones: string, close: () => void) => void; }) {
  const [open, setOpen] = useState(false);
  const [volumen, setVolumen] = useState(String(recojo.litrosVisibles || recojo.volumenAproximado || 0));
  const [observaciones, setObservaciones] = useState("");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">Confirmar</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirmar recolección {recojo.recoleccionId}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4">
          <div>
            <Label>Litros reales</Label>
            <Input type="number" value={volumen} onChange={(e) => setVolumen(e.target.value)} />
          </div>
          <div>
            <Label>Observaciones</Label>
            <Textarea rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button className="bg-gradient-eco" onClick={() => onConfirm(recojo, Number(volumen), observaciones, () => setOpen(false))}>
            <Check className="h-4 w-4 mr-1.5" /> Confirmar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
