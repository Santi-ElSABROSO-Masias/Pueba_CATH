export type EstadoSolicitud = 'pendiente' | 'aprobado' | 'rechazado';
export type TipoContenido = 'video' | 'audio' | 'pdf' | 'texto';

export interface TrabajadorTemporal {
  id: string;
  dni: string;
  nombre: string;
  apellido: string;
  empresa?: string;
  email?: string;
  celular?: string;
  username: string;
  activo: boolean;
  creadoEn: string;
}

export interface SolicitudInduccion {
  id: string;
  trabajadorId: string;
  trabajador?: TrabajadorTemporal;
  empresaContratista: string;
  tipoTrabajo: string;
  duracionDias: number;
  motivoIngreso: string;
  estado: EstadoSolicitud;
  aprobadoPor?: string;
  fechaDecision?: string;
  observaciones?: string;
  creadoEn: string;
}

export interface ContenidoCurso {
  id: string;
  titulo: string;
  tipo: TipoContenido;
  urlStorage: string;
  orden: number;
  activo: boolean;
  subidoEn: string;
}

export interface ResultadoEvaluacion {
  id: string;
  solicitudId: string;
  puntaje: number;
  aprobado: boolean;
  intentoNum: number;
  respuestas: Record<string, string>;
  completadoEn: string;
}

export interface Certificado {
  id: string;
  evaluacionId: string;
  trabajadorId: string;
  trabajador?: TrabajadorTemporal;
  codigoUnico: string;
  pdfUrl?: string;
  emitidoEn: string;
}
