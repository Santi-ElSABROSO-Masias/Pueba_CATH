
import React from 'react';
import { PROJECT_PHASES, DB_SCHEMA } from '../constants';

export const Blueprint: React.FC = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-12 pb-20 animate-fadeIn">
      <header className="border-b border-slate-200 pb-8">
        <div className="flex items-center gap-3 mb-2">
          <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded">SENIOR ARCHITECT VIEW</span>
        </div>
        <h2 className="text-4xl font-black text-slate-900 tracking-tight">Estrategia MVP Ejecutable</h2>
        <p className="text-slate-600 text-lg mt-2">Diseño orientado a la automatización con n8n y persistencia en Supabase.</p>
      </header>

      {/* Flujo Operativo Real */}
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <i className="fas fa-stream text-indigo-500"></i>
          Flujo Operativo de Negocio
        </h3>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex flex-wrap md:flex-nowrap justify-between items-center gap-4">
            {[
              { icon: 'fa-user-plus', label: 'Registro', sub: 'Usuario' },
              { icon: 'fa-database', label: 'Guardado', sub: 'Supabase' },
              { icon: 'fa-user-check', label: 'Aprobación', sub: 'Admin' },
              { icon: 'fa-paper-plane', label: 'Envío Link', sub: 'n8n' },
              { icon: 'fa-check-circle', label: 'Asistencia', sub: 'Moderador' },
              { icon: 'fa-file-excel', label: 'Excel', sub: 'Sistema' }
            ].map((step, i) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center text-center flex-1">
                  <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 border border-indigo-100">
                    <i className={`fas ${step.icon}`}></i>
                  </div>
                  <span className="font-bold text-slate-800 text-sm">{step.label}</span>
                  <span className="text-xs text-slate-400">{step.sub}</span>
                </div>
                {i < 5 && <i className="fas fa-arrow-right text-slate-200 hidden md:block"></i>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* Lógica de Automatización n8n */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 text-slate-300 p-8 rounded-2xl shadow-xl">
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <i className="fas fa-robot text-indigo-400"></i>
            Workflow n8n (Logic)
          </h3>
          <div className="space-y-4 font-mono text-sm">
            <div className="p-3 bg-slate-800 rounded border-l-4 border-indigo-500">
              <p className="text-indigo-400 font-bold mb-1">1. TRIGGER (Webhook)</p>
              <p>Escucha cambios en el estado 'APROBADO' desde Supabase.</p>
            </div>
            <div className="p-3 bg-slate-800 rounded border-l-4 border-emerald-500">
              <p className="text-emerald-400 font-bold mb-1">2. CONDITIONAL</p>
              <p>Si link_reunion != null AND status == 'APROBADO'.</p>
            </div>
            <div className="p-3 bg-slate-800 rounded border-l-4 border-orange-500">
              <p className="text-orange-400 font-bold mb-1">3. ACTION (Email/WA)</p>
              <p>Envía plantilla con link dinámico y cambia estado a 'LINK ENVIADO'.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-table text-indigo-500"></i>
            Columnas Excel Final
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-4 py-2 text-left text-slate-500">Columna</th>
                  <th className="px-4 py-2 text-left text-slate-500">Fuente de Datos</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr><td className="px-4 py-2 font-bold">Nombre</td><td className="px-4 py-2 text-slate-500">full_name</td></tr>
                <tr><td className="px-4 py-2 font-bold">Correo</td><td className="px-4 py-2 text-slate-500">email</td></tr>
                <tr><td className="px-4 py-2 font-bold">Estado Aprobación</td><td className="px-4 py-2 text-slate-500">status</td></tr>
                <tr><td className="px-4 py-2 font-bold">Asistencia</td><td className="px-4 py-2 text-slate-500">attended (SÍ/NO)</td></tr>
              </tbody>
            </table>
          </div>
          <p className="text-xs text-slate-400 italic">
            * El sistema alimenta exactamente este formato para evitar limpieza manual de datos posterior.
          </p>
        </div>
      </section>

      {/* Roadmap Simplificado */}
      <section>
        <h3 className="text-xl font-bold text-slate-800 mb-6">Plan de Ejecución Rápida</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PROJECT_PHASES.map((phase, idx) => (
            <div key={idx} className="p-6 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 transition-colors">
              <h4 className="font-black text-slate-900 mb-2 uppercase text-sm tracking-widest">{phase.title}</h4>
              <p className="text-xs text-indigo-600 font-bold mb-4">{phase.objective}</p>
              <ul className="space-y-2">
                {phase.tasks.map((task, tidx) => (
                  <li key={tidx} className="text-sm text-slate-600 flex gap-2">
                    <span className="text-indigo-500">•</span> {task}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
