import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type Instructor,
  type CreateInstructorDto,
  type UpdateInstructorDto,
  type PaginatedResponse,
  type Discipline
} from '@/types/api';

interface InstructorsState {
  instructors: Instructor[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchInstructors: (params?: { page?: number; limit?: number; branchId?: string; active?: boolean }) => Promise<void>;
  createInstructor: (instructor: CreateInstructorDto) => Promise<string>;
  updateInstructor: (id: string, updates: UpdateInstructorDto) => Promise<void>;
  deleteInstructor: (id: string) => Promise<void>;
  getInstructorById: (id: string) => Promise<Instructor>;
  getInstructorsByBranch: (branchId: string) => Promise<Instructor[]>;
}

// API functions
const api = {
  async getInstructors(params?: { page?: number; limit?: number; branchId?: string; active?: boolean }): Promise<PaginatedResponse<Instructor>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.branchId) searchParams.append('branchId', params.branchId);
    if (params?.active !== undefined) searchParams.append('active', params.active.toString());
    
    const response = await apiClient.get(`/instructors?${searchParams.toString()}`);
    return response.data;
  },

  async createInstructor(instructor: CreateInstructorDto): Promise<{ id: string }> {
    const response = await apiClient.post('/instructors', instructor);
    return response.data;
  },

  async updateInstructor(id: string, updates: UpdateInstructorDto): Promise<void> {
    await apiClient.patch(`/instructors/${id}`, updates);
  },

  async deleteInstructor(id: string): Promise<void> {
    await apiClient.delete(`/instructors/${id}`);
  },

  async getInstructorById(id: string): Promise<Instructor> {
    const response = await apiClient.get(`/instructors/${id}`);
    return response.data;
  },

  async getInstructorsByBranch(branchId: string): Promise<Instructor[]> {
    const response = await apiClient.get(`/instructors?branchId=${branchId}&active=true`);
    return response.data.data || [];
  }
};

export const useInstructorsStore = create<InstructorsState>((set, get) => ({
  instructors: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },

  fetchInstructors: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getInstructors(params);
      set({ 
        instructors: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        },
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar los instructores', loading: false });
    }
  },

  createInstructor: async (instructor) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createInstructor(instructor);
      await get().fetchInstructors();
      set({ loading: false });
      return response.id;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear el instructor', loading: false });
      throw error;
    }
  },

  updateInstructor: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateInstructor(id, updates);
      await get().fetchInstructors();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar el instructor', loading: false });
      throw error;
    }
  },

  deleteInstructor: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteInstructor(id);
      await get().fetchInstructors();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar el instructor', loading: false });
      throw error;
    }
  },

  getInstructorById: async (id) => {
    try {
      return await api.getInstructorById(id);
    } catch (error: any) {
      throw error;
    }
  },

  getInstructorsByBranch: async (branchId) => {
    try {
      return await api.getInstructorsByBranch(branchId);
    } catch (error: any) {
      throw error;
    }
  }
}));