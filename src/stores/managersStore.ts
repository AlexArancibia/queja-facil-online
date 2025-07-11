
import { create } from 'zustand';

export interface Manager {
  id: string;
  name: string;
  email: string;
  phone: string;
  stores: string[];
  role: 'manager';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface ManagersState {
  managers: Manager[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchManagers: () => Promise<void>;
  createManager: (manager: Omit<Manager, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateManager: (id: string, updates: Partial<Manager>) => Promise<void>;
  deleteManager: (id: string) => Promise<void>;
  toggleManagerStatus: (id: string) => Promise<void>;
}

// Mock API functions
const api = {
  async getManagers(): Promise<Manager[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem('managers');
    return stored ? JSON.parse(stored) : [];
  },

  async createManager(manager: Omit<Manager, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newManager: Manager = {
      ...manager,
      id: `MGR-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const existing = await this.getManagers();
    const updated = [...existing, newManager];
    localStorage.setItem('managers', JSON.stringify(updated));
    
    return newManager.id;
  },

  async updateManager(id: string, updates: Partial<Manager>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existing = await this.getManagers();
    const updated = existing.map(m => 
      m.id === id ? { ...m, ...updates, updatedAt: new Date() } : m
    );
    localStorage.setItem('managers', JSON.stringify(updated));
  },

  async deleteManager(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getManagers();
    const filtered = existing.filter(m => m.id !== id);
    localStorage.setItem('managers', JSON.stringify(filtered));
  },

  async toggleManagerStatus(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getManagers();
    const updated = existing.map(m => 
      m.id === id ? { ...m, isActive: !m.isActive, updatedAt: new Date() } : m
    );
    localStorage.setItem('managers', JSON.stringify(updated));
  }
};

export const useManagersStore = create<ManagersState>((set, get) => ({
  managers: [],
  loading: false,
  error: null,

  fetchManagers: async () => {
    set({ loading: true, error: null });
    try {
      const managers = await api.getManagers();
      set({ managers, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar los managers', loading: false });
    }
  },

  createManager: async (manager) => {
    set({ loading: true, error: null });
    try {
      const id = await api.createManager(manager);
      await get().fetchManagers();
      set({ loading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear el manager', loading: false });
      throw error;
    }
  },

  updateManager: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateManager(id, updates);
      await get().fetchManagers();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error al actualizar el manager', loading: false });
      throw error;
    }
  },

  deleteManager: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteManager(id);
      await get().fetchManagers();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error al eliminar el manager', loading: false });
      throw error;
    }
  },

  toggleManagerStatus: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.toggleManagerStatus(id);
      await get().fetchManagers();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error al cambiar el estado del manager', loading: false });
      throw error;
    }
  }
}));
