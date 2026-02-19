
import React, { useState } from 'react';
import { Notification, NotificationType, NotificationStatus } from '../types';
import { getEmailTemplate } from '../utils/notificationLogic';

interface NotificationCenterProps {
  notifications: Notification[];
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ notifications }) => {
  const [filter, setFilter] = useState<NotificationStatus | 'ALL'>('ALL');
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);

  const filtered = notifications.filter(n => filter === 'ALL' || n.status === filter);

  // Ordenar por fecha programada
  const sorted = [...filtered].sort((a, b) => 
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const getStatusBadge = (status: NotificationStatus) => {
    switch (status) {
      case 'pending': return <span className="px-2 py-1 rounded bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-wider border border-slate-200">Pendiente</span>;
      case 'sent': return <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-wider border border-emerald-100">Enviado</span>;
      case 'failed': return <span className="px-2 py-1 rounded bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-wider border border-red-100">Falló</span>;
    }
  };

  const getTypeLabel = (type: NotificationType) => {
    switch (type) {
      case 'reminder_7d': return { label: 'Recordatorio 7 Días', icon: 'fa-calendar-week', color: 'text-blue-500' };
      case 'deadline_warning': return { label: 'Alerta Deadline', icon: 'fa-exclamation-triangle', color: 'text-amber-500' };
      case 'registration_closed': return { label: 'Cierre Registro', icon: 'fa-lock', color: 'text-slate-500' };
      case 'consolidation_ready': return { label: 'Consolidado Final', icon: 'fa-file-excel', color: 'text-emerald-500' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <i className="fas fa-bell text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900">Centro de Notificaciones</h2>
            <p className="text-sm text-slate-500 font-medium">Monitoreo de alertas automáticas (n8n)</p>
          </div>
        </div>
        
        <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
          {['ALL', 'pending', 'sent', 'failed'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${filter === f ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {f === 'ALL' ? 'Todas' : f === 'pending' ? 'Programadas' : f === 'sent' ? 'Enviadas' : 'Fallidas'}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Notificaciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Lista */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                <th className="px-6 py-4">Evento / Tipo</th>
                <th className="px-6 py-4">Destinatario</th>
                <th className="px-6 py-4">Programación</th>
                <th className="px-6 py-4 text-right">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sorted.length === 0 ? (
                <tr><td colSpan={4} className="p-8 text-center text-slate-400 italic">No hay notificaciones en esta vista.</td></tr>
              ) : (
                sorted.map(n => {
                  const typeInfo = getTypeLabel(n.type);
                  return (
                    <tr 
                      key={n.id} 
                      onClick={() => setSelectedNotif(n)}
                      className={`hover:bg-indigo-50/30 cursor-pointer transition-colors ${selectedNotif?.id === n.id ? 'bg-indigo-50/50' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800 text-sm">{n.trainingTitle}</div>
                        <div className={`text-xs flex items-center gap-1.5 mt-1 font-medium ${typeInfo.color}`}>
                          <i className={`fas ${typeInfo.icon}`}></i> {typeInfo.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-mono text-slate-500 bg-slate-50 px-2 py-1 rounded border border-slate-100 inline-block">
                          {n.recipientEmail}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                         <div className="text-xs text-slate-700 font-bold">
                            {new Date(n.scheduledAt).toLocaleDateString()}
                         </div>
                         <div className="text-[10px] text-slate-400">
                            {new Date(n.scheduledAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                         </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {getStatusBadge(n.status)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Vista Previa */}
        <div className="bg-slate-50 rounded-3xl border border-slate-200 p-6 h-fit sticky top-6">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <i className="fas fa-eye text-indigo-500"></i> Vista Previa de Email
          </h3>
          
          {selectedNotif ? (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                <div className="flex justify-between items-start mb-3 border-b border-slate-100 pb-2">
                    <div>
                        <p className="text-[10px] uppercase font-bold text-slate-400">Tipo</p>
                        <p className="text-xs font-bold text-slate-700">{getTypeLabel(selectedNotif.type).label}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] uppercase font-bold text-slate-400">Estado</p>
                        {getStatusBadge(selectedNotif.status)}
                    </div>
                </div>
                
                <div className="space-y-2 mb-4">
                    <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Para:</span>
                        <span className="text-xs font-mono text-slate-600">{selectedNotif.recipientEmail}</span>
                    </div>
                     <div>
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">Programado:</span>
                        <span className="text-xs text-slate-600">{new Date(selectedNotif.scheduledAt).toLocaleString()}</span>
                    </div>
                </div>

                {/* Renderizado simulado del HTML */}
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Contenido HTML Generado:</p>
                  <div 
                    className="bg-slate-50 p-3 rounded border border-slate-100 text-xs text-slate-600"
                    dangerouslySetInnerHTML={{ 
                        __html: getEmailTemplate(selectedNotif.type, {
                            title: selectedNotif.trainingTitle,
                            date: '2025-10-15',
                            maxCapacity: 30
                        } as any) 
                    }} 
                  />
                </div>
              </div>
              
              {selectedNotif.status === 'failed' && (
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                      <i className="fas fa-redo-alt mr-2"></i> Reintentar Envío
                  </button>
              )}
            </div>
          ) : (
            <div className="text-center py-10 text-slate-400">
              <i className="far fa-envelope-open text-4xl mb-2 opacity-50"></i>
              <p className="text-sm">Selecciona una notificación para ver los detalles del envío.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
