import { apiClient } from "./apiClient";
import type { PickupRequest, TransportUnit } from "../types";

export const recolectorApi = {
  getPerfil: async () => {
    return await apiClient<Record<string, unknown>>("/recolector/perfil", { method: "GET" });
  },

  getResumen: async () => {
    return await apiClient<Record<string, unknown>>("/recolector/resumen", { method: "GET" });
  },

  getDashboard: async () => {
    return await apiClient<Record<string, unknown>>("/recolector/dashboard", { method: "GET" });
  },

  getSolicitudes: async () => {
    return await apiClient<PickupRequest[]>("/recolector/solicitudes", { method: "GET" });
  },

  getSolicitudesAceptadas: async () => {
    return await apiClient<PickupRequest[]>("/recolector/solicitudes-aceptadas", { method: "GET" });
  },

  getRecojosDia: async () => {
    return await apiClient<PickupRequest[]>("/recolector/recojos-dia", { method: "GET" });
  },

  getTransportes: async () => {
    return await apiClient<TransportUnit[]>("/recolector/transportes", { method: "GET" });
  },

  getUnidades: async () => {
    return await apiClient<TransportUnit[]>("/recolector/unidades", { method: "GET" });
  },

  crearUnidad: async (body: {
    placa: string;
    marca?: string;
    modelo?: string;
    tipoUnidad?: string;
    capacidadLitros: number;
    estado?: string;
    observaciones?: string;
  }) => {
    return apiClient<TransportUnit>("/recolector/unidades", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  actualizarUnidad: async (id: number, body: {
    placa: string;
    marca?: string;
    modelo?: string;
    tipoUnidad?: string;
    capacidadLitros: number;
    estado?: string;
    observaciones?: string;
  }) => {
    return apiClient<TransportUnit>(`/recolector/unidades/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },

  iniciarRuta: async (solicitudId: number) => {
    return apiClient<PickupRequest>(`/recolector/recojos/${solicitudId}/en-ruta`, {
      method: "PUT"
    });
  },

  confirmarRecojo: async (solicitudId: number, volumenReal: number) => {
    return apiClient<PickupRequest>(`/recolector/recojos/${solicitudId}/confirmar`, {
      method: "PUT",
      body: JSON.stringify({ volumenReal }),
    });
  },

  getSolicitudesDisponibles: async () => {
    return await apiClient<PickupRequest[]>("/recolector/solicitudes-disponibles", { method: "GET" });
  },

  aceptarSolicitud: async (solicitudId: number) => {
    return await apiClient<PickupRequest>(`/recolector/solicitudes/${solicitudId}/aceptar`, { method: "POST" });
  },

  rechazarSolicitud: async (solicitudId: number) => {
    return await apiClient<void>(`/recolector/solicitudes/${solicitudId}/rechazar`, { method: "POST" });
  },

  getRecojoActivo: async () => {
    return await apiClient<PickupRequest>("/recolector/recojo-activo", { method: "GET" });
  }
};
