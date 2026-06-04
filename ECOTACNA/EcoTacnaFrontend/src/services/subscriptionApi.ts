import { apiClient } from './apiClient';

export interface Plan {
  id: number;
  code: string;
  name: string;
  companyType: string;
  monthlyAmount: number;
  currency: string;
  trialDays: number;
}

export interface PublicCheckoutResponse {
  companyId: number;
  companyName: string;
  companyType: string;
  planId: number;
  planCode: string;
  planName: string;
  monthlyAmount: number;
  currency: string;
  trialDays: number;
  todayAmount: number;
  status: string;
}

export interface SubscriptionStatusResponse {
  companyName: string;
  companyType: string;
  status: string;
  planName?: string;
  monthlyAmount?: number;
  currency?: string;
  trialEndsAt?: string;
  currentPeriodEnd?: string;
  canOperate: boolean;
  message?: string;
}

export interface Subscription {
  id: number;
  planId: number;
  planName: string;
  status: string;
  startDate: string;
  trialEndsAt: string;
  nextBillingDate: string;
}

export const subscriptionApi = {
  getPublicPlans: async (): Promise<Plan[]> => {
    const response = await apiClient<Plan[]>('/public/plans', { method: 'GET' });
    return response.data || [];
  },

  getMySubscriptionStatus: async (): Promise<SubscriptionStatusResponse> => {
    const response = await apiClient<SubscriptionStatusResponse>('/subscriptions/me', { method: 'GET' });
    if (!response.data) throw new Error(response.message || 'Error al obtener estado de suscripción');
    return response.data;
  },

  activateTrial: async (): Promise<Subscription> => {
    const response = await apiClient<Subscription>('/subscriptions/trial', { method: 'POST' });
    if (!response.data) throw new Error(response.message || 'Error al activar prueba');
    return response.data;
  },

  getPublicCheckout: async (companyId: number): Promise<PublicCheckoutResponse> => {
    const response = await apiClient<PublicCheckoutResponse>(`/public/checkout/company/${companyId}`, { method: 'GET' });
    if (!response.data) throw new Error(response.message || 'Error al obtener checkout');
    return response.data;
  },

  confirmPublicMockPayment: async (
    companyId: number | string,
    data: {
      paymentMethod: string;
      cardholderName: string;
      email: string;
      cardLast4: string;
    }
  ): Promise<any> => {
    const response = await apiClient<any>(
      `/public/checkout/company/${companyId}/confirm-mock-payment`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    if (!response.data) throw new Error(response.message || 'Error al procesar el pago mock público');
    return response.data;
  },

  confirmPublicCulqiPayment: async (
    companyId: number | string,
    data: {
      culqiToken: string;
      paymentMethod: string;
      email: string;
    }
  ): Promise<any> => {
    const response = await apiClient<any>(
      `/public/checkout/company/${companyId}/confirm-culqi-payment`,
      {
        method: 'POST',
        body: JSON.stringify(data)
      }
    );
    if (!response.data) throw new Error(response.message || 'Error al procesar el pago Culqi');
    return response.data;
  }
};
