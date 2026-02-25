import React, { useState, useEffect, useCallback } from 'react';
import { Exam, ExamResult } from '../types';

interface PublicExamProps {
  examId: string;
  onSubmitResult: (examId: string, result: Omit<ExamResult, 'id' | 'examId' | 'completedAt'>) => void;
}

const getExamFromStorage = (examId: string): Exam | null => {
  const saved = localStorage.getItem('eventmanager_exams');
  if (!saved) return null;
  const exams: Exam[] = JSON.parse(saved);
  return exams.find(e => e.publicLink?.endsWith(examId)) || null;
};

type ExamStage = 'welcome' | 'info' | 'password' | 'taking' | 'result';

export const PublicExam: React.FC<PublicExamProps> = ({ examId, onSubmitResult }) => {
  const [exam, setExam] = useState<Exam | null>(null);

  useEffect(() => {
    const examFromStorage = getExamFromStorage(examId);
    setExam(examFromStorage);
  }, [examId]);
  const [stage, setStage] = useState<ExamStage>('welcome');
  const [formData, setFormData] = useState({ name: '', dni: '', email: '', organization: '' });
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (exam) {
      setTimeLeft(exam.timeLimit * 60);
    }
  }, [exam]);
  const [finalResult, setFinalResult] = useState<ExamResult | null>(null);

  const handleSubmit = useCallback(() => {
    if (!exam) return;

    const correctAnswers = exam.questions.filter(q => answers[q.id] === q.correctAnswer).length;
    const score = exam.questions.length > 0 ? (correctAnswers / exam.questions.length) * 100 : 0;
    const passed = score >= exam.minPassingScore;

    const result: Omit<ExamResult, 'id' | 'examId' | 'completedAt'> = {
      participantName: formData.name,
      dni: formData.dni,
      score,
      passed,
    };
    onSubmitResult(exam.id, result);
    setFinalResult({ ...result, id: '', examId: exam.id, completedAt: new Date().toISOString() });
    setStage('result');
  }, [exam, answers, formData, onSubmitResult]);

  if (!exam) {
    return <div className="flex items-center justify-center h-screen bg-slate-100 text-slate-700">Examen no encontrado o no disponible.</div>;
  }

  useEffect(() => {
    if (stage !== 'taking') return;
    if (timeLeft === 0) {
      handleSubmit();
      return;
    }
    const timer = setInterval(() => setTimeLeft(t => t - 1), 1000);
    return () => clearInterval(timer);
  }, [stage, timeLeft, handleSubmit]);

  const handleStart = () => {
    if (exam.results.some(r => r.dni === formData.dni)) {
      setError('Ya rendiste este examen anteriormente.');
      return;
    }
    setError('');
    if (exam.requiresPassword) {
      setStage('password');
    } else {
      setStage('taking');
    }
  };

  const handlePasswordCheck = () => {
    if (password === exam.password) {
      setStage('taking');
      setError('');
    } else {
      setError('Contraseña incorrecta.');
    }
  };

  const renderStage = () => {
    switch (stage) {
      case 'welcome':
        return (
          <div className="text-center">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{exam.trainingTitle}</h1>
            <p className="text-slate-500 mb-6">Tiempo límite: {exam.timeLimit} minutos.</p>
            <button onClick={() => setStage('info')} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">Iniciar</button>
          </div>
        );
      case 'info':
        return (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Información del Participante</h2>
            <div className="space-y-4 mb-6 text-left">
              {exam.participantFields.name && <input type="text" placeholder="Nombre Completo" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full p-2 border rounded" required />}
              {exam.participantFields.dni && <input type="text" placeholder="DNI" value={formData.dni} onChange={e => setFormData({...formData, dni: e.target.value})} className="w-full p-2 border rounded" required />}
              {exam.participantFields.email && <input type="email" placeholder="Email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full p-2 border rounded" />}
              {exam.participantFields.organization && <input type="text" placeholder="Organización" value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} className="w-full p-2 border rounded" />}
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button onClick={handleStart} disabled={!formData.name || !formData.dni} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:bg-slate-300">Continuar</button>
          </div>
        );
      case 'password':
        return (
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Contraseña Requerida</h2>
            <input type="password" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} className="w-full p-2 border rounded mb-4" />
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button onClick={handlePasswordCheck} className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700">Ingresar</button>
          </div>
        );
      case 'taking':
        return (
          <div className="max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <h1 className="text-xl font-bold text-slate-900">{exam.trainingTitle}</h1>
              <div className="text-lg font-bold text-indigo-600">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</div>
            </div>
            <div className="space-y-6">
              {exam.questions.map((q, index) => (
                <div key={q.id}>
                  <p className="font-semibold">{index + 1}. {q.text}</p>
                  <div className="mt-2 space-y-2">
                    {q.options.map((opt, i) => (
                      <label key={i} className="flex items-center p-3 rounded-lg border border-slate-200 has-[:checked]:bg-indigo-50 has-[:checked]:border-indigo-300">
                        <input type="radio" name={q.id} value={i} onChange={() => setAnswers(prev => ({ ...prev, [q.id]: i }))} className="h-4 w-4 text-indigo-600 border-slate-300 focus:ring-indigo-500" />
                        <span className="ml-3 text-sm text-slate-800">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 text-center">
              <button onClick={handleSubmit} className="bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700">Finalizar y Enviar</button>
            </div>
          </div>
        );
      case 'result':
        return (
          <div className="text-center">
            {finalResult?.passed ? (
              <div className="text-emerald-600 text-5xl mb-4">✅</div>
            ) : (
              <div className="text-red-600 text-5xl mb-4">❌</div>
            )}
            <h2 className="text-2xl font-bold">{finalResult?.passed ? 'APROBADO' : 'REPROBADO'}</h2>
            <p className="text-lg">Tu puntaje: {finalResult?.score.toFixed(2)}%</p>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        {renderStage()}
      </div>
    </div>
  );
};
