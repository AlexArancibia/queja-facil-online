import { type Complaint, type Rating, type Branch } from '@/types/api';

// Estilos compartidos para todos los templates
const sharedStyles = `
  <style>
    body { margin: 0; padding: 0; font-family: Arial, sans-serif; background: #f8f9fa; color: #333; }
    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #F47B48 0%, #9B4C8A 50%, #2A5D8F 100%); color: white; padding: 24px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; font-weight: bold; }
    .header p { margin: 8px 0 0 0; font-size: 14px; opacity: 0.9; }
    .content { padding: 24px; }
    .highlight { background: linear-gradient(135deg, #FBB040 0%, #F47B48 100%); color: white; padding: 16px; border-radius: 6px; text-align: center; margin: 16px 0; }
    .highlight h2 { margin: 0 0 8px 0; font-size: 16px; }
    .highlight .id { font-family: monospace; font-size: 20px; font-weight: bold; }
    .details { background: #f8f9fa; padding: 16px; border-radius: 6px; margin: 16px 0; }
    .detail-row { display: flex; margin-bottom: 8px; align-items: center; }
    .detail-row:last-child { margin-bottom: 0; }
    .detail-label { font-weight: bold; color: #2A5D8F; min-width: 80px; margin-right: 12px; font-size: 14px; }
    .detail-value { flex: 1; font-size: 14px; }
    .priority { display: inline-block; padding: 2px 8px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .priority.HIGH { background: #ef4444; color: white; }
    .priority.MEDIUM { background: #f59e0b; color: white; }
    .priority.LOW { background: #10b981; color: white; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: bold; }
    .status-old { background: #e5e7eb; color: #6b7280; }
    .status-new { background: #3b82f6; color: white; }
    .status-resolved { background: #10b981; color: white; }
    .status-rejected { background: #ef4444; color: white; }
    .status-pending { background: #f59e0b; color: white; }
    .status-in-progress { background: #3b82f6; color: white; }
    .info-box { background: #e0f2fe; border-left: 3px solid #2A5D8F; padding: 12px; margin: 16px 0; }
    .info-box h3 { margin: 0 0 8px 0; color: #2A5D8F; font-size: 14px; }
    .info-box ul { margin: 0; padding-left: 16px; font-size: 13px; }
    .info-box li { margin-bottom: 4px; }
    .footer { background: #2A5D8F; color: white; padding: 16px; text-align: center; font-size: 12px; }
    .footer p { margin: 0 0 4px 0; }
    .rating-summary { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px; border-radius: 6px; text-align: center; margin: 16px 0; }
    .avg-rating { font-size: 32px; font-weight: bold; margin: 8px 0; }
    .stars { font-size: 18px; margin: 4px 0; }
    .rating-bar { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
    .rating-label { font-weight: 500; min-width: 80px; color: #374151; font-size: 13px; }
    .bar-container { flex: 1; height: 6px; background: #e5e7eb; border-radius: 3px; overflow: hidden; }
    .bar-fill { height: 100%; border-radius: 3px; }
    .rating-score { font-weight: bold; min-width: 24px; text-align: right; font-size: 13px; }
    .nps-section { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 12px; border-radius: 6px; margin: 16px 0; text-align: center; }
    .nps-score { font-size: 24px; font-weight: bold; margin: 4px 0; }
    .thank-you { background: #fef3c7; border-left: 3px solid #FBB040; padding: 12px; margin: 16px 0; }
    .thank-you h3 { margin: 0 0 8px 0; color: #92400e; font-size: 14px; }
    .status-flow { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 12px 0; }
    .arrow { font-size: 18px; color: #6b7280; }
    .manager-message { background: #eff6ff; border-left: 3px solid #3b82f6; padding: 12px; margin: 16px 0; border-radius: 0 4px 4px 0; }
    .manager-message h3 { margin: 0 0 8px 0; color: #1d4ed8; font-size: 14px; }
    @media (max-width: 600px) {
      .container { margin: 0; border-radius: 0; }
      .header, .content, .footer { padding: 16px; }
      .detail-row, .rating-bar { flex-direction: column; align-items: flex-start; }
      .detail-label, .rating-label { min-width: auto; margin-right: 0; margin-bottom: 4px; }
      .status-flow { flex-direction: column; gap: 6px; }
      .arrow { transform: rotate(90deg); }
    }
  </style>
`;

export const generateComplaintConfirmationEmail = (
  complaint: Complaint,
  branchName: string
): string => {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Sugerencia - Siclo</title>
  ${sharedStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎯 Sugerencia Registrada</h1>
      <p>Hemos recibido tu queja y estamos trabajando en ella</p>
    </div>
    
    <div class="content">
      <p>Hola <strong>${complaint.fullName}</strong>,</p>
      <p>Gracias por compartir tu experiencia. Tu opinión nos ayuda a mejorar continuamente.</p>
      
      <div class="highlight">
        <h2>Tu ID de Sugerencia:</h2>
        <div class="id">${complaint.id}</div>
      </div>
      
      <div class="details">
        <div class="detail-row">
          <div class="detail-label">Local:</div>
          <div class="detail-value">${branchName}</div>
        </div>
        ${complaint.area ? `
        <div class="detail-row">
          <div class="detail-label">Área:</div>
          <div class="detail-value">${complaint.area.name}</div>
        </div>
        ` : ''}
        <div class="detail-row">
          <div class="detail-label">Tipo:</div>
          <div class="detail-value">${complaint.observationType}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Prioridad:</div>
          <div class="detail-value">
            <span class="priority ${complaint.priority}">
              ${complaint.priority === 'HIGH' ? '🔴 Alta' : 
                complaint.priority === 'MEDIUM' ? '🟡 Media' : '🟢 Baja'}
            </span>
          </div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Fecha:</div>
          <div class="detail-value">${new Date(complaint.createdAt).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Descripción:</div>
          <div class="detail-value">${complaint.detail}</div>
        </div>
      </div>
      
      <div class="info-box">
        <h3>🚀 Próximos Pasos</h3>
        <ul>
          <li><strong>Revisión:</strong> El manager revisará tu queja en 24 horas</li>
          <li><strong>Investigación:</strong> Se realizará una investigación detallada</li>
          <li><strong>Respuesta:</strong> Recibirás respuesta en máximo 3 días hábiles</li>
          <li><strong>Seguimiento:</strong> Te mantendremos informado del progreso</li>
        </ul>
      </div>
      
      <p style="margin-top: 20px; font-size: 13px;">
        <strong>¿Necesitas hacer seguimiento?</strong><br>
        Usa tu ID: <code>${complaint.id}</code>
      </p>
      
      <p style="color: #666; font-style: italic; font-size: 13px;">
        En Siclo valoramos tu confianza y trabajamos para brindarte la mejor experiencia.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Equipo Siclo</strong></p>
      <p>Comprometidos con tu experiencia</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const generateRatingConfirmationEmail = (
  rating: Rating,
  branchName: string,
  instructorName: string
): string => {
  const avgRating = Math.round(
    (rating.instructorRating + rating.cleanlinessRating + rating.audioRating + 
     rating.attentionQualityRating + rating.amenitiesRating + rating.punctualityRating) / 6 * 10
  ) / 10;
  
  const npsCategory = rating.npsScore >= 9 ? 'Promotor' : rating.npsScore >= 7 ? 'Neutral' : 'Detractor';
  const npsEmoji = rating.npsScore >= 9 ? '🌟' : rating.npsScore >= 7 ? '😊' : '🤔';

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirmación de Calificación - Siclo</title>
  ${sharedStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>⭐ Calificación Registrada</h1>
      <p>Gracias por calificar tu experiencia en Siclo</p>
    </div>
    
    <div class="content">
      <p>¡Hola!</p>
      <p>Gracias por calificar tu clase. Tu retroalimentación es invaluable para mantener nuestros estándares de calidad.</p>
      
      <div class="rating-summary">
        <h2>📊 Resumen de tu Calificación</h2>
        <div class="avg-rating">${avgRating}/10</div>
        <div class="stars">${'⭐'.repeat(Math.round(avgRating))}</div>
        <p>Calificación promedio general</p>
      </div>
      
      <div class="details">
        <div class="detail-row">
          <div class="detail-label">Local:</div>
          <div class="detail-value">${branchName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Instructor:</div>
          <div class="detail-value">${instructorName}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Disciplina:</div>
          <div class="detail-value">${rating.discipline.toUpperCase()}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Fecha:</div>
          <div class="detail-value">${new Date(rating.date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Horario:</div>
          <div class="detail-value">${rating.schedule}</div>
        </div>
      </div>
      
      <div style="margin: 16px 0;">
        <h3 style="margin-bottom: 12px; color: #2A5D8F; font-size: 14px;">🎯 Calificaciones Detalladas</h3>
        
        <div class="rating-bar">
          <div class="rating-label">Instructor</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${rating.instructorRating * 10}%; background: linear-gradient(90deg, #10b981, #059669);"></div>
          </div>
          <div class="rating-score">${rating.instructorRating}/10</div>
        </div>
        
        <div class="rating-bar">
          <div class="rating-label">Limpieza</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${rating.cleanlinessRating * 10}%; background: linear-gradient(90deg, #3b82f6, #1d4ed8);"></div>
          </div>
          <div class="rating-score">${rating.cleanlinessRating}/10</div>
        </div>
        
        <div class="rating-bar">
          <div class="rating-label">Audio</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${rating.audioRating * 10}%; background: linear-gradient(90deg, #8b5cf6, #7c3aed);"></div>
          </div>
          <div class="rating-score">${rating.audioRating}/10</div>
        </div>
        
        <div class="rating-bar">
          <div class="rating-label">Atención</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${rating.attentionQualityRating * 10}%; background: linear-gradient(90deg, #f59e0b, #d97706);"></div>
          </div>
          <div class="rating-score">${rating.attentionQualityRating}/10</div>
        </div>
        
        <div class="rating-bar">
          <div class="rating-label">Amenities</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${rating.amenitiesRating * 10}%; background: linear-gradient(90deg, #ef4444, #dc2626);"></div>
          </div>
          <div class="rating-score">${rating.amenitiesRating}/10</div>
        </div>
        
        <div class="rating-bar">
          <div class="rating-label">Puntualidad</div>
          <div class="bar-container">
            <div class="bar-fill" style="width: ${rating.punctualityRating * 10}%; background: linear-gradient(90deg, #06b6d4, #0891b2);"></div>
          </div>
          <div class="rating-score">${rating.punctualityRating}/10</div>
        </div>
      </div>
      
      <div class="nps-section">
        <h3 style="margin: 0 0 8px 0;">🎯 Net Promoter Score</h3>
        <div class="nps-score">${rating.npsScore}/10</div>
        <p style="margin: 0;">${npsEmoji} Eres un <strong>${npsCategory}</strong></p>
      </div>
      
      ${rating.comments ? `
      <div style="background: #f3f4f6; padding: 12px; border-radius: 6px; margin: 16px 0;">
        <h3 style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">💬 Tus Comentarios</h3>
        <p style="margin: 0; font-style: italic; color: #6b7280; font-size: 13px;">"${rating.comments}"</p>
      </div>
      ` : ''}
      
      <div class="thank-you">
        <h3>🙏 ¡Gracias por tu Retroalimentación!</h3>
        <p style="margin: 0; font-size: 13px;">
          Tu opinión nos ayuda a mejorar continuamente. Compartiremos tu calificación con el equipo.
        </p>
      </div>
      
      <p style="color: #666; font-style: italic; margin-top: 20px; font-size: 13px;">
        En Siclo siempre trabajamos para ofrecerte la mejor experiencia de entrenamiento.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Equipo Siclo</strong></p>
      <p>Transformando vidas, una clase a la vez</p>
    </div>
  </div>
</body>
</html>
  `;
};

export const generateComplaintStatusUpdateEmail = (
  complaint: Complaint,
  branchName: string,
  oldStatus: string,
  newStatus: string,
  managerComments?: string
): string => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'PENDING':
        return { text: 'Pendiente', emoji: '⏳', color: '#f59e0b' };
      case 'IN_PROGRESS':
        return { text: 'En Proceso', emoji: '🔄', color: '#3b82f6' };
      case 'RESOLVED':
        return { text: 'Resuelta', emoji: '✅', color: '#10b981' };
      case 'REJECTED':
        return { text: 'Rechazada', emoji: '❌', color: '#ef4444' };
      default:
        return { text: status, emoji: '📋', color: '#6b7280' };
    }
  };

  const oldStatusInfo = getStatusInfo(oldStatus);
  const newStatusInfo = getStatusInfo(newStatus);

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Actualización de Sugerencia - Siclo</title>
  ${sharedStyles}
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>📋 Estado Actualizado</h1>
      <p>Tu queja ha sido actualizada por nuestro equipo</p>
    </div>
    
    <div class="content">
      <p>Hola <strong>${complaint.fullName}</strong>,</p>
      <p>Te informamos que el estado de tu queja ha sido actualizado. Nuestro equipo ha revisado tu caso.</p>
      
      <div class="highlight" style="border: 2px solid ${newStatusInfo.color};">
        <h2>Cambio de Estado</h2>
        <div class="status-flow">
          <div class="status-badge status-old">
            ${oldStatusInfo.emoji} ${oldStatusInfo.text}
          </div>
          <div class="arrow">→</div>
          <div class="status-badge status-${newStatus.toLowerCase().replace('_', '-')}">
            ${newStatusInfo.emoji} ${newStatusInfo.text}
          </div>
        </div>
        <p style="margin: 8px 0 0 0; color: #6b7280; font-size: 12px;">ID: <code>${complaint.id}</code></p>
      </div>
      
      <div class="details">
        <div class="detail-row">
          <div class="detail-label">Local:</div>
          <div class="detail-value">${branchName}</div>
        </div>
        ${complaint.area ? `
        <div class="detail-row">
          <div class="detail-label">Área:</div>
          <div class="detail-value">${complaint.area.name}</div>
        </div>
        ` : ''}
        <div class="detail-row">
          <div class="detail-label">Tipo:</div>
          <div class="detail-value">${complaint.observationType}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Fecha original:</div>
          <div class="detail-value">${new Date(complaint.createdAt).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
        </div>
        <div class="detail-row">
          <div class="detail-label">Actualizado:</div>
          <div class="detail-value">${new Date().toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          })}</div>
        </div>
      </div>
      
      ${managerComments ? `
      <div class="manager-message">
        <h3>💬 Mensaje del Equipo</h3>
        <p style="margin: 0; line-height: 1.5; font-size: 13px;">${managerComments}</p>
      </div>
      ` : ''}
      
      <p style="margin-top: 20px; font-size: 13px;">
        <strong>¿Tienes dudas sobre esta actualización?</strong><br>
        Contacta con referencia a tu ID: <code>${complaint.id}</code>
      </p>
      
      <p style="color: #666; font-style: italic; font-size: 13px;">
        Gracias por tu paciencia y por ayudarnos a mejorar nuestros servicios.
      </p>
    </div>
    
    <div class="footer">
      <p><strong>Equipo Siclo</strong></p>
      <p>Comprometidos con tu experiencia</p>
    </div>
  </div>
</body>
</html>
  `;
};