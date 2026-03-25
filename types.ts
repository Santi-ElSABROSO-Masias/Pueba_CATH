
export enum UserStatus {
  REGISTERED = 'REGISTRADO',
  APPROVED = 'APROBADO',
  LINK_SENT = 'LINK ENVIADO',
  REJECTED = 'RECHAZADO',
  PENDING_LINK = 'PENDIENTE DE LINK'
}

export type UserRole = 'admin_contratista' | 'super_admin' | 'super_super_admin';

export const ROLE_LABELS: Record<UserRole, string> = {
  admin_contratista: 'Administrador',
  super_admin: 'Capacitador',
  super_super_admin: 'Gerencia SSO'
};

export type Permission =
  | 'canRegisterWorkers'
  | 'canValidate'
  | 'canApproveFinal'
  | 'canSendLinks'
  | 'canManageUsers'
  | 'canManageQuotas'
  | 'canExtendDeadline'
  | 'canManageCalendar';

export interface RolePermissions {
  canRegisterWorkers: boolean;
  canValidate: boolean;
  canApproveFinal: boolean;
  canSendLinks: boolean;
  canManageUsers: boolean;
  canManageQuotas: boolean;
  canExtendDeadline: boolean;
  canManageCalendar: boolean;
  viewScope: 'own_company' | 'all_companies';
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  admin_contratista: {
    canRegisterWorkers: true,      // ✅ Única función: registrar
    canValidate: false,             // ❌ NO valida
    canApproveFinal: false,         // ❌ NO aprueba
    canSendLinks: false,            // ❌ NO envía links
    canManageUsers: false,          // ❌ NO gestiona usuarios
    canManageQuotas: true,          // ✅ Gestiona su cupo
    canExtendDeadline: false,       // ❌ NO extiende deadlines
    canManageCalendar: false,       // ❌ NO gestiona calendario
    viewScope: 'own_company'        // Solo ve su empresa
  },

  super_admin: {
    canRegisterWorkers: false,      // ❌ NO registra
    canValidate: true,              // ✅ Única función: validar
    canApproveFinal: false,         // ❌ NO aprueba (solo valida)
    canSendLinks: false,            // ❌ NO envía links
    canManageUsers: false,          // ❌ NO gestiona usuarios
    canManageQuotas: false,         // ❌ NO gestiona cupos
    canExtendDeadline: false,       // ❌ NO extiende deadlines
    canManageCalendar: false,       // ❌ NO gestiona calendario
    viewScope: 'all_companies'      // Ve todas para validar
  },

  super_super_admin: {
    canRegisterWorkers: false,      // ❌ NO registra directamente
    canValidate: false,             // ❌ NO valida (eso es nivel 2)
    canApproveFinal: true,          // ✅ Aprobación final
    canSendLinks: true,             // ✅ Envía links
    canManageUsers: true,           // ✅ Gestiona usuarios
    canManageQuotas: true,          // ✅ Aprueba solicitudes de cupo
    canExtendDeadline: true,        // ✅ Extiende deadlines
    canManageCalendar: true,        // ✅ Gestiona calendario
    viewScope: 'all_companies'      // Ve todo el sistema
  }
};

export interface Company {
  id: string;
  name: string;
  contact_email?: string;
  quotaMax?: number;
  quotaUsed?: number;
}

export interface ProjectPhase {
  title: string;
  objective: string;
  tasks: string[];
}

export interface TrainingTemplate {
  id: string;
  name: string;
  duration_hours: number;
  day_of_week: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  start_time: string; // "08:00"
  end_time: string;   // "18:00"
  max_capacity: number;
  is_active_by_default: boolean; // false para "Aislamiento/Bloqueo"
  week_of_month: number; // 2 (segunda semana)
  is_multi_day: boolean; // true para Inducción (4 días)
}

export interface MonthlySchedule {
  id: string;
  month: number;        // 1-12
  year: number;         // 2026
  status: 'draft' | 'published' | 'completed';
  generated_at: string;
  published_at?: string;
  published_by?: string;
  trainings: Training[]; // Capacitaciones generadas para este mes
}

export enum TrainingStatus {
  ACTIVE = 'ACTIVE',
  FULL = 'FULL',
  CLOSED = 'CLOSED',
  UPCOMING = 'UPCOMING',
  SUSPENDED = 'SUSPENDED',
  ACTIVE_IS_ACTIVE = 'active',
  INACTIVE = 'inactive'
}

export interface Training {
  id: string;
  title: string;
  description: string;
  date: string;
  endDate?: string;       // Para cursos multi-día (Ej: Inducción 4 días)
  isFullDay?: boolean;    // true = jornada completa (AM+PM), false/undefined = medio día
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
  // Deadline
  registration_deadline: string;  // Fecha/hora límite manual
  deadline_extended_at?: string;  // Última extensión
  deadline_extended_by?: string;  // ID usuario que extendió
  deadline_extension_reason?: string;  // Motivo de extensión
  // Relación con Schedule
  monthly_schedule_id?: string;
  template_id?: string;
  is_active?: boolean; // Para activar/desactivar en el schedule
  registeredCount?: number; // Cantidad de inscritos (calculado)
  status?: TrainingStatus; // Estado del curso
  meetingLink?: string; // Link manual de Teams
}

export interface EventUser {
  id: string;
  trainingId: string;
  name: string; // Nombres y Apellidos
  email: string;
  phone: string; // Nuevo
  dni: string; // Nuevo
  organization: string; // Empresa
  area: string; // Nuevo
  role: string; // Cargo (Nuevo)
  brevete?: string; // Opcional (Nuevo para importación)
  dniPhoto?: string; // Base64 o URL de la foto del DNI
  status: UserStatus;
  meetingLink?: string;
  attended: boolean;
  registeredAt: string;
  customAnswers?: Record<string, string>;
  identity_validated: boolean;
  validation_date?: string;
  validation_link: string;        // Link único de validación
  validation_completed: boolean;
  dni_photo_url?: string;         // (simulado en MVP)
  selfie_photo_url?: string;      // (simulado en MVP)
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

export type NotificationType = 'reminder_7d' | 'deadline_warning' | 'registration_closed' | 'consolidation_ready' | 'course_opened' | 'registration_confirmed' | 'new_training_published' | 'critical_capacity_alert' | 'duplicated_worker_alert';
export type NotificationStatus = 'pending' | 'sent' | 'failed' | 'unread';

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
  read?: boolean; // Para ocultar del contador de alertas de campana
}

// Evaluation Module Types
export interface Exam {
  sentTo?: string[];
  dispatchedAt?: string;
  pendingDispatch?: boolean;
  id: string;
  trainingId: string;
  trainingTitle: string;
  createdAt: string;
  status: 'draft' | 'published';
  questions: Question[];
  timeLimit: number;        // minutos
  minPassingScore: number;  // porcentaje mínimo para aprobar
  results: ExamResult[];
  accessType: 'public' | 'restricted';
  requiresPassword: boolean;
  password?: string;
  participantFields: {
    name: boolean;
    dni: boolean;
    email: boolean;
    organization: boolean;
  };
  termsAndConditions?: string;
  publicLink?: string;
  isPublished: boolean;
}

export interface Question {
  id: string;
  text: string;             // Enunciado de la pregunta
  type: 'multiple';         // Por ahora solo opción múltiple
  options: string[];        // Exactamente 4 opciones [A, B, C, D]
  correctAnswer: number;    // Índice de la respuesta correcta (0-3)
  trainingTag: string;      // Capacitación asociada (por nombre)
}

export interface ExamResult {
  id: string;
  examId: string;
  participantName: string;
  dni: string;
  score: number;
  passed: boolean;
  completedAt: string;
}

// === SISTEMA DE ELEGIBILIDAD OCUPACIONAL ===

export interface OccupationalFamily {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface OccupationalRole {
  id: string;
  name: string;
  familyId: string;
  isActive: boolean;
}

export type EligibilityStatus = 'required' | 'eligible' | 'blocked';

export interface EligibilityRule {
  familyId: string;
  templateId: string;  // Vincula con TrainingTemplate.id
  status: EligibilityStatus;
}

// ── Módulo Inducción Temporal (agregado) ─────────────────
export * from './src/modules/induccion-temporal/types/induccion.types';
