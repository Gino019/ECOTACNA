import { apiClient } from './apiClient';

export interface PaymentInitRequest {
  planId: number;
}

export interface PaymentInitResponse {
  paymentId: number;
  amount: number;
  currency: string;
  status: string;
  providerPaymentId?: string;
}

export interface MockPaymentRequest {
  paymentId: number;
  simulateApproval: boolean;
}

export interface CulqiPaymentConfirmRequest {
  paymentId: number;
  tokenId: string;
}

export interface PaymentResponse {
  id: number;
  amount: number;
  currency: string;
  status: string;
  description?: string;
  confirmedAt?: string;
}

export const paymentApi = {
  initPayment: async (data: PaymentInitRequest): Promise<PaymentInitResponse> => {
    const response = await apiClient<PaymentInitResponse>('/payments/init', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!response.data) throw new Error(response.message || 'Error al inicializar pago');
    return response.data;
  },

  confirmMockPayment: async (data: MockPaymentRequest): Promise<PaymentResponse> => {
    const response = await apiClient<PaymentResponse>('/payments/mock/confirm', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!response.data) throw new Error(response.message || 'Error al confirmar pago mock');
    return response.data;
  },

  confirmCulqiPayment: async (data: CulqiPaymentConfirmRequest): Promise<PaymentResponse> => {
    const response = await apiClient<PaymentResponse>('/payments/culqi/confirm', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (!response.data) throw new Error(response.message || 'Error al confirmar pago Culqi');
    return response.data;
  }
};
