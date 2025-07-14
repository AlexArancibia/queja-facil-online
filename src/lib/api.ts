import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from "axios";

// Public API key for public endpoints
const PUBLIC_API_KEY = "MIIBIjraar33314iG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAv7oK2LrZxTbbZaffararxk3zSTxB0W0dXpJ9UDszX8aFQ9/uNsMZj+v34y6b57Jprds0kZyAbs8yDmhnxHvR5Ln85YVpP7Zm1fZqV+m1pWn6pSLoQo5X9nM5XwvR9LmUpl9Jl5m6+lM9GHRgVxyN7EHRR+op+Yh7VGpLLftNyP3gf+5RfzHk4vvzLz1XOD+SbV02RHEh5pP/9JBo9CjvZZZ7sFIJh";

// Create Axios instance with the backend URL
const apiClient: AxiosInstance = axios.create({
  baseURL: "https://quejasapi.emetstudio.com/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor to include authentication
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    // Get token from localStorage if in browser environment
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

    // Set Authorization header with token or use X-API-Key for public endpoints
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    } else {
      // Use X-API-Key for public endpoints (complaints, ratings creation)
      config.headers["X-API-Key"] = PUBLIC_API_KEY;
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
    return response;
  },
  (error) => {
    if (error.response) {
      console.error("API Error:", {
        status: error.response.status,
        data: error.response.data,
        url: error.config?.url,
      });

      // Handle specific HTTP status codes
      switch (error.response.status) {
        case 401:
          // Unauthorized - clear token and redirect to login
          if (typeof window !== "undefined") {
            localStorage.removeItem("access_token");
            // Only redirect if we're not already on login page
            if (window.location.pathname !== "/login") {
              window.location.href = "/login";
            }
          }
          break;
        case 403:
          console.error("Access forbidden");
          break;
        case 404:
          console.error("Resource not found");
          break;
        case 500:
          console.error("Internal server error");
          break;
      }
    } else if (error.request) {
      console.error("No response received from API");
    } else {
      console.error("Error setting up request:", error.message);
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
      localStorage.setItem("access_token", token);
    }
  },
  
  getAuthToken: (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("access_token");
    }
    return null;
  },
  
  clearAuthToken: () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token");
    }
  },
  
  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return !!apiHelpers.getAuthToken();
  }
};