import React, { useState } from 'react';
import { useAuth } from '../../../../AuthContext';
import { LicenciaRequest, DocumentRecord, RequestStatus } from '../../../../types/auth';
import { TimelineTracker } from './shared/TimelineTracker';
import { DocumentUploader } from './shared/DocumentUploader';
import { ApprovalPanel } from './shared/ApprovalPanel';

// --- DATA MOCK INICIAL ---
const MOCK_LICENCIAS: LicenciaRequest[] = [
    {
        id: 'LIC-001',
        solicitanteId: 'u1',
        solicitanteNombre: 'Carlos Méndez',
        empresa: 'TechFlow S.A.',
        fechaCreacion: '2026-10-15',
        estado: 'PENDIENTE_APROBACION',
        breveteBase: 'A-IIB',
        incluyeCamioneta: true,
        intentosTeorico: 0,
        intentosPractico: 0,
        historial: [{ id: 'h1', actor: 'Carlos Méndez', rol: 'Operador', accion: 'Creación de Borrador', fecha: '2026-10-14' }],
        documentos: [
            { id: 'd1', nombre: 'Licencia de conducir vigente', estado: 'CARGADO', archivoUrl: '#' },
            { id: 'd2', nombre: 'Récord de conductor', estado: 'CARGADO', archivoUrl: '#' },
            { id: 'd3', nombre: 'Constancia médica de manejo', estado: 'CARGADO', archivoUrl: '#' },
            { id: 'd4', nombre: 'Experiencia acreditada', estado: 'CARGADO', archivoUrl: '#' },
            { id: 'd5', nombre: 'Certificado NSC (Camioneta)', estado: 'CARGADO', archivoUrl: '#' },
        ]
    }
];

export const LicenciasManejo: React.FC = () => {
    const { user, isSuperAdmin, isSuperSuperAdmin, isAdminContratista } = useAuth();
    const [solicitudes, setSolicitudes] = useState<LicenciaRequest[]>(MOCK_LICENCIAS);
    const [vista, setVista] = useState<'LISTA' | 'DETALLE' | 'NUEVA'>('LISTA');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // --- RENDERERS ---
    const renderLista = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex gap-3">
                    <input type="text" placeholder="Buscar por Nombre o DNI..." className="px-4 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <select className="px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none">
                        <option value="">Todas las Empresas</option>
                        <option value="TechFlow S.A.">TechFlow S.A.</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold">ID / Solicitante</th>
                            <th className="px-6 py-4 font-semibold">Empresa</th>
                            <th className="px-6 py-4 font-semibold">Brevete</th>
                            <th className="px-6 py-4 font-semibold">Estado Actual</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {solicitudes.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800">{req.solicitanteNombre}</p>
                                    <p className="text-xs text-slate-500">{req.id}</p>
                                </td>
                                <td className="px-6 py-4 text-slate-600">{req.empresa}</td>
                                <td className="px-6 py-4 text-slate-600">
                                    <span className="bg-slate-100 text-slate-700 px-2 py-1 flex w-max rounded text-xs font-bold">{req.breveteBase}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${req.estado === 'PENDIENTE_APROBACION' ? 'bg-amber-100 text-amber-700' :
                                        req.estado === 'APROBADO' ? 'bg-green-100 text-green-700' :
                                            req.estado === 'RECHAZADO' ? 'bg-red-100 text-red-700' :
                                                'bg-blue-100 text-blue-700'
                                        }`}>
                                        {req.estado.replace('_', ' ')}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => { setSelectedId(req.id); setVista('DETALLE'); }}
                                        className="text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg font-semibold transition-colors"
                                    >
                                        Evaluar <i className="fas fa-chevron-right ml-1"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderDetalle = () => {
        const req = solicitudes.find(s => s.id === selectedId);
        if (!req) return null;

        const timelineSteps = [
            { label: 'Borrador', status: 'completed' as const },
            { label: 'Aprob. Gerencial', status: req.estado === 'PENDIENTE_APROBACION' ? 'current' as const : 'completed' as const },
            { label: 'Eval. Médica', status: 'pending' as const },
            { label: 'Capacitación', status: 'pending' as const },
            { label: 'Emitido', status: 'pending' as const },
        ];

        return (
            <div className="space-y-6 animate-fadeIn">
                <button onClick={() => setVista('LISTA')} className="text-slate-500 hover:text-slate-800 font-semibold text-sm mb-4">
                    <i className="fas fa-arrow-left mr-2"></i> Volver al Listado
                </button>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                    <div className="flex justify-between items-start mb-6">
                        <div>
                            <h2 className="text-xl font-bold text-slate-800">Solicitud {req.id}</h2>
                            <p className="text-sm text-slate-500 mt-1">{req.solicitanteNombre} | {req.empresa}</p>
                        </div>
                        <span className="bg-amber-100 text-amber-700 px-4 py-2 rounded-lg text-sm font-bold">
                            {req.estado.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Timeline */}
                    <TimelineTracker steps={timelineSteps} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Info Column */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4"><i className="fas fa-user-circle text-indigo-500 mr-2"></i>Datos del Conductor</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">Brevete MTC</span>
                                        <span className="font-semibold text-slate-800">{req.breveteBase}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">Maneja Camioneta</span>
                                        <span className="font-semibold text-slate-800">{req.incluyeCamioneta ? 'SÍ (Requiere NSC)' : 'NO'}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-slate-500">Oportunidades</span>
                                        <span className="font-semibold text-slate-800">
                                            Teórico: {req.intentosTeorico}/2 | Práctico: {req.intentosPractico}/2
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Action */}
                            {(isSuperAdmin() || isSuperSuperAdmin()) && req.estado === 'PENDIENTE_APROBACION' && (
                                <ApprovalPanel
                                    title="Evaluación Gerencial / Dueño de Contrato"
                                    onApprove={() => alert('Aprobado. Pasa a Eval Médica.')}
                                    onReject={(comment) => alert(`Rechazado: ${comment}`)}
                                />
                            )}
                        </div>

                        {/* Docs Column */}
                        <div>
                            <DocumentUploader
                                requiredDocs={req.incluyeCamioneta ?
                                    ['Licencia de conducir vigente', 'Récord de conductor', 'Constancia médica de manejo', 'Experiencia acreditada', 'Fotocheck de afiliación', 'Certificado NSC (Camioneta)'] :
                                    ['Licencia de conducir vigente', 'Récord de conductor', 'Constancia médica de manejo', 'Experiencia acreditada', 'Fotocheck de afiliación']}
                                documents={req.documentos}
                                onDocumentChange={() => { }}
                                readOnly={true}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {vista === 'LISTA' && (
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Licencias Internas de Manejo</h2>
                        <p className="text-slate-500 mt-1">Gestión y control de autorizaciones de conducción en planta.</p>
                    </div>
                    {isAdminContratista() && (
                        <button onClick={() => setVista('NUEVA')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2">
                            <i className="fas fa-plus"></i> Ingresar Solicitud
                        </button>
                    )}
                </div>
            )}

            {vista === 'LISTA' && renderLista()}
            {vista === 'DETALLE' && renderDetalle()}
            {vista === 'NUEVA' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
                    <button onClick={() => setVista('LISTA')} className="text-slate-500 hover:text-slate-800 font-semibold text-sm mb-6">
                        <i className="fas fa-arrow-left mr-2"></i> Cancelar Solicitud
                    </button>

                    <h3 className="text-xl font-bold text-slate-800 mb-6">Nueva Solicitud de Licencia Interna</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Conductor (DNI)</label>
                            <input type="text" placeholder="Ej. 74839210" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombres Completos</label>
                            <input type="text" placeholder="Automático tras buscar DNI..." disabled className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 outline-none" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Categoría Brevete MTC</label>
                            <select className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all">
                                <option>A-I</option>
                                <option>A-IIa</option>
                                <option>A-IIb</option>
                                <option>A-IIIa</option>
                                <option>A-IIIb</option>
                                <option>A-IIIc</option>
                            </select>
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <input type="checkbox" id="camioneta" className="w-5 h-5 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                            <label htmlFor="camioneta" className="text-sm font-semibold text-slate-700 cursor-pointer">
                                El conductor manejará Camioneta (Requiere Certificado NSC)
                            </label>
                        </div>
                    </div>

                    <DocumentUploader
                        requiredDocs={['Licencia de conducir vigente', 'Récord de conductor', 'Constancia médica de manejo', 'Experiencia acreditada', 'Fotocheck de afiliación']}
                        documents={[]}
                        onDocumentChange={() => { }}
                    />

                    <div className="mt-8 flex justify-end">
                        <button onClick={() => { alert('Solicitud Enviada (En Borrador o Pendiente).'); setVista('LISTA'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all">
                            Emitir Solicitud
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
