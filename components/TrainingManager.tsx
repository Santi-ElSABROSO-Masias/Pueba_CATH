
import React, { useState } from 'react';
import { Training, UserRole, MonthlySchedule, EventUser } from '../types';
import { MonthlyScheduleManager } from './MonthlyScheduleManager';
import { DuplicateTrainingModal } from './DuplicateTrainingModal';
import { ParticipantsLinksModal } from './ParticipantsLinksModal';
import { PublicLinkModal } from './PublicLinkModal';

interface TrainingManagerProps {
  trainings: Training[];
  users?: EventUser[]; // Para contar inscritos
  onCreateTraining: (training: Omit<Training, 'id'>) => void;
  onUpdateTraining: (training: Training) => void;
  onSelectTraining: (trainingId: string) => void;
  userRole: UserRole; // Nuevo prop para control de acceso
  onScheduleGenerated?: (schedule: MonthlySchedule) => void; // Prop para recargar trainings
}

const COLORS = [
  '#0EA5E9', // Sky
  '#22C55E', // Green
  '#F97316', // Orange
  '#8B5CF6', // Violet
  '#EF4444', // Red
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#6366F1', // Indigo
];

const PREDEFINED_SCHEDULES = [
  '07:00 - 09:00',
  '07:00 - 11:00',
  '08:00 - 10:00',
  '08:00 - 12:00',
  '09:00 - 13:00',
  '10:00 - 14:00',
  '13:00 - 17:00',
  '14:00 - 18:00',
  '18:00 - 22:00'
];

export const TrainingManager: React.FC<TrainingManagerProps> = ({ trainings, users, onCreateTraining, onUpdateTraining, onSelectTraining, userRole, onScheduleGenerated }) => {
  const safeTrainings = Array.isArray(trainings) ? trainings : [];

  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [participantsForModal, setParticipantsForModal] = useState<EventUser[]>([]);
  const [publicLinkUrl, setPublicLinkUrl] = useState<string | null>(null);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [duplicatingTraining, setDuplicatingTraining] = useState<Training | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    registration_deadline: '', // Nuevo campo
    maxCapacity: 60,
    isPublished: true,
    customQuestions: [] as string[],
    color: COLORS[0],
    duration: '',
    schedule: '',
    group: 'Grupo 1',
    meetingLink: ''
  });
  const [tempQuestion, setTempQuestion] = useState('');

  const isSuperSuperAdmin = userRole === 'super_super_admin';
  const isAdminContratista = userRole === 'admin_contratista';
  const hasTrainings = safeTrainings.length > 0;

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      date: '',
      registration_deadline: '',
      maxCapacity: 60,
      isPublished: true,
      customQuestions: [],
      color: COLORS[0],
      duration: '',
      schedule: '',
      group: 'Grupo 1',
      meetingLink: ''
    });
    setEditingId(null);
  };

  const handleEdit = (training: Training) => {
    // Solo super_super_admin puede editar
    if (!isSuperSuperAdmin) return;

    setFormData({
      title: training.title,
      description: training.description,
      date: training.date,
      registration_deadline: training.registration_deadline || '',
      maxCapacity: training.maxCapacity,
      isPublished: training.isPublished,
      customQuestions: [...training.customQuestions],
      color: training.color || COLORS[0],
      duration: training.duration || '',
      schedule: training.schedule || '',
      group: training.group || 'Grupo 1',
      meetingLink: training.meetingLink || ''
    });
    setEditingId(training.id);
  };

  const addQuestion = () => {
    if (tempQuestion.trim()) {
      setFormData(prev => ({ ...prev, customQuestions: [...prev.customQuestions, tempQuestion.trim()] }));
      setTempQuestion('');
    }
  };

  const handleSave = async () => {
    // Validaciones de fecha
    if (formData.registration_deadline) {
      if (new Date(formData.registration_deadline) >= new Date(formData.date)) {
        alert("La fecha límite debe ser anterior a la fecha del curso");
        return;
      }
    } else {
      alert("La fecha límite de inscripción es obligatoria");
      return;
    }

    try {
      if (editingId === 'new') {
        await onCreateTraining(formData as any);
      } else if (editingId) {
        await onUpdateTraining({ ...formData, id: editingId } as any);
      }
      resetForm();
    } catch (error) {
       // Si hay error (validacion del backend), no resetemaos para que pueda corregir
       console.log('Hubo un error al guardar la capacitación, previniendo reseteo.');
    }
  };

  const getShareUrl = (id: string) => `${window.location.origin}/registro?id=${id}`;

  const copyToClipboard = (id: string) => {
    const url = getShareUrl(id);
    navigator.clipboard.writeText(url).then(() => {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
      setSharingId(null);
    });
  };

  const shareViaWhatsApp = (training: Training) => {
    const url = getShareUrl(training.id);
    const text = `¡Hola! Te invito a inscribirte en la capacitación: *${training.title}*. Fecha: ${training.date}. Regístrate aquí: ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    setSharingId(null);
  };

  const shareViaEmail = (training: Training) => {
    const url = getShareUrl(training.id);
    const subject = `Invitación a Capacitación: ${training.title}`;
    const body = `Hola,\n\nTe invitamos a participar en la capacitación "${training.title}" que se llevará a cabo el día ${training.date}.\n\nPuedes inscribirte en el siguiente enlace:\n${url}\n\n¡Te esperamos!`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setSharingId(null);
  };

  const handleDuplicate = (originalTraining: Training, newDate: string, newTime: string, newCapacity: number) => {
    const newGroupNumber = safeTrainings.filter(t => t.title === originalTraining.title).length + 1;
    const newGroup = `Grupo ${newGroupNumber}`;

    const duplicatedTraining = {
      ...originalTraining,
      id: '', // El backend debería generar un nuevo ID
      date: newDate,
      schedule: newTime,
      maxCapacity: newCapacity,
      group: newGroup,
      isPublished: false, // El duplicado empieza como borrador
      registration_deadline: '' // Forzar a que se establezca uno nuevo
    };

    onCreateTraining(duplicatedTraining as Omit<Training, 'id'>);
    setDuplicatingTraining(null);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Modal de Duplicación */}
      {participantsForModal.length > 0 && (
        <ParticipantsLinksModal
          participants={participantsForModal}
          onClose={() => setParticipantsForModal([])}
        />
      )}

      {publicLinkUrl && (
        <PublicLinkModal
          url={publicLinkUrl}
          onClose={() => setPublicLinkUrl(null)}
        />
      )}

      {duplicatingTraining && (
        <DuplicateTrainingModal
          training={duplicatingTraining}
          onClose={() => setDuplicatingTraining(null)}
          onDuplicate={handleDuplicate}
          existingTrainings={trainings}
        />
      )}
      {/* Header Sección */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-catalina-grey tracking-tight">Capacitaciones</h2>
          {!isAdminContratista && (
            <p className="text-catalina-grey/60 text-sm mt-1 font-normal">Gestiona el catálogo de cursos y sus configuraciones.</p>
          )}
        </div>
        {/* Solo SuperSuperAdmin puede crear */}
        {!editingId && isSuperSuperAdmin && (
          <div className="flex gap-2">
            <button
              onClick={() => setShowScheduleManager(!showScheduleManager)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${showScheduleManager ? 'bg-catalina-green/10 text-catalina-forest-green' : 'bg-white border border-slate-200 text-catalina-grey hover:bg-slate-50'}`}
            >
              <i className="fas fa-calendar-alt text-xs"></i>
              {showScheduleManager ? 'Ocultar Cronograma' : 'Gestionar Cronograma'}
            </button>
            <button
              onClick={() => setEditingId('new')}
              className="bg-catalina-forest-green text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-catalina-green hover:shadow-lg transition-all"
            >
              <i className="fas fa-plus text-xs"></i>
              Nueva Capacitación
            </button>
          </div>
        )}
      </div>

      {/* Schedule Manager (Solo Super Super Admin) */}
      {isSuperSuperAdmin && showScheduleManager && (
        <MonthlyScheduleManager onScheduleGenerated={onScheduleGenerated} users={users} />
      )}

      {editingId ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm animate-fadeIn">
          {/* Formulario de Edición (Manteniendo funcionalidad pero limpiando estilos) */}
          <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 bg-catalina-green/10 text-catalina-green rounded-full flex items-center justify-center">
              <i className={editingId === 'new' ? "fas fa-plus text-xs" : "fas fa-pencil-alt text-xs"}></i>
            </div>
            <h3 className="text-lg font-semibold text-catalina-grey">
              {editingId === 'new' ? 'Nueva Capacitación' : 'Editar Configuración'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Columna Izquierda */}
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Identidad Visual</label>
                <div className="flex gap-3">
                  {COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => setFormData({ ...formData, color: c })}
                      className={`w-6 h-6 rounded-full transition-all ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del Evento</label>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-catalina-green focus:ring-1 focus:ring-catalina-green/30 outline-none transition-all"
                  placeholder="Ej. Inducción Básica de Seguridad"
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Grupo</label>
                  <input
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-catalina-green focus:ring-1 focus:ring-catalina-green/30 outline-none transition-all"
                    placeholder="Ej. Grupo 1"
                    value={formData.group || ''}
                    onChange={e => setFormData({ ...formData, group: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-catalina-green focus:ring-1 focus:ring-catalina-green/30 outline-none transition-all"
                    value={formData.isPublished ? 'true' : 'false'}
                    onChange={e => setFormData({ ...formData, isPublished: e.target.value === 'true' })}
                  >
                    <option value="true">Publicado</option>
                    <option value="false">Borrador</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-catalina-green focus:ring-1 focus:ring-catalina-green/30 outline-none h-24 resize-none"
                  placeholder="Breve descripción del objetivo..."
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.date}
                    onChange={e => setFormData({ ...formData, date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Límite Inscripción</label>
                  <input
                    type="datetime-local"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.registration_deadline}
                    onChange={e => setFormData({ ...formData, registration_deadline: e.target.value })}
                  />
                  <p className="text-[10px] text-slate-400 mt-1">Cierre automático de registros</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link de Microsoft Teams</label>
                <input
                  type="url"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-catalina-green focus:ring-1 focus:ring-catalina-green/30 outline-none transition-all"
                  placeholder="https://teams.microsoft.com/..."
                  value={formData.meetingLink || ''}
                  onChange={e => setFormData({ ...formData, meetingLink: e.target.value })}
                />
                <small className="text-[10px] text-slate-400 mt-1">El admin crea la reunión manualmente y pega el link aquí</small>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aforo Máximo</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.maxCapacity}
                    onChange={e => setFormData({ ...formData, maxCapacity: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duración</label>
                  <input
                    type="text"
                    placeholder="Ej. 4 horas"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horario</label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.schedule}
                    onChange={e => setFormData({ ...formData, schedule: e.target.value })}
                  >
                    <option value="" disabled>Seleccione un horario</option>
                    {PREDEFINED_SCHEDULES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                    {formData.schedule && !PREDEFINED_SCHEDULES.includes(formData.schedule) && (
                      <option value={formData.schedule}>Otro ({formData.schedule})</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            {/* Columna Derecha - Preguntas */}
            <div className="space-y-4 bg-slate-50 p-6 rounded-xl border border-slate-100">
              <h3 className="text-sm font-semibold text-slate-900">Formulario de Registro</h3>
              <p className="text-xs text-slate-500 mb-4">Los campos básicos (Nombre, DNI, Email) son obligatorios por defecto.</p>

              <div>
                <label className="block text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Campos Adicionales</label>
                <div className="flex gap-2">
                  <input
                    className="flex-grow px-4 py-2 rounded-lg border border-slate-200 text-sm outline-none"
                    placeholder="Ej. ¿Alergias?"
                    value={tempQuestion}
                    onChange={e => setTempQuestion(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addQuestion()}
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-white border border-slate-200 text-slate-600 px-3 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <i className="fas fa-plus text-xs"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2 mt-2">
                {formData.customQuestions.map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-600">
                    <span>{q}</span>
                    <button onClick={() => setFormData(prev => ({ ...prev, customQuestions: prev.customQuestions.filter((_, idx) => idx !== i) }))}>
                      <i className="fas fa-times text-slate-400 hover:text-red-500 text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
            <button
              onClick={resetForm}
              className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title || !formData.date}
              className="bg-catalina-green text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-catalina-forest-green disabled:opacity-50 transition-all shadow-sm"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      ) : (
        /* GRID DE TARJETAS REDISEÑADAS */
        !hasTrainings ? (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-catalina-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-catalina-green text-2xl">
              <i className="fas fa-inbox"></i>
            </div>
            <h3 className="text-catalina-forest-green font-medium text-lg">No hay capacitaciones disponibles</h3>
            <p className="text-slate-500 text-sm mt-1">{isSuperSuperAdmin ? 'Crea una nueva capacitación para comenzar.' : 'Aún no se han programado capacitaciones.'}</p>
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {safeTrainings.map(t => (
            <div
              key={t.id}
              className="group relative bg-white rounded-2xl border border-slate-200 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
            >
              {/* Accent Line (Lateral izquierda suave) */}
              <div
                className="absolute left-0 top-6 bottom-6 w-1 rounded-r-full opacity-80"
                style={{ backgroundColor: t.color }}
              ></div>

              <div className="p-6 pl-7 flex flex-col h-full">

                {/* Header: Grupo y Estado */}
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
                    {t.group || 'GENERAL'}
                  </span>

                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${t.isPublished
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                    }`}>
                    {t.isPublished ? '● Activo' : '○ Borrador'}
                  </span>
                </div>

                {/* Título y Descripción */}
                <div className="mb-6">
                  <h3 
                    className="font-bold text-lg leading-snug mb-2 transition-colors cursor-pointer hover:opacity-80"
                    style={{ color: t.color || '#1e293b' }}
                    onClick={() => onSelectTraining(t.id)}
                  >
                    {t.title}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                    {t.description}
                  </p>
                </div>

                {/* Separador Suave */}
                <div className="border-t border-slate-50 mb-4"></div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <i className="far fa-calendar text-slate-400 w-4"></i>
                    <span>{t.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px] text-slate-600">
                    <i className="fas fa-users text-slate-400 w-4"></i>
                    <span>{t.maxCapacity} cupos</span>
                  </div>
                  {t.duration && (
                    <div className="flex items-center gap-2 text-[13px] text-slate-600">
                      <i className="far fa-clock text-slate-400 w-4"></i>
                      <span>{t.duration}</span>
                    </div>
                  )}
                  {t.schedule && (
                    <div className="flex items-center gap-2 text-[13px] text-slate-600">
                      <i className="far fa-clock text-slate-400 w-4"></i>
                      <span className="truncate">{t.schedule}</span>
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="mt-auto pt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {/* Share Button con Popover simple */}
                    {!isAdminContratista && (
                      <div className="relative">
                        <button
                          onClick={() => setSharingId(sharingId === t.id ? null : t.id)}
                          className="w-8 h-8 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                          title="Compartir"
                        >
                          <i className="fas fa-share-alt text-xs"></i>
                        </button>

                        {sharingId === t.id && (
                          <div className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-xl shadow-xl border border-slate-100 p-2 z-20 animate-fadeIn space-y-1">
                            <div className="px-3 py-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">OPCIONES DE DIFUSIÓN</p>
                            </div>
                            <button onClick={() => {
                              setPublicLinkUrl(getShareUrl(t.id));
                              setSharingId(null);
                            }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                              <i className="fas fa-link text-slate-400 w-4"></i>
                              <span>Link de registro público</span>
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                            <button onClick={() => {
                              const trainingParticipants = users?.filter(u => u.trainingId === t.id) || [];
                              setParticipantsForModal(trainingParticipants);
                              setSharingId(null);
                            }} className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-3">
                              <i className="fas fa-users text-slate-400 w-4"></i>
                              <span>Links de validación ({users?.filter(u => u.trainingId === t.id && u.validation_link).length || 0})</span>
                            </button>
                          </div>
                        )}
                        {/* Backdrop invisible para cerrar */}
                        {sharingId === t.id && <div className="fixed inset-0 z-10" onClick={() => setSharingId(null)}></div>}
                      </div>
                    )}

                    {/* Controles SuperSuperAdmin */}
                    {isSuperSuperAdmin && (
                      <>
                        {/* Toggle Activo/Inactivo */}
                        <div className="flex items-center gap-1.5 text-xs text-slate-500" title={t.isPublished ? 'Desactivar capacitación' : 'Activar capacitación'}>
                          <button
                            id={`toggle-${t.id}`}
                            onClick={() => onUpdateTraining({ ...t, isPublished: !t.isPublished })}
                            className={`relative inline-flex items-center h-5 w-9 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-catalina-green ${t.isPublished ? 'bg-catalina-green' : 'bg-slate-300'}`}
                          >
                            <span className={`inline-block w-3 h-3 transform bg-white rounded-full transition-transform ${t.isPublished ? 'translate-x-5' : 'translate-x-1'}`} />
                          </button>
                        </div>

                        {/* Botón Duplicar */}
                        <button
                          onClick={() => setDuplicatingTraining(t)}
                          className="w-auto h-8 px-2 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors gap-1.5"
                          title="Duplicar"
                        >
                          <i className="far fa-copy text-xs"></i>
                          <span className="text-[10px] font-bold">Duplicar</span>
                        </button>

                        {/* Botón Configurar (Existente) */}
                        <button
                          onClick={() => handleEdit(t)}
                          className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-slate-700 flex items-center justify-center transition-colors"
                          title="Configurar"
                        >
                          <i className="fas fa-cog text-xs"></i>
                        </button>
                      </>
                    )}
                  </div>

                  <button
                    onClick={() => onSelectTraining(t.id)}
                    className="text-catalina-green text-xs font-medium hover:text-catalina-forest-green hover:bg-catalina-green/5 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    Participantes
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        )
      )}
    </div>
  );
};
