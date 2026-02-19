
import React, { useState } from 'react';
import { Training, UserRole } from '../types';

interface TrainingManagerProps {
  trainings: Training[];
  onCreateTraining: (training: Omit<Training, 'id'>) => void;
  onUpdateTraining: (training: Training) => void;
  onSelectTraining: (trainingId: string) => void;
  userRole: UserRole; // Nuevo prop para control de acceso
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

export const TrainingManager: React.FC<TrainingManagerProps> = ({ trainings, onCreateTraining, onUpdateTraining, onSelectTraining, userRole }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    maxCapacity: 60,
    isPublished: true,
    customQuestions: [] as string[],
    color: COLORS[0],
    duration: '',
    schedule: '',
    group: 'Grupo 1'
  });
  const [tempQuestion, setTempQuestion] = useState('');

  const isSuperAdmin = userRole === 'superadmin';

  const resetForm = () => {
    setFormData({ 
      title: '', 
      description: '', 
      date: '', 
      maxCapacity: 60, 
      isPublished: true, 
      customQuestions: [],
      color: COLORS[0],
      duration: '',
      schedule: '',
      group: 'Grupo 1'
    });
    setEditingId(null);
  };

  const handleEdit = (training: Training) => {
    // Si no es superadmin, no permitir edición (aunque idealmente el botón no se mostraría)
    if (!isSuperAdmin) return;
    
    setFormData({
      title: training.title,
      description: training.description,
      date: training.date,
      maxCapacity: training.maxCapacity,
      isPublished: training.isPublished,
      customQuestions: [...training.customQuestions],
      color: training.color || COLORS[0],
      duration: training.duration || '',
      schedule: training.schedule || '',
      group: training.group || 'Grupo 1'
    });
    setEditingId(training.id);
  };

  const addQuestion = () => {
    if (tempQuestion.trim()) {
      setFormData(prev => ({ ...prev, customQuestions: [...prev.customQuestions, tempQuestion.trim()] }));
      setTempQuestion('');
    }
  };

  const handleSave = () => {
    if (editingId === 'new') {
      onCreateTraining(formData);
    } else if (editingId) {
      onUpdateTraining({ ...formData, id: editingId });
    }
    resetForm();
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

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header Sección */}
      <div className="flex justify-between items-end border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 tracking-tight">Capacitaciones</h2>
          <p className="text-slate-500 text-sm mt-1">Gestiona el catálogo de cursos y sus configuraciones.</p>
        </div>
        {/* Solo SuperAdmin puede crear */}
        {!editingId && isSuperAdmin && (
          <button
            onClick={() => setEditingId('new')}
            className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-slate-800 hover:shadow-lg transition-all"
          >
            <i className="fas fa-plus text-xs"></i>
            Nueva Capacitación
          </button>
        )}
      </div>

      {editingId ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm animate-fadeIn">
          {/* Formulario de Edición (Manteniendo funcionalidad pero limpiando estilos) */}
          <div className="mb-8 flex items-center gap-3 border-b border-slate-100 pb-4">
            <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
              <i className={editingId === 'new' ? "fas fa-plus text-xs" : "fas fa-pencil-alt text-xs"}></i>
            </div>
            <h3 className="text-lg font-semibold text-slate-800">
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
                      onClick={() => setFormData({...formData, color: c})}
                      className={`w-6 h-6 rounded-full transition-all ${formData.color === c ? 'ring-2 ring-offset-2 ring-slate-400 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Título del Evento</label>
                <input
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                  placeholder="Ej. Inducción Básica de Seguridad"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Nombre del Grupo</label>
                    <input
                      className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                      placeholder="Ej. Grupo 1"
                      value={formData.group || ''}
                      onChange={e => setFormData({...formData, group: e.target.value})}
                    />
                 </div>
                 <div>
                     <label className="block text-sm font-medium text-slate-700 mb-1">Estado</label>
                     <select
                        className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
                        value={formData.isPublished ? 'true' : 'false'}
                        onChange={e => setFormData({...formData, isPublished: e.target.value === 'true'})}
                     >
                         <option value="true">Publicado</option>
                         <option value="false">Borrador</option>
                     </select>
                 </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Descripción</label>
                <textarea
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none h-24 resize-none"
                  placeholder="Breve descripción del objetivo..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Fecha Inicio</label>
                  <input
                    type="date"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Aforo Máximo</label>
                  <input
                    type="number"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.maxCapacity}
                    onChange={e => setFormData({...formData, maxCapacity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Duración</label>
                  <input
                    type="text"
                    placeholder="Ej. 4 horas"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.duration}
                    onChange={e => setFormData({...formData, duration: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Horario</label>
                  <input
                    type="text"
                    placeholder="Ej. 8:00 am - 12:00 m"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm outline-none"
                    value={formData.schedule}
                    onChange={e => setFormData({...formData, schedule: e.target.value})}
                  />
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
                    <button onClick={() => setFormData(prev => ({...prev, customQuestions: prev.customQuestions.filter((_, idx) => idx !== i)}))}>
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
              className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm"
            >
              Guardar Cambios
            </button>
          </div>
        </div>
      ) : (
        /* GRID DE TARJETAS REDISEÑADAS */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {trainings.map(t => (
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
                  
                  <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${
                    t.isPublished 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-slate-100 text-slate-500 border border-slate-200'
                  }`}>
                    {t.isPublished ? '● Activo' : '○ Borrador'}
                  </span>
                </div>

                {/* Título y Descripción */}
                <div className="mb-6">
                  <h3 className="text-slate-900 font-semibold text-lg leading-snug mb-2 group-hover:text-indigo-600 transition-colors cursor-pointer" onClick={() => onSelectTraining(t.id)}>
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
                     <div className="relative">
                        <button 
                            onClick={() => setSharingId(sharingId === t.id ? null : t.id)}
                            className="w-8 h-8 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                            title="Compartir"
                        >
                            <i className="fas fa-share-alt text-xs"></i>
                        </button>
                        
                        {sharingId === t.id && (
                            <div className="absolute bottom-full left-0 mb-2 w-40 bg-white rounded-xl shadow-xl border border-slate-100 p-1 z-20 animate-fadeIn">
                                <button onClick={() => copyToClipboard(t.id)} className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">
                                    <i className="fas fa-link mr-2"></i> Copiar Link
                                </button>
                                <button onClick={() => shareViaWhatsApp(t)} className="w-full text-left px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 rounded-lg">
                                    <i className="fab fa-whatsapp mr-2"></i> WhatsApp
                                </button>
                            </div>
                        )}
                        {/* Backdrop invisible para cerrar */}
                        {sharingId === t.id && <div className="fixed inset-0 z-10" onClick={() => setSharingId(null)}></div>}
                     </div>

                     {/* Botón Configurar (Solo Admin) */}
                     {isSuperAdmin && (
                        <button 
                            onClick={() => handleEdit(t)}
                            className="w-8 h-8 rounded-full hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
                            title="Configurar"
                        >
                            <i className="fas fa-cog text-xs"></i>
                        </button>
                     )}
                  </div>

                  <button 
                    onClick={() => onSelectTraining(t.id)}
                    className="text-indigo-600 text-xs font-medium hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                  >
                    Participantes
                    <i className="fas fa-arrow-right text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
