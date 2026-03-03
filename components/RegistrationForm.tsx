
import React, { useState } from 'react';

interface RegistrationFormProps {
  onSubmit: (data: { name: string; email: string; organization: string }) => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', email: '', organization: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email) return;
    onSubmit(formData);
    setSubmitted(true);
    setFormData({ name: '', email: '', organization: '' });
  };

  if (submitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-2xl border border-slate-200 shadow-xl text-center animate-fadeIn">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-2xl"></i>
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">¡Registro Recibido!</h2>
        <p className="text-slate-600 mb-8">
          Tu solicitud está siendo procesada por nuestro equipo administrativo. Recibirás un correo una vez aprobada.
        </p>
        <button
          onClick={() => setSubmitted(false)}
          className="text-catalina-green font-bold hover:underline"
        >
          Registrar a otra persona
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
        <div className="bg-catalina-green p-8 text-white">
          <h2 className="text-3xl font-bold mb-2">Registro al Evento</h2>
          <p className="opacity-90">Completa el formulario para solicitar tu acceso al workshop exclusivo.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Nombre Completo</label>
            <input
              required
              type="text"
              placeholder="Juan Pérez"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-catalina-green focus:border-catalina-green outline-none transition-all"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Correo Electrónico</label>
            <input
              required
              type="email"
              placeholder="juan@empresa.com"
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-catalina-green focus:border-catalina-green outline-none transition-all"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Organización / Empresa</label>
            <input
              type="text"
              placeholder="Empresa Tech S.A."
              className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-catalina-green focus:border-catalina-green outline-none transition-all"
              value={formData.organization}
              onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            />
          </div>

          <button
            type="submit"
            className="w-full bg-catalina-green hover:bg-catalina-forest-green text-white font-bold py-4 rounded-xl transition-colors shadow-lg shadow-catalina-green/20 flex items-center justify-center gap-2"
          >
            Enviar Solicitud
            <i className="fas fa-paper-plane text-xs"></i>
          </button>

          <p className="text-xs text-slate-400 text-center">
            Al registrarte, aceptas que procesemos tus datos según la política del evento.
          </p>
        </form>
      </div>
    </div>
  );
};
