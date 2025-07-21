import { useBranchesStore } from '@/stores/branchesStore';
import { useAuthStore } from '@/stores/authStore';
import { UserRole } from '@/types/api';

export interface EmailMetadata {
  branchId?: string;
  branchName?: string;
  managers?: Array<{
    id: string;
    name: string;
    email: string;
  }>;
  type?: 'complaint' | 'rating' | 'status_update';
  entityId?: string;
}

/**
 * Obtiene metadata del branch y sus managers para incluir en emails
 */
export const getBranchEmailMetadata = async (
  branchId: string,
  type: 'complaint' | 'rating' | 'status_update',
  entityId?: string
): Promise<EmailMetadata> => {
  try {
    // Obtener información del branch
    const branchesStore = useBranchesStore.getState();
    const authStore = useAuthStore.getState();
    
    // Buscar el branch en el store local
    let branchName = 'Local';
    const localBranch = branchesStore.branches.find(b => b.id === branchId);
    if (localBranch) {
      branchName = localBranch.name;
    } else {
      // Si no está en el store local, intentar obtenerlo de la API
      try {
        const branch = await branchesStore.getBranchById(branchId);
        branchName = branch.name;
      } catch (error) {
        console.warn('No se pudo obtener información del branch:', branchId);
      }
    }

    // Obtener managers del branch
    let managers: Array<{ id: string; name: string; email: string }> = [];
    try {
      // Obtener todos los usuarios del sistema si están disponibles
      const allUsers = authStore.users || [];
      
      // Filtrar managers que pertenezcan a este branch
      const branchManagers = allUsers.filter(user => 
        user.role === UserRole.MANAGER && 
        user.branches && 
        user.branches.some(branch => branch.id === branchId)
      );

      managers = branchManagers.map(manager => ({
        id: manager.id,
        name: manager.name || `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || 'Manager',
        email: manager.email
      }));

      // Si no hay managers en el store local, intentar obtenerlos de la API
      if (managers.length === 0) {
        try {
          const branchUsers = await branchesStore.getBranchUsers(branchId);
          const branchManagersFromApi = branchUsers.filter(user => user.role === UserRole.MANAGER);
          
          managers = branchManagersFromApi.map(manager => ({
            id: manager.id,
            name: manager.name || `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || 'Manager',
            email: manager.email
          }));
        } catch (error) {
          console.warn('No se pudo obtener managers del branch desde API:', branchId);
        }
      }
    } catch (error) {
      console.warn('Error obteniendo managers del branch:', error);
    }

    const metadata: EmailMetadata = {
      branchId,
      branchName,
      managers,
      type,
      entityId
    };

    console.log('📧 Metadata generada para email:', {
      branchId,
      branchName,
      managersCount: managers.length,
      type,
      entityId
    });

    return metadata;
  } catch (error) {
    console.error('Error generando metadata de email:', error);
    
    // Retornar metadata básica en caso de error
    return {
      branchId,
      branchName: 'Local',
      managers: [],
      type,
      entityId
    };
  }
};

/**
 * Obtiene metadata de forma síncrona usando solo datos del store local
 */
export const getBranchEmailMetadataSync = (
  branchId: string,
  type: 'complaint' | 'rating' | 'status_update',
  entityId?: string
): EmailMetadata => {
  const branchesStore = useBranchesStore.getState();
  const authStore = useAuthStore.getState();
  
  // Obtener nombre del branch
  const localBranch = branchesStore.branches.find(b => b.id === branchId);
  const branchName = localBranch?.name || 'Local';
  
  // Obtener managers del branch
  const allUsers = authStore.users || [];
  const branchManagers = allUsers.filter(user => 
    user.role === UserRole.MANAGER && 
    user.branches && 
    user.branches.some(branch => branch.id === branchId)
  );

  const managers = branchManagers.map(manager => ({
    id: manager.id,
    name: manager.name || `${manager.firstName || ''} ${manager.lastName || ''}`.trim() || 'Manager',
    email: manager.email
  }));

  const metadata: EmailMetadata = {
    branchId,
    branchName,
    managers,
    type,
    entityId
  };

  console.log('📧 Metadata síncrona generada para email:', {
    branchId,
    branchName,
    managersCount: managers.length,
    type,
    entityId
  });

  return metadata;
}; 