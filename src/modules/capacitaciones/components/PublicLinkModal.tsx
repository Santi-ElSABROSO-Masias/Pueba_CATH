import React, { useState } from 'react';

interface PublicLinkModalProps {
  url: string;
  onClose: () => void;
}

export const PublicLinkModal: React.FC<PublicLinkModalProps> = ({ url, onClose }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 animate-fadeIn p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col">
        <div className="p-6 border-b border-slate-200 relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100">
            <i className="fas fa-times"></i>
          </button>
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <i className="fas fa-link text-catalina-green"></i>
            Link de Registro Público
          </h2>
          <p className="text-sm text-slate-500 mt-1">Comparte este enlace para que los usuarios puedan inscribirse automáticamente en el curso.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 break-all text-sm text-slate-600 font-mono select-all">
            {url}
          </div>
          <button 
            onClick={handleCopy}
            className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${copied ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-sm' : 'bg-catalina-green hover:bg-catalina-forest-green text-white shadow-lg shadow-catalina-green/20'}`}
          >
            {copied ? (
              <><i className="fas fa-check"></i> ¡Copiado!</>
            ) : (
              <><i className="far fa-copy"></i> Copiar al portapapeles</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
