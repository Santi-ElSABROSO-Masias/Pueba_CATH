import React, { useState, useEffect } from 'react';
import { SolicitudInduccion } from '../types/induccion.types';

interface EditParticipantModalProps {
    participant: SolicitudInduccion | null;
    onClose: () => void;
    onSave: (id: string, data: any) => Promise<void>;
}

type FormErrors = {
    name?: string;
    dni?: string;
    email?: string;
    phone?: string;
    general?: string;
};

export const EditParticipantModal: React.FC<EditParticipantModalProps> = ({ participant, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        celular: '',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (participant?.trabajador) {
            setFormData({
                nombre: participant.trabajador.nombre,
                apellido: participant.trabajador.apellido,
                dni: participant.trabajador.dni,
                // Estos campos pueden no existir en el modelo, los añadimos por si acaso
                email: (participant.trabajador as any).email || '',
                celular: (participant.trabajador as any).celular || '',
            });
            setErrors({});
        }
    }, [participant]);

    if (!participant) return null;

    const handleSave = async () => {
        setLoading(true);
        setErrors({});
        try {
            // El endpoint de PATCH espera 'name', 'phone', etc.
            const dataToSave = {
                name: `${formData.nombre} ${formData.apellido}`,
                dni: formData.dni,
                email: formData.email,
                phone: formData.celular,
            };
            await onSave(participant.id, dataToSave);
        } catch (err: any) {
            const errorData = err.response?.data;
            if (errorData?.field) {
                // Mapeamos el campo de error del backend a nuestro formulario
                const formField = errorData.field === 'phone' ? 'celular' : errorData.field;
                setErrors(prev => ({ ...prev, [formField]: errorData.message }));
            } else {
                setErrors(prev => ({ ...prev, general: errorData?.message || 'Error al actualizar' }));
            }
        } finally {
            setLoading(false);
        }
    };


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold text-slate-800 mb-4">Editar Participante</h2>
                {errors.general && <p className="text-red-500 text-sm mb-4">{errors.general}</p>}
                
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                            <input
                                type="text"
                                value={formData.nombre}
                                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                            <input
                                type="text"
                                value={formData.apellido}
                                onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                        <input
                            type="text"
                            value={formData.dni}
                            onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.dni ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {errors.dni && <p className="text-red-500 text-xs mt-1">{errors.dni}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico</label>
                        <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono</label>
                        <input
                            type="text"
                            value={formData.celular}
                            onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
                            className={`w-full px-3 py-2 border rounded-lg ${errors.celular ? 'border-red-500' : 'border-slate-300'}`}
                        />
                        {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
                    </div>
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50">
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Cambios'}
                    </button>
                </div>
            </div>
        </div>
    );
};
