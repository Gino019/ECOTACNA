import { useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReCAPTCHA from "react-google-recaptcha";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  ArrowLeft, ArrowRight, CheckCircle2, Search, 
  FileText, Users, ShieldCheck, Save 
} from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { publicApi, RucLookupResponse } from "@/services/publicApi";
import { authApi } from "@/services/authApi";
import { saveAuth } from "@/services/authStorage";
import { toast } from "sonner";

export default function Registro() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Form State
  const [ruc, setRuc] = useState("");
  const [companyData, setCompanyData] = useState<RucLookupResponse | null>(null);
  const [registeredCompanyId, setRegisteredCompanyId] = useState<number | null>(null);
  
  const [tipoEmpresa, setTipoEmpresa] = useState<"GENERADOR" | "RECOLECTOR">("GENERADOR");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [nombre, setNombre] = useState("");
  const [cargo, setCargo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [referencia, setReferencia] = useState("");

  const [captchaToken, setCaptchaToken] = useState("");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const siteKey = import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Lcl7wYtAAAAAEcjpZVi_ECqXcfCKHiu2To_x3ev";

  const handleLookup = async () => {
    if (!ruc || ruc.length !== 11) {
      toast.error("Ingrese un RUC válido de 11 dígitos");
      return;
    }
    setIsLoading(true);
    try {
      console.log(`Llamando a: ${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082/ecotacna/api'}/public/ruc/${ruc}`);
      const data = await publicApi.lookupRuc(ruc);
      console.log('Respuesta OK:', data);
      
      setCompanyData(data);
      toast.success("Datos de empresa autocompletados correctamente");
    } catch (err: any) {
      console.error('Error HTTP en RUC:', err);
      console.error('Response Status:', err.status);
      console.error('Response Body:', err.data || err.message);
      
      const backendMessage = err.message || err.data?.message || err.response?.data?.message;
      toast.error(backendMessage && backendMessage !== "Error de red" ? backendMessage : "Servicio de consulta RUC no disponible o backend apagado");
      setCompanyData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!companyData || !correo || !nombre || !telefono) {
      toast.error("Complete todos los campos obligatorios");
      return;
    }
    // As password might be removed from UI if auto-login is bypassed, we can default it or add it to UI.
    // The mockup does NOT show a password field. We need to auto-generate one or keep it hidden.
    // Wait, the mockup doesn't have a password field. "Completa los datos auxiliares" only has:
    // Correo, Teléfono, Persona de contacto, Cargo, Referencia.
    // I will auto-generate the password to RUC for now, or just default it to RUC.
    const finalPassword = ruc;

    if (siteKey && !captchaToken) {
      toast.error("Completa el reCAPTCHA para continuar");
      return;
    }

    setIsLoading(true);
    try {
      // 1. Registrar empresa
      const regRes = await authApi.register({
        ruc: companyData.ruc,
        email: correo,
        password: finalPassword,
        firstName: nombre,
        lastName: "-", // Since mockup only has "Persona de contacto" we split or use '-'
        role: tipoEmpresa === "GENERADOR" ? "GENERADOR" : "RECOLECTOR",
        companyType: tipoEmpresa === "GENERADOR" ? "GENERADORA" : "RECOLECTORA"
      });

      // Guardamos el companyId del registro para el checkout
      if (regRes.data && regRes.data.companyId) {
        setRegisteredCompanyId(regRes.data.companyId);
      }

      // 2. Auto-login para obtener JWT y poder continuar al pago
      try {
        const authRes = await authApi.login(correo, finalPassword, captchaToken);
        if (authRes.data) {
          saveAuth(authRes.data);
        }
      } catch (loginErr) {
        console.warn("Auto-login falló tras el registro. Se continuará con companyId.", loginErr);
      }

      setStep(2);
      window.scrollTo(0, 0);
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Error en el registro";
      toast.error(errorMsg);
      if (siteKey) {
        recaptchaRef.current?.reset();
        setCaptchaToken("");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateApproval = () => {
    toast.success("Empresa aprobada administrativamente (MOCK)");
    setStep(3);
  };

  // Helper for the visual disabled inputs
  const AutocompleteField = ({ label, value, colSpan = 1 }: { label: string, value: string, colSpan?: number }) => (
    <div className={`space-y-1.5 ${colSpan === 2 ? 'md:col-span-2' : ''}`}>
      <Label className="text-xs text-gray-700">{label} *</Label>
      <div className="relative flex items-center">
        <Input 
          disabled 
          value={value} 
          className="bg-green-50/30 border-green-200/60 text-gray-800 disabled:opacity-100 pr-10" 
        />
        <CheckCircle2 className="absolute right-3 h-4 w-4 text-green-600" />
      </div>
    </div>
  );

  const renderStep1 = () => (
    <Card className="p-8 border-border shadow-sm max-w-5xl mx-auto rounded-2xl">
      
      <div className="flex items-start gap-4 mb-6">
        <div className="w-12 h-12 bg-green-50 text-green-600 rounded-xl flex items-center justify-center shrink-0">
          <FileText className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900">Datos principales con RUC</h2>
          <p className="text-sm text-gray-500">Ingresa el RUC de tu empresa para autocompletar la información.</p>
        </div>
      </div>
      
      <div className="mb-4">
        <Label className="text-sm mb-1.5 block">Número de RUC *</Label>
        <div className="flex flex-col sm:flex-row gap-4 items-start">
          <Input 
            placeholder="Ej: 20605432198" 
            maxLength={11} 
            value={ruc} 
            onChange={e => setRuc(e.target.value)} 
            className="max-w-2xl h-11"
          />
          <Button onClick={handleLookup} disabled={isLoading} className="bg-green-600 hover:bg-green-700 h-11 px-6 shrink-0 font-semibold">
            <Search className="w-4 h-4 mr-2" /> Buscar datos
          </Button>
        </div>
      </div>
      
      <p className="text-xs text-gray-500 mb-8 flex items-center gap-1.5">
        <Search className="w-3 h-3" />
        Al consultar el RUC, se autocompletarán los datos principales de la empresa. La integración con SUNAT se activará en una siguiente etapa.
      </p>

      {companyData && (
        <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <h3 className="font-bold text-gray-900">Datos de la empresa (autocompletados)</h3>
            <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-0 text-xs font-normal">Autocompletado</Badge>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5">
            <AutocompleteField label="Razón social" value={companyData.razonSocial} />
            <AutocompleteField label="Nombre comercial" value={companyData.nombreComercial} />
            
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-700">Tipo de empresa *</Label>
              <div className="relative">
                <Select value={tipoEmpresa} onValueChange={(v: "GENERADOR"|"RECOLECTOR") => setTipoEmpresa(v)}>
                  <SelectTrigger className="bg-green-50/30 border-green-200/60 text-gray-800 pr-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GENERADOR">Restaurante / Generador</SelectItem>
                    <SelectItem value="RECOLECTOR">Empresa Recolectora</SelectItem>
                  </SelectContent>
                </Select>
                <CheckCircle2 className="absolute right-10 top-1/2 -translate-y-1/2 h-4 w-4 text-green-600 pointer-events-none" />
              </div>
            </div>

            <AutocompleteField label="Dirección fiscal" value={companyData.direccionFiscal} />
            <AutocompleteField label="Distrito" value={companyData.distrito} />
            <AutocompleteField label="Provincia" value={companyData.provincia} />
            <AutocompleteField label="Departamento" value={companyData.departamento} />
          </div>
        </div>
      )}

      {companyData && (
        <>
          <div className="flex items-center gap-2 mb-6 text-gray-900 mt-2">
            <Users className="w-5 h-5 text-green-600" />
            <h3 className="font-bold">Completa los datos auxiliares</h3>
          </div>
          
          <div className="grid md:grid-cols-3 gap-5 mb-8">
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-700">Correo electrónico *</Label>
              <Input placeholder="contacto@empresa.com" type="email" value={correo} onChange={e => setCorreo(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-700">Teléfono *</Label>
              <Input placeholder="+51 952 123 456" value={telefono} onChange={e => setTelefono(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-gray-700">Persona de contacto *</Label>
              <Input placeholder="Juan Carlos Mamani Condori" value={nombre} onChange={e => setNombre(e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-1">
              <Label className="text-xs text-gray-700">Cargo (opcional)</Label>
              <Input placeholder="Gerente General" value={cargo} onChange={e => setCargo(e.target.value)} />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs text-gray-700">Referencia (opcional)</Label>
              <Input placeholder="A media cuadra del Mercado Central" value={referencia} onChange={e => setReferencia(e.target.value)} />
            </div>
          </div>

          <div className="bg-green-50/50 rounded-xl p-4 border border-green-100 flex items-start gap-3 mb-8">
            <ShieldCheck className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            <p className="text-sm text-gray-600">
              Tus datos están seguros. La información proporcionada será utilizada únicamente para la gestión del sistema EcoTacna.
            </p>
          </div>

          {siteKey && (
            <div className="flex justify-center mb-6">
              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={siteKey}
                onChange={(token) => setCaptchaToken(token || "")}
                onExpired={() => setCaptchaToken("")}
                onErrored={() => setCaptchaToken("")}
              />
            </div>
          )}

          <div className="flex justify-end gap-4 pt-4 border-t border-gray-100">
            <Button variant="ghost" className="font-semibold text-gray-600">
              <Save className="w-4 h-4 mr-2" /> Guardar borrador
            </Button>
            <Button onClick={handleRegister} disabled={isLoading} className="bg-green-600 hover:bg-green-700 px-8 font-semibold h-11">
              {isLoading ? "Guardando..." : "Siguiente"} <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </>
      )}
    </Card>
  );

  const renderStep2 = () => (
    <Card className="p-10 border-border shadow-sm max-w-2xl mx-auto text-center rounded-2xl">
      <div className="w-20 h-20 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
        <Search className="w-10 h-10" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-gray-900">Tu empresa está en revisión</h2>
      <p className="text-muted-foreground mb-8">
        Hemos recibido tu solicitud de registro para la empresa <span className="font-semibold text-gray-900">{companyData?.razonSocial}</span>. 
        Nuestro equipo validará la información y activará tu cuenta en las próximas 24 horas.
      </p>
      
      <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-xl mb-8 text-left">
        <h4 className="font-bold text-yellow-800 mb-2">Modo Desarrollo / Pruebas</h4>
        <p className="text-sm text-yellow-700 mb-4">
          En entorno de pruebas, puedes simular la aprobación administrativa para continuar con el flujo de selección de plan y pago de Culqi.
        </p>
        <Button onClick={handleSimulateApproval} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold w-full">
          Simular aprobación administrativa
        </Button>
      </div>

      <Link to="/">
        <Button variant="outline" className="w-full">Volver al inicio</Button>
      </Link>
    </Card>
  );

  const renderStep3 = () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold mb-3 text-gray-900">Selecciona tu Plan</h2>
        <p className="text-muted-foreground">Tu empresa ha sido verificada. Para comenzar a operar necesitas activar tu suscripción.</p>
      </div>
      
      {tipoEmpresa === 'GENERADOR' ? (
        <Card className="p-10 border-2 border-primary relative overflow-hidden flex flex-col bg-white shadow-xl mx-auto max-w-md text-center rounded-2xl">
          <Badge className="bg-green-100 text-green-800 border-none mx-auto mb-6 font-semibold px-4 py-1">Plan Generador</Badge>
          <div className="mb-4">
            <span className="text-5xl font-extrabold text-gray-900">S/ 20</span>
            <span className="text-muted-foreground font-medium"> / mes</span>
          </div>
          <p className="text-muted-foreground mb-8">
            Para restaurantes y pollerías. Empieza ahora con una prueba gratis.
          </p>
          <Button 
            onClick={() => navigate(registeredCompanyId ? `/pagos/checkout?companyId=${registeredCompanyId}` : '/pagos/checkout')}
            className="w-full bg-primary text-primary-foreground hover:bg-primary/90 h-14 text-lg font-bold rounded-xl"
          >
            Activar 7 días gratis
          </Button>
        </Card>
      ) : (
        <Card className="p-10 border-2 border-accent relative overflow-hidden flex flex-col bg-white shadow-xl mx-auto max-w-md text-center rounded-2xl">
          <Badge className="bg-blue-100 text-blue-800 border-none mx-auto mb-6 font-semibold px-4 py-1">Plan Recolector</Badge>
          <div className="mb-4">
            <span className="text-5xl font-extrabold text-gray-900">S/ 250</span>
            <span className="text-muted-foreground font-medium"> / mes</span>
          </div>
          <p className="text-muted-foreground mb-8">
            Acceso a la bolsa de recojos y operación formal.
          </p>
          <Button 
            onClick={() => navigate(registeredCompanyId ? `/pagos/checkout?companyId=${registeredCompanyId}` : '/pagos/checkout')}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 h-14 text-lg font-bold rounded-xl"
          >
            Proceder al pago
          </Button>
        </Card>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50/80 to-white flex flex-col justify-between font-sans">
      <div>
        <header className="container py-5 flex items-center justify-between">
          <Logo />
          <Link to="/" className="text-sm font-medium text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Volver al inicio
          </Link>
        </header>

        <div className="container pb-16 pt-8 max-w-6xl mx-auto">
          
          {/* Header Texts */}
          <div className="text-center mb-10">
            <Badge variant="secondary" className="bg-gray-100 text-gray-700 hover:bg-gray-100 border border-gray-200 mb-4 px-3 py-1 font-medium">
              <CheckCircle2 className="w-3 h-3 mr-1 inline-block text-green-600" /> Registro y suscripción
            </Badge>
            <h1 className="font-display text-4xl font-bold mb-3 text-gray-900">Registra tu empresa</h1>
            <p className="text-gray-500 text-sm">Ingresa tu RUC para autocompletar los datos principales de tu empresa y luego completa la información auxiliar.</p>
          </div>

          {/* Stepper Header matches mockup */}
          <div className="max-w-4xl mx-auto mb-12 hidden md:block">
            <div className="flex justify-between items-center relative px-8">
              <div className="absolute left-10 right-10 top-4 h-[2px] bg-gray-200 -z-10"></div>
              <div className="absolute left-10 top-4 h-[2px] bg-green-600 -z-10 transition-all duration-500" style={{ width: `${(step - 1) * 25}%` }}></div>
              
              {[
                { num: 1, label: "Registro de empresa" },
                { num: 2, label: "Verificación" },
                { num: 3, label: "Plan y pago" },
                { num: 4, label: "Confirmación" },
                { num: 5, label: "Acceso al sistema" },
              ].map((s) => (
                <div key={s.num} className="flex flex-col items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    step >= s.num ? 'bg-green-600 text-white shadow-sm ring-4 ring-white' : 'bg-gray-100 text-gray-400 ring-4 ring-white'
                  }`}>
                    {s.num}
                  </div>
                  <span className={`text-xs font-semibold ${step >= s.num ? 'text-green-600' : 'text-gray-400'}`}>
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>
      </div>

      <footer className="py-6 border-t border-gray-100 text-center text-xs text-gray-400 bg-white">
        <div className="container">
          EcoTacna © 2026 · Plataforma de Gestión Sostenible
        </div>
      </footer>
    </div>
  );
}
