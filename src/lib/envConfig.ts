// Email Environment Variables Configuration
export const emailConfig = {
  fromAddress: import.meta.env.VITE_FROM_EMAIL_ADDRESS || 'administracion.peru@siclo.com',
  fromName: import.meta.env.VITE_FROM_EMAIL_NAME || 'Siclo',
};

// Frontend URL Configuration
export const frontendConfig = {
  baseUrl: import.meta.env.VITE_FRONTEND_ENDPOINT || 'http://localhost:5173',
};

// Validate required environment variables
export const validateEmailConfig = () => {
  const requiredVars = ['VITE_FROM_EMAIL_ADDRESS'];

  const missingVars = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.warn(
      `⚠️  Variable de entorno de email no configurada, usando valor por defecto:`,
      `VITE_FROM_EMAIL_ADDRESS=${emailConfig.fromAddress}`
    );
    console.warn(
      `📝 Para configurarla, agrega esta variable a tu archivo .env:\n` +
      `VITE_FROM_EMAIL_ADDRESS=tu-email@siclo.com`
    );
  }

  return emailConfig;
};

// Validate frontend configuration
export const validateFrontendConfig = () => {
  if (!import.meta.env.VITE_FRONTEND_ENDPOINT) {
    console.warn(
      `⚠️  Variable de entorno VITE_FRONTEND_ENDPOINT no configurada, usando valor por defecto:`,
      `VITE_FRONTEND_ENDPOINT=${frontendConfig.baseUrl}`
    );
    console.warn(
      `📝 Para configurarla, agrega esta variable a tu archivo .env:\n` +
      `VITE_FRONTEND_ENDPOINT=https://tu-dominio.com`
    );
  }

  return frontendConfig;
};

// Helper function to generate complaint shareable URL
export const generateComplaintShareableUrl = (complaintId: string): string => {
  const config = validateFrontendConfig();
  return `${config.baseUrl}/complaints?id=${encodeURIComponent(complaintId)}`;
};

// Initialize and validate on import
export const validatedEmailConfig = validateEmailConfig();
export const validatedFrontendConfig = validateFrontendConfig(); 