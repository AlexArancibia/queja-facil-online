import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type Branch,
  type CreateBranchDto,
  type UpdateBranchDto,
  type PaginatedResponse
} from '@/types/api';

interface BranchesState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchBranches: (params?: { page?: number; limit?: number; active?: boolean }) => Promise<void>;
  createBranch: (branch: CreateBranchDto) => Promise<string>;
  updateBranch: (id: string, updates: UpdateBranchDto) => Promise<void>;
  deleteBranch: (id: string) => Promise<void>;
  getBranchById: (id: string) => Promise<Branch>;
  getAllBranches: () => Promise<Branch[]>; // For dropdowns and selects
}

// API functions
const api = {
  async getBranches(params?: { page?: number; limit?: number; active?: boolean }): Promise<PaginatedResponse<Branch>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    
    const response = await apiClient.get(`/branches?${searchParams.toString()}`);
    return response.data;
  },

  async createBranch(branch: CreateBranchDto): Promise<{ id: string }> {
    const response = await apiClient.post('/branches', branch);
    return response.data;
  },

  async updateBranch(id: string, updates: UpdateBranchDto): Promise<void> {
    await apiClient.patch(`/branches/${id}`, updates);
  },

  async deleteBranch(id: string): Promise<void> {
    await apiClient.delete(`/branches/${id}`);
  },

  async getBranchById(id: string): Promise<Branch> {
    const response = await apiClient.get(`/branches/${id}`);
    return response.data;
  },

  async getAllBranches(): Promise<Branch[]> {
    const response = await apiClient.get('/branches?active=true');
    return response.data.data || [];
  }
};

export const useBranchesStore = create<BranchesState>((set, get) => ({
  branches: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },

  fetchBranches: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getBranches(params);
      set({ 
        branches: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        },
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar las sucursales', loading: false });
    }
  },

  createBranch: async (branch) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createBranch(branch);
      await get().fetchBranches();
      set({ loading: false });
      return response.id;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear la sucursal', loading: false });
      throw error;
    }
  },

  updateBranch: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateBranch(id, updates);
      await get().fetchBranches();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar la sucursal', loading: false });
      throw error;
    }
  },

  deleteBranch: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteBranch(id);
      await get().fetchBranches();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar la sucursal', loading: false });
      throw error;
    }
  },

  getBranchById: async (id) => {
    try {
      return await api.getBranchById(id);
    } catch (error: any) {
      throw error;
    }
  },

  getAllBranches: async () => {
    try {
      return await api.getAllBranches();
    } catch (error: any) {
      throw error;
    }
  }
}));