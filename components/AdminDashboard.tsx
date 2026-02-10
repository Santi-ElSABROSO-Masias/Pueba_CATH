
import React, { useState } from 'react';
import { EventUser, UserStatus, Training } from '../types';

interface AdminDashboardProps {
  users: EventUser[];
  trainings: Training[];
  selectedTrainingId: string;
  onUpdateStatus: (userId: string, status: UserStatus, meetingLink?: string) => void;
  onToggleAttendance: (userId: string) => void;
  onExport: (trainingId: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ users, trainings, selectedTrainingId, onUpdateStatus, onToggleAttendance, onExport }) => {
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [currentTrainingId, setCurrentTrainingId] = useState(selectedTrainingId || (trainings[0]?.id || ''));
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});

  const activeTraining = trainings.find(t => t.id === currentTrainingId);
  const filteredUsers = users.filter(u => 
    u.trainingId === currentTrainingId && 
    (filterStatus === 'ALL' || u.status === filterStatus)
  );

  const stats = {
    total: users.filter(u => u.trainingId === currentTrainingId).length,
    approved: users.filter(u => u.trainingId === currentTrainingId && (u.status === UserStatus.APPROVED || u.status === UserStatus.LINK_SENT)).length,
    attended: users.filter(u => u.trainingId === currentTrainingId && u.attended).length
  };

  const handleLinkChange = (id: string, val: string) => {
    setMeetingLinks(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Selector de Capacitación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filtrar por Capacitación</label>
          <select 
            className="w-full md:w-80 px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500/20"
            value={currentTrainingId}
            onChange={(e) => setCurrentTrainingId(e.target.value)}
          >
            {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
        </div>
        <button
          onClick={() => onExport(currentTrainingId)}
          className="w-full md:w-auto bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 font-bold"
        >
          <i className="fas fa-file-excel"></i>
          Exportar Lista Oficial
        </button>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Inscritos Hoy', val: stats.total, color: 'border-blue-500', icon: 'fa-user-plus' },
          { label: 'Candidatos Aptos', val: stats.approved, color: 'border-emerald-500', icon: 'fa-id-card' },
          { label: 'Asistencia Confirmada', val: stats.attended, color: 'border-indigo-500', icon: 'fa-clipboard-list' }
        ].map((stat, i) => (
          <div key={i} className={`bg-white p-6 rounded-2xl border-l-4 ${stat.color} shadow-sm flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900">{stat.val}</p>
            </div>
            <i className={`fas ${stat.icon} text-slate-100 text-2xl`}></i>
          </div>
        ))}
      </div>

      {/* Tabla Operativa */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
          <h3 className="font-bold text-slate-800 text-sm">Registro de Asistencia: <span className="text-indigo-600">{activeTraining?.title}</span></h3>
          <div className="flex gap-2">
            {['ALL', UserStatus.REGISTERED, UserStatus.APPROVED, UserStatus.LINK_SENT].map((f) => (
              <button
                key={f}
                onClick={() => setFilterStatus(f as any)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all ${filterStatus === f ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}
              >
                {f === 'ALL' ? 'Todos' : f}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                <th className="px-6 py-4">Identidad</th>
                <th className="px-6 py-4">Organización / Área</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Link Invitación</th>
                <th className="px-6 py-4 text-center">Asistió</th>
                <th className="px-6 py-4 text-right">Gestión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic text-sm">No hay registros bajo este filtro.</td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id} className="hover:bg-slate-50/30 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900 text-sm uppercase">{user.name}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="font-mono bg-slate-100 px-1 rounded">DNI: {user.dni}</span>
                        <span className="truncate max-w-[120px]">{user.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-bold text-slate-700">{user.organization}</div>
                      <div className="text-[10px] text-slate-400 uppercase">{user.area} • {user.role}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-md border ${
                        user.status === UserStatus.REGISTERED ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        user.status === UserStatus.APPROVED ? 'bg-blue-50 text-blue-600 border-blue-100' :
                        'bg-emerald-50 text-emerald-600 border-emerald-100'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.status === UserStatus.REGISTERED ? (
                        <div className="relative">
                          <input
                            type="text"
                            className="text-[10px] border border-slate-200 rounded-lg px-3 py-2 w-full outline-none focus:ring-1 focus:ring-indigo-500 bg-slate-50"
                            placeholder="Link Teams/Zoom..."
                            value={meetingLinks[user.id] || ''}
                            onChange={(e) => handleLinkChange(user.id, e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[10px] text-indigo-500 font-mono italic">
                          <i className="fas fa-link text-[8px]"></i>
                          <span className="truncate max-w-[100px]">{user.meetingLink}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => onToggleAttendance(user.id)}
                        disabled={user.status !== UserStatus.LINK_SENT}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all mx-auto ${
                          user.attended ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 text-slate-300'
                        } ${user.status !== UserStatus.LINK_SENT && 'opacity-20 cursor-not-allowed'}`}
                      >
                        <i className="fas fa-check text-[10px]"></i>
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        {user.status === UserStatus.REGISTERED && (
                          <button
                            onClick={() => onUpdateStatus(user.id, UserStatus.APPROVED, meetingLinks[user.id])}
                            disabled={!meetingLinks[user.id]}
                            className="bg-slate-900 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-slate-800 disabled:opacity-20 shadow-sm transition-all"
                          >
                            Aprobar
                          </button>
                        )}
                        {user.status === UserStatus.APPROVED && (
                          <button
                            onClick={() => onUpdateStatus(user.id, UserStatus.LINK_SENT)}
                            className="bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-indigo-700 shadow-sm transition-all"
                          >
                            Enviar Link
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
