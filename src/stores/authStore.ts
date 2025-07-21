import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
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
  users: User[];
  usersLoading: boolean;
  
  // Actions
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  getCurrentUser: () => Promise<void>;
  getAllUsers: () => Promise<void>;
  updateUser: (id: string, userData: any) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  verifyEmail: (email: string, token: string) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      error: null,
      users: [],
      usersLoading: false,

      initializeAuth: async () => {
        console.log('🚀 Inicializando autenticación...');
        const token = apiHelpers.getAuthToken();
        
        if (token) {
          console.log('🔑 Token encontrado, verificando validez...');
          try {
            // Verificar si el token es válido obteniendo el usuario actual
            await get().getCurrentUser();
          } catch (error) {
            console.log('❌ Token inválido, limpiando estado...');
            get().logout();
          }
        } else {
          console.log('❌ No hay token, usuario no autenticado');
          set({ isAuthenticated: false, user: null });
        }
      },

      login: async (credentials) => {
        console.log('🔐 Login iniciado con:', credentials);
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post('/auth/login', credentials);
          console.log('✅ Login exitoso:', response.data);
          
          // El servidor devuelve access_token y userInfo
          apiHelpers.setAuthToken(response.data.access_token);
          set({ 
            user: response.data.userInfo, 
            isAuthenticated: true, 
            loading: false 
          });
        } catch (error: any) {
          console.error('❌ Error en login:', error);
          console.error('❌ Error response:', error.response?.data);
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
        console.log('📝 Registro iniciado con:', userData);
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post('/auth', userData);
          console.log('✅ Registro exitoso:', response.data);
          set({ loading: false });
        } catch (error: any) {
          console.error('❌ Error en registro:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al registrarse', 
            loading: false 
          });
          throw error;
        }
      },

      logout: () => {
        console.log('🚪 Logout iniciado');
        apiHelpers.clearAuthToken();
        set({ 
          user: null, 
          isAuthenticated: false, 
          error: null 
        });
        console.log('✅ Logout completado');
      },

      getCurrentUser: async () => {
        console.log('👤 Obteniendo usuario actual');
        if (!apiHelpers.isAuthenticated()) {
          console.log('❌ Usuario no autenticado');
          set({ isAuthenticated: false, user: null });
          return;
        }

        // Si ya tenemos el usuario en el estado, no necesitamos hacer la llamada
        const currentState = get();
        if (currentState.user) {
          console.log('✅ Usuario ya disponible en el estado');
          set({ isAuthenticated: true, loading: false });
          return;
        }

        console.log('❌ No hay usuario en el estado, pero hay token');
        // Si hay token pero no usuario, limpiar el estado
        apiHelpers.clearAuthToken();
        set({ 
          user: null, 
          isAuthenticated: false, 
          loading: false 
        });
      },

      verifyEmail: async (email, token) => {
        console.log('📧 Verificando email:', { email, token });
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post('/auth/verify-email', { email, token });
          console.log('✅ Email verificado:', response.data);
          set({ loading: false });
        } catch (error: any) {
          console.error('❌ Error verificando email:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al verificar el email', 
            loading: false 
          });
          throw error;
        }
      },

      resendVerification: async (email) => {
        console.log('🔄 Reenviando verificación para:', email);
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post('/auth/resend-verification', { email });
          console.log('✅ Verificación reenviada:', response.data);
          set({ loading: false });
        } catch (error: any) {
          console.error('❌ Error reenviando verificación:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al reenviar la verificación', 
            loading: false 
          });
          throw error;
        }
      },

      forgotPassword: async (email) => {
        console.log('🔑 Olvidé contraseña para:', email);
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post('/auth/forgot-password', { email });
          console.log('✅ Email de recuperación enviado:', response.data);
          set({ loading: false });
        } catch (error: any) {
          console.error('❌ Error enviando email de recuperación:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al enviar el email de recuperación', 
            loading: false 
          });
          throw error;
        }
      },

      resetPassword: async (token, password) => {
        console.log('🔐 Restableciendo contraseña con token:', token);
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post('/auth/reset-password', { token, password });
          console.log('✅ Contraseña restablecida:', response.data);
          set({ loading: false });
        } catch (error: any) {
          console.error('❌ Error restableciendo contraseña:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al restablecer la contraseña', 
            loading: false 
          });
          throw error;
        }
      },

      changePassword: async (currentPassword, newPassword) => {
        console.log('🔄 Cambiando contraseña');
        set({ loading: true, error: null });
        try {
          const response = await apiClient.post('/auth/change-password', { currentPassword, newPassword });
          console.log('✅ Contraseña cambiada:', response.data);
          set({ loading: false });
        } catch (error: any) {
          console.error('❌ Error cambiando contraseña:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al cambiar la contraseña', 
            loading: false 
          });
          throw error;
        }
      },

      getAllUsers: async () => {
        console.log('👥 Obteniendo todos los usuarios');
        set({ usersLoading: true, error: null });
        try {
          const response = await apiClient.get('/auth');
          console.log('✅ Usuarios obtenidos:', response.data);
          set({ 
            users: response.data, 
            usersLoading: false 
          });
        } catch (error: any) {
          console.error('❌ Error obteniendo usuarios:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al obtener usuarios', 
            usersLoading: false 
          });
          throw error;
        }
      },

      updateUser: async (id: string, userData: any) => {
        console.log('🔄 Actualizando usuario:', { id, userData });
        set({ loading: true, error: null });
        try {
          const response = await apiClient.patch(`/auth/${id}`, userData);
          console.log('✅ Usuario actualizado:', response.data);
          
          // Actualizar la lista de usuarios
          const currentUsers = get().users;
          const updatedUsers = currentUsers.map(user => 
            user.id === id ? { ...user, ...response.data } : user
          );
          set({ users: updatedUsers, loading: false });
        } catch (error: any) {
          console.error('❌ Error actualizando usuario:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al actualizar usuario', 
            loading: false 
          });
          throw error;
        }
      },

      deleteUser: async (id: string) => {
        console.log('🗑️ Eliminando usuario:', id);
        set({ loading: true, error: null });
        try {
          await apiClient.delete(`/auth/${id}`);
          console.log('✅ Usuario eliminado');
          
          // Remover de la lista de usuarios
          const currentUsers = get().users;
          const updatedUsers = currentUsers.filter(user => user.id !== id);
          set({ users: updatedUsers, loading: false });
        } catch (error: any) {
          console.error('❌ Error eliminando usuario:', error);
          console.error('❌ Error response:', error.response?.data);
          set({ 
            error: error.response?.data?.message || 'Error al eliminar usuario', 
            loading: false 
          });
          throw error;
        }
      }
    }),
    {
      name: 'siclo_quejas_auth_storage_v1', // nombre único para el localStorage
      storage: createJSONStorage(() => localStorage),
      // Solo persistir estos campos
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // Restaurar solo estos campos al cargar
      onRehydrateStorage: () => (state) => {
        console.log('🔄 Estado de autenticación restaurado:', state);
      },
    }
  )
);