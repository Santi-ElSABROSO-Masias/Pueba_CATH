
import { Training, Notification, NotificationType } from '../types';

export const getEmailTemplate = (type: NotificationType, training: Training, supervisorName: string = 'Supervisor'): string => {
  const commonStyles = "font-family: sans-serif; color: #334155;";
  
  switch (type) {
    case 'reminder_7d':
      return `
        <div style="${commonStyles}">
          <h3>📅 Recordatorio: Capacitación "${training.title}" en 7 días</h3>
          <p>Hola ${supervisorName},</p>
          <p>Te recordamos que la capacitación se llevará a cabo el <strong>${training.date}</strong>.</p>
          <ul>
            <li>Aforo máximo: ${training.maxCapacity}</li>
            <li>Link de registro: <a href="#">Ver Link</a></li>
          </ul>
          <p>Por favor asegura que tu equipo se registre a tiempo.</p>
        </div>
      `;
    
    case 'deadline_warning':
      return `
        <div style="${commonStyles}">
          <h3 style="color: #b45309;">⚠️ URGENTE: Fecha límite de registro cercana</h3>
          <p>Hola ${supervisorName},</p>
          <p>El registro para "${training.title}" cierra en 24 horas.</p>
          <p>Si tienes participantes pendientes, usa la carga masiva ahora.</p>
        </div>
      `;

    case 'registration_closed':
      return `
        <div style="${commonStyles}">
          <h3>🔒 Registro Cerrado</h3>
          <p>El periodo de inscripción para "${training.title}" ha finalizado.</p>
          <p>Se ha generado el reporte preliminar de inscritos.</p>
        </div>
      `;

    case 'consolidation_ready':
      return `
        <div style="${commonStyles}">
          <h3>✅ Consolidado Final Disponible</h3>
          <p>La capacitación "${training.title}" ha concluido su ciclo administrativo.</p>
          <p>Adjunto encontrarás el Excel final con la asistencia verificada.</p>
        </div>
      `;
      
    default:
      return "";
  }
};

export const calculateNotificationDates = (training: Training) => {
  // Asumimos training.date es YYYY-MM-DD
  const startDate = new Date(training.date + 'T09:00:00'); 
  
  // Deadline suele ser 2 días antes del evento
  const deadlineDate = new Date(startDate);
  deadlineDate.setDate(startDate.getDate() - 2);
  deadlineDate.setHours(18, 0, 0, 0);

  return {
    reminder_7d: new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000), // 7 días antes
    deadline_warning: new Date(deadlineDate.getTime() - 24 * 60 * 60 * 1000), // 1 día antes del deadline
    registration_closed: deadlineDate,
    consolidation_ready: new Date(startDate.getTime() + 24 * 60 * 60 * 1000) // 1 día después del evento
  };
};

export const createNotificationsForTraining = (training: Training): Notification[] => {
  const dates = calculateNotificationDates(training);
  const baseNotification = {
    trainingId: training.id,
    trainingTitle: training.title,
    status: 'pending' as const,
    sentAt: undefined,
    errorMessage: undefined
  };

  return [
    {
      ...baseNotification,
      id: Math.random().toString(36).substr(2, 9),
      type: 'reminder_7d',
      recipientEmail: 'supervisor@empresa.com',
      scheduledAt: dates.reminder_7d.toISOString(),
      contentPreview: 'Recordatorio 7 días antes'
    },
    {
      ...baseNotification,
      id: Math.random().toString(36).substr(2, 9),
      type: 'deadline_warning',
      recipientEmail: 'supervisor@empresa.com',
      scheduledAt: dates.deadline_warning.toISOString(),
      contentPreview: 'Alerta de Cierre inminente'
    },
    {
      ...baseNotification,
      id: Math.random().toString(36).substr(2, 9),
      type: 'registration_closed',
      recipientEmail: 'admin@sistema.com',
      scheduledAt: dates.registration_closed.toISOString(),
      contentPreview: 'Confirmación Cierre Registro'
    },
    {
      ...baseNotification,
      id: Math.random().toString(36).substr(2, 9),
      type: 'consolidation_ready',
      recipientEmail: 'admin@sistema.com',
      scheduledAt: dates.consolidation_ready.toISOString(),
      contentPreview: 'Reporte Final Consolidado'
    }
  ];
};
