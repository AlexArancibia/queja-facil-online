import { type Complaint, type Rating, type Branch } from '@/types/api';

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
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #F47B48 0%, #9B4C8A 50%, #2A5D8F 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .complaint-id {
            background: linear-gradient(135deg, #FBB040 0%, #F47B48 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin: 20px 0;
        }
        .complaint-id h2 {
            margin: 0 0 10px 0;
            font-size: 18px;
        }
        .complaint-id .id {
            font-family: 'Courier New', monospace;
            font-size: 24px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .details {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: bold;
            color: #2A5D8F;
            min-width: 120px;
            margin-right: 15px;
        }
        .detail-value {
            flex: 1;
            word-break: break-word;
        }
        .priority {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .priority.HIGH {
            background-color: #ef4444;
            color: white;
        }
        .priority.MEDIUM {
            background-color: #f59e0b;
            color: white;
        }
        .priority.LOW {
            background-color: #10b981;
            color: white;
        }
        .next-steps {
            background-color: #e0f2fe;
            border-left: 4px solid #2A5D8F;
            padding: 20px;
            margin: 25px 0;
        }
        .next-steps h3 {
            margin: 0 0 15px 0;
            color: #2A5D8F;
            font-size: 18px;
        }
        .next-steps ul {
            margin: 0;
            padding-left: 20px;
        }
        .next-steps li {
            margin-bottom: 8px;
        }
        .footer {
            background-color: #2A5D8F;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer p {
            margin: 0 0 10px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                min-width: auto;
                margin-right: 0;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 Sugerencia Registrada</h1>
            <p>Hemos recibido tu queja y estamos trabajando en ella</p>
        </div>
        
        <div class="content">
            <p>Hola <strong>${complaint.fullName}</strong>,</p>
            
            <p>Gracias por tomarte el tiempo de compartir tu experiencia con nosotros. Tu opinión es muy importante y nos ayuda a mejorar continuamente nuestros servicios.</p>
            
            <div class="complaint-id">
                <h2>Tu ID de Sugerencia es:</h2>
                <div class="id">${complaint.id}</div>
            </div>
            
            <div class="details">
                <h3 style="margin-top: 0; color: #2A5D8F;">Detalles de tu Sugerencia</h3>
                
                <div class="detail-row">
                    <div class="detail-label">Local:</div>
                    <div class="detail-value">${branchName}</div>
                </div>
                
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
            
            <div class="next-steps">
                <h3>🚀 Próximos Pasos</h3>
                <ul>
                    <li><strong>Revisión:</strong> El manager del local revisará tu queja en las próximas 24 horas</li>
                    <li><strong>Investigación:</strong> Se realizará una investigación detallada del caso</li>
                    <li><strong>Respuesta:</strong> Recibirás una respuesta en un máximo de 3 días hábiles</li>
                    <li><strong>Seguimiento:</strong> Te mantendremos informado sobre el progreso</li>
                </ul>
            </div>
            
            <p style="margin-top: 30px;">
                <strong>¿Necesitas hacer seguimiento?</strong><br>
                Puedes consultar el estado de tu queja en cualquier momento usando tu ID: <code>${complaint.id}</code>
            </p>
            
            <p style="color: #666; font-style: italic;">
                En Siclo valoramos tu confianza y trabajamos constantemente para brindarte la mejor experiencia. 
                Gracias por ayudarnos a ser mejores cada día.
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
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #FBB040 0%, #F47B48 50%, #9B4C8A 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .rating-summary {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
        }
        .rating-summary h2 {
            margin: 0 0 15px 0;
            font-size: 20px;
        }
        .avg-rating {
            font-size: 48px;
            font-weight: bold;
            margin: 10px 0;
        }
        .stars {
            font-size: 24px;
            margin: 10px 0;
        }
        .details {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 15px;
            align-items: center;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: bold;
            color: #2A5D8F;
            min-width: 140px;
            margin-right: 15px;
        }
        .detail-value {
            flex: 1;
        }
        .rating-bars {
            display: grid;
            gap: 15px;
            margin: 25px 0;
        }
        .rating-bar {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        .rating-label {
            font-weight: 500;
            min-width: 120px;
            color: #374151;
        }
        .bar-container {
            flex: 1;
            height: 8px;
            background-color: #e5e7eb;
            border-radius: 4px;
            overflow: hidden;
        }
        .bar-fill {
            height: 100%;
            border-radius: 4px;
            transition: width 0.3s ease;
        }
        .rating-score {
            font-weight: bold;
            min-width: 30px;
            text-align: right;
        }
        .nps-section {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin: 25px 0;
            text-align: center;
        }
        .nps-score {
            font-size: 36px;
            font-weight: bold;
            margin: 10px 0;
        }
        .thank-you {
            background-color: #fef3c7;
            border-left: 4px solid #FBB040;
            padding: 20px;
            margin: 25px 0;
        }
        .thank-you h3 {
            margin: 0 0 15px 0;
            color: #92400e;
            font-size: 18px;
        }
        .footer {
            background-color: #2A5D8F;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer p {
            margin: 0 0 10px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .detail-row, .rating-bar {
                flex-direction: column;
                align-items: flex-start;
            }
            .detail-label, .rating-label {
                min-width: auto;
                margin-right: 0;
                margin-bottom: 5px;
            }
            .rating-score {
                margin-top: 5px;
                text-align: left;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>⭐ Calificación Registrada</h1>
            <p>Gracias por calificar tu experiencia en Siclo</p>
        </div>
        
        <div class="content">
            <p>¡Hola!</p>
            
            <p>Gracias por tomarte el tiempo de calificar tu clase. Tu retroalimentación es invaluable para nosotros y nos ayuda a mantener los más altos estándares de calidad.</p>
            
            <div class="rating-summary">
                <h2>📊 Resumen de tu Calificación</h2>
                <div class="avg-rating">${avgRating}/10</div>
                <div class="stars">${'⭐'.repeat(Math.round(avgRating))}</div>
                <p>Calificación promedio general</p>
            </div>
            
            <div class="details">
                <h3 style="margin-top: 0; color: #2A5D8F;">📍 Detalles de la Clase</h3>
                
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
            
            <div class="rating-bars">
                <h3 style="margin-bottom: 20px; color: #2A5D8F;">🎯 Calificaciones Detalladas</h3>
                
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
                <h3 style="margin: 0 0 15px 0;">🎯 Net Promoter Score</h3>
                <div class="nps-score">${rating.npsScore}/10</div>
                <p style="margin: 0;">${npsEmoji} Eres un <strong>${npsCategory}</strong></p>
            </div>
            
            ${rating.comments ? `
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
                <h3 style="margin: 0 0 15px 0; color: #374151;">💬 Tus Comentarios</h3>
                <p style="margin: 0; font-style: italic; color: #6b7280;">"${rating.comments}"</p>
            </div>
            ` : ''}
            
            <div class="thank-you">
                <h3>🙏 ¡Gracias por tu Retroalimentación!</h3>
                <p style="margin: 0;">
                    Tu opinión nos ayuda a mejorar continuamente. Compartiremos tu calificación con el equipo 
                    para seguir ofreciendo experiencias excepcionales.
                </p>
            </div>
            
            <p style="color: #666; font-style: italic; margin-top: 30px;">
                En Siclo siempre estamos trabajando para ofrecerte la mejor experiencia de entrenamiento.
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
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: 'Arial', sans-serif;
            background-color: #f8f9fa;
            color: #333;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
        }
        .header p {
            margin: 10px 0 0 0;
            font-size: 16px;
            opacity: 0.9;
        }
        .content {
            padding: 40px 30px;
        }
        .status-update {
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            padding: 25px;
            border-radius: 12px;
            text-align: center;
            margin: 25px 0;
            border: 2px solid ${newStatusInfo.color};
        }
        .status-flow {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            margin: 20px 0;
        }
        .status-badge {
            padding: 12px 20px;
            border-radius: 25px;
            font-weight: bold;
            font-size: 16px;
        }
        .status-old {
            background-color: #e5e7eb;
            color: #6b7280;
        }
        .status-new {
            background-color: ${newStatusInfo.color};
            color: white;
        }
        .arrow {
            font-size: 24px;
            color: #6b7280;
        }
        .details {
            background-color: #f8f9fa;
            padding: 25px;
            border-radius: 8px;
            margin: 25px 0;
        }
        .detail-row {
            display: flex;
            margin-bottom: 15px;
            align-items: flex-start;
        }
        .detail-row:last-child {
            margin-bottom: 0;
        }
        .detail-label {
            font-weight: bold;
            color: #2A5D8F;
            min-width: 120px;
            margin-right: 15px;
        }
        .detail-value {
            flex: 1;
            word-break: break-word;
        }
        .manager-message {
            background-color: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            margin: 25px 0;
            border-radius: 0 8px 8px 0;
        }
        .manager-message h3 {
            margin: 0 0 15px 0;
            color: #1d4ed8;
            font-size: 18px;
        }
        .footer {
            background-color: #2A5D8F;
            color: white;
            padding: 30px;
            text-align: center;
        }
        .footer p {
            margin: 0 0 10px 0;
        }
        @media only screen and (max-width: 600px) {
            .container {
                margin: 0;
                border-radius: 0;
            }
            .header, .content, .footer {
                padding: 20px;
            }
            .status-flow {
                flex-direction: column;
                gap: 10px;
            }
            .arrow {
                transform: rotate(90deg);
            }
            .detail-row {
                flex-direction: column;
            }
            .detail-label {
                min-width: auto;
                margin-right: 0;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>📋 Estado Actualizado</h1>
            <p>Tu queja ha sido actualizada por nuestro equipo</p>
        </div>
        
        <div class="content">
            <p>Hola <strong>${complaint.fullName}</strong>,</p>
            
            <p>Te informamos que el estado de tu queja ha sido actualizado. Nuestro equipo ha revisado tu caso y queremos mantenerte informado sobre el progreso.</p>
            
            <div class="status-update">
                <h2 style="margin: 0 0 20px 0; color: #1f2937;">Cambio de Estado</h2>
                <div class="status-flow">
                    <div class="status-badge status-old">
                        ${oldStatusInfo.emoji} ${oldStatusInfo.text}
                    </div>
                    <div class="arrow">→</div>
                    <div class="status-badge status-new">
                        ${newStatusInfo.emoji} ${newStatusInfo.text}
                    </div>
                </div>
                <p style="margin: 0; color: #6b7280; font-size: 14px;">ID de Sugerencia: <code>${complaint.id}</code></p>
            </div>
            
            <div class="details">
                <h3 style="margin-top: 0; color: #2A5D8F;">Detalles de tu Sugerencia</h3>
                
                <div class="detail-row">
                    <div class="detail-label">Local:</div>
                    <div class="detail-value">${branchName}</div>
                </div>
                
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
                <p style="margin: 0; line-height: 1.6;">${managerComments}</p>
            </div>
            ` : ''}
            
            <p style="margin-top: 30px;">
                <strong>¿Tienes dudas sobre esta actualización?</strong><br>
                Puedes contactarnos haciendo referencia a tu ID de queja: <code>${complaint.id}</code>
            </p>
            
            <p style="color: #666; font-style: italic;">
                Gracias por tu paciencia y por ayudarnos a mejorar nuestros servicios. 
                Tu retroalimentación es muy valiosa para nosotros.
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