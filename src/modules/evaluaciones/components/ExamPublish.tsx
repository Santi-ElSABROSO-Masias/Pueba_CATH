import React, { useState, useEffect } from 'react';
import { Exam, Training, EventUser, UserStatus } from '../../../../types';
import { isSixHoursAfterEnd } from '../../../../utils/time';

interface ExamPublishProps {
  exam: Exam;
  onUpdateExam: (updatedExam: Exam) => void;
  trainings: Training[];
  users: EventUser[];
}

export const ExamPublish: React.FC<ExamPublishProps> = ({ exam, onUpdateExam, trainings, users }) => {
  if (!trainings || !Array.isArray(trainings) || trainings.length === 0) return <div className="p-8 text-center text-slate-500">No hay capacitaciones disponibles</div>;
  const [countdown, setCountdown] = useState('');

  const getTrainingEndTime = (training: Training): Date => {
    const trainingDate = new Date(training.date);
    const endTimeStr = training.schedule.split(' - ')[1];
    const [time, period] = endTimeStr.trim().split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    
    if (period?.toLowerCase() === 'pm' && hours !== 12) hours += 12;
    if (period?.toLowerCase() === 'am' && hours === 12) hours = 0;
    
    trainingDate.setHours(hours, minutes, 0, 0);
    return trainingDate;
  };

  useEffect(() => {
    const training = trainings.find(t => t.id === exam.trainingId);
    if (!training || exam.isPublished || exam.dispatchedAt) return;

    const interval = setInterval(() => {
      const endTime = getTrainingEndTime(training);
      const dispatchTime = new Date(endTime.getTime() + 6 * 60 * 60 * 1000);
      const remaining = dispatchTime.getTime() - Date.now();
      if (remaining <= 0) {
        setCountdown('¡Listo para enviar!');
        clearInterval(interval);
      } else {
        const h = Math.floor(remaining / 3600000);
        const m = Math.floor((remaining % 3600000) / 60000);
        setCountdown(`${h}h ${m}m`);
      }
    }, 1000); // Check every second for more accuracy
    return () => clearInterval(interval);
  }, [exam, trainings]);

  const handlePublish = () => {
    const publicLink = `${window.location.origin}/examen?id=${exam.id}`;
    onUpdateExam({
      ...exam,
      isPublished: true,
      publicLink,
      status: 'published'
    });
  };

  const handleUnpublish = () => {
    onUpdateExam({
      ...exam,
      isPublished: false,
      publicLink: undefined,
      status: 'draft'
    });
  };

  const handleCopyLink = () => {
    if (exam.publicLink) {
      navigator.clipboard.writeText(exam.publicLink);
      alert('Link copiado al portapapeles');
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <h3 className="font-bold text-lg text-slate-800 mb-4">Publicar</h3>
      {!exam.isPublished ? (
        <div>
          <p className="text-sm text-slate-500 mb-2">El examen aún no está publicado.</p>
          <p className="text-sm text-slate-500 mb-4">Asegúrate de tener al menos 1 pregunta antes de publicar.</p>
          <button 
            disabled={exam.questions.length === 0} 
            onClick={handlePublish}
            className="bg-catalina-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-catalina-forest-green disabled:bg-slate-300"
          >
            Publicar Examen
          </button>
        </div>
      ) : (
        <div>
          <p className="text-sm text-emerald-600 bg-emerald-50 p-3 rounded-lg mb-4">✅ Examen publicado y disponible</p>
          <div className="flex gap-2">
            <input readOnly value={exam.publicLink} className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm" />
            <button onClick={handleCopyLink} className="bg-slate-200 text-slate-800 px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-300">Copiar Link</button>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-200">
            <h4 className="font-bold text-slate-800 mb-3">Estado de envío automático</h4>
            {exam.dispatchedAt ? (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-sm">
                <p className="text-emerald-800 font-semibold">✅ Link enviado a {exam.sentTo?.length || 0} participantes</p>
                <p className="text-emerald-600">📧 Email + 📱 WhatsApp — {new Date(exam.dispatchedAt).toLocaleString()}</p>
              </div>
            ) : exam.pendingDispatch ? (
              <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-sm">
                <p className="text-yellow-800 font-semibold">⚠️ Capacitación terminada</p>
                <p className="text-yellow-600">Al publicar, el link se enviará inmediatamente a los participantes elegibles.</p>
              </div>
            ) : countdown && !exam.isPublished ? (
              <div className="p-3 rounded-lg bg-sky-50 border border-sky-200 text-sm">
                <p className="text-sky-800 font-semibold">⏳ Envío automático en: {countdown}</p>
                <p className="text-sky-600">Se enviará a los participantes con estado LINK_SENT.</p>
              </div>
            ) : exam.isPublished && !exam.dispatchedAt ? (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                 <p className="text-slate-600">El envío está siendo procesado...</p>
              </div>
            ) : (
              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-sm">
                 <p className="text-slate-600">El envío se programará 6 horas después de finalizar la capacitación.</p>
              </div>
            )}
          </div>

          <button onClick={handleUnpublish} className="mt-4 text-sm text-red-600 hover:underline">Despublicar</button>
        </div>
      )}
    </div>
  );
};
