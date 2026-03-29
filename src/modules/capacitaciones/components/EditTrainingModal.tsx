import React, { useState, useEffect } from 'react';
import { Training } from '../../../../types';
import { useAutoCloseOnNavigate } from '../../../../hooks/useAutoCloseOnNavigate';

interface EditTrainingModalProps {
  training: Training;
  onClose: () => void;
  onSave: (updatedTraining: Training) => void;
}

export const EditTrainingModal: React.FC<EditTrainingModalProps> = ({ training, onClose, onSave }) => {
  const [formData, setFormData] = useState<Training>({ ...training });

  useAutoCloseOnNavigate('edit-training-modal', true, onClose);

  useEffect(() => {
    setFormData({ ...training });
  }, [training]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    if (!formData.date || !formData.registration_deadline) {
        alert("La fecha y el deadline son obligatorios.");
        return;
    }
    if (new Date(formData.registration_deadline) >= new Date(formData.date)) {
        alert("El deadline debe ser anterior a la fecha de la capacitación.");
        return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden transform transition-all scale-100">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800 text-lg">Editar Capacitación</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-catalina-green/20 outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Fecha</label>
                <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-catalina-green/20 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Horario</label>
                <input
                type="text"
                name="schedule"
                value={formData.schedule}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-catalina-green/20 outline-none"
                />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Aforo</label>
                <input
                type="number"
                name="maxCapacity"
                value={formData.maxCapacity}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-catalina-green/20 outline-none"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Duración</label>
                <input
                type="text"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-catalina-green/20 outline-none"
                />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Deadline de Inscripción</label>
            <input
              type="datetime-local"
              name="registration_deadline"
              value={formData.registration_deadline || ''}
              onChange={handleChange}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-catalina-green/20 outline-none"
            />
            <p className="text-xs text-slate-500 mt-1">Debe ser anterior a la fecha de inicio.</p>
          </div>
          
          <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="isActive" 
                name="is_active" 
                checked={formData.is_active || false}
                onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                className="rounded text-catalina-green focus:ring-catalina-green"
              />
              <label htmlFor="isActive" className="text-sm text-slate-700 font-medium">Activo en el cronograma</label>
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="bg-catalina-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-catalina-forest-green shadow-sm transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};
