import React, { useState } from 'react';
import { useAuth } from '../../../../AuthContext';
import { VehicularRequest } from '../../../../types/auth';
import { TimelineTracker } from './shared/TimelineTracker';
import { DocumentUploader } from './shared/DocumentUploader';
import { ApprovalPanel } from './shared/ApprovalPanel';

// --- DATA MOCK INICIAL ---
const MOCK_VEHICULOS: VehicularRequest[] = [
    {
        id: 'AUT-V-001',
        solicitanteId: 'u2',
        solicitanteNombre: 'Juan Ramírez',
        empresa: 'Minera Los Andes',
        fechaCreacion: '2026-10-18',
        estado: 'CHKX_TECNICO',
        placa: 'F4C-892',
        marca: 'Toyota',
        modelo: 'Hilux',
        tieneIVSM: true,
        tieneMixVision: true,
        historial: [{ id: 'h1', actor: 'Admin SSOMA', rol: 'Gestión Vial', accion: 'Docs Conformidad', fecha: '2026-10-19' }],
        documentos: [
            { id: 'd1', nombre: 'Tarjeta de Propiedad', estado: 'CARGADO', archivoUrl: '#' },
            { id: 'd2', nombre: 'Póliza SOAT vigente', estado: 'CARGADO', archivoUrl: '#' },
            { id: 'd3', nombre: 'Seguro Contra Todo Riesgo', estado: 'CARGADO', archivoUrl: '#' },
            { id: 'd4', nombre: 'Revisión Técnica', estado: 'CARGADO', archivoUrl: '#' },
        ]
    }
];

export const AcreditacionVehicular: React.FC = () => {
    const { user, isSuperAdmin, isSuperSuperAdmin, isAdminContratista } = useAuth();
    const [solicitudes, setSolicitudes] = useState<VehicularRequest[]>(MOCK_VEHICULOS);
    const [vista, setVista] = useState<'LISTA' | 'DETALLE' | 'NUEVA'>('LISTA');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // --- RENDERERS ---
    const renderLista = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex gap-3">
                    <input type="text" placeholder="Buscar por Placa o Empresa..." className="px-4 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none" />
                    <select className="px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none">
                        <option value="">Todas las Empresas</option>
                        <option value="Minera Los Andes">Minera Los Andes</option>
                        <option value="TechFlow S.A.">TechFlow S.A.</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold">ID / Solicitante</th>
                            <th className="px-6 py-4 font-semibold">Placa / Vehículo</th>
                            <th className="px-6 py-4 font-semibold">Equipos GPS</th>
                            <th className="px-6 py-4 font-semibold">Estado Actual</th>
                            <th className="px-6 py-4 font-semibold text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {solicitudes.map(req => (
                            <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-800">{req.solicitanteNombre}</p>
                                    <p className="text-xs text-slate-500">{req.id} - {req.empresa}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-slate-800 text-white px-2 py-1 rounded text-xs font-mono font-bold tracking-widest">{req.placa}</span>
                                    <p className="text-xs text-slate-500 mt-1">{req.marca} {req.modelo}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.tieneIVSM ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>IVSM</span>
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${req.tieneMixVision ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-400'}`}>MIX V.</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${req.estado === 'PENDIENTE_APROBACION' ? 'bg-amber-100 text-amber-700' :
                                        req.estado === 'CHKX_TECNICO' ? 'bg-purple-100 text-purple-700' :
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
            { label: 'Verificación Documental', status: req.estado === 'VERIFICACION_DOCUMENTAL' ? 'current' as const : 'completed' as const },
            { label: 'Instalación Equipos', status: 'completed' as const },
            { label: 'Checklist Técnico', status: req.estado === 'CHKX_TECNICO' ? 'current' as const : 'pending' as const },
            { label: 'Autorizado', status: 'pending' as const },
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
                            <p className="text-sm text-slate-500 mt-1">Placa: <span className="font-mono text-slate-900 font-bold">{req.placa}</span> | {req.empresa}</p>
                        </div>
                        <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold tracking-wider uppercase">
                            {req.estado.replace('_', ' ')}
                        </span>
                    </div>

                    {/* Timeline */}
                    <TimelineTracker steps={timelineSteps} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        {/* Info Column */}
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4"><i className="fas fa-truck text-indigo-500 mr-2"></i>Datos del Vehículo</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">Marca / Modelo</span>
                                        <span className="font-semibold text-slate-800">{req.marca} {req.modelo}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-200 pb-2">
                                        <span className="text-slate-500">Instalación IVSM</span>
                                        <span className="font-semibold text-slate-800">{req.tieneIVSM ? 'CONFIRMADO' : 'PENDIENTE'}</span>
                                    </div>
                                    <div className="flex justify-between pb-2">
                                        <span className="text-slate-500">Instalación Mix Vision</span>
                                        <span className="font-semibold text-slate-800">{req.tieneMixVision ? 'CONFIRMADO' : 'PENDIENTE'}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Approval Action */}
                            {(isSuperAdmin() || isSuperSuperAdmin()) && req.estado === 'CHKX_TECNICO' && (
                                <ApprovalPanel
                                    title="Checklist Técnico (Jefatura Mantenimiento Mina)"
                                    onApprove={() => alert('Checklist Técnico Aprobado. Vehículo Autorizado.')}
                                    onReject={(comment) => alert(`Rechazado en Inspección Técnica: ${comment}`)}
                                />
                            )}
                        </div>

                        {/* Docs Column */}
                        <div>
                            <DocumentUploader
                                requiredDocs={['Tarjeta de Propiedad', 'Póliza SOAT vigente', 'Seguro Contra Todo Riesgo', 'Revisión Técnica']}
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
                        <h2 className="text-2xl font-bold text-slate-800">Acreditación Vehicular</h2>
                        <p className="text-slate-500 mt-1">Gestión y control de vehículos autorizados a operar en planta.</p>
                    </div>
                    {isAdminContratista() && (
                        <button onClick={() => setVista('NUEVA')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2">
                            <i className="fas fa-plus"></i> Registrar Vehículo
                        </button>
                    )}
                </div>
            )}

            {vista === 'LISTA' && renderLista()}
            {vista === 'DETALLE' && renderDetalle()}

            {vista === 'NUEVA' && (
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-fadeIn">
                    <button onClick={() => setVista('LISTA')} className="text-slate-500 hover:text-slate-800 font-semibold text-sm mb-6">
                        <i className="fas fa-arrow-left mr-2"></i> Cancelar Registro
                    </button>

                    <h3 className="text-xl font-bold text-slate-800 mb-6">Nuevo Registro Vehicular</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Placa (Formato: ABC-123)</label>
                            <input type="text" placeholder="ABC-123" className="w-full px-4 py-3 font-mono rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all uppercase" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Marca</label>
                            <input type="text" placeholder="Ej. Toyota" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Modelo / Año</label>
                            <input type="text" placeholder="Ej. Hilux 2024" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                    </div>

                    <div className="mb-8 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-sm text-indigo-800 font-semibold mb-3">
                            <i className="fas fa-info-circle mr-2"></i> Requisitos de Monitoreo GPS
                        </p>
                        <p className="text-xs text-indigo-700/80 mb-3">La validación final requerirá la instalación confirmada de estos equipos. Usted indicará si ya los tiene instalados.</p>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                                Tiene IVSM instalado
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-slate-700">
                                <input type="checkbox" className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300" />
                                Tiene Mix Vision instalado
                            </label>
                        </div>
                    </div>

                    <DocumentUploader
                        requiredDocs={['Tarjeta de Propiedad', 'Póliza SOAT vigente', 'Seguro Contra Todo Riesgo', 'Revisión Técnica']}
                        documents={[]}
                        onDocumentChange={() => { }}
                    />

                    <div className="mt-8 flex justify-end">
                        <button onClick={() => { alert('Solicitud Vehicular Creada.'); setVista('LISTA'); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all">
                            Enviar para Verificación
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
