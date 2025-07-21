import { create } from 'zustand';
import apiClient from '@/lib/api';
import { 
  type SendEmailDto, 
  type FormSubmissionDto,
  type EmailResponse
} from '@/types/api';

interface EmailState {
  loading: boolean;
  error: string | null;
  lastResponse: EmailResponse | null;
  
  // Actions
  sendEmail: (emailData: SendEmailDto) => Promise<EmailResponse>;
  submitForm: (formData: FormSubmissionDto) => Promise<EmailResponse>;
  clearError: () => void;
  clearLastResponse: () => void;
}

export const useEmailStore = create<EmailState>((set, get) => ({
  loading: false,
  error: null,
  lastResponse: null,

  sendEmail: async (emailData: SendEmailDto) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<EmailResponse>('/email/send', emailData);
      const result = response.data;
      
      set({ 
        loading: false, 
        lastResponse: result,
        error: result.success ? null : result.message 
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al enviar email';
      const errorResponse: EmailResponse = {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
      
      set({ 
        loading: false, 
        error: errorMessage,
        lastResponse: errorResponse
      });
      
      throw error;
    }
  },

  submitForm: async (formData: FormSubmissionDto) => {
    set({ loading: true, error: null });
    try {
      const response = await apiClient.post<EmailResponse>('/email/submit-form', formData);
      const result = response.data;
      
      set({ 
        loading: false, 
        lastResponse: result,
        error: result.success ? null : result.message 
      });
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al procesar formulario';
      const errorResponse: EmailResponse = {
        success: false,
        message: errorMessage,
        error: errorMessage
      };
      
      set({ 
        loading: false, 
        error: errorMessage,
        lastResponse: errorResponse
      });
      
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },

  clearLastResponse: () => {
    set({ lastResponse: null });
  }
})); 