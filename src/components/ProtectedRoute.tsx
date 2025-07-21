import { ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/api';
import LoadingSpinner from './LoadingSpinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: UserRole;
  allowedRoles?: UserRole[];
  fallbackPath?: string;
}

const ProtectedRoute = ({ 
  children, 
  requiredRole, 
  allowedRoles,
  fallbackPath = '/login' 
}: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, loading } = useAuthStore();

  useEffect(() => {
    console.log('🔍 ProtectedRoute - Estado:', { user, isAuthenticated, loading, requiredRole });
    
    if (!loading) {
      if (!isAuthenticated || !user) {
        console.log('🔒 Usuario no autenticado, redirigiendo a login');
        navigate(fallbackPath);
        return;
      }

      const hasPermission = allowedRoles 
        ? allowedRoles.includes(user.role)
        : requiredRole 
          ? user.role === requiredRole 
          : true;

      if ((requiredRole || allowedRoles) && !hasPermission) {
        console.log('🚫 Usuario no tiene permisos suficientes', {
          userRole: user.role,
          requiredRole,
          allowedRoles
        });
        
        // Redirigir según el rol del usuario
        switch (user.role) {
          case UserRole.ADMIN:
            navigate('/admin');
            break;
          case UserRole.MANAGER:
          case UserRole.SUPERVISOR:
            navigate('/manager');
            break;
          default:
            navigate('/');
        }
        return;
      }
      
      console.log('✅ Usuario autorizado, mostrando contenido');
    }
  }, [isAuthenticated, user, loading, requiredRole, navigate, fallbackPath]);

  // Mostrar loading mientras se verifica la autenticación
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando permisos..." />
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated || !user) {
    return null;
  }

  // Si no tiene el rol requerido, no mostrar nada (se redirigirá)
  const hasPermission = allowedRoles 
    ? allowedRoles.includes(user.role)
    : requiredRole 
      ? user.role === requiredRole 
      : true;

  if ((requiredRole || allowedRoles) && !hasPermission) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute; 