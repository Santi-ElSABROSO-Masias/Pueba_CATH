
import React, { useState, useRef, useEffect } from 'react';
import { Training } from '../types';

interface TrainingManagerProps {
  trainings: Training[];
  onCreateTraining: (training: Omit<Training, 'id'>) => void;
  onUpdateTraining: (training: Training) => void;
  onSelectTraining: (trainingId: string) => void;
}

export const TrainingManager: React.FC<TrainingManagerProps> = ({ trainings, onCreateTraining, onUpdateTraining, onSelectTraining }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    maxCapacity: 50,
    isPublished: true,
    customQuestions: [] as string[]
  });
  const [tempQuestion, setTempQuestion] = useState('');

  const resetForm = () => {
    setFormData({ title: '', description: '', date: '', maxCapacity: 50, isPublished: true, customQuestions: [] });
    setEditingId(null);
  };

  const handleEdit = (training: Training) => {
    setFormData({
      title: training.title,
      description: training.description,
      date: training.date,
      maxCapacity: training.maxCapacity,
      isPublished: training.isPublished,
      customQuestions: [...training.customQuestions]
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
    <div className="space-y-6 animate-fadeIn">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Capacitaciones</h2>
          <p className="text-slate-500 font-medium">Configura eventos con el formato oficial de asistencia.</p>
        </div>
        {!editingId && (
          <button
            onClick={() => setEditingId('new')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all"
          >
            <i className="fas fa-plus"></i>
            Nueva Capacitación
          </button>
        )}
      </div>

      {editingId ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl animate-fadeIn">
          <div className="mb-6 flex items-center gap-3">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <i className={editingId === 'new' ? "fas fa-plus" : "fas fa-edit"}></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800">
              {editingId === 'new' ? 'Configurar Capacitación' : `Editando: ${formData.title}`}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <i className="fas fa-info-circle text-indigo-500"></i>
                Detalles Generales
              </h3>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Título</label>
                <input
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                  placeholder="Ej. Taller de Inducción de Seguridad"
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Descripción</label>
                <textarea
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none h-24"
                  placeholder="Propósito de la capacitación..."
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Fecha</label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    value={formData.date}
                    onChange={e => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Aforo Máx.</label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none"
                    value={formData.maxCapacity}
                    onChange={e => setFormData({...formData, maxCapacity: parseInt(e.target.value) || 0})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wider">
                <i className="fas fa-list-check text-indigo-500"></i>
                Formato de Registro
              </h3>
              <div className="bg-slate-50 p-5 rounded-2xl space-y-3 border border-slate-100">
                <div className="flex justify-between items-center mb-1">
                  <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Campos Obligatorios (Sistema)</p>
                  <i className="fas fa-lock text-[10px] text-slate-300"></i>
                </div>
                <div className="flex flex-wrap gap-2">
                  {['Nombres y Apellidos', 'DNI', 'Empresa', 'Área', 'Cargo', 'Email'].map(field => (
                    <span key={field} className="bg-white px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-600 shadow-sm flex items-center gap-2">
                      <i className="fas fa-check-circle text-emerald-500 text-[10px]"></i>
                      {field}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 italic">Estos campos son requeridos para el reporte oficial de asistencia.</p>
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Preguntas adicionales</label>
                <div className="flex gap-2">
                  <input
                    className="flex-grow px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20"
                    placeholder="Ej. ¿Restricciones alimentarias?"
                    value={tempQuestion}
                    onChange={e => setTempQuestion(e.target.value)}
                    onKeyPress={e => e.key === 'Enter' && addQuestion()}
                  />
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="bg-slate-900 text-white px-4 rounded-xl hover:bg-slate-800 transition-colors"
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>

              <div className="space-y-2 max-h-[150px] overflow-y-auto pr-2">
                {formData.customQuestions.map((q, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-indigo-50 text-indigo-700 rounded-xl text-sm font-medium animate-fadeIn">
                    <span>{q}</span>
                    <button onClick={() => setFormData(prev => ({...prev, customQuestions: prev.customQuestions.filter((_, idx) => idx !== i)}))}>
                      <i className="fas fa-times opacity-50 hover:opacity-100"></i>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-10 pt-6 border-t border-slate-100">
            <button
              onClick={resetForm}
              className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-50 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!formData.title || !formData.date}
              className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-30 shadow-lg shadow-indigo-100 transition-all"
            >
              {editingId === 'new' ? 'Publicar Capacitación' : 'Guardar Cambios'}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainings.map(t => (
            <div key={t.id} className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <span className={`text-[10px] font-black px-2 py-1 rounded-md border ${t.isPublished ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>
                  {t.isPublished ? 'ACTIVO' : 'BORRADOR'}
                </span>
                <button 
                  onClick={() => onSelectTraining(t.id)}
                  className="text-indigo-600 font-bold text-xs hover:underline flex items-center gap-1 transition-all"
                >
                  Participantes <i className="fas fa-arrow-right text-[10px]"></i>
                </button>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2 truncate" title={t.title}>{t.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-2 mb-4 h-10">{t.description}</p>
              
              <div className="flex items-center gap-4 text-xs text-slate-400 font-medium mb-6">
                <span className="flex items-center gap-1"><i className="far fa-calendar-alt opacity-60"></i> {t.date}</span>
                <span className="flex items-center gap-1"><i className="fas fa-users opacity-60"></i> {t.maxCapacity} cupos</span>
              </div>

              <div className="pt-4 border-t border-slate-50 flex items-center justify-between relative">
                {/* Botón de Compartir con Menú */}
                <div className="relative">
                  <button 
                    className={`p-2 transition-all rounded-lg flex items-center gap-2 ${sharingId === t.id ? 'bg-indigo-600 text-white' : copiedId === t.id ? 'bg-emerald-50 text-emerald-600' : 'text-slate-400 hover:text-indigo-600 bg-slate-50'}`}
                    title="Opciones para Compartir"
                    onClick={() => setSharingId(sharingId === t.id ? null : t.id)}
                  >
                    <i className={`fas ${copiedId === t.id ? 'fa-check' : 'fa-share-alt'}`}></i>
                    <span className="text-[10px] font-bold uppercase tracking-widest">
                      {copiedId === t.id ? 'Copiado' : 'Compartir'}
                    </span>
                  </button>

                  {/* Menú Pequeño de Compartir */}
                  {sharingId === t.id && (
                    <div className="absolute bottom-full left-0 mb-2 w-48 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[60] animate-fadeIn">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-3 py-2 border-b border-slate-50 mb-1">Enviar Invitación</p>
                      
                      <button 
                        onClick={() => shareViaWhatsApp(t)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 rounded-xl transition-colors text-xs font-bold"
                      >
                        <i className="fab fa-whatsapp text-lg text-emerald-500"></i>
                        WhatsApp
                      </button>

                      <button 
                        onClick={() => shareViaEmail(t)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-blue-50 text-slate-700 hover:text-blue-600 rounded-xl transition-colors text-xs font-bold"
                      >
                        <i className="far fa-envelope text-lg text-blue-500"></i>
                        Correo Electrónico
                      </button>

                      <button 
                        onClick={() => copyToClipboard(t.id)}
                        className="w-full flex items-center gap-3 px-3 py-2 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 rounded-xl transition-colors text-xs font-bold"
                      >
                        <i className="fas fa-link text-lg text-indigo-500"></i>
                        Copiar Enlace
                      </button>

                      {/* Click outside backdrop to close */}
                      <div className="fixed inset-0 z-[-1]" onClick={() => setSharingId(null)}></div>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleEdit(t)}
                  className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-indigo-50 transition-all"
                >
                  <i className="fas fa-cog text-xs"></i>
                  Configurar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
