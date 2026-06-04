import { apiClient } from "./apiClient";

export const recolectorApi = {
  getPerfil: async () => {
    return await apiClient<any>("/recolector/perfil", { method: "GET" });
  },

  getResumen: async () => {
    return await apiClient<any>("/recolector/resumen", { method: "GET" });
  },

  getSolicitudes: async () => {
    return await apiClient<any>("/recolector/solicitudes", { method: "GET" });
  },

  getTransportes: async () => {
    return await apiClient<any>("/recolector/transportes", { method: "GET" });
  },

  getUnidades: async () => {
    return await apiClient<any>("/recolector/unidades", { method: "GET" });
  },

  crearUnidad: async (body: {
    placa: string;
    tipo: string;
    capacidadLitros: number;
    activo: boolean;
  }) => {
    return apiClient<any>("/recolector/unidades", {
      method: "POST",
      body: JSON.stringify(body)
    });
  },

  actualizarUnidad: async (id: number, body: {
    placa: string;
    tipo: string;
    capacidadLitros: number;
    activo: boolean;
  }) => {
    return apiClient<any>(`/recolector/unidades/${id}`, {
      method: "PUT",
      body: JSON.stringify(body)
    });
  },

  iniciarRuta: async (solicitudId: number) => {
    return apiClient<any>(`/recolector/recojos/${solicitudId}/en-ruta`, {
      method: "PUT"
    });
  },

  confirmarRecojo: async (solicitudId: number, volumenReal: number) => {
    return apiClient<any>(`/recolector/recojos/${solicitudId}/confirmar`, {
      method: "PUT",
      body: JSON.stringify({ volumenReal }),
    });
  }
};
