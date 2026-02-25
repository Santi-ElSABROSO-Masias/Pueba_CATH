import React, { useState } from 'react';
import { Training } from '../types';
import { useAutoCloseOnNavigate } from '../hooks/useAutoCloseOnNavigate';

interface ExtendDeadlineModalProps {
  training: Training;
  onClose: () => void;
  onExtend: (newDeadline: string, reason: string) => void;
}

export function ExtendDeadlineModal({ training, onClose, onExtend }: ExtendDeadlineModalProps) {
  const [newDeadline, setNewDeadline] = useState('');
  const [reason, setReason] = useState('');
  
  useAutoCloseOnNavigate('extend-deadline', true, onClose);
  
  function handleSubmit() {
    if (!newDeadline) {
      alert("Debes especificar nueva fecha límite");
      return;
    }
    
    if (new Date(newDeadline) <= new Date(training.registration_deadline)) {
      alert("La nueva fecha debe ser posterior a la actual");
      return;
    }
    
    if (new Date(newDeadline) >= new Date(training.date)) {
      alert("La fecha límite no puede ser después del curso");
      return;
    }
    
    if (!reason.trim()) {
      alert("Debes especificar el motivo de la extensión");
      return;
    }
    
    onExtend(newDeadline, reason);
  }

  const getTimeLeft = (deadline: string) => {
      const now = new Date();
      const target = new Date(deadline);
      const diff = target.getTime() - now.getTime();
      return diff > 0 ? Math.floor(diff / (1000 * 60 * 60 * 24)) : 0;
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <h3 className="text-lg font-bold text-slate-800">Extender Fecha Límite</h3>
            <p className="text-xs text-slate-500 mt-1">Modificación excepcional del plazo de inscripción</p>
        </div>
        
        <div className="p-6 space-y-4">
            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm space-y-2">
                <p><strong className="text-blue-700">Capacitación:</strong> {training.title}</p>
                <p><strong className="text-blue-700">Fecha del curso:</strong> {training.date}</p>
                <p><strong className="text-blue-700">Deadline actual:</strong> {new Date(training.registration_deadline).toLocaleString()}</p>
                {getTimeLeft(training.registration_deadline) === 0 && (
                <div className="flex items-center gap-2 text-amber-600 font-bold mt-2 text-xs">
                    <i className="fas fa-exclamation-triangle"></i>
                    El deadline ya venció o está por vencer
                </div>
                )}
            </div>
      
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Nueva Fecha Límite</label>
                <input 
                type="datetime-local"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                min={training.registration_deadline}
                max={training.date} // Asumiendo que date es YYYY-MM-DD, esto podría necesitar ajuste si date incluye hora
                required
                />
            </div>
            
            <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Motivo de la Extensión</label>
                <textarea
                className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all text-sm resize-none h-24"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Ej: Solicitud de la empresa para registrar trabajadores adicionales"
                required
                />
            </div>
        </div>
      
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
            <button 
                onClick={onClose} 
                className="px-4 py-2 rounded-lg font-bold text-slate-500 hover:bg-white hover:shadow-sm transition-all"
            >
                Cancelar
            </button>
            <button 
                onClick={handleSubmit} 
                className="bg-amber-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-amber-600 shadow-lg shadow-amber-100 transition-all"
            >
                Extender Deadline
            </button>
        </div>
      </div>
    </div>
  );
}
