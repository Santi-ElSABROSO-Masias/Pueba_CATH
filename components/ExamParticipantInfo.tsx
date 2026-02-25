import React, { useState } from 'react';
import { Exam } from '../types';

interface ExamParticipantInfoProps {
  exam: Exam;
  onUpdateExam: (updatedExam: Exam) => void;
}

export const ExamParticipantInfo: React.FC<ExamParticipantInfoProps> = ({ exam, onUpdateExam }) => {
  const [fields, setFields] = useState(exam.participantFields);

  const handleFieldChange = (field: keyof typeof fields) => {
    setFields(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSave = () => {
    onUpdateExam({ ...exam, participantFields: fields });
    alert('Información del participante guardada.');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Información del Participante</h3>
      <p className="text-sm text-slate-500 mb-4">Selecciona los campos requeridos que el participante debe completar antes de iniciar el examen.</p>
      <div className="space-y-3">
        {Object.keys(fields).map(fieldKey => (
          <div key={fieldKey} className="flex items-center">
            <input 
              id={fieldKey} 
              name={fieldKey} 
              type="checkbox" 
              checked={fields[fieldKey as keyof typeof fields]} 
              onChange={() => handleFieldChange(fieldKey as keyof typeof fields)} 
              disabled={fieldKey === 'name' || fieldKey === 'dni'} 
              className="h-4 w-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 disabled:opacity-50"
            />
            <label htmlFor={fieldKey} className="ml-3 block text-sm text-slate-900 capitalize">
              {fieldKey.replace(/([A-Z])/g, ' $1')}
              {(fieldKey === 'name' || fieldKey === 'dni') && <span className="text-xs text-slate-400 ml-2">(obligatorio)</span>}
            </label>
          </div>
        ))}
      </div>
      <div className="mt-6">
        <button onClick={handleSave} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700">Guardar</button>
      </div>
    </div>
  );
};
