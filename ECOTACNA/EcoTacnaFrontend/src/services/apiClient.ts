const resolveBaseUrl = () => {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  if (configuredUrl) return configuredUrl.replace(/\/$/, "");

  if (typeof window === "undefined") return "/ecotacna/api";

  // Local development backend runs on localhost:8082.
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return `${window.location.protocol}//${window.location.hostname}:8082/ecotacna/api`;
  }

  // In production, if no BASE URL is configured, use a relative path.
  console.warn(
    "VITE_API_BASE_URL is not set. Falling back to /ecotacna/api. Configure VITE_API_BASE_URL for production deployments."
  );
  return "/ecotacna/api";
};

export const BASE_URL = resolveBaseUrl();

export interface ApiResponse<T = unknown> {
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
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const extractMessage = (payload: unknown, fallback: string) => {
  if (payload && typeof payload === "object") {
    const p = payload as Record<string, unknown>;
    if (typeof p.message === "string" && p.message.trim()) return p.message;
    if (typeof p.error === "string" && p.error.trim()) return p.error;
  }
  return fallback;
};

const normalizePayload = <T>(payload: unknown, status: number): ApiResponse<T> => {
  if (payload && typeof payload === "object" && !Array.isArray(payload) && "success" in payload) {
    return {
      success: Boolean((payload as Record<string, unknown>).success),
      message: extractMessage(payload, (payload as Record<string, unknown>).success ? "OK" : "Error en la petición"),
      data: (payload as Record<string, unknown>).data !== undefined ? (payload as Record<string, unknown>).data as T : undefined,
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
    } catch (e) {
      // ignore parsing error
    }
  }

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    "Accept": "application/json",
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    const rawText = await response.text().catch(() => "");
    let parsed: unknown = null;
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
  } catch (error: unknown) {
    if (error instanceof ApiError) throw error;
    const msg = error instanceof Error ? error.message : "Error de red";
    throw new ApiError(msg, false);
  }
}
