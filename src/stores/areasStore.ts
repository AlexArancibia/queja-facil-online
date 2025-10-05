import { create } from 'zustand';
import apiClient from '@/lib/api';
import { Area } from '@/types/api';

interface AreasState {
  areas: Area[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchAreas: (isActive?: boolean) => Promise<void>;
  createArea: (area: Omit<Area, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Area>;
  updateArea: (id: string, area: Partial<Area>) => Promise<Area>;
  deleteArea: (id: string) => Promise<void>;
  getAreaById: (id: string) => Promise<Area>;
  getAllAreas: () => Promise<Area[]>; // For dropdowns and selects
}

export const useAreasStore = create<AreasState>((set, get) => ({
  areas: [],
  loading: false,
  error: null,

  fetchAreas: async (isActive?: boolean) => {
    set({ loading: true, error: null });
    try {
      // Use public endpoint for active areas (for public forms)
      if (isActive === true) {
        const response = await apiClient.get<Area[]>('/areas/public');
        set({ areas: response.data, loading: false });
      } else {
        // Use authenticated endpoint for admin operations
        const params = new URLSearchParams();
        if (isActive !== undefined) {
          params.append('active', isActive.toString());
        }
        
        const response = await apiClient.get<Area[]>(`/areas?${params.toString()}`);
        set({ areas: response.data, loading: false });
      }
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar las áreas',
        loading: false 
      });
      throw error;
    }
  },

  createArea: async (areaData) => {
    try {
      const response = await apiClient.post<Area>('/areas', areaData);
      const newArea = response.data;
      
      set(state => ({
        areas: [...state.areas, newArea]
      }));
      
      return newArea;
    } catch (error: any) {
      throw error;
    }
  },

  updateArea: async (id, areaData) => {
    try {
      const response = await apiClient.patch<Area>(`/areas/${id}`, areaData);
      const updatedArea = response.data;
      
      set(state => ({
        areas: state.areas.map(area => 
          area.id === id ? updatedArea : area
        )
      }));
      
      return updatedArea;
    } catch (error: any) {
      throw error;
    }
  },

  deleteArea: async (id) => {
    try {
      await apiClient.delete(`/areas/${id}`);
      
      set(state => ({
        areas: state.areas.filter(area => area.id !== id)
      }));
    } catch (error: any) {
      throw error;
    }
  },

  getAreaById: async (id) => {
    try {
      const response = await apiClient.get<Area>(`/areas/${id}`);
      return response.data;
    } catch (error: any) {
      throw error;
    }
  },

  getAllAreas: async () => {
    try {
      const response = await apiClient.get<Area[]>('/areas');
      return response.data;
    } catch (error: any) {
      throw error;
    }
  }
}));
