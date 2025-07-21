import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type Rating, 
  type CreateRatingDto, 
  type UpdateRatingDto,
  type PaginatedResponse,
  type RatingStats
} from '@/types/api';

interface RatingsState {
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchRatings: (params?: { page?: number; limit?: number; branchId?: string; instructorId?: string; startDate?: string; endDate?: string }) => Promise<void>;
  createRating: (rating: CreateRatingDto) => Promise<Rating>;
  updateRating: (id: string, updates: UpdateRatingDto) => Promise<Rating>;
  deleteRating: (id: string) => Promise<void>;
  getRatingStats: (branchId?: string, instructorId?: string, startDate?: string, endDate?: string) => Promise<RatingStats>;
  getRatingAnalytics: (branchId?: string) => Promise<any>;
  getRatingById: (id: string) => Promise<Rating>;
}

export const useRatingsStore = create<RatingsState>((set, get) => ({
  ratings: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },

  fetchRatings: async (params) => {
    set({ loading: true, error: null });
    try {
      const searchParams = new URLSearchParams();
      if (params?.page) searchParams.append('page', params.page.toString());
      if (params?.limit) searchParams.append('limit', params.limit.toString());
      if (params?.branchId) searchParams.append('branchId', params.branchId);
      if (params?.instructorId) searchParams.append('instructorId', params.instructorId);
      if (params?.startDate) searchParams.append('startDate', params.startDate);
      if (params?.endDate) searchParams.append('endDate', params.endDate);
      
      const response = await apiClient.get<PaginatedResponse<Rating>>(`/ratings?${searchParams.toString()}`);
      
      set({ 
        ratings: response.data.data,
        pagination: {
          page: response.data.pagination.page,
          limit: response.data.pagination.limit,
          total: response.data.pagination.total,
          totalPages: response.data.pagination.totalPages
        },
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar las calificaciones', loading: false });
    }
  },

  createRating: async (rating) => {
    set({ loading: true, error: null });
    try {
      console.log('⭐ PAYLOAD CALIFICACIÓN RECIBIDO:', JSON.stringify(rating, null, 2));
      console.log('📤 Enviando calificación...');
      
      const response = await apiClient.post<Rating>('/ratings', rating);
      console.log('✅ Calificación creada exitosamente:', response.data);
      
      await get().fetchRatings();
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando calificación:', error);
      console.error('❌ Error response:', error.response?.data);
      set({ error: error.response?.data?.message || 'Error al crear la calificación', loading: false });
      throw error;
    }
  },

  updateRating: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch<Rating>(`/ratings/${id}`, updates);
      await get().fetchRatings();
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar la calificación', loading: false });
      throw error;
    }
  },

  deleteRating: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/ratings/${id}`);
      await get().fetchRatings();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar la calificación', loading: false });
      throw error;
    }
  },

  getRatingStats: async (branchId, instructorId, startDate, endDate) => {
    try {
      const searchParams = new URLSearchParams();
      if (branchId) searchParams.append('branchId', branchId);
      if (instructorId) searchParams.append('instructorId', instructorId);
      if (startDate) searchParams.append('startDate', startDate);
      if (endDate) searchParams.append('endDate', endDate);
      
      const response = await apiClient.get<RatingStats>(`/ratings/stats?${searchParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getRatingAnalytics: async (branchId) => {
    try {
      const searchParams = new URLSearchParams();
      if (branchId) searchParams.append('branchId', branchId);
      
      const response = await apiClient.get<any>(`/ratings/analytics?${searchParams.toString()}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getRatingById: async (id) => {
    try {
      const response = await apiClient.get<Rating>(`/ratings/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}));