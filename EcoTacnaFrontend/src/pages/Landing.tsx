import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapMock } from "@/components/MapMock";
import heroImg from "@/assets/hero-ecotacna.jpg";
import {
  ArrowRight, Building2, Truck, ShieldCheck, FileCheck2, Recycle,
  Droplets, MapPin, BarChart3, Sparkles, CheckCircle2, AlertTriangle,
  TrendingUp, Award, Phone, Mail, Facebook, Instagram, Linkedin, Leaf
} from "lucide-react";

const navLinks = [
  { href: "#inicio", label: "Inicio" },
  { href: "#problema", label: "Impacto" },
  { href: "#flujo", label: "Cómo funciona" },
  { href: "#cobertura", label: "Cobertura" },
  { href: "#roles", label: "Roles" },
  { href: "#beneficios", label: "Beneficios" },
  { href: "#contacto", label: "Contacto" },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* NAVBAR */}
      <header className="fixed top-0 inset-x-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <Logo size="md" />
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map(l => (
              <a key={l.href} href={l.href} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">{l.label}</a>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <Link to="/login"><Button variant="ghost" size="sm">Ingresar</Button></Link>
            <Link to="/registro"><Button size="sm" className="bg-gradient-eco shadow-eco">Registrar empresa</Button></Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="inicio" className="relative pt-28 pb-20 overflow-hidden">
        <div className="absolute inset-0 eco-radial" />
        <div className="absolute inset-0 eco-grid-bg opacity-50" />
        <div className="container relative grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-7">
            <Badge className="bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/20 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 mr-1.5" /> Plataforma autorizada · Tacna 2026
            </Badge>
            <h1 className="font-display text-5xl lg:text-6xl font-extrabold leading-[1.05] tracking-tight">
              Gestión digital del <span className="text-gradient-eco">aceite usado</span> en Tacna
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl">
              Conectamos restaurantes, pollerías y locales de comida con recolectores autorizados. Valorización
              económica y cumplimiento ambiental en una sola plataforma.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link to="/registro">
                <Button size="lg" className="bg-gradient-eco shadow-eco h-12 px-6">
                  Registrar mi empresa <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <a href="#flujo">
                <Button size="lg" variant="outline" className="h-12 px-6 border-2">Ver cómo funciona</Button>
              </a>
            </div>
            <div className="flex items-center gap-6 pt-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success"/> Validación interna manual</div>
              <div className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-success"/> Pagos S/ por litro</div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-6 bg-gradient-eco opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-3xl overflow-hidden border-4 border-card shadow-eco">
              <img src={heroImg} alt="Sistema EcoTacna recolección sostenible" className="w-full h-auto" width={1920} height={1080} />
            </div>
            {/* Floating cards */}
            <Card className="absolute -bottom-6 -left-6 p-4 shadow-lg bg-card/95 backdrop-blur w-56 hidden md:block animate-float">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-eco flex items-center justify-center">
                  <Droplets className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <div className="text-sm font-semibold">Recolección sostenible</div>
                  <div className="text-[11px] text-muted-foreground">Flujo optimizado para aceite usado</div>
                </div>
              </div>
            </Card>
            <Card className="absolute -top-4 -right-4 p-3 shadow-lg bg-card/95 backdrop-blur hidden md:block">
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-primary" />
                <span className="text-xs font-semibold">Red de recolectores</span>
              </div>
            </Card>
          </div>
        </div>
      </section>


      {/* PROBLEMA */}
      <section id="problema" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4 border-destructive/30 text-destructive">El problema</Badge>
            <h2 className="font-display text-4xl font-bold mb-4">El aceite usado contamina y nadie lo controla</h2>
            <p className="text-muted-foreground">Cada litro de aceite vertido al desagüe contamina hasta 1,000 litros de agua. En Tacna se generan miles de litros mensuales sin registro ni disposición formal.</p>
          </div>
          <div className="grid md:grid-cols-4 gap-5">
            {[
              { i: Droplets, t: "Contaminación de agua", d: "1 L de aceite contamina 1,000 L de agua potable." },
              { i: AlertTriangle, t: "Daño al alcantarillado", d: "Atascos y daños en redes de desagüe del distrito." },
              { i: Building2, t: "Informalidad", d: "Disposición sin control ni registro por parte de locales." },
            ].map((p, i) => (
              <Card key={i} className="p-6 border-border hover:shadow-md transition-all">
                <div className="w-11 h-11 rounded-xl bg-destructive/10 text-destructive flex items-center justify-center mb-4">
                  <p.i className="h-5 w-5" />
                </div>
                <h3 className="font-semibold mb-2">{p.t}</h3>
                <p className="text-sm text-muted-foreground">{p.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CÓMO FUNCIONA */}
      <section id="flujo" className="py-24 bg-gradient-soft">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">El proceso</Badge>
            <h2 className="font-display text-4xl font-bold mb-4">Cómo funciona EcoTacna</h2>
            <p className="text-muted-foreground">Un flujo digital simple, formal y trazable de principio a fin.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { n: "01", i: Building2, t: "Empresa se registra", d: "El negocio crea su cuenta y completa sus datos operativos." },
              { n: "02", i: ShieldCheck, t: "Validación interna", d: "Verificación interna y manual de datos para confirmar identidad." },
              { n: "03", i: Recycle, t: "Solicita recojo", d: "Indica litros estimados, dirección y horario disponible." },
              { n: "04", i: Truck, t: "Recolector confirma", d: "Recibe la solicitud, programa la ruta y confirma el recojo." },
              { n: "05", i: FileCheck2, t: "Pago y certificado", d: "Liquidación por litro y certificado ambiental descargable." },
            ].map((s, i) => (
              <Card key={i} className="p-6 relative overflow-hidden group hover:shadow-eco transition-all hover:-translate-y-1">
                <div className="absolute top-3 right-4 text-5xl font-display font-extrabold text-primary/10 group-hover:text-primary/20 transition-colors">{s.n}</div>
                <div className="w-12 h-12 rounded-xl bg-gradient-eco flex items-center justify-center mb-4 shadow-eco">
                  <s.i className="h-6 w-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">{s.t}</h3>
                <p className="text-sm text-muted-foreground">{s.d}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ROLES */}
      <section id="roles" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge variant="outline" className="mb-4">Tres roles, una plataforma</Badge>
            <h2 className="font-display text-4xl font-bold mb-4">¿Quiénes participan?</h2>
            <p className="text-muted-foreground">Cada actor tiene su propio panel, permisos y herramientas.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                role: "Administrador",
                color: "bg-secondary text-secondary-foreground",
                badge: "Gobierno / Operador",
                d: "Supervisa toda la plataforma, valida empresas y recolectores, configura precios y gestiona reportes territoriales.",
                features: ["Aprobar empresas y recolectores", "Configurar precios por litro", "Monitoreo territorial", "Auditoría y reportes", "Gestión de usuarios"]
              },
              {
                role: "Empresa / Generador",
                color: "bg-primary text-primary-foreground",
                badge: "Restaurantes y locales",
                d: "Restaurantes, pollerías y comercios que generan aceite usado y solicitan su recojo de manera digital.",
                features: ["Solicitar recojo en 1 clic", "Seguimiento referencial", "Liquidaciones por litro", "Certificados ambientales", "Historial completo"]
              },
              {
                role: "Recolector",
                color: "bg-accent text-accent-foreground",
                badge: "Empresas autorizadas",
                d: "Empresas autorizadas que ejecutan los recojos y registran litros reales.",
                features: ["Aceptación voluntaria", "Mapa operativo de aceptación", "Registro de litros y evidencia", "Generar liquidaciones", "Cobertura por distrito"]
              },
            ].map((r, i) => (
              <Card key={i} className="p-7 border-2 hover:border-primary/40 transition-all relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-eco opacity-5 rounded-full -translate-y-16 translate-x-16" />
                <Badge className={`${r.color} mb-4`}>{r.badge}</Badge>
                <h3 className="font-display text-2xl font-bold mb-3">{r.role}</h3>
                <p className="text-sm text-muted-foreground mb-5">{r.d}</p>
                <ul className="space-y-2">
                  {r.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section id="beneficios" className="py-24 bg-secondary text-secondary-foreground relative overflow-hidden">
        <div className="absolute inset-0 eco-grid-bg opacity-20" />
        <div className="container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-accent text-accent-foreground mb-4">Beneficios</Badge>
              <h2 className="font-display text-4xl font-bold mb-6 leading-tight">
                Más que recoger aceite, <br />
                <span className="text-accent">creamos valor circular</span>
              </h2>
              <p className="text-secondary-foreground/80 mb-8">
                EcoTacna convierte un residuo problemático en un recurso valorizado.
                Tu negocio gana cumplimiento, ingresos y reputación ambiental.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { v: "+92%", l: "Reducción de vertidos" },
                  { v: "S/ 2.80", l: "Promedio por litro" },
                  { v: "100%", l: "Empresas verificadas" },
                  { v: "24h", l: "Confirmación de recojo" },
                ].map((s, i) => (
                  <div key={i} className="border-l-2 border-accent pl-4">
                    <div className="text-3xl font-display font-bold">{s.v}</div>
                    <div className="text-xs text-secondary-foreground/70">{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { i: ShieldCheck, t: "Formalidad", d: "Cumple con normativa ambiental local." },
                { i: BarChart3, t: "Información centralizada", d: "Todos tus datos en un solo lugar." },
                { i: TrendingUp, t: "Valorización", d: "Recibe pago por cada litro entregado." },
                { i: Leaf, t: "Impacto ambiental", d: "Reportes de huella positiva mensual." },
                { i: Award, t: "Certificación", d: "Constancias descargables al instante." },
              ].map((b, i) => (
                <Card key={i} className="p-5 bg-card/10 border-card/20 backdrop-blur text-secondary-foreground hover:bg-card/15 transition">
                  <b.i className="h-6 w-6 text-accent mb-3" />
                  <h4 className="font-semibold mb-1">{b.t}</h4>
                  <p className="text-xs text-secondary-foreground/70">{b.d}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COBERTURA */}
      <section id="cobertura" className="py-24">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <Badge className="bg-info/10 text-info border-info/20 mb-4 hover:bg-info/10">Cobertura territorial</Badge>
            <h2 className="font-display text-4xl font-bold mb-4">Operamos en toda la región Tacna</h2>
            <p className="text-muted-foreground">Empresas registradas, puntos de recojo y zonas de alta actividad.</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <MapMock
                height="h-[480px]"
                showLegend
                title="Mapa de cobertura referencial · Tacna"
                pins={[
                  { id: "1", label: "Pollería El Dorado", sub: "Tacna Cercado · 35 L", x: 35, y: 38, type: "empresa" },
                  { id: "2", label: "Chifa Wong", sub: "G. Albarracín · 60 L", x: 62, y: 72, type: "empresa" },
                  { id: "3", label: "Sabor Sureño", sub: "Pocollay · 22 L", x: 72, y: 32, type: "empresa" },
                  { id: "4", label: "Mar Brava", sub: "Ciudad Nueva · 18 L", x: 22, y: 60, type: "empresa" },
                  { id: "5", label: "EcoRutas Sur", sub: "Recolector activo", x: 50, y: 50, type: "recolector" },
                  { id: "6", label: "Bella Italia", sub: "Tacna Cercado · 28 L", x: 45, y: 28, type: "empresa" },
                  { id: "7", label: "Broaster King", sub: "Alto de la Alianza · 45 L", x: 28, y: 22, type: "empresa" },
                ]}
              />
            </div>
            <div className="space-y-3">
              <Card className="p-5">
                <h4 className="font-display font-bold mb-3">Distritos atendidos</h4>
                <div className="space-y-2.5">
                  {[
                    { d: "Tacna Cercado", e: 48, p: "Alta" },
                    { d: "Gregorio Albarracín", e: 32, p: "Alta" },
                    { d: "Pocollay", e: 21, p: "Media" },
                    { d: "Ciudad Nueva", e: 18, p: "Media" },
                    { d: "Alto de la Alianza", e: 14, p: "Media" },
                    { d: "Calana", e: 6, p: "Baja" },
                    { d: "Pachía", e: 2, p: "Baja" },
                    { d: "Inclán", e: 1, p: "Baja" },
                  ].map(d => (
                    <div key={d.d} className="flex items-center justify-between text-sm pb-2 border-b border-border last:border-0">
                      <div>
                        <div className="font-medium">{d.d}</div>
                        <div className="text-xs text-muted-foreground">{d.e} empresas</div>
                      </div>
                      <Badge variant="outline" className={
                        d.p === "Alta" ? "border-success/40 text-success" :
                        d.p === "Media" ? "border-warning/40 text-warning" :
                        "border-border text-muted-foreground"
                      }>{d.p}</Badge>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* PLANES Y SUSCRIPCIÓN */}
      <section id="planes" className="py-24 bg-gray-50 border-t border-border">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <Badge className="mb-4 bg-primary/10 text-primary border-primary/20 hover:bg-primary/10">Suscripciones</Badge>
            <h2 className="font-display text-4xl font-bold mb-4">Planes y acceso a la plataforma</h2>
            <p className="text-muted-foreground">Opciones diseñadas para cada tipo de empresa, garantizando transparencia y formalidad.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 border-2 border-border relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-bl-lg">
                Generadores
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">Restaurantes y Locales</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold">Gratis</span>
              </div>
              <p className="text-muted-foreground mb-6 flex-grow">
                Ideal para empezar a disponer correctamente tu aceite usado y recibir pagos por ello.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> Inscripción sin costo</li>
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> Recibe S/ por litro</li>
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> Certificados ambientales gratis</li>
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-primary" /> Soporte básico</li>
              </ul>
              <Link to="/registro">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Comenzar 7 días de prueba
                </Button>
              </Link>
            </Card>

            <Card className="p-8 border-2 border-accent relative overflow-hidden flex flex-col shadow-lg shadow-accent/10">
              <div className="absolute top-0 right-0 bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-bl-lg">
                Recolectores
              </div>
              <h3 className="text-2xl font-bold mb-2 text-foreground">Empresas Autorizadas</h3>
              <div className="mb-4">
                <span className="text-4xl font-extrabold">S/ 45.00</span>
                <span className="text-muted-foreground"> / mes</span>
              </div>
              <p className="text-muted-foreground mb-6 flex-grow">
                Acceso completo a la bolsa de recojos y herramientas operativas.
              </p>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent" /> Acceso a solicitudes de recojo</li>
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent" /> Gestión de unidades y personal</li>
                <li className="flex items-center gap-2 text-sm"><CheckCircle2 className="h-4 w-4 text-accent" /> Soporte prioritario</li>
              </ul>
              <Link to="/registro">
                <Button className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                  Registrar Empresa Recolectora
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA FINAL */}
      <section className="py-20">
        <div className="container">
          <Card className="p-12 bg-gradient-hero text-primary-foreground border-0 relative overflow-hidden">
            <div className="absolute inset-0 eco-grid-bg opacity-15" />
            <div className="relative grid lg:grid-cols-[1fr_auto] gap-8 items-center">
              <div>
                <h2 className="font-display text-3xl lg:text-4xl font-bold mb-3">
                  Tu negocio puede empezar a generar impacto hoy
                </h2>
                <p className="text-primary-foreground/80 max-w-2xl">
                  Regístrate para conocer la plataforma y solicita tu primer recojo de aceite usado.
                  Sin costos de inscripción, sin papeleo.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/registro"><Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90 h-12 px-6 shadow-lg">Registrar empresa</Button></Link>
                <Link to="/login"><Button size="lg" variant="outline" className="h-12 px-6 border-primary-foreground/30 text-primary-foreground bg-transparent hover:bg-primary-foreground/10 hover:text-primary-foreground">Ya tengo cuenta</Button></Link>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="contacto" className="bg-secondary text-secondary-foreground border-t border-secondary/30">
        <div className="container py-14 grid md:grid-cols-4 gap-10">
          <div className="space-y-4">
            <Logo variant="dark" />
            <p className="text-sm text-secondary-foreground/70">
              Plataforma digital de gestión, recolección y valorización del aceite de cocina usado en la región Tacna.
            </p>
            <div className="flex gap-2">
              {[Facebook, Instagram, Linkedin].map((I, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-lg bg-card/10 flex items-center justify-center hover:bg-accent hover:text-accent-foreground transition">
                  <I className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-accent">Plataforma</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><a href="#flujo" className="hover:text-accent">Cómo funciona</a></li>
              <li><a href="#roles" className="hover:text-accent">Roles</a></li>
              <li><a href="#beneficios" className="hover:text-accent">Beneficios</a></li>
              <li><a href="#cobertura" className="hover:text-accent">Cobertura</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-accent">Acceso</h4>
            <ul className="space-y-2 text-sm text-secondary-foreground/70">
              <li><Link to="/login" className="hover:text-accent">Iniciar sesión</Link></li>
              <li><Link to="/registro" className="hover:text-accent">Registrar empresa</Link></li>
              <li><Link to="/recuperar" className="hover:text-accent">Recuperar contraseña</Link></li>
              <li><Link to="/admin" className="hover:text-accent">Acceso administrador</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-bold mb-4 text-sm uppercase tracking-wider text-accent">Contacto</h4>
            <ul className="space-y-3 text-sm text-secondary-foreground/70">
              <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-accent"/> Av. Bolognesi 1247, Tacna</li>
              <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-accent"/> (052) 415-887</li>
              <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent"/> contacto@virtual.upt.pe</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-secondary-foreground/10 py-5">
          <div className="container flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-secondary-foreground/60">
            <div>© 2026 EcoTacna · Plataforma de gestión sostenible · Demo académico</div>
            <div className="flex gap-5">
              <a href="#" className="hover:text-accent">Términos</a>
              <a href="#" className="hover:text-accent">Privacidad</a>
              <a href="#" className="hover:text-accent">Política ambiental</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
