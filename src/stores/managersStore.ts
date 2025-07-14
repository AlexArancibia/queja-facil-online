
import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type User,
  type CreateUserDto,
  type UpdateUserDto,
  type Branch,
  type PaginatedResponse,
  UserRole
} from '@/types/api';

export interface Manager extends User {
  branches?: Branch[];
  company?: string;
}

interface ManagersState {
  managers: Manager[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchManagers: (params?: { page?: number; limit?: number; branchId?: string }) => Promise<void>;
  createManager: (manager: CreateUserDto) => Promise<string>;
  updateManager: (id: string, updates: UpdateUserDto) => Promise<void>;
  deleteManager: (id: string) => Promise<void>;
  toggleManagerStatus: (id: string) => Promise<void>;
  getManagerById: (id: string) => Promise<Manager>;
}

// API functions
const api = {
  async getManagers(params?: { page?: number; limit?: number; branchId?: string }): Promise<PaginatedResponse<Manager>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.branchId) searchParams.append('branchId', params.branchId);
    
    const response = await apiClient.get(`/auth?${searchParams.toString()}`);
    
    // Filter only managers and admins
    const filteredData = response.data.data?.filter((user: User) => 
      user.role === UserRole.MANAGER || user.role === UserRole.ADMIN
    ) || [];
    
    return {
      ...response.data,
      data: filteredData
    };
  },

  async createManager(manager: CreateUserDto): Promise<{ id: string }> {
    const managerData = {
      ...manager,
      role: UserRole.MANAGER
    };
    const response = await apiClient.post('/auth', managerData);
    return response.data;
  },

  async updateManager(id: string, updates: UpdateUserDto): Promise<void> {
    await apiClient.patch(`/auth/${id}`, updates);
  },

  async deleteManager(id: string): Promise<void> {
    await apiClient.delete(`/auth/${id}`);
  },

  async toggleManagerStatus(id: string): Promise<void> {
    // First get the current manager to toggle status
    const response = await apiClient.get(`/auth/${id}`);
    const manager = response.data;
    
    await apiClient.patch(`/auth/${id}`, {
      isActive: !manager.isActive
    });
  },

  async getManagerById(id: string): Promise<Manager> {
    const response = await apiClient.get(`/auth/${id}`);
    return response.data;
  }
};

export const useManagersStore = create<ManagersState>((set, get) => ({
  managers: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },

  fetchManagers: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getManagers(params);
      set({ 
        managers: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        },
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar los managers', loading: false });
    }
  },

  createManager: async (manager) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createManager(manager);
      await get().fetchManagers();
      set({ loading: false });
      return response.id;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear el manager', loading: false });
      throw error;
    }
  },

  updateManager: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateManager(id, updates);
      await get().fetchManagers();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar el manager', loading: false });
      throw error;
    }
  },

  deleteManager: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteManager(id);
      await get().fetchManagers();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar el manager', loading: false });
      throw error;
    }
  },

  toggleManagerStatus: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.toggleManagerStatus(id);
      await get().fetchManagers();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cambiar el estado del manager', loading: false });
      throw error;
    }
  },

  getManagerById: async (id) => {
    try {
      return await api.getManagerById(id);
    } catch (error: any) {
      throw error;
    }
  }
}));
