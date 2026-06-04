import { apiClient } from "./apiClient";

export const adminApi = {
  getResumen: async () => {
    return await apiClient<any>("/admin/resumen", { method: "GET" });
  },

  getEmpresas: async () => {
    return await apiClient<any>("/admin/empresas", { method: "GET" });
  },

  getUsuarios: async () => {
    return await apiClient<any>("/admin/usuarios", { method: "GET" });
  },

  getSolicitudes: async () => {
    return await apiClient<any>("/admin/solicitudes", { method: "GET" });
  },

  getTransportes: async () => {
    return await apiClient<any>("/admin/transportes", { method: "GET" });
  },

  asignarSolicitud: async (id: number, body: { recolectorId: number, transporteId: number }) => {
    return await apiClient<any>(`/admin/solicitudes/${id}/asignar`, {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  actualizarSuscripcion: async (empresaId: number, subscriptionStatus: string) => {
    return await apiClient<any>(`/admin/suscripciones/${empresaId}`, {
      method: "PUT",
      body: JSON.stringify({ subscriptionStatus })
    });
  }
};
