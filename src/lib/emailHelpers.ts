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
      let allUsers = authStore.users || [];
      
      // Si no hay usuarios cargados, intentar cargarlos
      if (allUsers.length === 0) {
        try {
          await authStore.getAllUsers();
          allUsers = authStore.users || [];
        } catch (error) {
          console.warn('Error cargando usuarios:', error);
        }
      }
      
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
export const getBranchEmailMetadataSync = async (
  branchId: string,
  type: 'complaint' | 'rating' | 'status_update',
  entityId?: string
): Promise<EmailMetadata> => {
  console.log('🔍 getBranchEmailMetadataSync - Iniciando para branchId:', branchId, 'type:', type);
  
  const branchesStore = useBranchesStore.getState();
  const authStore = useAuthStore.getState();
  
  // Obtener nombre del branch
  const localBranch = branchesStore.branches.find(b => b.id === branchId);
  const branchName = localBranch?.name || 'Local';
  console.log('🏢 Branch encontrado:', { id: branchId, name: branchName });
  
  // Obtener managers del branch
  let allUsers = authStore.users || [];
  console.log('👥 Usuarios en store local:', allUsers.length);
  
  // Si no hay usuarios cargados, intentar cargarlos
  if (allUsers.length === 0) {
    try {
      console.log('📥 Cargando usuarios desde API...');
      await authStore.getAllUsers();
      allUsers = authStore.users || [];
      console.log('✅ Usuarios cargados:', allUsers.length);
    } catch (error) {
      console.warn('❌ Error cargando usuarios:', error);
    }
  }
  
  const branchManagers = allUsers.filter(user => 
    user.role === UserRole.MANAGER && 
    user.branches && 
    user.branches.some(branch => branch.id === branchId)
  );

  console.log('👨‍💼 Managers encontrados para branch:', branchManagers.length);
  branchManagers.forEach(manager => {
    console.log('  - Manager:', {
      name: manager.name || `${manager.firstName || ''} ${manager.lastName || ''}`.trim(),
      email: manager.email,
      role: manager.role
    });
  });

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

  console.log('📊 Metadata final generada:', {
    branchId: metadata.branchId,
    branchName: metadata.branchName,
    managersCount: metadata.managers.length,
    type: metadata.type,
    entityId: metadata.entityId
  });

  return metadata;
};

/**
 * Obtiene metadata para quejas sin sucursal (quejas generales)
 * Incluye todos los supervisores y administradores del sistema
 */
export const getGeneralComplaintEmailMetadata = async (
  type: 'complaint' | 'rating' | 'status_update',
  entityId?: string
): Promise<EmailMetadata> => {
  console.log('🌐 getGeneralComplaintEmailMetadata - Iniciando para queja general, type:', type);
  
  try {
    const authStore = useAuthStore.getState();
    
    // Obtener todos los usuarios del sistema
    let allUsers = authStore.users || [];
    console.log('👥 Usuarios en store local:', allUsers.length);
    
    // Si no hay usuarios cargados, intentar cargarlos
    if (allUsers.length === 0) {
      try {
        console.log('📥 Cargando usuarios desde API...');
        await authStore.getAllUsers();
        allUsers = authStore.users || [];
        console.log('✅ Usuarios cargados:', allUsers.length);
      } catch (error) {
        console.warn('❌ Error cargando usuarios:', error);
      }
    }
    
    // Filtrar supervisores y administradores
    const supervisorsAndAdmins = allUsers.filter(user => 
      user.role === UserRole.SUPERVISOR || user.role === UserRole.ADMIN
    );

    console.log('👨‍💼👩‍💼 Supervisores y Administradores encontrados:', supervisorsAndAdmins.length);
    supervisorsAndAdmins.forEach(user => {
      console.log('  - Usuario:', {
        name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        email: user.email,
        role: user.role
      });
    });

    const managers = supervisorsAndAdmins.map(user => ({
      id: user.id,
      name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Usuario',
      email: user.email
    }));

    const metadata: EmailMetadata = {
      branchName: 'Todas las sucursales',
      managers,
      type,
      entityId
    };

    console.log('📊 Metadata final para queja general:', {
      branchName: metadata.branchName,
      managersCount: metadata.managers.length,
      type: metadata.type,
      entityId: metadata.entityId
    });

    return metadata;
  } catch (error) {
    console.error('❌ Error generando metadata para queja general:', error);
    
    // Retornar metadata básica en caso de error
    const fallbackMetadata = {
      branchName: 'Todas las sucursales',
      managers: [],
      type,
      entityId
    };
    
    console.log('🔄 Usando metadata de fallback:', fallbackMetadata);
    return fallbackMetadata;
  }
}; 