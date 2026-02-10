
export enum UserStatus {
  REGISTERED = 'REGISTRADO',
  APPROVED = 'APROBADO',
  LINK_SENT = 'LINK ENVIADO',
  REJECTED = 'RECHAZADO'
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
  role: 'ADMIN' | 'OPERATOR';
}
