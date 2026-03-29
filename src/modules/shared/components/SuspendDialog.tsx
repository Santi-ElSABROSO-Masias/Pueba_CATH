import React, { useState } from 'react';
import { Training } from '../../../../types';
import { useAutoCloseOnNavigate } from '../../../../hooks/useAutoCloseOnNavigate';

interface SuspendDialogProps {
  training: Training;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
}

export const SuspendDialog: React.FC<SuspendDialogProps> = ({ training, onConfirm, onCancel }) => {
  const [reason, setReason] = useState('');

  useAutoCloseOnNavigate('suspend-dialog', true, onCancel);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 animate-fadeIn" onClick={onCancel}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
        <div className="bg-amber-50 px-6 py-4 border-b border-amber-100 flex items-center gap-3">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center text-amber-600">
            <i className="fas fa-pause"></i>
          </div>
          <h3 className="font-bold text-amber-900 text-lg">Suspender Capacitación</h3>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
            <p className="text-sm font-bold text-slate-800">{training.title}</p>
            <p className="text-xs text-slate-500 mt-1">📅 {training.date} • {training.schedule}</p>
          </div>
          
          <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-xs text-amber-800">
            <p className="font-bold mb-1">⚠️ Al suspender:</p>
            <ul className="list-disc ml-4 space-y-1 opacity-90">
                <li>Se cerrará el registro inmediatamente.</li>
                <li>Ya no aparecerá como disponible para nuevos usuarios.</li>
                <li>Puedes reactivarla después si es necesario.</li>
            </ul>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
                Motivo de suspensión <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ej: Capacitador no disponible, falta de participantes, etc."
              rows={3}
              className="w-full px-4 py-3 rounded-lg border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500/20 outline-none resize-none"
              autoFocus
            />
          </div>
        </div>

        <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim()}
            className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-amber-600 shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Confirmar Suspensión
          </button>
        </div>
      </div>
    </div>
  );
};
