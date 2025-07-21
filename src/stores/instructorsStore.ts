import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type Instructor,
  type CreateInstructorDto,
  type UpdateInstructorDto,
  type Rating
} from '@/types/api';

interface InstructorsState {
  instructors: Instructor[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchInstructors: (params?: { branchId?: string; active?: boolean }) => Promise<void>;
  createInstructor: (instructor: CreateInstructorDto) => Promise<Instructor>;
  updateInstructor: (id: string, updates: UpdateInstructorDto) => Promise<Instructor>;
  deleteInstructor: (id: string) => Promise<void>;
  getInstructorById: (id: string) => Promise<Instructor>;
  getAllInstructors: () => Promise<Instructor[]>; // For dropdowns and selects
  getInstructorRatings: (id: string) => Promise<Rating[]>;
}

export const useInstructorsStore = create<InstructorsState>((set, get) => ({
  instructors: [],
  loading: false,
  error: null,

  fetchInstructors: async (params) => {
    set({ loading: true, error: null });
    try {
      const searchParams = new URLSearchParams();
      if (params?.branchId) searchParams.append('branchId', params.branchId);
      if (params?.active !== undefined) searchParams.append('active', params.active.toString());
      
      const response = await apiClient.get<Instructor[]>(`/instructors?${searchParams.toString()}`);
      
      set({ 
        instructors: response.data,
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar los instructores', loading: false });
    }
  },

  createInstructor: async (instructor) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<Instructor>('/instructors', instructor);
      await get().fetchInstructors();
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear el instructor', loading: false });
      throw error;
    }
  },

  updateInstructor: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch<Instructor>(`/instructors/${id}`, updates);
      await get().fetchInstructors();
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar el instructor', loading: false });
      throw error;
    }
  },

  deleteInstructor: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/instructors/${id}`);
      await get().fetchInstructors();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar el instructor', loading: false });
      throw error;
    }
  },

  getInstructorById: async (id) => {
    try {
      const response = await apiClient.get<Instructor>(`/instructors/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getAllInstructors: async () => {
    try {
      const response = await apiClient.get<Instructor[]>('/instructors?active=true');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getInstructorRatings: async (id) => {
    try {
      const response = await apiClient.get<Rating[]>(`/instructors/${id}/ratings`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}));