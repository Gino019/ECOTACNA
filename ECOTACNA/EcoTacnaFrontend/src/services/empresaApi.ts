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
  }) => {
    return apiClient<PickupRequest>("/empresa/solicitudes", {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  getSeguimientoActivo: async () => {
    return await apiClient<import("../types").PickupTrackingResponse>("/empresa/seguimiento-activo", { method: "GET" });
  }
};
