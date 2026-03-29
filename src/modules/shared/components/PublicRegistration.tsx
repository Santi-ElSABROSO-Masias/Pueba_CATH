
import React, { useState } from 'react';
import { Training } from '../../../../types';

interface PublicRegistrationProps {
  training: Training;
  onSubmit: (data: any) => void;
}

export const PublicRegistration: React.FC<PublicRegistrationProps> = ({ training, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '',
    organization: '',
    area: '',
    role: '',
    custom: {} as any
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, trainingId: training.id });
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-md mx-auto mt-20 p-10 bg-white rounded-3xl border border-slate-200 shadow-2xl text-center animate-fadeIn">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <i className="fas fa-check text-3xl"></i>
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-4">¡Inscripción Recibida!</h2>
        <p className="text-slate-600 mb-8 font-medium">
          Hemos procesado tu registro para <strong>{training.title}</strong>. El equipo de capacitación validará tus datos y te enviará el link de acceso a <strong>{formData.email}</strong>.
        </p>
        <div className="p-4 bg-slate-50 rounded-2xl text-xs text-slate-400 italic border border-slate-100">
          Este registro es personal e intransferible.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto my-10 animate-fadeIn p-4 md:p-0">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden">
        <div className="bg-catalina-green p-8 md:p-12 text-white relative">
          <div className="absolute top-0 right-0 p-6 opacity-20">
            <img src="/assets/logo ch.png" alt="Logo CH" className="w-32 h-32 object-contain filter grayscale" />
          </div>
          <div className="inline-block px-3 py-1 bg-white/20 rounded-lg text-[10px] font-black uppercase tracking-widest mb-4">Registro Oficial</div>
          <h2 className="text-3xl md:text-4xl font-black mb-4 leading-tight">{training.title}</h2>
          <p className="opacity-90 text-sm md:text-base mb-6 max-w-lg">{training.description}</p>
          <div className="flex flex-wrap gap-6 text-xs md:text-sm font-bold">
            <span className="flex items-center gap-2"><i className="far fa-calendar-alt opacity-60"></i> {training.date}</span>
            <span className="flex items-center gap-2"><i className="fas fa-laptop opacity-60"></i> Modalidad Virtual</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-12 space-y-8">
          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">1</span>
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombres y Apellidos Completos</label>
                <input
                  required
                  minLength={5}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-catalina-green/20 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Ej. Juan Manuel Pérez Soto"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">DNI / ID Identificación</label>
                <input
                  required
                  pattern="[0-9]*"
                  minLength={8}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-catalina-green/20 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Solo números"
                  value={formData.dni}
                  onChange={e => setFormData({ ...formData, dni: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correo Corporativo</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-catalina-green/20 outline-none transition-all placeholder:text-slate-300"
                  placeholder="juan.perez@empresa.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
              <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">2</span>
              Información Institucional
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Empresa</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-catalina-green/20 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Nombre de la empresa"
                  value={formData.organization}
                  onChange={e => setFormData({ ...formData, organization: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Área / Departamento</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-catalina-green/20 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Ej. Operaciones"
                  value={formData.area}
                  onChange={e => setFormData({ ...formData, area: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Cargo Actual</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-catalina-green/20 outline-none transition-all placeholder:text-slate-300"
                  placeholder="Ej. Supervisor de Planta"
                  value={formData.role}
                  onChange={e => setFormData({ ...formData, role: e.target.value })}
                />
              </div>
            </div>
          </div>

          {training.customQuestions.length > 0 && (
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6 flex items-center gap-2">
                <span className="w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center text-[10px]">3</span>
                Preguntas Adicionales
              </h3>
              <div className="space-y-6">
                {training.customQuestions.map((q, idx) => (
                  <div key={idx}>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{q}</label>
                    <input
                      required
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-catalina-green/20 outline-none transition-all placeholder:text-slate-300"
                      placeholder="Escribe aquí tu respuesta..."
                      onChange={e => setFormData({
                        ...formData,
                        custom: { ...formData.custom, [q]: e.target.value }
                      })}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-6">
            <button
              type="submit"
              className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl flex items-center justify-center gap-3 text-sm md:text-base uppercase tracking-widest"
            >
              Confirmar Inscripción
              <i className="fas fa-check-circle text-xs text-catalina-green/70"></i>
            </button>
            <p className="text-center text-[10px] text-slate-400 font-medium mt-6 leading-relaxed">
              La información proporcionada se utilizará exclusivamente para el control de asistencia y emisión de constancias de participación del evento.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};
