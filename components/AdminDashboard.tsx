
import React, { useState } from 'react';
import { EventUser, UserStatus, Training, Company, Exam, ExamResult } from '../types';
import { ExcelUploader } from './ExcelUploader';
import { IndividualWorkerForm } from './IndividualWorkerForm';
import { generateOfficialDocument } from '../utils/consolidationService';
import { useAuth } from '../AuthContext';
import { getStatusDisplayForRole } from '../utils/statusDisplay';
import { DeadlineCountdown } from './DeadlineCountdown';
import { ExtendDeadlineModal } from './ExtendDeadlineModal';
import { isRegistrationOpen } from '../utils/deadlineService';
import { useAutoCloseOnNavigate } from '../hooks/useAutoCloseOnNavigate';

interface AdminDashboardProps {
  users: EventUser[];
  trainings: Training[];
  selectedTrainingId: string;
  onUpdateStatus: (userId: string, status: UserStatus, meetingLink?: string) => void;
  onToggleAttendance: (userId: string) => void;
  onExport: (trainingId: string) => void;
  onBulkRegister?: (users: Partial<EventUser>[], trainingId: string) => void;
  onManualRegister?: (user: Partial<EventUser>, trainingId: string, newCompany?: string) => void;
  onConsolidate?: (trainingId: string) => void; // Nuevo prop
  companyName?: string;
  companies?: Company[];
  currentUserCompanyId?: string | null;
  exams: Exam[];
  examResults: ExamResult[];
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  users, trainings, selectedTrainingId, onUpdateStatus, onToggleAttendance, onExport, onBulkRegister, onManualRegister, onConsolidate, companyName, companies = [], currentUserCompanyId = null, exams, examResults
}) => {
  const { can, user } = useAuth();
  const [filterStatus, setFilterStatus] = useState<UserStatus | 'ALL'>('ALL');
  const [searchDni, setSearchDni] = useState('');
  const [currentTrainingId, setCurrentTrainingId] = useState(selectedTrainingId || (trainings[0]?.id || ''));
  const [meetingLinks, setMeetingLinks] = useState<Record<string, string>>({});
  const [showUploader, setShowUploader] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [showExtendModal, setShowExtendModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'assistance' | 'results'>('assistance');

  useAutoCloseOnNavigate('admin-uploader', showUploader, () => setShowUploader(false));
  useAutoCloseOnNavigate('admin-manual-form', showManualForm, () => setShowManualForm(false));
  useAutoCloseOnNavigate('admin-extend-modal', showExtendModal, () => setShowExtendModal(false));

  const activeTraining = trainings.find(t => t.id === currentTrainingId);
  const filteredUsers = users.filter(u =>
    u.trainingId === currentTrainingId &&
    (filterStatus === 'ALL' || u.status === filterStatus) &&
    (searchDni === '' || u.dni.includes(searchDni))
  );

  const trainingUsers = users.filter(u => u.trainingId === currentTrainingId);

  const pendingLinkUsers = trainingUsers.filter(u => u.status === UserStatus.PENDING_LINK);

  const isSuperAdmin = user?.role === 'super_admin';
  const isSuperSuperAdmin = user?.role === 'super_super_admin';
  const isAdminContratista = user?.role === 'admin_contratista';

  // Filtros disponibles según rol
  const availableFilters = ['ALL', UserStatus.REGISTERED, UserStatus.APPROVED, UserStatus.REJECTED];
  if (isSuperSuperAdmin) {
    availableFilters.push(UserStatus.LINK_SENT);
  }

  // Lógica de Selección Masiva (Solo Super Admin y Super Super Admin)
  const handleSelectAll = () => {
    if (!isSuperAdmin && !isSuperSuperAdmin) return;

    // Determinar si todos los visibles están aprobados
    const allVisibleApproved = filteredUsers.every(u => u.status === UserStatus.APPROVED || u.status === UserStatus.LINK_SENT);

    // Acción: Si todos aprobados -> Revertir a Registrado. Si no -> Aprobar todos.
    const newStatus = allVisibleApproved ? UserStatus.REGISTERED : UserStatus.APPROVED;

    if (confirm(`¿Estás seguro de ${newStatus === UserStatus.APPROVED ? 'APROBAR' : 'REVERTIR aprobación de'} ${filteredUsers.length} usuarios visibles?`)) {
      filteredUsers.forEach(u => {
        // Evitar cambiar estados finales si no es deseado, pero el requerimiento dice "Revertir la aprobación"
        // Para Super Admin, solo operamos sobre lo visible.
        if (u.status !== UserStatus.REJECTED) { // No tocamos rechazados con el checkbox masivo de aprobación
          onUpdateStatus(u.id, newStatus);
        }
      });
    }
  };

  // Lógica de Checkbox Individual (Aprobar/Revertir)
  const handleStatusCheckbox = (userId: string, currentStatus: UserStatus) => {
    if (!isSuperAdmin && !isSuperSuperAdmin) return;

    // Toggle: Si está Aprobado/Link -> Registrado. Si no -> Aprobado.
    const isApproved = currentStatus === UserStatus.APPROVED || currentStatus === UserStatus.LINK_SENT;
    const newStatus = isApproved ? UserStatus.REGISTERED : UserStatus.APPROVED;

    onUpdateStatus(userId, newStatus);
  };

  // Lógica de Rechazo (Botón independiente)
  const handleReject = (userId: string) => {
    if (!isSuperAdmin && !isSuperSuperAdmin) return;
    if (confirm("¿Marcar este usuario como RECHAZADO?")) {
      onUpdateStatus(userId, UserStatus.REJECTED);
    }
  };

  const stats = {
    total: trainingUsers.length,
    approved: trainingUsers.filter(u => (u.status === UserStatus.APPROVED || u.status === UserStatus.LINK_SENT)).length,
    attended: trainingUsers.filter(u => u.attended).length
  };

  const handleLinkChange = (id: string, val: string) => {
    setMeetingLinks(prev => ({ ...prev, [id]: val }));
  };

  const handleBulkImport = (newUsers: Partial<EventUser>[]) => {
    if (onBulkRegister && activeTraining) {
      onBulkRegister(newUsers, activeTraining.id);
      setShowUploader(false);
    }
  };

  const handleExportExcel = async () => {
    if (!activeTraining || !user) return;
    try {
      await generateOfficialDocument(activeTraining, trainingUsers, user.role);
    } catch (error) {
      console.error(error);
      alert("Error al generar el Excel.");
    }
    setShowExportMenu(false);
  };

  const sendPendingLinks = () => {
    if (!activeTraining?.meetingLink) {
      alert("Primero debe guardar el link de Teams en la configuración de la capacitación.");
      return;
    }

    if (confirm(`¿Enviar el link de Teams a ${pendingLinkUsers.length} usuarios pendientes?`)) {
      pendingLinkUsers.forEach(user => {
        // En un caso real, aquí llamaríamos a la función que envía el correo/whatsapp
        // sendTeamsLinkToUser(user, activeTraining.meetingLink, activeTraining);

        // Y luego actualizamos el estado del usuario
        onUpdateStatus(user.id, UserStatus.LINK_SENT, activeTraining.meetingLink);
      });
      alert("Links enviados exitosamente.");
    }
  };

  const handleConsolidation = async () => {
    if (!activeTraining || !onConsolidate || !user) return;
    setIsGenerating(true);
    try {
      await generateOfficialDocument(activeTraining, trainingUsers, user.role);
      onConsolidate(activeTraining.id);
      alert("Documento oficial generado y capacitación consolidada exitosamente.");
    } catch (error) {
      console.error(error);
      alert("Error al generar el documento.");
    } finally {
      setIsGenerating(false);
    }
  };

  const isDeadlinePassed = activeTraining ? new Date(activeTraining.date) < new Date() : false;

  const handleExtendDeadline = (newDeadline: string, reason: string) => {
    // En un caso real, esto actualizaría el backend.
    // Aquí simulamos la actualización localmente (esto requeriría que onUpdateTraining se pase a AdminDashboard, 
    // pero por ahora solo mostraremos un alert y cerraremos el modal para cumplir con el MVP visual).
    // Idealmente: onUpdateTraining({ ...activeTraining, registration_deadline: newDeadline, ... });
    alert(`Deadline extendido hasta: ${newDeadline}\nMotivo: ${reason}`);
    setShowExtendModal(false);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modal de Carga Masiva */}
      {showUploader && activeTraining && (
        <ExcelUploader
          training={activeTraining}
          existingUsers={trainingUsers}
          onImport={handleBulkImport}
          onClose={() => setShowUploader(false)}
        />
      )}

      {/* Modal de Registro Individual */}
      {showManualForm && activeTraining && (
        <IndividualWorkerForm
          training={activeTraining}
          companies={companies}
          currentUserCompanyId={currentUserCompanyId}
          existingUsers={trainingUsers}
          onRegister={(user, newCompany) => {
            if (onManualRegister) {
              onManualRegister(user, activeTraining.id, newCompany);
              setShowManualForm(false);
            }
          }}
          onClose={() => setShowManualForm(false)}
        />
      )}

      {/* Modal de Extensión de Deadline */}
      {showExtendModal && activeTraining && (
        <ExtendDeadlineModal
          training={activeTraining}
          onClose={() => setShowExtendModal(false)}
          onExtend={handleExtendDeadline}
        />
      )}

      {/* Alerta de Links Pendientes */}
      {pendingLinkUsers.length > 0 && activeTraining?.meetingLink && (
        <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg flex justify-between items-center shadow-sm">
          <div className="flex items-center">
            <div className="p-2">
              <i className="fas fa-exclamation-triangle text-amber-500"></i>
            </div>
            <div className="ms-3">
              <p className="text-sm text-amber-700">
                Hay <span className="font-bold">{pendingLinkUsers.length} usuarios validados</span> esperando el link de Teams para esta capacitación.
              </p>
            </div>
          </div>
          <button
            onClick={sendPendingLinks}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-amber-600 transition-all"
          >
            Enviar Links Ahora
          </button>
        </div>
      )}

      {/* Selector de Capacitación */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto">
          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Filtrar por Capacitación</label>
          <div className="flex flex-col gap-2">
            <select
              className="w-full md:w-80 px-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm font-bold text-slate-800 outline-none focus:ring-2 focus:ring-catalina-green/20"
              value={currentTrainingId}
              onChange={(e) => setCurrentTrainingId(e.target.value)}
            >
              {trainings.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
            </select>

            {activeTraining && activeTraining.registration_deadline && (
              <div className="flex items-center gap-2">
                <DeadlineCountdown deadline={activeTraining.registration_deadline} />
                {isSuperSuperAdmin && (
                  <button
                    onClick={() => setShowExtendModal(true)}
                    className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded hover:bg-amber-200 transition-colors font-bold"
                    title="Extender Deadline"
                  >
                    <i className="fas fa-history mr-1"></i> Extender
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex w-full md:w-auto gap-2">
          {can('canRegisterWorkers') && (
            <>
              <button
                onClick={() => {
                  if (activeTraining && !isRegistrationOpen(activeTraining)) {
                    alert("La inscripción para esta capacitación ya cerró.");
                    return;
                  }
                  setShowManualForm(true);
                }}
                disabled={activeTraining?.isConsolidated || (activeTraining && !isRegistrationOpen(activeTraining))}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${activeTraining?.isConsolidated || (activeTraining && !isRegistrationOpen(activeTraining)) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-catalina-green text-white hover:bg-catalina-forest-green shadow-catalina-green/10'}`}
              >
                <i className="fas fa-user-plus"></i>
                Agregar Trabajador
              </button>
              <button
                onClick={() => {
                  if (activeTraining && !isRegistrationOpen(activeTraining)) {
                    alert("La inscripción para esta capacitación ya cerró.");
                    return;
                  }
                  setShowUploader(true);
                }}
                disabled={activeTraining?.isConsolidated || (activeTraining && !isRegistrationOpen(activeTraining))}
                className={`flex-1 md:flex-none px-6 py-3 rounded-xl flex items-center justify-center gap-2 font-bold transition-all shadow-lg ${activeTraining?.isConsolidated || (activeTraining && !isRegistrationOpen(activeTraining)) ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'}`}
                title={activeTraining?.isConsolidated ? "Capacitación consolidada" : !isRegistrationOpen(activeTraining!) ? "Inscripción cerrada" : "Importar Excel"}
              >
                <i className="fas fa-file-upload"></i>
                Importar
              </button>
            </>
          )}
          <div className="relative flex-1 md:flex-none">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 font-bold"
            >
              <i className="fas fa-download"></i>
              Exportar
              <i className={`fas fa-chevron-down text-xs transition-transform ${showExportMenu ? 'rotate-180' : ''}`}></i>
            </button>

            {showExportMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowExportMenu(false)}></div>
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-20 animate-fadeIn">
                  <button
                    onClick={() => { onExport(currentTrainingId); setShowExportMenu(false); }}
                    className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors"
                  >
                    <i className="fas fa-file-csv text-emerald-600"></i>
                    Exportar CSV
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="w-full text-left px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 flex items-center gap-3 transition-colors border-t border-slate-50"
                  >
                    <i className="fas fa-file-excel text-emerald-600"></i>
                    Exportar Excel
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Métricas (Dashboard Visual) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Inscritos Hoy', val: stats.total, color: 'border-blue-500', icon: 'fa-user-plus' },
          { label: 'Candidatos Aptos', val: stats.approved, color: 'border-emerald-500', icon: 'fa-id-card' },
          { label: 'Asistencia Confirmada', val: stats.attended, color: 'border-catalina-green', icon: 'fa-clipboard-list' }
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
          <div className="flex gap-4">
            <button onClick={() => setActiveSubTab('assistance')} className={`font-bold text-sm ${activeSubTab === 'assistance' ? 'text-catalina-green' : 'text-slate-800'}`}>Registro de Asistencia</button>
            <button onClick={() => setActiveSubTab('results')} className={`font-bold text-sm ${activeSubTab === 'results' ? 'text-catalina-green' : 'text-slate-800'}`}>Resultados de Evaluación</button>
          </div>

          {activeSubTab === 'assistance' && (
            <div className="flex flex-col sm:flex-row gap-4 items-center">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <i className="fas fa-search text-slate-400 text-xs"></i>
                </div>
                <input
                  type="text"
                  placeholder="Buscar por DNI..."
                  value={searchDni}
                  onChange={(e) => setSearchDni(e.target.value)}
                  className="pl-8 pr-4 py-1.5 w-full sm:w-48 text-[11px] rounded-lg border border-slate-200 outline-none focus:border-catalina-green focus:ring-1 focus:ring-catalina-green bg-white shadow-sm"
                />
              </div>
              <div className="flex gap-2">
                {availableFilters.map((f) => (
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
          )}
        </div>

        {activeSubTab === 'assistance' ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Identidad</th>
                  <th className="px-6 py-4">Organización / Área</th>
                  <th className="px-6 py-4">
                    {(isSuperAdmin || isSuperSuperAdmin) ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-slate-300 text-catalina-green focus:ring-catalina-green cursor-pointer"
                          checked={filteredUsers.length > 0 && filteredUsers.every(u => u.status === UserStatus.APPROVED || u.status === UserStatus.LINK_SENT)}
                          onChange={handleSelectAll}
                          title="Aprobar/Revertir todos los visibles"
                        />
                        <span>Estado (Aprobar)</span>
                      </div>
                    ) : 'Estado'}
                  </th>
                  {isSuperSuperAdmin && <th className="px-6 py-4">Link Invitación</th>}
                  <th className="px-6 py-4 text-center">Asistió</th>
                  {isSuperSuperAdmin && <th className="px-6 py-4 text-right">Gestión</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr><td colSpan={6} className="px-6 py-10 text-center text-slate-400 italic text-sm">No hay registros bajo este filtro.</td></tr>
                ) : (
                  filteredUsers.map(user => (
                    <tr key={user.id} className={`hover:bg-slate-50/30 transition-colors group ${user.status === UserStatus.REJECTED ? 'bg-red-50/30' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-900 text-sm uppercase">{user.name}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span className="font-mono bg-slate-100 px-1 rounded">DNI: {user.dni}</span>
                          {user.brevete && <span className="font-mono bg-amber-50 text-amber-700 px-1 rounded border border-amber-100" title="Brevete"><i className="fas fa-car text-[9px]"></i> {user.brevete}</span>}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">{user.email}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-bold text-slate-700">{user.organization}</div>
                        <div className="text-[10px] text-slate-400 uppercase">{user.area} • {user.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        {(() => {
                          // Nota: La función getStatusDisplayForRole toma el rol del USUARIO ACTUAL (el que ve la tabla)
                          const currentUserRole = isSuperSuperAdmin ? 'super_super_admin' : isSuperAdmin ? 'super_admin' : 'admin_contratista';
                          const display = getStatusDisplayForRole(user.status, currentUserRole);

                          return (isSuperAdmin || isSuperSuperAdmin) ? (
                            <div className="flex items-center gap-3">
                              {/* Checkbox de Aprobación */}
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-slate-300 text-catalina-green focus:ring-catalina-green cursor-pointer"
                                checked={user.status === UserStatus.APPROVED || user.status === UserStatus.LINK_SENT}
                                onChange={() => handleStatusCheckbox(user.id, user.status)}
                                disabled={user.status === UserStatus.REJECTED}
                              />

                              {/* Badge de Estado Contextual */}
                              <span
                                className={`text-[9px] font-black px-2 py-1 rounded-md border cursor-help ${display.colorClass}`}
                                title={display.description}
                              >
                                {display.label}
                              </span>

                              {/* Botón de Rechazo (Independiente) */}
                              {user.status !== UserStatus.REJECTED && (
                                <button
                                  onClick={() => handleReject(user.id)}
                                  className="w-6 h-6 rounded-full bg-red-50 text-red-500 hover:bg-red-100 flex items-center justify-center transition-colors"
                                  title="Rechazar Trabajador"
                                >
                                  <i className="fas fa-times text-xs"></i>
                                </button>
                              )}
                            </div>
                          ) : (
                            // Vista Solo Lectura (Admin Contratista)
                            <span
                              className={`text-[9px] font-black px-2 py-1 rounded-md border cursor-help ${display.colorClass}`}
                              title={display.description}
                            >
                              {display.label}
                            </span>
                          );
                        })()}
                      </td>
                      {isSuperSuperAdmin && (
                        <td className="px-6 py-4">
                          {user.status === UserStatus.REGISTERED || user.status === UserStatus.REJECTED ? (
                            <div className="relative">
                              <input
                                type="text"
                                disabled={activeTraining?.isConsolidated}
                                className="text-[10px] border border-slate-200 rounded-lg px-3 py-2 w-full outline-none focus:ring-1 focus:ring-catalina-green bg-slate-50 disabled:opacity-50"
                                placeholder="Link Teams/Zoom..."
                                value={meetingLinks[user.id] || ''}
                                onChange={(e) => handleLinkChange(user.id, e.target.value)}
                              />
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-[10px] text-catalina-green font-mono italic">
                              <i className="fas fa-link text-[8px]"></i>
                              <span className="truncate max-w-[100px]">{user.meetingLink}</span>
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-6 py-4 text-center">
                        {/* Asistencia Solo Lectura para TODOS */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center mx-auto ${user.attended ? 'bg-catalina-green text-white shadow-md' : 'bg-slate-100 text-slate-300'
                          }`}>
                          <i className="fas fa-check text-[10px]"></i>
                        </div>
                      </td>
                      {isSuperSuperAdmin && (
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end gap-1">
                            {user.status === UserStatus.APPROVED && can('canSendLinks') && (
                              <button
                                onClick={() => onUpdateStatus(user.id, UserStatus.LINK_SENT)}
                                disabled={activeTraining?.isConsolidated}
                                className="bg-catalina-green text-white px-3 py-1.5 rounded-lg text-[10px] font-bold hover:bg-catalina-forest-green disabled:opacity-50 shadow-sm transition-all"
                              >
                                Enviar Link
                              </button>
                            )}
                            {/* Botón Eliminar para Super Super Admin */}
                            <button
                              className="bg-slate-100 text-slate-400 hover:text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all"
                              title="Eliminar Registro"
                              onClick={() => {
                                if (confirm("¿Eliminar este registro permanentemente?")) {
                                  // Aquí idealmente llamaríamos a una función onDelete, pero por ahora simulamos rechazo o no hacemos nada si no hay prop
                                  alert("Funcionalidad de eliminar pendiente de implementación en backend");
                                }
                              }}
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="px-6 py-4">Participante</th>
                  <th className="px-6 py-4">Evaluación</th>
                  <th className="px-6 py-4">Nota</th>
                  <th className="px-6 py-4">Resultado</th>
                  <th className="px-6 py-4">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {examResults.filter(r => exams.find(e => e.id === r.examId)?.trainingId === currentTrainingId).map(result => (
                  <tr key={result.id}>
                    <td className="px-6 py-4 text-sm text-slate-700">{result.participantName} ({result.dni})</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{exams.find(e => e.id === result.examId)?.trainingTitle}</td>
                    <td className="px-6 py-4 text-sm font-bold">{result.score.toFixed(2)}%</td>
                    <td className="px-6 py-4">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-md border ${result.passed ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                        {result.passed ? 'APROBADO' : 'REPROBADO'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{new Date(result.completedAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
