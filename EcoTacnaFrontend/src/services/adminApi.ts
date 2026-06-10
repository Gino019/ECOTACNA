import { apiClient } from "./apiClient";
import type { PickupRequest, TransportUnit, Company } from "../types";

export const adminApi = {
  getResumen: async () => {
    return await apiClient<Record<string, unknown>>("/admin/resumen", { method: "GET" });
  },

  getEmpresas: async () => {
    return await apiClient<Company[]>("/admin/empresas", { method: "GET" });
  },

  getRecolectores: async () => {
    return await apiClient<Company[]>("/admin/recolectores", { method: "GET" });
  },

  getUsuarios: async () => {
    return await apiClient<Record<string, unknown>[]>("/admin/usuarios", { method: "GET" });
  },

  getSolicitudes: async () => {
    return await apiClient<PickupRequest[]>("/admin/solicitudes", { method: "GET" });
  },

  getTransportes: async () => {
    return await apiClient<TransportUnit[]>("/admin/transportes", { method: "GET" });
  },

  asignarSolicitud: async (id: number, body: { recolectorId: number, transporteId: number }) => {
    return await apiClient<PickupRequest>(`/admin/solicitudes/${id}/asignar`, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  actualizarSuscripcion: async (empresaId: number, subscriptionStatus: string) => {
    return await apiClient<Company>(`/admin/suscripciones/${empresaId}`, {
      method: "PUT",
      body: JSON.stringify({ subscriptionStatus })
    });
  },

  approveCompany: async (id: number) => {
    return await apiClient<Record<string, unknown>>(`/admin/empresas/${id}/approve`, {
      method: "POST"
    });
  },

  rejectCompany: async (id: number) => {
    return await apiClient<Record<string, unknown>>(`/admin/empresas/${id}/reject`, {
      method: "POST"
    });
  },

  approveRecolector: async (id: number) => {
    return await apiClient<Record<string, unknown>>(`/admin/recolectores/${id}/approve`, {
      method: "POST"
    });
  },

  rejectRecolector: async (id: number) => {
    return await apiClient<Record<string, unknown>>(`/admin/recolectores/${id}/reject`, {
      method: "POST"
    });
  }
};
