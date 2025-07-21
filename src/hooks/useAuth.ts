import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/api';

export const useAuth = () => {
  const authStore = useAuthStore();

  const isAdmin = authStore.user?.role === UserRole.ADMIN;
  const isManager = authStore.user?.role === UserRole.MANAGER;
  const isSupervisor = authStore.user?.role === UserRole.SUPERVISOR;
  const isUser = authStore.user?.role === UserRole.USER;

  const hasRole = (role: UserRole) => authStore.user?.role === role;
  const hasAnyRole = (roles: UserRole[]) => roles.includes(authStore.user?.role || UserRole.USER);

  return {
    ...authStore,
    isAdmin,
    isManager,
    isSupervisor,
    isUser,
    hasRole,
    hasAnyRole,
  };
}; 