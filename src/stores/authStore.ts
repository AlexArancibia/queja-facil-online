import { create } from 'zustand';
import apiClient, { apiHelpers } from '@/lib/api';
import { 
  type User,
  type LoginDto,
  type RegisterDto,
  UserRole
} from '@/types/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

// API functions
const api = {
  async login(credentials: LoginDto): Promise<{ user: User; token: string }> {
    const response = await apiClient.post('/auth/login', credentials);
    return response.data;
  },

  async register(userData: RegisterDto): Promise<{ user: User; message: string }> {
    const response = await apiClient.post('/auth/register', userData);
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  async verifyEmail(email: string, token: string): Promise<void> {
    await apiClient.post('/auth/verify-email', { email, token });
  },

  async resendVerification(email: string): Promise<void> {
    await apiClient.post('/auth/resend-verification', { email });
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/auth/forgot-password', { email });
  },

  async resetPassword(token: string, password: string): Promise<void> {
    await apiClient.post('/auth/reset-password', { token, password });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/auth/change-password', { currentPassword, newPassword });
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,

  login: async (credentials) => {
    set({ loading: true, error: null });
    try {
      const response = await api.login(credentials);
      apiHelpers.setAuthToken(response.token);
      set({ 
        user: response.user, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al iniciar sesión', 
        loading: false,
        isAuthenticated: false,
        user: null
      });
      throw error;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      await api.register(userData);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al registrarse', 
        loading: false 
      });
      throw error;
    }
  },

  logout: () => {
    apiHelpers.clearAuthToken();
    set({ 
      user: null, 
      isAuthenticated: false, 
      error: null 
    });
  },

  getCurrentUser: async () => {
    if (!apiHelpers.isAuthenticated()) {
      set({ isAuthenticated: false, user: null });
      return;
    }

    set({ loading: true, error: null });
    try {
      const user = await api.getCurrentUser();
      set({ 
        user, 
        isAuthenticated: true, 
        loading: false 
      });
    } catch (error: any) {
      // If token is invalid, logout
      if (error.response?.status === 401) {
        apiHelpers.clearAuthToken();
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false 
        });
      } else {
        set({ 
          error: error.response?.data?.message || 'Error al cargar el usuario', 
          loading: false 
        });
      }
    }
  },

  verifyEmail: async (email, token) => {
    set({ loading: true, error: null });
    try {
      await api.verifyEmail(email, token);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al verificar el email', 
        loading: false 
      });
      throw error;
    }
  },

  resendVerification: async (email) => {
    set({ loading: true, error: null });
    try {
      await api.resendVerification(email);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al reenviar la verificación', 
        loading: false 
      });
      throw error;
    }
  },

  forgotPassword: async (email) => {
    set({ loading: true, error: null });
    try {
      await api.forgotPassword(email);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al enviar el email de recuperación', 
        loading: false 
      });
      throw error;
    }
  },

  resetPassword: async (token, password) => {
    set({ loading: true, error: null });
    try {
      await api.resetPassword(token, password);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al restablecer la contraseña', 
        loading: false 
      });
      throw error;
    }
  },

  changePassword: async (currentPassword, newPassword) => {
    set({ loading: true, error: null });
    try {
      await api.changePassword(currentPassword, newPassword);
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cambiar la contraseña', 
        loading: false 
      });
      throw error;
    }
  }
}));