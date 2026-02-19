
export enum UserStatus {
  REGISTERED = 'REGISTRADO',
  APPROVED = 'APROBADO',
  LINK_SENT = 'LINK ENVIADO',
  REJECTED = 'RECHAZADO'
}

export type UserRole = 'superadmin' | 'user';

export interface Company {
  id: string;
  name: string;
  contact_email?: string;
}

export interface ProjectPhase {
  title: string;
  objective: string;
  tasks: string[];
}

export interface Training {
  id: string;
  title: string;
  description: string;
  date: string;
  maxCapacity: number;
  isPublished: boolean;
  customQuestions: string[];
  // Campos nuevos para consolidación
  isConsolidated?: boolean;
  consolidatedAt?: string;
  instructorName?: string;
  // Campos nuevos para UI y Clasificación
  color: string;      // Hex color para identificar el tipo de curso
  duration: string;   // Ej: "4 horas", "4 días"
  schedule: string;   // Ej: "8:00 am - 12:00 m"
  group?: string;     // Ej: "Grupo 1"
  // Multi-tenant
  companyId?: string | null; // NULL significa visible para todos (Global) o específico de una empresa
}

export interface EventUser {
  id: string;
  trainingId: string;
  name: string; // Nombres y Apellidos
  email: string;
  dni: string; // Nuevo
  organization: string; // Empresa
  area: string; // Nuevo
  role: string; // Cargo (Nuevo)
  brevete?: string; // Opcional (Nuevo para importación)
  status: UserStatus;
  meetingLink?: string;
  attended: boolean;
  registeredAt: string;
  customAnswers?: Record<string, string>;
}

export interface SystemUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  companyId: string | null; // Null si es superadmin global
  isActive: boolean;
  password?: string; // Solo para manejo interno en creación
}

// --- NOTIFICACIONES ---

export type NotificationType = 'reminder_7d' | 'deadline_warning' | 'registration_closed' | 'consolidation_ready';
export type NotificationStatus = 'pending' | 'sent' | 'failed';

export interface Notification {
  id: string;
  trainingId: string;
  trainingTitle: string; // Desnormalizado para UI rápida
  type: NotificationType;
  recipientEmail: string; // 'SUPERVISOR', 'ADMIN' o email específico
  scheduledAt: string; // ISO String
  sentAt?: string;
  status: NotificationStatus;
  errorMessage?: string;
  contentPreview?: string; // Para mostrar en el panel qué se enviará
}
