
import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type Complaint, 
  type CreateComplaintDto, 
  type UpdateComplaintDto,
  type PaginatedResponse,
  type ComplaintStats
} from '@/types/api';

interface ComplaintsState {
  complaints: Complaint[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  
  // Actions
  fetchComplaints: (params?: { page?: number; limit?: number; branchId?: string; status?: string; priority?: string }) => Promise<void>;
  createComplaint: (complaint: CreateComplaintDto) => Promise<string>;
  updateComplaint: (id: string, updates: UpdateComplaintDto) => Promise<void>;
  deleteComplaint: (id: string) => Promise<void>;
  searchComplaints: (email: string, complaintId?: string) => Promise<Complaint[]>;
  getComplaintStats: (branchId?: string) => Promise<ComplaintStats>;
  getComplaintById: (id: string) => Promise<Complaint>;
}

// API functions
const api = {
  async getComplaints(params?: { page?: number; limit?: number; branchId?: string; status?: string; priority?: string }): Promise<PaginatedResponse<Complaint>> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.limit) searchParams.append('limit', params.limit.toString());
    if (params?.branchId) searchParams.append('branchId', params.branchId);
    if (params?.status) searchParams.append('status', params.status);
    if (params?.priority) searchParams.append('priority', params.priority);
    
    const response = await apiClient.get(`/complaints?${searchParams.toString()}`);
    return response.data;
  },

  async createComplaint(complaint: CreateComplaintDto): Promise<{ id: string }> {
    const response = await apiClient.post('/complaints', complaint);
    return response.data;
  },

  async updateComplaint(id: string, updates: UpdateComplaintDto): Promise<void> {
    await apiClient.patch(`/complaints/${id}`, updates);
  },

  async deleteComplaint(id: string): Promise<void> {
    await apiClient.delete(`/complaints/${id}`);
  },

  async searchComplaints(email: string, complaintId?: string): Promise<Complaint[]> {
    const searchParams = new URLSearchParams();
    searchParams.append('email', email);
    if (complaintId) searchParams.append('id', complaintId);
    
    const response = await apiClient.get(`/complaints?${searchParams.toString()}`);
    return response.data.data || [];
  },

  async getComplaintStats(branchId?: string): Promise<ComplaintStats> {
    const searchParams = new URLSearchParams();
    if (branchId) searchParams.append('branchId', branchId);
    
    const response = await apiClient.get(`/complaints/stats?${searchParams.toString()}`);
    return response.data;
  },

  async getComplaintById(id: string): Promise<Complaint> {
    const response = await apiClient.get(`/complaints/${id}`);
    return response.data;
  }
};

export const useComplaintsStore = create<ComplaintsState>((set, get) => ({
  complaints: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  },

  fetchComplaints: async (params) => {
    set({ loading: true, error: null });
    try {
      const response = await api.getComplaints(params);
      set({ 
        complaints: response.data,
        pagination: {
          page: response.page,
          limit: response.limit,
          total: response.total,
          totalPages: response.totalPages
        },
        loading: false 
      });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al cargar las quejas', loading: false });
    }
  },

  createComplaint: async (complaint) => {
    set({ loading: true, error: null });
    try {
      const response = await api.createComplaint(complaint);
      await get().fetchComplaints(); // Refresh the list
      set({ loading: false });
      return response.id;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al crear la queja', loading: false });
      throw error;
    }
  },

  updateComplaint: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      await api.updateComplaint(id, updates);
      await get().fetchComplaints();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al actualizar la queja', loading: false });
      throw error;
    }
  },

  deleteComplaint: async (id) => {
    set({ loading: true, error: null });
    try {
      await api.deleteComplaint(id);
      await get().fetchComplaints();
      set({ loading: false });
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al eliminar la queja', loading: false });
      throw error;
    }
  },

  searchComplaints: async (email, complaintId) => {
    set({ loading: true, error: null });
    try {
      const results = await api.searchComplaints(email, complaintId);
      set({ loading: false });
      return results;
    } catch (error: any) {
      set({ error: error.response?.data?.message || 'Error al buscar quejas', loading: false });
      throw error;
    }
  },

  getComplaintStats: async (branchId) => {
    try {
      return await api.getComplaintStats(branchId);
    } catch (error: any) {
      throw error;
    }
  },

  getComplaintById: async (id) => {
    try {
      return await api.getComplaintById(id);
    } catch (error: any) {
      throw error;
    }
  }
}));
