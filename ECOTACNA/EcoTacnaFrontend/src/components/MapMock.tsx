import { MapPin, Navigation } from "lucide-react";
import { cn } from "@/lib/utils";

interface MapPin { id: string; label: string; sub?: string; x: number; y: number; type?: "empresa" | "recolector" | "ruta" | "destacado"; }

interface Props {
  pins?: MapPin[];
  height?: string;
  showRoute?: boolean;
  showLegend?: boolean;
  title?: string;
  className?: string;
}

const typeColor = {
  empresa: "bg-primary text-primary-foreground",
  recolector: "bg-accent text-accent-foreground",
  ruta: "bg-info text-info-foreground",
  destacado: "bg-destructive text-destructive-foreground",
};

export const MapMock = ({ pins = [], height = "h-[420px]", showRoute, showLegend, title, className }: Props) => {
  return (
    <div className={cn("relative rounded-2xl overflow-hidden border border-border bg-muted shadow-md", height, className)}>
      {/* Mapa base estilizado */}
      <div className="absolute inset-0" style={{
        background: `
          linear-gradient(135deg, hsl(140 30% 92%) 0%, hsl(150 25% 88%) 100%)
        `
      }} />
      {/* Grilla de calles */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="streets" width="8" height="8" patternUnits="userSpaceOnUse">
            <path d="M 8 0 L 0 0 0 8" fill="none" stroke="hsl(140 20% 78%)" strokeWidth="0.15"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#streets)"/>
        {/* avenidas principales */}
        <path d="M 0 35 L 100 30" stroke="hsl(0 0% 100%)" strokeWidth="1.2" />
        <path d="M 0 65 L 100 70" stroke="hsl(0 0% 100%)" strokeWidth="1.2" />
        <path d="M 30 0 L 32 100" stroke="hsl(0 0% 100%)" strokeWidth="1.2" />
        <path d="M 70 0 L 68 100" stroke="hsl(0 0% 100%)" strokeWidth="1.2" />
        {/* zonas verdes */}
        <circle cx="20" cy="80" r="6" fill="hsl(142 50% 75%)" opacity="0.7" />
        <circle cx="85" cy="20" r="5" fill="hsl(142 50% 75%)" opacity="0.7" />
        {/* río */}
        <path d="M 0 50 Q 30 48 50 52 T 100 50" stroke="hsl(205 70% 75%)" strokeWidth="1.5" fill="none" opacity="0.6"/>

        {showRoute && pins.length > 1 && (
          <polyline
            points={pins.map(p => `${p.x},${p.y}`).join(" ")}
            fill="none"
            stroke="hsl(145 65% 32%)"
            strokeWidth="0.6"
            strokeDasharray="2 1.5"
            opacity="0.85"
          />
        )}
      </svg>

      {/* Pins */}
      {pins.map((p, i) => (
        <div
          key={p.id}
          className="absolute -translate-x-1/2 -translate-y-full group cursor-pointer"
          style={{ left: `${p.x}%`, top: `${p.y}%` }}
        >
          <div className={cn(
            "w-8 h-8 rounded-full border-2 border-card shadow-lg flex items-center justify-center text-[10px] font-bold transition-transform group-hover:scale-125",
            typeColor[p.type || "empresa"]
          )}>
            {i + 1}
          </div>
          <div className="absolute left-1/2 top-full mt-1 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10 whitespace-nowrap pointer-events-none">
            <div className="bg-card border border-border shadow-lg rounded-lg px-2.5 py-1.5 text-xs">
              <div className="font-semibold text-foreground">{p.label}</div>
              {p.sub && <div className="text-muted-foreground text-[10px]">{p.sub}</div>}
            </div>
          </div>
        </div>
      ))}

      {/* Header del mapa */}
      {title && (
        <div className="absolute top-3 left-3 bg-card/95 backdrop-blur px-3 py-1.5 rounded-lg shadow-md border border-border flex items-center gap-2">
          <Navigation className="h-3.5 w-3.5 text-primary" />
          <span className="text-xs font-semibold">{title}</span>
        </div>
      )}

      {/* Atribución mock */}
      <div className="absolute bottom-2 right-2 bg-card/90 px-2 py-0.5 rounded text-[9px] text-muted-foreground border border-border">
        Mapa referencial · Sin GPS ni rutas reales
      </div>

      {/* Leyenda */}
      {showLegend && (
        <div className="absolute bottom-3 left-3 bg-card/95 backdrop-blur p-2.5 rounded-lg shadow-md border border-border space-y-1">
          <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-primary"/> Empresas generadoras</div>
          <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-accent"/> Puntos de recojo</div>
          <div className="flex items-center gap-2 text-xs"><span className="w-3 h-3 rounded-full bg-info"/> Recolector referencial</div>
        </div>
      )}
    </div>
  );
};
