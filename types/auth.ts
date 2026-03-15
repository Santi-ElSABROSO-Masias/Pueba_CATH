export type RequestStatus = 'BORRADOR' | 'PENDIENTE_APROBACION' | 'VERIFICACION_DOCUMENTAL' | 'EVALUACION_MEDICA' | 'CAPACITACION' | 'CHKX_TECNICO' | 'APROBADO' | 'RECHAZADO';

export interface DocumentRecord {
    id: string;
    nombre: string;
    archivoUrl?: string;
    estado: 'PENDIENTE' | 'CARGADO' | 'RECHAZADO' | 'APROBADO';
    comentario?: string;
}

export interface HistoryLog {
    id: string;
    fecha: string;
    actor: string;
    rol: string;
    accion: string;
    comentario?: string;
}

export interface BaseAuthRequest {
    id: string;
    solicitanteId: string;
    solicitanteNombre: string;
    empresa: string;
    fechaCreacion: string;
    estado: RequestStatus;
    documentos: DocumentRecord[];
    historial: HistoryLog[];
}

export interface VehicularRequest extends BaseAuthRequest {
    placa: string;
    marca: string;
    modelo: string;
    tieneIVSM: boolean;
    tieneMixVision: boolean;
}

export interface AltoRiesgoRequest extends BaseAuthRequest {
    tiposTrabajo: string[];
    fechaCapacitacion?: string;
    fechaEMO?: string;
    vigencia?: string;
}

export interface LicenciaRequest extends BaseAuthRequest {
    breveteBase: string;
    incluyeCamioneta: boolean;
    intentosTeorico: number;
    intentosPractico: number;
}
