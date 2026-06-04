import { apiClient } from './apiClient';

export interface RucLookupResponse {
  ruc: string;
  razonSocial: string;
  nombreComercial: string;
  direccionFiscal: string;
  distrito: string;
  provincia: string;
  departamento: string;
  estadoContribuyente: string;
  condicionDomicilio: string;
  fuente: string;
}

export interface CaptchaChallengeResponse {
  captchaToken: string;
  backgroundImage: string;
  puzzlePieceImage: string;
  y: number;
}

export const publicApi = {
  lookupRuc: async (ruc: string): Promise<RucLookupResponse> => {
    const response = await apiClient<RucLookupResponse>(`/public/ruc/${ruc}`);
    return response.data as RucLookupResponse;
  },

  getCaptchaChallenge: async (): Promise<CaptchaChallengeResponse> => {
    const response = await apiClient<CaptchaChallengeResponse>("/public/captcha/challenge");
    return response.data as CaptchaChallengeResponse;
  }
};
