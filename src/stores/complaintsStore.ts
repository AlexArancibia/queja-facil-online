import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type Complaint, 
  type CreateComplaintDto, 
  type UpdateComplaintDto,
  type PaginatedResponse,
  type ComplaintStats,
  type ComplaintStatus,
  type ComplaintPriority
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
  fetchComplaints: (params?: {
    page?: number;
    limit?: number;
    branchId?: string;
    status?: ComplaintStatus;
    priority?: ComplaintPriority;
  }) => Promise<void>;
  
  createComplaint: (complaint: CreateComplaintDto) => Promise<Complaint>;
  updateComplaint: (id: string, updates: UpdateComplaintDto) => Promise<Complaint>;
  deleteComplaint: (id: string) => Promise<void>;
  getComplaintStats: (branchId?: string) => Promise<ComplaintStats>;
  getComplaintById: (id: string) => Promise<Complaint>;
}

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

  fetchComplaints: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const { page = 1, limit = 10, branchId, status, priority } = params;
      
      const searchParams = new URLSearchParams();
      searchParams.append('page', page.toString());
      searchParams.append('limit', limit.toString());
      if (branchId) searchParams.append('branchId', branchId);
      if (status) searchParams.append('status', status);
      if (priority) searchParams.append('priority', priority);
      
      const response = await apiClient.get<PaginatedResponse<Complaint>>(
        `/complaints?${searchParams.toString()}`
      );
      
      set({ 
        complaints: response.data.data,
        pagination: {
          page: response.data.page,
          limit: response.data.limit,
          total: response.data.total,
          totalPages: response.data.totalPages
        },
        loading: false 
      });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al cargar las quejas', 
        loading: false 
      });
      throw error;
    }
  },

  createComplaint: async (complaint) => {
    set({ loading: true, error: null });
    try {
      console.log('📝 PAYLOAD QUEJA RECIBIDO:', JSON.stringify(complaint, null, 2));
      console.log('📤 Enviando queja como JSON...');
      
      const response = await apiClient.post<Complaint>('/complaints', complaint);
      console.log('✅ Queja creada exitosamente:', response.data);
      
      await get().fetchComplaints({
        page: get().pagination.page,
        limit: get().pagination.limit
      });
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      console.error('❌ Error creando queja:', error);
      console.error('❌ Error response:', error.response?.data);
      set({ 
        error: error.response?.data?.message || 'Error al crear la queja', 
        loading: false 
      });
      throw error;
    }
  },

  updateComplaint: async (id, updates) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.patch<Complaint>(`/complaints/${id}`, updates);
      // Refresh the list with current pagination
      await get().fetchComplaints({
        page: get().pagination.page,
        limit: get().pagination.limit
      });
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al actualizar la queja', 
        loading: false 
      });
      throw error;
    }
  },

  deleteComplaint: async (id) => {
    set({ loading: true, error: null });
    try {
      await apiClient.delete(`/complaints/${id}`);
      // Refresh the list with current pagination
      await get().fetchComplaints({
        page: get().pagination.page,
        limit: get().pagination.limit
      });
      set({ loading: false });
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al eliminar la queja', 
        loading: false 
      });
      throw error;
    }
  },

  getComplaintStats: async (branchId) => {
    set({ loading: true, error: null });
    try {
      const searchParams = new URLSearchParams();
      if (branchId) searchParams.append('branchId', branchId);
      
      const response = await apiClient.get<ComplaintStats>(
        `/complaints/stats?${searchParams.toString()}`
      );
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al obtener estadísticas', 
        loading: false 
      });
      throw error;
    }
  },

  getComplaintById: async (id) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.get<Complaint>(`/complaints/${id}`);
      set({ loading: false });
      return response.data;
    } catch (error: any) {
      set({ 
        error: error.response?.data?.message || 'Error al obtener la queja', 
        loading: false 
      });
      throw error;
    }
  }
}));