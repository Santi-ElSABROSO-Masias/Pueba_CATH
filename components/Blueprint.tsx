
import React from 'react';
import { PROJECT_PHASES, DB_SCHEMA, N8N_WORKFLOW_DOCS } from '../constants';

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
              { icon: 'fa-lock', label: 'Cierre', sub: 'Sistema' },
              { icon: 'fa-file-signature', label: 'Consolidación', sub: 'ExcelJS' },
              { icon: 'fa-paper-plane', label: 'Envío Final', sub: 'n8n' }
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
            Workflow n8n (Core)
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

          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 mt-8">
            <i className="fas fa-bell text-amber-400"></i>
            Workflow Notificaciones (Auto)
          </h3>
          <div className="space-y-2 font-mono text-xs bg-black/30 p-4 rounded-xl">
              <p className="text-amber-400 font-bold">{N8N_WORKFLOW_DOCS.trigger}</p>
              <ul className="list-disc pl-4 space-y-1 text-slate-400">
                  {N8N_WORKFLOW_DOCS.nodes.map((node, i) => (
                      <li key={i}>{node.name} <span className="text-[10px] opacity-50">({node.action})</span></li>
                  ))}
              </ul>
          </div>

        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-database text-indigo-500"></i>
            Modelo de Datos (Supabase)
          </h3>
           <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4 font-mono text-xs text-slate-600 whitespace-pre-wrap">
                {DB_SCHEMA}
           </div>

          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2 mt-8">
            <i className="fas fa-table text-indigo-500"></i>
            Reporte de Consolidación
          </h3>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm p-4">
            <p className="text-sm text-slate-600 mb-2">Se genera usando <strong>ExcelJS</strong> para garantizar:</p>
            <ul className="list-disc pl-5 text-sm text-slate-500 space-y-1">
                <li>Preservación de fórmulas (PROMEDIO, ESTADO).</li>
                <li>Estilos corporativos (Bordes, Colores, Logos).</li>
                <li>Bloqueo de edición posterior.</li>
                <li>Trazabilidad de envío automático.</li>
            </ul>
          </div>
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
