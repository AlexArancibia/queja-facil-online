
import { create } from 'zustand';
import { type Complaint } from '@/types/complaint';

interface ComplaintsState {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
  
  // Actions
  fetchComplaints: () => Promise<void>;
  createComplaint: (complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  searchComplaints: (email: string, complaintId?: string) => Promise<Complaint[]>;
}

// Mock API functions - replace with real API calls
const api = {
  async getComplaints(): Promise<Complaint[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    const stored = localStorage.getItem('complaints');
    return stored ? JSON.parse(stored) : [];
  },

  async createComplaint(complaint: Omit<Complaint, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 800));
    const newComplaint: Complaint = {
      ...complaint,
      id: `SICLO-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const existing = await this.getComplaints();
    const updated = [...existing, newComplaint];
    localStorage.setItem('complaints', JSON.stringify(updated));
    
    return newComplaint.id;
  },

  async updateComplaint(id: string, updates: Partial<Complaint>): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const existing = await this.getComplaints();
    const updated = existing.map(c => 
      c.id === id ? { ...c, ...updates, updatedAt: new Date() } : c
    );
    localStorage.setItem('complaints', JSON.stringify(updated));
  },

  async deleteComplaint(id: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existing = await this.getComplaints();
    const filtered = existing.filter(c => c.id !== id);
    localStorage.setItem('complaints', JSON.stringify(filtered));
  },

  async searchComplaints(email: string, complaintId?: string): Promise<Complaint[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const all = await this.getComplaints();
    return all.filter(c => {
      const emailMatch = c.email.toLowerCase().includes(email.toLowerCase());
      const idMatch = complaintId ? c.id === complaintId : true;
      return emailMatch && idMatch;
    });
  }
};

export const useComplaintsStore = create<ComplaintsState>((set, get) => ({
  complaints: [],
  loading: false,
  error: null,

  fetchComplaints: async () => {
    set({ loading: true, error: null });
    try {
      const complaints = await api.getComplaints();
      set({ complaints, loading: false });
    } catch (error) {
      set({ error: 'Error al cargar las quejas', loading: false });
    }
  },

  createComplaint: async (complaint) => {
    set({ loading: true, error: null });
    try {
      const id = await api.createComplaint(complaint);
      await get().fetchComplaints(); // Refresh the list
      set({ loading: false });
      return id;
    } catch (error) {
      set({ error: 'Error al crear la queja', loading: false });
      throw error;
    }
  },

  updateComplaint: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateComplaint(id, updates);
      await get().fetchComplaints();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error al actualizar la queja', loading: false });
      throw error;
    }
  },

  deleteComplaint: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteComplaint(id);
      await get().fetchComplaints();
      set({ loading: false });
    } catch (error) {
      set({ error: 'Error al eliminar la queja', loading: false });
      throw error;
    }
  },

  searchComplaints: async (email, complaintId) => {
    set({ loading: true, error: null });
    try {
      const results = await api.searchComplaints(email, complaintId);
      set({ loading: false });
      return results;
    } catch (error) {
      set({ error: 'Error al buscar quejas', loading: false });
      throw error;
    }
  }
}));
