import React, { useState } from 'react';
import { EventUser } from '../types';

interface ParticipantsLinksModalProps {
  participants: EventUser[];
  onClose: () => void;
}

export const ParticipantsLinksModal: React.FC<ParticipantsLinksModalProps> = ({ participants, onClose }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyValidationLink = async (participant: EventUser) => {
    if (participant.validation_link) {
      await navigator.clipboard.writeText(participant.validation_link);
      setCopiedId(participant.id);
      setTimeout(() => setCopiedId(null), 2000);
    } else {
      alert('Este participante aún no tiene un link de validación generado.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-4xl flex flex-col" style={{maxHeight: '90vh'}}>
        <div className="p-6 border-b border-slate-200">
          <h2 className="text-xl font-bold text-slate-800">Links de Validación Individual</h2>
          <p className="text-sm text-slate-500 mt-1">Copia y comparte el link de validación con cada participante.</p>
        </div>

        <div className="overflow-y-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">DNI</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-xs font-semibold text-slate-600 uppercase tracking-wider text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {participants.map(p => (
                <tr key={p.id}>
                  <td className="px-6 py-4 whitespace-nowrap font-medium text-slate-800">{p.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-mono text-sm">{p.dni}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-slate-500">{p.email}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {p.identity_validated ? (
                      <span className="px-2 py-1 text-xs font-semibold text-emerald-800 bg-emerald-100 rounded-full">✅ Validado</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-semibold text-amber-800 bg-amber-100 rounded-full">⏳ Pendiente</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button 
                      onClick={() => copyValidationLink(p)}
                      className={`text-xs font-bold py-2 px-3 rounded-lg transition-colors w-[110px] text-center ${copiedId === p.id ? 'bg-emerald-100 text-emerald-700 pointer-events-none' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {copiedId === p.id ? '¡Copiado!' : '📋 Copiar link'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50/50 flex justify-end">
          <button onClick={onClose} className="px-5 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};