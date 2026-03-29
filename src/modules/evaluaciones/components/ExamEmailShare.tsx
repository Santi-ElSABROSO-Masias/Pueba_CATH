import React from 'react';
import { Exam } from '../../../../types';

interface ExamEmailShareProps {
  exam: Exam;
}

export const ExamEmailShare: React.FC<ExamEmailShareProps> = ({ exam }) => {
  const message = `Estimado participante,\n\nTe invitamos a rendir el examen "${exam.trainingTitle}".\n\nAccede aquí: ${exam.publicLink || 'No publicado aún'}\n\nTiempo límite: ${exam.timeLimit} minutos`;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copiado al portapapeles');
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Compartir por Email</h3>
      {exam.publicLink ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700">Link del examen</label>
            <div className="flex gap-2 mt-1">
              <input readOnly value={exam.publicLink} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
              <button onClick={() => handleCopy(exam.publicLink!)} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300">Copiar</button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Mensaje sugerido</label>
            <div className="mt-1 p-3 bg-slate-50 rounded-lg border border-slate-200 text-sm whitespace-pre-wrap">{message}</div>
            <button onClick={() => handleCopy(message)} className="mt-2 bg-catalina-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-catalina-forest-green">Copiar mensaje completo</button>
          </div>
        </div>
      ) : (
        <p className="text-sm text-slate-500">Publica el examen primero para generar el link y el mensaje.</p>
      )}
    </div>
  );
};
