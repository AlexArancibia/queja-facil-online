import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// Public API key for public endpoints
const PUBLIC_API_KEY = "MIIBIjraar33314iG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv7oK2LrZxTbbZaffararxk3zSTxB0W0dXpJ9UDszX8aFQ9/uNsMZj+v34y6b57Jprds0kZyAbs8yDmhnxHvR5Ln85YVpP7Zm1fZqV+m1pWn6pSLoQo5X9nM5XwvR9LmUpl9Jl5m6+lM9GHRgVxyN7EHRR+op+Yh7VGpLLftNyP3gf+5RfzHk4vvzLz1XOD+SbV02RHEh5pP/9JBo9CjvZZZ7sFIJh";

// Token storage key - más específico para el sistema de quejas
const AUTH_TOKEN_KEY = "siclo_quejas_sistema_auth_token_v1";

// Create Axios instance with the backend URL
const apiClient: AxiosInstance = axios.create({
  baseURL: "https://quejasapi.emetstudio.com",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to include authentication
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from localStorage if in browser environment
    const token = typeof window !== "undefined" ? localStorage.getItem(AUTH_TOKEN_KEY) : null;

    // Always use Authorization header with Bearer prefix
    if (token) {
      // Use Bearer token for authenticated requests
      config.headers["Authorization"] = `Bearer ${token}`;
      console.log('🔑 Usando token de autenticación para:', config.url);
    } else {
      // Use public API key for unauthenticated requests
      config.headers["Authorization"] = `Bearer ${PUBLIC_API_KEY}`;
      console.log('🌐 Usando API key pública para:', config.url);
    }

    return config;
  },
  (error: any) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('✅ API Response:', {
      status: response.status,
      url: response.config?.url,
      method: response.config?.method
    });
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("❌ API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers
      });

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          console.log('🔒 Error 401 - Token inválido o expirado');
          apiHelpers.clearAuthToken();
          // You might want to redirect to login page here
          break;
        case 403:
          // Forbidden - user doesn't have permission
          console.error("🚫 Access forbidden - Usuario sin permisos");
          break;
        case 404:
          // Not found
          console.error("🔍 Resource not found - Recurso no encontrado");
          break;
        case 500:
          // Internal server error
          console.error("💥 Internal server error - Error del servidor");
          break;
        default:
          console.error("❓ Unexpected error occurred - Error inesperado");
      }
    } else if (error.request) {
      console.error("🌐 No response received from API - Sin respuesta del servidor");
    } else {
      console.error("⚙️ Error setting up request:", error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;

// Helper functions for API calls
export const apiHelpers = {
  // Auth helpers
  setAuthToken: (token: string) => {
    if (typeof window !== "undefined") {
      localStorage.setItem(AUTH_TOKEN_KEY, token);
      console.log('💾 Token guardado en localStorage');
    }
  },
  
  getAuthToken: (): string | null => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem(AUTH_TOKEN_KEY);
      console.log('🔍 Token obtenido:', token ? 'SÍ' : 'NO');
      return token;
    }
    return null;
  },
  
  clearAuthToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(AUTH_TOKEN_KEY);
      console.log('🗑️ Token eliminado de localStorage');
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const hasToken = !!apiHelpers.getAuthToken();
    console.log('🔐 Usuario autenticado:', hasToken);
    return hasToken;
  },

  // Helper to manually set API key for specific requests
  setApiKey: (key: string) => {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${key}`;
    console.log('🔑 API key configurada manualmente');
  }
};

