export interface UserSession {
  id?: number;
  email: string;
  role: string;
  token?: string;
  companyId?: number;
  companyName?: string;
}

export interface Company {
  id: number;
  ruc: string;
  businessName: string;
  tradeName?: string;
  email?: string;
  phone?: string;
  legalRepresentative?: string;
  contactPerson?: string;
  industry?: string;
  taxPayerType?: string;
  taxPayerStatus?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  registrationDate?: string;
  createdAt?: string;
  updatedAt?: string;
  isActive?: boolean;
}

export interface PickupRequest {
  id: number;
  empresaId: number;
  empresaRazonSocial: string;
  volumenAproximado: number;
  estado: string;
  fechaSolicitud: string;
  fechaProgramada: string;
  volumenReal?: number;
  fechaRecoleccion?: string;
  direccion?: string;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
  transportePlaca?: string;
  recolectorAsignado?: string;
  precioOfertadoPorLitro?: number;
  montoEstimado?: number;
}

export interface TransportUnit {
  id: number;
  empresaRecolectoraId: number;
  empresaRazonSocial: string;
  placa: string;
  marca: string;
  modelo: string;
  capacidadLitros: number;
  tipoUnidad: string;
  estado: string;
  observaciones?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface SubscriptionStatusResponse {
  active: boolean;
  subscriptionId?: number;
  status?: string;
  startDate?: string;
  endDate?: string;
  planName?: string;
  planMaxLiters?: number;
  currentCycleLiters?: number;
  daysRemaining?: number;
  litersRemaining?: number;
  nextBillingDate?: string;
}

export interface CheckoutSummary {
  planId?: number;
  planName?: string;
  price?: number;
  currency?: string;
}

export interface PaymentResult {
  success: boolean;
  transactionId?: string;
  status?: string;
  message?: string;
}

export interface RucLookupResponse {
  success: boolean;
  ruc?: string;
  businessName?: string;
  tradeName?: string;
  taxPayerType?: string;
  taxPayerStatus?: string;
  address?: string;
  department?: string;
  province?: string;
  district?: string;
  error?: string;
}

export interface RegistrationStatusData {
  exists: boolean;
  ruc: string;
  companyId?: number;
  razonSocial?: string;
  tipoEmpresa?: string;
  correoContacto?: string;
  subscriptionStatus?: string;
  nextStep: 'NEW_REGISTRATION' | 'REVIEW_PENDING' | 'PAYMENT_PENDING' | 'ACTIVE_LOGIN' | 'REJECTED' | 'UNKNOWN_STATE';
  message?: string;
}

export interface PickupTrackingResponse {
  solicitudId: number;
  estado: string;
  empresaGeneradora: string;
  direccion: string;
  volumenAproximado: number;
  fechaSolicitud: string;
  fechaProgramada: string;
  observaciones?: string;
  recolector?: {
    empresaRecolectoraId: number;
    razonSocial: string;
    ruc: string;
    correo: string;
    telefono: string;
  };
  unidad?: {
    placa: string;
    marca: string;
    modelo: string;
    tipoUnidad: string;
    capacidadLitros: number;
  };
  precioOfertadoPorLitro?: number;
  montoEstimado?: number;
}
