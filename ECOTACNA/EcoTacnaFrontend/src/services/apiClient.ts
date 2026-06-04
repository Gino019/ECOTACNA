const resolveBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (typeof window === "undefined") return "/ecotacna/api";
  return `${window.location.protocol}//${window.location.hostname}:8082/ecotacna/api`;
};

export const BASE_URL = resolveBaseUrl();

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  status?: number;
}

export class ApiError extends Error {
  constructor(
    public message: string,
    public isAuthError: boolean = false,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const extractMessage = (payload: any, fallback: string) => {
  if (payload && typeof payload.message === "string" && payload.message.trim()) return payload.message;
  if (payload && typeof payload.error === "string" && payload.error.trim()) return payload.error;
  return fallback;
};

const normalizePayload = <T>(payload: any, status: number): ApiResponse<T> => {
  if (payload && typeof payload === "object" && !Array.isArray(payload) && "success" in payload) {
    return {
      success: Boolean(payload.success),
      message: extractMessage(payload, payload.success ? "OK" : "Error en la petición"),
      data: payload.data !== undefined ? payload.data : null,
      status,
    };
  }

  return {
    success: true,
    data: payload as T,
    status,
  };
};

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${BASE_URL}${endpoint}`;
  const authStr = localStorage.getItem("ecotacna_auth");
  let token = null;
  if (authStr) {
    try {
      const auth = JSON.parse(authStr);
      if (auth && auth.token) {
        token = auth.token;
      }
    } catch (e) {}
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const rawText = await response.text().catch(() => "");
    let parsed: any = null;
    if (rawText) {
      try {
        parsed = JSON.parse(rawText);
      } catch {
        parsed = rawText;
      }
    }

    // console.log("API RAW", url, response.status, rawText);
    const normalized = normalizePayload<T>(parsed, response.status);
    // console.log("API NORMALIZADO", normalized);

    if (!response.ok) {
      const message = extractMessage(parsed, `Error HTTP: ${response.status}`);
      throw new ApiError(message, response.status === 401 || response.status === 403, response.status, normalized.data);
    }

    return normalized;
  } catch (error: any) {
    if (error instanceof ApiError) throw error;
    throw new ApiError(error.message || "Error de red", false);
  }
}
