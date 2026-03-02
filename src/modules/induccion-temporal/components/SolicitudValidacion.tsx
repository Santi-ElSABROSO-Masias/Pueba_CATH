import React, { useState } from 'react';
import { useInduccion } from '../hooks/useInduccion';
import { TrabajadorTemporal } from '../types/induccion.types';

interface SolicitudValidacionProps {
    trabajador: TrabajadorTemporal;
    onSolicitudCreada: () => void;
}

export const SolicitudValidacion: React.FC<SolicitudValidacionProps> = ({ trabajador, onSolicitudCreada }) => {
    const { crearSolicitud, loading, error } = useInduccion();
    const [formData, setFormData] = useState({
        empresaContratista: trabajador.empresa || '',
        tipoTrabajo: '',
        duracionDias: 0,
        motivoIngreso: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.duracionDias > 30) {
            alert('Atención: Si la duración del contrato es mayor a 30 días, este no es el canal adecuado. Será redirigido al módulo de Capacitaciones Generales.');
            // Simulamos redirección o simplemente bloqueamos
            window.location.href = '/';
            return;
        }

        try {
            await crearSolicitud({
                trabajadorId: trabajador.id,
                estado: 'pendiente',
                ...formData
            });
            onSolicitudCreada();
        } catch (err) {
            console.error('Error al crear solicitud:', err);
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 shadow-sm rounded-xl border border-slate-200 mt-10">
            <div className="mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-slate-800">Formulario de Inducción</h2>
                <p className="text-slate-600 mt-2">Hola <strong>{trabajador.nombre}</strong>. Antes de acceder al contenido debes proporcionar detalles del trabajo a realizar.</p>
            </div>

            {error && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{error}</div>}

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Empresa Contratista</label>
                    <input
                        type="text"
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={formData.empresaContratista}
                        onChange={(e) => setFormData({ ...formData, empresaContratista: e.target.value })}
                        placeholder="Ingresa el nombre de tu empresa"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Trabajo</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.tipoTrabajo}
                            onChange={(e) => setFormData({ ...formData, tipoTrabajo: e.target.value })}
                            placeholder="Ej: Mantenimiento Eléctrico"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Duración (Días)</label>
                        <input
                            type="number"
                            required
                            min="1"
                            max="30"
                            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.duracionDias || ''}
                            onChange={(e) => setFormData({ ...formData, duracionDias: parseInt(e.target.value) || 0 })}
                        />
                        <p className="text-xs text-slate-500 mt-1">Máximo 30 días para Inducción Temporal.</p>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Motivo de Ingreso / Detalle Adicional</label>
                    <textarea
                        required
                        rows={4}
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none resize-none"
                        value={formData.motivoIngreso}
                        onChange={(e) => setFormData({ ...formData, motivoIngreso: e.target.value })}
                        placeholder="Describe brevemente el objetivo del trabajo..."
                    ></textarea>
                </div>

                <div className="pt-4 border-t">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 disabled:opacity-50 font-semibold shadow-md transition-all text-lg"
                    >
                        {loading ? 'Enviando solicitud...' : 'Enviar Solicitud e Iniciar Inducción'}
                    </button>
                    <p className="text-center text-sm text-slate-500 mt-4">Al enviar, tu solicitud pasará por revisión de Seguridad Ocupacional.</p>
                </div>
            </form>
        </div>
    );
};
