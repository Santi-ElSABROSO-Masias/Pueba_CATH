
import { Training, Notification, NotificationType } from '../types';

export const getEmailTemplate = (type: NotificationType, training: Training, supervisorName: string = 'Supervisor', extraData?: string): string => {
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

    case 'course_opened':
      return `
        <div style="${commonStyles}">
          <h3>📢 Nuevo Curso Disponible: ${training.title}</h3>
          <p>Hola ${supervisorName},</p>
          <p>Se ha abierto la inscripción para la capacitación <strong>${training.title}</strong>.</p>
          <ul>
            <li>Fecha: <strong>${training.date}</strong></li>
            <li>Aforo máximo: ${training.maxCapacity} participantes</li>
          </ul>
          <p>Registra a tus trabajadores antes de que se agoten los cupos.</p>
        </div>
      `;

    case 'registration_confirmed':
      return `
        <div style="${commonStyles}">
          <h3>📝 Registro Confirmado</h3>
          <p>El trabajador ha sido inscrito exitosamente en la capacitación <strong>${training.title}</strong>.</p>
          <ul>
            <li>Fecha del curso: <strong>${training.date}</strong></li>
            <li>Horario: ${training.schedule || 'Por confirmar'}</li>
          </ul>
          <p>Se enviará el link de acceso una vez aprobado por el supervisor.</p>
        </div>
      `;

    case 'new_training_published':
      return `
        <div style="${commonStyles}">
          <h3 style="color: #10b981;">📚 Nueva capacitación disponible: ${training.title}</h3>
          <p>Hola ${supervisorName},</p>
          <p>Se ha publicado un nuevo curso en el sistema.</p>
          <ul>
            <li>Fecha: <strong>${training.date}</strong></li>
            <li>Cupos máximos ofertados: ${training.maxCapacity}</li>
          </ul>
          <p>Ingresa a la plataforma para inscribir a tus trabajadores lo antes posible.</p>
        </div>
      `;

    case 'critical_capacity_alert':
      return `
        <div style="${commonStyles}">
          <h3 style="color: #ea580c;">⚠️ Alerta de cupos: La capacitación "${training.title}" tiene menos de 5 cupos disponibles</h3>
          <p>Hola Gerencia,</p>
          <p>La recepción de inscripciones para el curso "${training.title}" está por llegar a su límite máximo.</p>
          <p>Actualmente quedan únicamente <strong>${Math.max(0, training.maxCapacity - (training.registeredCount || 0))} cupos</strong> disponibles.</p>
        </div>
      `;

    case 'duplicated_worker_alert':
      const extr = extraData ? extraData.split('|') : ['[Nombre]', '[DNI]'];
      const nomb = extr[0] || '[Nombre]';
      const doc = extr[1] || '[DNI]';
      return `
        <div style="${commonStyles}">
          <h3 style="color: #eab308;">👤 Alerta: Trabajador Repetido</h3>
          <p>Se ha detectado una anomalía durante una inscripción a su clase.</p>
          <p>El trabajador <strong>${nomb}</strong> - DNI <strong>${doc}</strong> está intentando volver a cursar la capacitación "${training.title}" que ya tomó anteriormente.</p>
          <p>Recomendamos verificar en el sistema este comportamiento.</p>
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

// Crear notificación individual de apertura de curso
export const createCourseOpenedNotification = (training: Training): Notification => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    trainingId: training.id,
    trainingTitle: training.title,
    type: 'course_opened',
    recipientEmail: 'todos-supervisores@empresa.com',
    scheduledAt: new Date().toISOString(),
    status: 'sent',
    contentPreview: `Curso "${training.title}" ahora disponible`,
    sentAt: new Date().toISOString(),
    errorMessage: undefined
  };
};

// Crear notificación de registro confirmado
export const createRegistrationConfirmedNotification = (
  training: Training,
  workerName: string,
  workerEmail: string
): Notification => {
  return {
    id: Math.random().toString(36).substr(2, 9),
    trainingId: training.id,
    trainingTitle: training.title,
    type: 'registration_confirmed',
    recipientEmail: workerEmail,
    scheduledAt: new Date().toISOString(),
    status: 'sent',
    contentPreview: `${workerName} inscrito en "${training.title}"`,
    sentAt: new Date().toISOString(),
    errorMessage: undefined
  };
};
