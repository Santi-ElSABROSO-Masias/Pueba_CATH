import React, { useState } from 'react';
import { Training } from '../types';

interface DuplicateTrainingModalProps {
  training: Training;
  onClose: () => void;
  onDuplicate: (originalTraining: Training, newDate: string, newTime: string, newCapacity: number) => void;
  existingTrainings: Training[];
}

export const DuplicateTrainingModal: React.FC<DuplicateTrainingModalProps> = ({ training, onClose, onDuplicate, existingTrainings }) => {
  const [newDate, setNewDate] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newCapacity, setNewCapacity] = useState(60);

  const handleSubmit = () => {
    if (!newDate || !newTime) {
      alert('Por favor, complete la fecha y hora.');
      return;
    }
    onDuplicate(training, newDate, newTime, newCapacity);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-xl p-8 m-4 max-w-lg w-full">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Duplicar Capacitación</h2>
        <p className="text-sm text-slate-500 mb-6">Creando una copia de <span className="font-semibold">{training.title} - {training.group}</span>.</p>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Fecha</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Hora</label>
            <input
              type="time"
              value={newTime}
              onChange={(e) => setNewTime(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Aforo Máximo</label>
            <input
              type="number"
              value={newCapacity}
              onChange={(e) => setNewCapacity(parseInt(e.target.value, 10) || 0)}
              className="w-full px-4 py-2.5 rounded-lg border border-slate-200 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-8 pt-6 border-t border-slate-100">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all">
            Cancelar
          </button>
          <button onClick={handleSubmit} className="bg-indigo-600 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-sm">
            Crear Duplicado
          </button>
        </div>
      </div>
    </div>
  );
};
