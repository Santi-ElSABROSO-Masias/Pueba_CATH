import React, { useState } from 'react';
import { useAuth } from '../../../../AuthContext';
import { AltoRiesgoRequest } from '../../../../types/auth';
import { TimelineTracker } from './shared/TimelineTracker';
import { DocumentUploader } from './shared/DocumentUploader';
import { ApprovalPanel } from './shared/ApprovalPanel';
import { supabase } from '../../../config/supabaseClient';
import { apiClient } from '../../../api/client';

const TIPOS_REQUIEREN_EMO = ['Altura', 'Caliente', 'Espacio Confinado'];

// Mapping helpers for Supabase
const mapDBToUI = (dbRow: any): AltoRiesgoRequest => {
    let extraData: any = {};
    try {
        if (dbRow.rejection_reason) {
            extraData = JSON.parse(dbRow.rejection_reason);
        }
    } catch { }

    return {
        id: dbRow.id,
        solicitanteId: dbRow.worker_id,
        solicitanteNombre: dbRow.worker_name,
        empresa: dbRow.company,
        fechaCreacion: new Date(dbRow.date_requested).toISOString().split('T')[0],
        estado: extraData.estadoUI || 'BORRADOR',
        tiposTrabajo: extraData.tiposTrabajo || [dbRow.work_type].filter(Boolean),
        documentos: extraData.documentos || [],
        historial: extraData.historial || [],
        fechaCapacitacion: extraData.fechaCapacitacion,
        fechaEMO: extraData.fechaEMO,
        vigencia: extraData.vigencia,
    };
};

const mapUIToDB = (req: AltoRiesgoRequest) => {
    const extraData = {
        estadoUI: req.estado,
        tiposTrabajo: req.tiposTrabajo,
        documentos: req.documentos,
        historial: req.historial,
        fechaCapacitacion: req.fechaCapacitacion,
        fechaEMO: req.fechaEMO,
        vigencia: req.vigencia,
    };
    return {
        id: req.id,
        worker_id: req.solicitanteId || '00000000-0000-0000-0000-000000000000',
        worker_name: req.solicitanteNombre,
        dni: '00000000', // Campo requerido en DB
        company: req.empresa,
        work_type: req.tiposTrabajo.join(', '),
        location: 'No especificada',
        date_requested: new Date(req.fechaCreacion).toISOString(),
        date_needed: new Date().toISOString(),
        status: ['APROBADO'].includes(req.estado) ? 'approved' : ['RECHAZADO'].includes(req.estado) ? 'rejected' : 'pending',
        rejection_reason: JSON.stringify(extraData)
    };
};

export const TrabajosAltoRiesgo: React.FC = () => {
    const { user, isSuperAdmin, isSuperSuperAdmin, isAdminContratista } = useAuth();
    const [solicitudes, setSolicitudes] = useState<AltoRiesgoRequest[]>([]);
    const [vista, setVista] = useState<'LISTA' | 'DETALLE' | 'NUEVA'>('LISTA');
    const [selectedId, setSelectedId] = useState<string | null>(null);

    // Initial Fetch & Realtime Subscription
    React.useEffect(() => {
        const fetchData = async () => {
            try {
                const { data } = await apiClient.get('/authorizations/high-risk');
                if (data.success) {
                    setSolicitudes(data.data.map(mapDBToUI));
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();

        const channel = supabase.channel('public:auth_high_risk_works')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'auth_high_risk_works' }, (payload: any) => {
                if (payload.eventType === 'INSERT') {
                    setSolicitudes(prev => [...prev.filter(r => r.id !== payload.new.id), mapDBToUI(payload.new)]);
                } else if (payload.eventType === 'UPDATE') {
                    setSolicitudes(prev => prev.map(req => req.id === payload.new.id ? mapDBToUI(payload.new) : req));
                } else if (payload.eventType === 'DELETE') {
                    setSolicitudes(prev => prev.filter(req => req.id !== payload.old.id));
                }
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, []);

    // --- ESTADO LOCAL NUEVA SOLICITUD ---
    const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
    const [newDocuments, setNewDocuments] = useState<any[]>([]); // To hold documents while creating
    const TIPOS_DISPONIBLES = ['Altura', 'Caliente', 'Espacio Confinado', 'Bloqueo de Energía', 'Izajes'];

    const toggleType = (tipo: string) => {
        setSelectedTypes(prev =>
            prev.includes(tipo) ? prev.filter(t => t !== tipo) : [...prev, tipo]
        );
    };

    const getDynamicChecklist = () => {
        const baseDocs = ['Récord de Conductor', 'Experiencia Mínima (3 años)'];
        if (selectedTypes.includes('Altura')) baseDocs.push('Aptitud Médica Ocupacional (Altura)');
        if (selectedTypes.includes('Izajes')) baseDocs.push('Certificación Externa ASME');
        return baseDocs;
    };

    // --- RENDERERS ---
    const renderLista = () => (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex gap-3">
                    <input type="text" placeholder="Buscar por Trabajador..." className="px-4 py-2 rounded-lg border border-slate-200 text-sm w-64 focus:ring-2 focus:ring-indigo-500 outline-none" />
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50/80 text-slate-500">
                        <tr>
                            <th className="px-6 py-4 font-semibold">ID / Solicitante</th>
                            <th className="px-6 py-4 font-semibold">Empresa</th>
                            <th className="px-6 py-4 font-semibold">Tipos Habilitados</th>
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
                                <td className="px-6 py-4">
                                    <div className="flex flex-wrap gap-1">
                                        {req.tiposTrabajo.map(t => (
                                            <span key={t} className="bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-bold">{t}</span>
                                        ))}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase ${req.estado === 'PENDIENTE_APROBACION' ? 'bg-amber-100 text-amber-700' :
                                        req.estado === 'CAPACITACION' ? 'bg-purple-100 text-purple-700' :
                                            req.estado === 'VERIFICACION_DOCUMENTAL' ? 'bg-blue-100 text-blue-700' :
                                                req.estado === 'APROBADO' ? 'bg-green-100 text-green-700' :
                                                    'bg-red-100 text-red-700'
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

        // EMO Logic Checks
        const requiereEMO = req.tiposTrabajo.some(t => TIPOS_REQUIEREN_EMO.includes(t));

        // Fechas Locales state for the Document Verification step
        const [localFechaCapacitacion, setLocalFechaCapacitacion] = useState(req.fechaCapacitacion || new Date().toISOString().split('T')[0]);
        const [localFechaEMO, setLocalFechaEMO] = useState(req.fechaEMO || new Date().toISOString().split('T')[0]);
        const [localVigencia, setLocalVigencia] = useState(req.vigencia || '');

        // Auto calculate Vigencia based on EMO
        React.useEffect(() => {
            if (requiereEMO && localFechaEMO && !req.vigencia) { // Only auto-calculate if it wasn't saved before
                const date = new Date(localFechaEMO);
                date.setFullYear(date.getFullYear() + 1);
                setLocalVigencia(date.toISOString().split('T')[0]);
            }
        }, [localFechaEMO, requiereEMO, req.vigencia]);

        const timelineSteps = [
            { label: 'Borrador', status: 'completed' as const },
            { label: 'Aprob. Gerencial', status: 'completed' as const },
            { label: 'Inducción & Examen', status: req.estado === 'CAPACITACION' ? 'current' as const : 'pending' as const },
            { label: 'Verificación Documental', status: req.estado === 'VERIFICACION_DOCUMENTAL' ? 'current' as const : 'pending' as const },
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
                            <p className="text-sm text-slate-500 mt-1">{req.solicitanteNombre} | {req.empresa}</p>
                        </div>
                        <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-lg text-sm font-bold tracking-wider uppercase">
                            {req.estado.replace('_', ' ')}
                        </span>
                    </div>

                    <TimelineTracker steps={timelineSteps} />

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
                        <div className="space-y-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <h3 className="font-bold text-slate-800 mb-4"><i className="fas fa-hard-hat text-indigo-500 mr-2"></i>Roles Solicitados</h3>
                                <div className="flex flex-wrap gap-2">
                                    {req.tiposTrabajo.map(t => (
                                        <span key={t} className="bg-indigo-100 text-indigo-800 border border-indigo-200 px-3 py-1 rounded-lg text-sm font-bold flex items-center gap-2">
                                            <i className="fas fa-check-circle"></i> {t}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Approval Action */}
                            {(isSuperAdmin() || isSuperSuperAdmin()) && req.estado === 'CAPACITACION' && (
                                <ApprovalPanel
                                    title="Resultado de Capacitación"
                                    onApprove={async () => {
                                        const updated = { ...req, estado: 'VERIFICACION_DOCUMENTAL' as any };
                                        await supabase.from('auth_high_risk_works').update(mapUIToDB(updated)).eq('id', req.id);
                                        setVista('LISTA');
                                    }}
                                    onReject={async (comment) => {
                                        const updated = { ...req, estado: 'RECHAZADO' as any };
                                        updated.historial = [...updated.historial, { id: crypto.randomUUID(), actor: user?.name || 'Admin', rol: 'Evaluador', accion: 'Rechazo', fecha: new Date().toISOString(), comentario: comment }];
                                        await supabase.from('auth_high_risk_works').update(mapUIToDB(updated)).eq('id', req.id);
                                        setVista('LISTA');
                                    }}
                                />
                            )}

                            {/* Final EMO/Vigencia Approval Panel */}
                            {(isSuperAdmin() || isSuperSuperAdmin()) && req.estado === 'VERIFICACION_DOCUMENTAL' && (
                                <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 mt-4">
                                    <h3 className="font-bold text-indigo-900 mb-4"><i className="fas fa-calendar-check mr-2"></i>Gestión de Fechas y Vigencia Final</h3>

                                    <div className="space-y-4 mb-6">
                                        <div>
                                            <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Capacitación</label>
                                            <input type="date" value={localFechaCapacitacion} onChange={e => setLocalFechaCapacitacion(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                                        </div>

                                        {requiereEMO && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Fecha de Examen Médico (EMO)</label>
                                                    <input type="date" value={localFechaEMO} onChange={e => setLocalFechaEMO(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-indigo-200 outline-none focus:ring-2 focus:ring-indigo-500" />
                                                    <p className="text-xs text-slate-500 mt-1">Requerido por los tipos de trabajo solicitados.</p>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Vigencia Calculada (Editable)</label>
                                                    <input type="date" value={localVigencia} onChange={e => setLocalVigencia(e.target.value)} className="w-full px-4 py-2 rounded-lg border border-indigo-400 bg-white font-bold text-indigo-700 outline-none focus:ring-2 focus:ring-indigo-500" />
                                                    <p className="text-xs text-indigo-600 mt-1">Por defecto: Fecha EMO + 1 año exacto.</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    <button
                                        onClick={async () => {
                                            if (requiereEMO && (!localFechaEMO || !localVigencia)) {
                                                return alert("Debe especificar la Fecha de EMO y la Vigencia antes de emitir la autorización.");
                                            }

                                            try {
                                                const response = await apiClient.put(`/authorizations/high-risk/${req.id}/approve`, {
                                                    status: 'approved',
                                                    fechaCapacitacion: localFechaCapacitacion,
                                                    fechaEMO: requiereEMO ? localFechaEMO : undefined,
                                                    vigencia: requiereEMO ? localVigencia : undefined,
                                                    tiposTrabajo: req.tiposTrabajo
                                                }, {
                                                    responseType: 'blob'
                                                });

                                                const contentType = response.headers['content-type'];
                                                if (contentType && contentType.includes('application/pdf')) {
                                                    const blob = new Blob([response.data], { type: 'application/pdf' });
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement('a');
                                                    a.style.display = 'none';
                                                    a.href = url;
                                                    a.download = `Autorizacion_${req.id}.pdf`;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    window.URL.revokeObjectURL(url);
                                                    document.body.removeChild(a);
                                                    alert("Autorización de Trabajo Generada. Vigencia: " + (requiereEMO ? localVigencia : 'N/A: No requiere EMO'));
                                                } else {
                                                    alert("Autorización aprobada correctamente.");
                                                }

                                                setVista('LISTA');
                                            } catch (error: any) {
                                                alert("Error al aprobar: " + error.message);
                                            }
                                        }}
                                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-indigo-500/30"
                                    >
                                        <i className="fas fa-stamp mr-2"></i> Emitir Autorización Final
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Docs Column */}
                        <div>
                            <DocumentUploader
                                requiredDocs={['Récord de Conductor', 'Experiencia Mínima (3 años)', 'Aptitud Médica Ocupacional (Altura)']}
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
                        <h2 className="text-2xl font-bold text-slate-800">Trabajos de Alto Riesgo</h2>
                        <p className="text-slate-500 mt-1">Gestión de habilitaciones para trabajos de peligrosidad crítica.</p>
                    </div>
                    {isAdminContratista() && (
                        <button onClick={() => { setVista('NUEVA'); setSelectedTypes([]); }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-md shadow-indigo-500/20 transition-all flex items-center gap-2">
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

                    <h3 className="text-xl font-bold text-slate-800 mb-6">Solicitud Multi-Habilitación para Trabajos Críticos</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Conductor (DNI)</label>
                            <input type="text" placeholder="Ej. 74839210" className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Nombres Completos</label>
                            <input type="text" placeholder="Automático tras buscar DNI..." disabled className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-100 text-slate-500 outline-none" />
                        </div>
                    </div>

                    <div className="mb-8 p-6 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm text-slate-800 font-bold mb-4">
                            Selecciona las habilitaciones requeridas (El checklist mutará dinámicamente)
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {TIPOS_DISPONIBLES.map(tipo => (
                                <label key={tipo} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${selectedTypes.includes(tipo) ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 bg-white hover:border-indigo-200'}`}>
                                    <input
                                        type="checkbox"
                                        checked={selectedTypes.includes(tipo)}
                                        onChange={() => toggleType(tipo)}
                                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 border-slate-300 pointer-events-none"
                                    />
                                    <span className="text-sm font-semibold text-slate-700 pointer-events-none">{tipo}</span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <DocumentUploader
                        requiredDocs={getDynamicChecklist()}
                        documents={newDocuments}
                        onDocumentChange={setNewDocuments}
                    />

                    <div className="mt-8 flex justify-end">
                        <button onClick={async () => {
                            if (selectedTypes.length === 0) return alert('Seleccione al menos un tipo habilitado');

                            const newReq: AltoRiesgoRequest = {
                                id: crypto.randomUUID(),
                                solicitanteId: '00000000-0000-0000-0000-000000000000',
                                solicitanteNombre: 'Conductor ' + Date.now().toString().slice(-4),
                                empresa: user?.companyId ? 'Empresa ID: ' + user.companyId : 'Constructor Limitada',
                                fechaCreacion: new Date().toISOString(),
                                estado: 'CAPACITACION' as any,
                                tiposTrabajo: selectedTypes,
                                documentos: newDocuments,
                                historial: []
                            };
                            const dbPayload = mapUIToDB(newReq);
                            try {
                                await apiClient.post('/authorizations/high-risk', dbPayload);
                                alert('Solicitud Multi-Tipo Emitida exitosamente.');
                                setVista('LISTA');
                                setSelectedTypes([]);
                                setNewDocuments([]);
                            } catch (error: any) {
                                alert('Error al guardar: ' + (error.response?.data?.message || error.message));
                            }
                        }} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all">
                            Emitir Solicitud
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
