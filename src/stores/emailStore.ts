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
    console.log('📧 EMAIL STORE - Iniciando envío de email');
    console.log('📤 Datos del email:', {
      to: emailData.to,
      subject: emailData.subject,
      from: emailData.from,
      hasHtml: !!emailData.html,
      hasMetadata: !!emailData.metadata,
      metadataType: emailData.metadata?.type,
      metadataBranchId: emailData.metadata?.branchId,
      metadataBranchName: emailData.metadata?.branchName,
      metadataManagersCount: emailData.metadata?.managers?.length || 0
    });
    
    if (emailData.metadata?.managers && emailData.metadata.managers.length > 0) {
      console.log('👥 Copias (CC) que se enviarán:');
      emailData.metadata.managers.forEach((manager, index) => {
        console.log(`  ${index + 1}. ${manager.name} (${manager.email})`);
      });
    } else {
      console.log('👥 No hay copias (CC) configuradas');
    }
    
    set({ loading: true, error: null });
    try {
      console.log('🚀 Enviando request a /email/send...');
      const response = await apiClient.post<EmailResponse>('/email/send', emailData);
      const result = response.data;
      
      console.log('✅ EMAIL STORE - Respuesta del servidor:', {
        success: result.success,
        message: result.message,
        hasError: !!result.error
      });
      
      set({ 
        loading: false, 
        lastResponse: result,
        error: result.success ? null : result.message 
      });
      
      return result;
    } catch (error: any) {
      console.error('❌ EMAIL STORE - Error en envío:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      
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