import { apiClient, BASE_URL } from "./apiClient";

export const empresaApi = {
  getPerfil: async () => {
    return await apiClient<any>("/empresa/perfil", { method: "GET" });
  },

  getResumen: async () => {
    return await apiClient<any>("/empresa/resumen", { method: "GET" });
  },

  getSolicitudes: async () => {
    return await apiClient<any>("/empresa/solicitudes", { method: "GET" });
  },

  crearSolicitud: async (body: {
    volumenAproximado: number;
    direccion: string;
    fechaProgramada: string;
    observaciones?: string;
  }) => {
    return apiClient<any>("/empresa/solicitudes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  confirmarPagoOperativo: async (
    solicitudId: number,
    body: {
      litrosConfirmados: number;
      precioPorLitro: number;
      observacionPago?: string;
    }
  ) => {
    return apiClient<any>(`/empresa/solicitudes/${solicitudId}/confirmar-pago`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  descargarConstancia: async (solicitudId: number) => {
    const authStr = localStorage.getItem("ecotacna_auth");
    let token = null;
    if (authStr) {
      try {
        const auth = JSON.parse(authStr);
        token = auth?.token;
      } catch (e) {}
    }

    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}/empresa/solicitudes/${solicitudId}/constancia`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("No se pudo descargar la constancia PDF");
    }

    return await response.blob();
  },
};
