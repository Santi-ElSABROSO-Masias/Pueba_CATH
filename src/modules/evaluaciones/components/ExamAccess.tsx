import React, { useState } from 'react';
import { Exam } from '../../../../types';

interface ExamAccessProps {
  exam: Exam;
  onUpdateExam: (updatedExam: Exam) => void;
}

export const ExamAccess: React.FC<ExamAccessProps> = ({ exam, onUpdateExam }) => {
  const [accessType, setAccessType] = useState(exam.accessType);
  const [password, setPassword] = useState(exam.password || '');

  const handleSave = () => {
    onUpdateExam({
      ...exam,
      accessType,
      requiresPassword: accessType === 'restricted',
      password: accessType === 'restricted' ? password : '',
    });
    alert('Configuración de acceso guardada.');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Configurar Acceso</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700">Tipo de acceso</label>
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <input id="public" name="accessType" type="radio" checked={accessType === 'public'} onChange={() => setAccessType('public')} className="h-4 w-4 text-catalina-green border-slate-300 focus:ring-catalina-green" />
              <label htmlFor="public" className="ml-3 block text-sm text-slate-900">Público (cualquiera con el link)</label>
            </div>
            <div className="flex items-center">
              <input id="restricted" name="accessType" type="radio" checked={accessType === 'restricted'} onChange={() => setAccessType('restricted')} className="h-4 w-4 text-catalina-green border-slate-300 focus:ring-catalina-green" />
              <label htmlFor="restricted" className="ml-3 block text-sm text-slate-900">Restringido (solo con contraseña)</label>
            </div>
          </div>
        </div>
        {accessType === 'restricted' && (
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">Contraseña</label>
            <input type="password" id="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md shadow-sm placeholder-slate-400 focus:outline-none focus:ring-catalina-green focus:border-catalina-green sm:text-sm" />
          </div>
        )}
        <div>
          <button onClick={handleSave} className="bg-catalina-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-catalina-forest-green">Guardar configuración</button>
        </div>
      </div>
    </div>
  );
};
