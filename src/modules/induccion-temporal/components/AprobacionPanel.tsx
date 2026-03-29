import React, { useState, useEffect } from 'react';
import { useInduccion } from '../hooks/useInduccion';
import { SolicitudInduccion, EstadoSolicitud } from '../types/induccion.types';
import { EditParticipantModal } from './EditParticipantModal';
import { apiClient } from '../../../api/client';

export const AprobacionPanel: React.FC = () => {
    const { cambiarDecisionSolicitud, loading, error } = useInduccion();
    const [solicitudes, setSolicitudes] = useState<SolicitudInduccion[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filtroEstado, setFiltroEstado] = useState<EstadoSolicitud | 'todas'>('pendiente');
    const [editingParticipant, setEditingParticipant] = useState<SolicitudInduccion | null>(null);

    useEffect(() => {
        // En un caso real llamar al backend para obtener solicitudes
        // Simularemos algunas por ahora y añadimos los campos faltantes
        setSolicitudes([
            {
                id: 'sol-001',
                trabajadorId: 'wk-123',
                trabajador: { id: 'wk-123', dni: '12345678', nombre: 'Juan', apellido: 'Perez', email: 'juan.perez@example.com', celular: '987654321', username: 'temp_12345678', activo: true, creadoEn: new Date().toISOString() },
                empresaContratista: 'TechFlow S.A.',
                tipoTrabajo: 'Soporte de Redes',
                duracionDias: 15,
                motivoIngreso: 'Mantenimiento cuarto de servidores',
                estado: 'pendiente',
                creadoEn: new Date().toISOString()
            },
            {
                id: 'sol-002',
                trabajadorId: 'wk-124',
                trabajador: { id: 'wk-124', dni: '87654321', nombre: 'Ana', apellido: 'Gomez', email: 'ana.gomez@example.com', celular: '912345678', username: 'temp_87654321', activo: true, creadoEn: new Date().toISOString() },
                empresaContratista: 'Constructora XYZ',
                tipoTrabajo: 'Inspección de Obra',
                duracionDias: 5,
                motivoIngreso: 'Revisión estructural',
                estado: 'aprobado',
                creadoEn: new Date().toISOString()
            }
        ]);
    }, []);

    const handleDecision = async (id: string, decision: EstadoSolicitud) => {
        let obs = '';
        if (decision === 'rechazado') {
            obs = window.prompt('Motivo del rechazo:') || 'No cumple requisitos';
            if (!obs) return;
        }

        try {
            await cambiarDecisionSolicitud(id, decision, obs);
            setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: decision, observaciones: obs } : s));
        } catch (err) {
            console.error('Error al cambiar decisión', err);
            setSolicitudes(prev => prev.map(s => s.id === id ? { ...s, estado: decision, observaciones: obs } : s));
        }
    };

    const handleUpdateParticipant = async (id: string, data: any) => {
        // Esta función se pasa al modal, que se encargará de los errores
        await apiClient.patch(`/registrations/${id}`, data);
        
        // Actualizamos el estado local
        setSolicitudes(prev =>
            prev.map(p => {
                if (p.id === id) {
                    const [nombre, ...apellidoParts] = (data.name || p.trabajador.nombre + ' ' + p.trabajador.apellido).split(' ');
                    const apellido = apellidoParts.join(' ');
                    return {
                        ...p,
                        trabajador: {
                            ...p.trabajador,
                            nombre,
                            apellido,
                            dni: data.dni || p.trabajador.dni,
                            email: data.email || (p.trabajador as any).email,
                            celular: data.phone || (p.trabajador as any).celular,
                        }
                    };
                }
                return p;
            })
        );
        setEditingParticipant(null); // Cierra el modal en éxito
    };

    const filtradas = solicitudes.filter(s => {
        const trabajador = s.trabajador;
        const searchTermLower = searchTerm.toLowerCase();
        const matchesTerm = (
            trabajador?.nombre?.toLowerCase().includes(searchTermLower) ||
            trabajador?.apellido?.toLowerCase().includes(searchTermLower) ||
            trabajador?.dni?.toLowerCase().includes(searchTermLower)
        );
        const matchesEstado = filtroEstado === 'todas' || s.estado === filtroEstado;
        return matchesTerm && matchesEstado;
    });

    return (
        <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Aprobación de Accesos por Seguridad</h2>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <input
                    type="text"
                    placeholder="Buscar por nombre o DNI..."
                    className="px-4 py-2 border border-slate-300 rounded-lg flex-1 outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
                <select
                    className="px-4 py-2 border border-slate-300 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500"
                    value={filtroEstado}
                    onChange={(e) => setFiltroEstado(e.target.value as any)}
                >
                    <option value="todas">Todas</option>
                    <option value="pendiente">Pendientes</option>
                    <option value="aprobado">Aprobadas</option>
                    <option value="rechazado">Rechazadas</option>
                </select>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

            <div className="overflow-x-auto rounded-lg border border-slate-200">
                <table className="w-full text-left text-sm text-slate-600">
                    <thead className="bg-slate-50 text-slate-700 border-b">
                        <tr>
                            <th className="px-4 py-3">Trabajador</th>
                            <th className="px-4 py-3">Empresa</th>
                            <th className="px-4 py-3">Trabajo / Motivo</th>
                            <th className="px-4 py-3">Duración</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-center">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filtradas.length === 0 ? (
                            <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-500">No se encontraron solicitudes.</td></tr>
                        ) : (
                            filtradas.map(s => (
                                <tr key={s.id} className="hover:bg-slate-50">
                                    <td className="px-4 py-3">
                                        <div className="font-medium text-slate-800">{s.trabajador?.nombre} {s.trabajador?.apellido}</div>
                                        <div className="text-xs text-slate-500">DNI: {s.trabajador?.dni}</div>
                                    </td>
                                    <td className="px-4 py-3">{s.empresaContratista}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-medium">{s.tipoTrabajo}</div>
                                        <div className="text-xs text-slate-500 truncate max-w-[200px]" title={s.motivoIngreso}>{s.motivoIngreso}</div>
                                    </td>
                                    <td className="px-4 py-3">{s.duracionDias} días</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.estado === 'aprobado' ? 'bg-green-100 text-green-700' : s.estado === 'rechazado' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {s.estado.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex gap-2 justify-center">
                                            <button onClick={() => setEditingParticipant(s)} className="text-blue-500 hover:text-blue-700 p-1" title="Editar participante">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z"></path></svg>
                                            </button>
                                            {s.estado === 'pendiente' && (
                                                <>
                                                    <button onClick={() => handleDecision(s.id, 'aprobado')} disabled={loading} className="p-1.5 bg-green-100 hover:bg-green-200 text-green-700 rounded transition" title="Aprobar">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                                    </button>
                                                    <button onClick={() => handleDecision(s.id, 'rechazado')} disabled={loading} className="p-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded transition" title="Rechazar">
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
            
            {editingParticipant && (
                <EditParticipantModal 
                    participant={editingParticipant}
                    onClose={() => setEditingParticipant(null)}
                    onSave={handleUpdateParticipant}
                />
            )}
        </div>
    );
};
