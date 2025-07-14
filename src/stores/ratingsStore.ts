
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
  fetchRatings: (params?: { page?: number; limit?: number; branchId?: string; instructorId?: string }) => Promise<void>;
  createRating: (rating: CreateRatingDto) => Promise<string>;
  updateRating: (id: string, updates: UpdateRatingDto) => Promise<void>;
  deleteRating: (id: string) => Promise<void>;
  searchRatings: (filters: { branchId?: string; instructorId?: string; dateRange?: { from: Date; to: Date } }) => Promise<Rating[]>;
  getRatingStats: (branchId?: string, instructorId?: string) => Promise<RatingStats>;
  getRatingById: (id: string) => Promise<Rating>;
}

// API functions
const api = {
  async getRatings(params?: { page?: number; limit?: number; branchId?: string; instructorId?: string }): Promise<PaginatedResponse<Rating>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.branchId) searchParams.append('branchId', params.branchId);
    if (params?.instructorId) searchParams.append('instructorId', params.instructorId);
    
    const response = await apiClient.get(`/ratings?${searchParams.toString()}`);
    return response.data;
  },

  async createRating(rating: CreateRatingDto): Promise<{ id: string }> {
    const response = await apiClient.post('/ratings', rating);
    return response.data;
  },

  async updateRating(id: string, updates: UpdateRatingDto): Promise<void> {
    await apiClient.patch(`/ratings/${id}`, updates);
  },

  async deleteRating(id: string): Promise<void> {
    await apiClient.delete(`/ratings/${id}`);
  },

  async searchRatings(filters: { branchId?: string; instructorId?: string; dateRange?: { from: Date; to: Date } }): Promise<Rating[]> {
    const searchParams = new URLSearchParams();
    if (filters.branchId) searchParams.append('branchId', filters.branchId);
    if (filters.instructorId) searchParams.append('instructorId', filters.instructorId);
    if (filters.dateRange) {
      searchParams.append('from', filters.dateRange.from.toISOString());
      searchParams.append('to', filters.dateRange.to.toISOString());
    }
    
    const response = await apiClient.get(`/ratings?${searchParams.toString()}`);
    return response.data.data || [];
  },

  async getRatingStats(branchId?: string, instructorId?: string): Promise<RatingStats> {
    const searchParams = new URLSearchParams();
    if (branchId) searchParams.append('branchId', branchId);
    if (instructorId) searchParams.append('instructorId', instructorId);
    
    const response = await apiClient.get(`/ratings/stats?${searchParams.toString()}`);
    return response.data;
  },

  async getRatingById(id: string): Promise<Rating> {
    const response = await apiClient.get(`/ratings/${id}`);
    return response.data;
  }
};

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
      const response = await api.getRatings(params);
      set({ 
        ratings: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
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
      const response = await api.createRating(rating);
      await get().fetchRatings();
      set({ loading: false });
      return response.id;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear la calificación', loading: false });
      throw error;
    }
  },

  updateRating: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateRating(id, updates);
      await get().fetchRatings();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar la calificación', loading: false });
      throw error;
    }
  },

  deleteRating: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteRating(id);
      await get().fetchRatings();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar la calificación', loading: false });
      throw error;
    }
  },

  searchRatings: async (filters) => {
    set({ loading: true, error: null });
    try {
      const results = await api.searchRatings(filters);
      set({ loading: false });
      return results;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al buscar calificaciones', loading: false });
      throw error;
    }
  },

  getRatingStats: async (branchId, instructorId) => {
    try {
      return await api.getRatingStats(branchId, instructorId);
    } catch (error: any) {
      throw error;
    }
  },

  getRatingById: async (id) => {
    try {
      return await api.getRatingById(id);
    } catch (error: any) {
      throw error;
    }
  }
}));
