import { apiClient } from "./apiClient";
import type { PickupRequest } from "../types";

export const empresaApi = {
  getPerfil: async () => {
    return await apiClient<Record<string, unknown>>("/empresa/perfil", { method: "GET" });
  },

  getResumen: async () => {
    return await apiClient<Record<string, unknown>>("/empresa/resumen", { method: "GET" });
  },

  getSolicitudes: async () => {
    return await apiClient<PickupRequest[]>("/empresa/solicitudes", { method: "GET" });
  },

  crearSolicitud: async (body: {
    volumenAproximado: number;
    direccion: string;
    fechaProgramada: string;
    observaciones?: string;
    precioOfertadoPorLitro: number;
  }) => {
    return apiClient<PickupRequest>("/empresa/solicitudes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getSeguimientoActivo: async () => {
    return await apiClient<import("../types").PickupTrackingResponse>("/empresa/seguimiento-activo", { method: "GET" });
  },

  confirmarPago: async (solicitudId: number, payload: { litrosConfirmados: number; observacionPago?: string }) => {
    return apiClient<import("../types").PickupTrackingResponse>(`/empresa/solicitudes/${solicitudId}/confirmar-pago`, {
      method: "POST",
      body: JSON.stringify(payload)
    });
  },

  descargarConstancia: async (solicitudId: number) => {
    const authStr = localStorage.getItem("ecotacna_auth");
    let token = "";
    if (authStr) {
      try {
        const auth = JSON.parse(authStr);
        if (auth && auth.token) token = auth.token;
      } catch (e) {
        console.warn("Error leyendo auth storage local", e);
      }
    }

    const { BASE_URL } = await import("./apiClient");
    const response = await fetch(`${BASE_URL}/empresa/solicitudes/${solicitudId}/constancia`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo descargar la constancia. Verifique el estado de la solicitud.");
    }
    
    return response.blob();
  },

  exportarSolicitudesExcel: async (desde: string, hasta: string) => {
    const authStr = localStorage.getItem("ecotacna_auth");
    let token = "";
    if (authStr) {
      try {
        const auth = JSON.parse(authStr);
        if (auth && auth.token) token = auth.token;
      } catch (e) {
        console.warn("Error leyendo auth storage local", e);
      }
    }

    const { BASE_URL } = await import("./apiClient");
    const response = await fetch(`${BASE_URL}/empresa/solicitudes/exportar?desde=${desde}&hasta=${hasta}`, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error("No se pudo exportar el historial de solicitudes.");
    }
    return response.blob();
  }
};
