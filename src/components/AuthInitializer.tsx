import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

const AuthInitializer = () => {
  const { initializeAuth, user, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    console.log('🚀 AuthInitializer: Inicializando autenticación...');
    console.log('🔍 AuthInitializer - Estado actual:', { user, isAuthenticated, loading });
    initializeAuth();
  }, [initializeAuth]);

  useEffect(() => {
    console.log('🔄 AuthInitializer - Estado actualizado:', { user, isAuthenticated, loading });
  }, [user, isAuthenticated, loading]);

  return null; // Este componente no renderiza nada
};

export default AuthInitializer; 