import React, { useState } from 'react';
import { useInduccion } from '../hooks/useInduccion';
import { validarDNI } from '../utils/validarDNI';

// Definimos un tipo para los errores del formulario
type FormErrors = {
    dni?: string;
    nombre?: string;
    apellido?: string;
    empresa?: string;
    email?: string;
    celular?: string;
    general?: string;
};

export const RegistroTrabajadorForm: React.FC = () => {
    const { registrarTrabajador, loading } = useInduccion();
    const [formData, setFormData] = useState({
        dni: '',
        nombre: '',
        apellido: '',
        empresa: '',
        email: '',
        celular: ''
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage(null);
        setErrors({});

        if (!validarDNI(formData.dni)) {
            alert('El DNI debe tener 8 dígitos numéricos.');
            return;
        }

        try {
            const result = await registrarTrabajador(formData);
            const campusUrl = import.meta.env.VITE_CAMPUS_URL || 'https://plataforma-catalina-campus-cath.c2awqr.easypanel.host';
            setSuccessMessage(`Trabajador registrado. Se notificó al trabajador que ingrese a Campus_CATH (${campusUrl}/login). Username: ${result.username}`);
            setFormData({ dni: '', nombre: '', apellido: '', empresa: '', email: '', celular: '' });
        } catch (err: any) {
            console.error('Error registering worker:', err);
            const errorData = err.response?.data;

            if (errorData?.field === 'email') {
                setErrors(prev => ({ ...prev, email: errorData.message }));
            } else if (errorData?.field === 'phone') {
                // El backend devuelve 'phone', lo mapeamos a nuestro campo 'celular'
                setErrors(prev => ({ ...prev, celular: errorData.message }));
            } else {
                setErrors(prev => ({ ...prev, general: errorData?.message || 'Error al registrar al trabajador.' }));
            }
        }
    };

    return (
        <div className="bg-white p-6 shadow-sm rounded-xl border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-6">Registro Individual de Trabajador Temporal</h2>

            {errors.general && <div className="mb-4 bg-red-50 text-red-600 p-3 rounded-md text-sm">{errors.general}</div>}
            {successMessage && <div className="mb-4 bg-green-50 text-green-700 p-3 rounded-md text-sm font-medium">{successMessage}</div>}

            <form onSubmit={handleSubmit} className="space-y-4 max-w-lg">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">DNI</label>
                    <input
                        type="text"
                        required
                        maxLength={8}
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.dni ? 'border-red-500' : 'border-slate-300'}`}
                        value={formData.dni}
                        onChange={(e) => setFormData({ ...formData, dni: e.target.value.replace(/[^0-9]/g, '') })}
                        placeholder="Ej: 12345678"
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Nombre</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.nombre}
                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Apellido</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.apellido}
                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Empresa Contratista</label>
                        <input
                            type="text"
                            required
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={formData.empresa}
                            onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Teléfono Ej:+51999888777 (Opcional)</label>
                        <input
                            type="text"
                            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.celular ? 'border-red-500' : 'border-slate-300'}`}
                            value={formData.celular}
                            onChange={(e) => setFormData({ ...formData, celular: e.target.value.replace(/[^0-9+]/g, '') })}
                            placeholder="+51999888777"
                        />
                        {errors.celular && <p className="text-red-500 text-xs mt-1">{errors.celular}</p>}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Correo Electrónico (Opcional)</label>
                    <input
                        type="email"
                        className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.email ? 'border-red-500' : 'border-slate-300'}`}
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="trabajador@gmai.com"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                </div>

                <div className="pt-2 flex justify-end">
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 font-medium transition-colors"
                    >
                        {loading ? 'Registrando...' : 'Registrar Trabajador'}
                    </button>
                </div>
            </form>
        </div>
    );
};
