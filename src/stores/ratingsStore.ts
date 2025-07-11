
import { create } from 'zustand';
import { type Rating } from '@/types/instructor';

interface RatingsState {
  ratings: Rating[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchRatings: () => Promise<void>;
  createRating: (rating: Omit<Rating, 'id' | 'createdAt'>) => Promise<string>;
  updateRating: (id: string, updates: Partial<Rating>) => Promise<void>;
  deleteRating: (id: string) => Promise<void>;
  searchRatings: (filters: { storeId?: string; instructorId?: string; dateRange?: { from: Date; to: Date } }) => Promise<Rating[]>;
}

// Mock API functions
const api = {
  async getRatings(): Promise<Rating[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem('ratings');
    return stored ? JSON.parse(stored) : [];
  },

  async createRating(rating: Omit<Rating, 'id' | 'createdAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newRating: Rating = {
      ...rating,
      id: `RATING-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      createdAt: new Date()
    };
    
    const existing = await this.getRatings();
    const updated = [...existing, newRating];
    localStorage.setItem('ratings', JSON.stringify(updated));
    
    return newRating.id;
  },

  async updateRating(id: string, updates: Partial<Rating>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existing = await this.getRatings();
    const updated = existing.map(r => 
      r.id === id ? { ...r, ...updates } : r
    );
    localStorage.setItem('ratings', JSON.stringify(updated));
  },

  async deleteRating(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getRatings();
    const filtered = existing.filter(r => r.id !== id);
    localStorage.setItem('ratings', JSON.stringify(filtered));
  },

  async searchRatings(filters: { storeId?: string; instructorId?: string; dateRange?: { from: Date; to: Date } }): Promise<Rating[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const all = await this.getRatings();
    return all.filter(r => {
      const storeMatch = filters.storeId ? r.storeId === filters.storeId : true;
      const instructorMatch = filters.instructorId ? r.instructorId === filters.instructorId : true;
      const dateMatch = filters.dateRange ? 
        new Date(r.createdAt) >= filters.dateRange.from && new Date(r.createdAt) <= filters.dateRange.to : true;
      
      return storeMatch && instructorMatch && dateMatch;
    });
  }
};

export const useRatingsStore = create<RatingsState>((set, get) => ({
  ratings: [],
  loading: false,
  error: null,

  fetchRatings: async () => {
    set({ loading: true, error: null });
    try {
      const ratings = await api.getRatings();
      set({ ratings, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar las calificaciones', loading: false });
    }
  },

  createRating: async (rating) => {
    set({ loading: true, error: null });
    try {
      const id = await api.createRating(rating);
      await get().fetchRatings();
      set({ loading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear la calificación', loading: false });
      throw error;
    }
  },

  updateRating: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateRating(id, updates);
      await get().fetchRatings();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error al actualizar la calificación', loading: false });
      throw error;
    }
  },

  deleteRating: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteRating(id);
      await get().fetchRatings();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error al eliminar la calificación', loading: false });
      throw error;
    }
  },

  searchRatings: async (filters) => {
    set({ loading: true, error: null });
    try {
      const results = await api.searchRatings(filters);
      set({ loading: false });
      return results;
    } catch (error) {
      set({ error: 'Error al buscar calificaciones', loading: false });
      throw error;
    }
  }
}));
