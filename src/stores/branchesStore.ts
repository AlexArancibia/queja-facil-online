import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type Branch,
  type CreateBranchDto,
  type UpdateBranchDto
} from '@/types/api';

interface BranchesState {
  branches: Branch[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchBranches: (active?: boolean) => Promise<void>;
  createBranch: (branch: CreateBranchDto) => Promise<Branch>;
  updateBranch: (id: string, updates: UpdateBranchDto) => Promise<Branch>;
  deleteBranch: (id: string) => Promise<void>;
  getBranchById: (id: string) => Promise<Branch>;
  getAllBranches: () => Promise<Branch[]>; // For dropdowns and selects
  getBranchUsers: (id: string) => Promise<any[]>;
  getBranchInstructors: (id: string) => Promise<any[]>;
  getBranchComplaints: (id: string, status?: string) => Promise<any[]>;
  getBranchRatings: (id: string) => Promise<any[]>;
}

export const useBranchesStore = create<BranchesState>((set, get) => ({
  branches: [],
  loading: false,
  error: null,

  fetchBranches: async (active) => {
    set({ loading: true, error: null });
    try {
      const searchParams = new URLSearchParams();
      if (active !== undefined) searchParams.append('active', active.toString());
      
      const response = await apiClient.get<Branch[]>(`/branches?${searchParams.toString()}`);
      
      set({ 
        branches: response.data,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar las sucursales', loading: false });
    }
  },

  createBranch: async (branch) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<Branch>('/branches', branch);
      await get().fetchBranches();
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear la sucursal', loading: false });
      throw error;
    }
  },

  updateBranch: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch<Branch>(`/branches/${id}`, updates);
      await get().fetchBranches();
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar la sucursal', loading: false });
      throw error;
    }
  },

  deleteBranch: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/branches/${id}`);
      await get().fetchBranches();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar la sucursal', loading: false });
      throw error;
    }
  },

  getBranchById: async (id) => {
    try {
      const response = await apiClient.get<Branch>(`/branches/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getAllBranches: async () => {
    try {
      const response = await apiClient.get<Branch[]>('/branches?active=true');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getBranchUsers: async (id) => {
    try {
      const response = await apiClient.get<any[]>(`/branches/${id}/users`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getBranchInstructors: async (id) => {
    try {
      const response = await apiClient.get<any[]>(`/branches/${id}/instructors`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getBranchComplaints: async (id, status) => {
    try {
      const searchParams = new URLSearchParams();
      if (status) searchParams.append('status', status);
      
      const response = await apiClient.get<any[]>(`/branches/${id}/complaints?${searchParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getBranchRatings: async (id) => {
    try {
      const response = await apiClient.get<any[]>(`/branches/${id}/ratings`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}));