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
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <i className="fas fa-exclamation-triangle text-3xl text-slate-400"></i>
          </div>
          <h1 className="text-2xl font-black text-slate-700 mb-2">Examen no disponible</h1>
          <p className="text-slate-500">Este enlace no es válido o el examen ha expirado.</p>
        </div>
      </div>
    );
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

  const today = new Date();
  const formattedDate = today.toLocaleDateString('es-PE', { day: 'numeric', month: 'short', year: 'numeric' });

  const answeredCount = Object.keys(answers).length;
  const totalQuestions = exam.questions.length;
  const progress = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;

  const renderStage = () => {
    switch (stage) {
      case 'welcome':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            {/* Header bar */}
            <div className="bg-slate-900 text-white">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-hard-hat text-lg"></i>
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-wide">CATALINA HUANCA</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sociedad Minera S.A.C.</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Disponible</p>
                  <p className="text-sm font-semibold text-emerald-400">{formattedDate}</p>
                </div>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-4xl mx-auto px-6 py-10">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">

                {/* Banner visual */}
                <div className="relative bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 p-8 md:p-12 text-white overflow-hidden">
                  {/* Patrón decorativo */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2"></div>
                  </div>

                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-4">
                      <span className="bg-white/20 backdrop-blur-sm text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
                        Evaluación de Seguridad
                      </span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">{exam.trainingTitle}</h1>
                    <p className="text-emerald-200 text-sm max-w-lg">
                      Marcar la alternativa o alternativas correctas para cada pregunta.
                    </p>
                  </div>
                </div>

                {/* Info cards */}
                <div className="p-8 md:p-12">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-catalina-green/10 text-catalina-green rounded-xl flex items-center justify-center">
                        <i className="fas fa-clock text-xl"></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Tiempo Límite</p>
                        <p className="text-xl font-black text-slate-900">{exam.timeLimit} min</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                        <i className="fas fa-list-ol text-xl"></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Preguntas</p>
                        <p className="text-xl font-black text-slate-900">{exam.questions.length}</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 flex items-center gap-4">
                      <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                        <i className="fas fa-award text-xl"></i>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nota Mínima</p>
                        <p className="text-xl font-black text-slate-900">{exam.minPassingScore}%</p>
                      </div>
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 mb-10">
                    <div className="flex items-start gap-3">
                      <i className="fas fa-info-circle text-amber-500 mt-0.5"></i>
                      <div className="text-sm text-amber-800 space-y-1">
                        <p className="font-bold">Instrucciones importantes:</p>
                        <ul className="list-disc list-inside space-y-1 text-amber-700">
                          <li>Lee cada pregunta cuidadosamente antes de responder</li>
                          <li>Una vez iniciado, el temporizador no se puede pausar</li>
                          <li>Si el tiempo se agota, el examen se envía automáticamente</li>
                          <li>Solo tienes <strong>un intento</strong> por evaluación</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Slogan */}
                  <div className="text-center mb-8">
                    <p className="text-sm text-slate-400 italic">"Seguridad, compromiso de uno, responsabilidad de todos"</p>
                  </div>

                  {/* CTA */}
                  <div className="text-center">
                    <button
                      onClick={() => setStage('info')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-xl shadow-emerald-200 transition-all hover:shadow-2xl hover:shadow-emerald-300 hover:-translate-y-0.5 flex items-center gap-3 mx-auto"
                    >
                      <i className="fas fa-play-circle"></i>
                      Iniciar Evaluación
                    </button>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="text-center mt-8">
                <p className="text-xs text-slate-400">Plataforma de Evaluación • Catalina Huanca S.A.C.</p>
              </div>
            </div>
          </div>
        );

      case 'info':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30">
            {/* Header bar */}
            <div className="bg-slate-900 text-white">
              <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-hard-hat text-lg"></i>
                  </div>
                  <div>
                    <p className="font-bold text-sm tracking-wide">CATALINA HUANCA</p>
                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Sociedad Minera S.A.C.</p>
                  </div>
                </div>
                <p className="text-sm text-slate-400">{exam.trainingTitle}</p>
              </div>
            </div>

            <div className="max-w-lg mx-auto px-6 py-10">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-10">

                {/* Step indicator */}
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                  <div className="flex-1 h-1 bg-slate-200 rounded-full">
                    <div className="h-1 bg-emerald-500 rounded-full w-0"></div>
                  </div>
                  <div className="w-8 h-8 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                </div>

                <div className="text-center mb-8">
                  <div className="w-16 h-16 bg-catalina-green/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <i className="fas fa-user-edit text-2xl text-catalina-green"></i>
                  </div>
                  <h2 className="text-2xl font-black text-slate-900 mb-1">Datos del Participante</h2>
                  <p className="text-sm text-slate-500">Ingresa tus datos para iniciar la evaluación</p>
                </div>

                <div className="space-y-4 mb-8">
                  {exam.participantFields.name && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Nombres y Apellidos <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="Ej. Juan Pérez García"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                        required
                      />
                    </div>
                  )}
                  {exam.participantFields.dni && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">DNI <span className="text-red-400">*</span></label>
                      <input
                        type="text"
                        placeholder="00000000"
                        maxLength={8}
                        value={formData.dni}
                        onChange={e => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all font-mono"
                        required
                      />
                    </div>
                  )}
                  {exam.participantFields.email && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Correo Electrónico</label>
                      <input
                        type="email"
                        placeholder="tu@empresa.com"
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  )}
                  {exam.participantFields.organization && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Empresa / Organización</label>
                      <input
                        type="text"
                        placeholder="Nombre de tu empresa"
                        value={formData.organization}
                        onChange={e => setFormData({ ...formData, organization: e.target.value })}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all"
                      />
                    </div>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700">
                    <i className="fas fa-exclamation-circle"></i>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <button
                  onClick={handleStart}
                  disabled={!formData.name || !formData.dni}
                  className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none flex items-center justify-center gap-2"
                >
                  <i className="fas fa-arrow-right"></i>
                  Continuar
                </button>
              </div>
            </div>
          </div>
        );

      case 'password':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 md:p-10">

              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <i className="fas fa-lock text-2xl text-amber-600"></i>
                </div>
                <h2 className="text-2xl font-black text-slate-900 mb-1">Acceso Restringido</h2>
                <p className="text-sm text-slate-500">Ingresa la contraseña proporcionada por tu capacitador</p>
              </div>

              <div className="mb-6">
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">Contraseña</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400 transition-all text-center text-lg tracking-widest"
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-4 mb-6 flex items-center gap-3 text-red-700">
                  <i className="fas fa-exclamation-circle"></i>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                onClick={handlePasswordCheck}
                className="w-full bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
              >
                <i className="fas fa-unlock-alt"></i>
                Ingresar
              </button>
            </div>
          </div>
        );

      case 'taking':
        return (
          <div className="min-h-screen bg-slate-50">
            {/* Sticky top bar */}
            <div className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
              <div className="max-w-4xl mx-auto px-6 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                    <i className="fas fa-hard-hat text-sm text-white"></i>
                  </div>
                  <div>
                    <p className="font-bold text-sm text-slate-900 leading-tight">{exam.trainingTitle}</p>
                    <p className="text-[10px] text-slate-400">{formData.name} • DNI: {formData.dni}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress */}
                  <div className="hidden md:flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">{answeredCount}/{totalQuestions}</span>
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-2 bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    </div>
                  </div>

                  {/* Timer */}
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-lg font-bold ${timeLeft <= 60 ? 'bg-red-50 text-red-600 animate-pulse' : timeLeft <= 180 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-700'}`}>
                    <i className={`fas fa-clock text-sm ${timeLeft <= 60 ? 'text-red-400' : 'text-slate-400'}`}></i>
                    {Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}
                  </div>
                </div>
              </div>
            </div>

            {/* Questions */}
            <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
              {exam.questions.map((q, index) => (
                <div key={q.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                  {/* Question header */}
                  <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center text-sm font-bold">{index + 1}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pregunta {index + 1} de {totalQuestions}</span>
                    </div>
                    {answers[q.id] !== undefined && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md flex items-center gap-1">
                        <i className="fas fa-check text-[8px]"></i> Respondida
                      </span>
                    )}
                  </div>

                  <div className="p-6">
                    <p className="text-base font-semibold text-slate-800 mb-4 leading-relaxed">{q.text}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, i) => (
                        <label
                          key={i}
                          className={`flex items-center p-4 rounded-xl border-2 cursor-pointer transition-all ${answers[q.id] === i
                              ? 'bg-emerald-50 border-emerald-400 shadow-sm'
                              : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                            }`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            value={i}
                            checked={answers[q.id] === i}
                            onChange={() => setAnswers(prev => ({ ...prev, [q.id]: i }))}
                            className="h-4 w-4 text-emerald-600 border-slate-300 focus:ring-emerald-500"
                          />
                          <span className={`ml-3 text-sm ${answers[q.id] === i ? 'text-emerald-800 font-semibold' : 'text-slate-700'}`}>
                            <span className="font-bold text-slate-400 mr-2">{String.fromCharCode(65 + i)}.</span>
                            {opt}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              {/* Submit */}
              <div className="py-8 text-center">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <p className="text-sm text-slate-500 mb-4">
                    Has respondido <strong className="text-emerald-600">{answeredCount}</strong> de <strong>{totalQuestions}</strong> preguntas
                  </p>
                  <button
                    onClick={handleSubmit}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-10 py-4 rounded-2xl font-bold text-base shadow-xl shadow-emerald-200 transition-all hover:shadow-2xl hover:shadow-emerald-300 hover:-translate-y-0.5 flex items-center gap-3 mx-auto"
                  >
                    <i className="fas fa-paper-plane"></i>
                    Finalizar y Enviar
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'result':
        return (
          <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
                {/* Result header */}
                <div className={`p-8 text-center ${finalResult?.passed ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-gradient-to-br from-red-500 to-rose-600'} text-white`}>
                  <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                    {finalResult?.passed ? (
                      <i className="fas fa-check-circle text-4xl"></i>
                    ) : (
                      <i className="fas fa-times-circle text-4xl"></i>
                    )}
                  </div>
                  <h2 className="text-3xl font-black mb-1">
                    {finalResult?.passed ? 'APROBADO' : 'REPROBADO'}
                  </h2>
                  <p className="text-white/80 text-sm">{exam.trainingTitle}</p>
                </div>

                <div className="p-8">
                  {/* Score */}
                  <div className="text-center mb-6">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tu Puntaje</p>
                    <p className="text-5xl font-black text-slate-900">{finalResult?.score.toFixed(1)}<span className="text-2xl text-slate-400">%</span></p>
                    <p className="text-xs text-slate-400 mt-1">Nota mínima: {exam.minPassingScore}%</p>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Participante</p>
                      <p className="text-sm font-bold text-slate-700 mt-1">{formData.name}</p>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4 text-center">
                      <p className="text-[10px] font-bold text-slate-400 uppercase">DNI</p>
                      <p className="text-sm font-bold text-slate-700 font-mono mt-1">{formData.dni}</p>
                    </div>
                  </div>

                  <div className={`rounded-xl p-4 text-center text-sm font-semibold ${finalResult?.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
                    {finalResult?.passed
                      ? '✅ Has completado satisfactoriamente la evaluación. Tu resultado ha sido registrado.'
                      : '❌ No alcanzaste la nota mínima requerida. Consulta con tu capacitador para más información.'
                    }
                  </div>
                </div>
              </div>

              <div className="text-center mt-6">
                <p className="text-xs text-slate-400">"Seguridad, compromiso de uno, responsabilidad de todos"</p>
                <p className="text-[10px] text-slate-300 mt-1">Catalina Huanca S.A.C.</p>
              </div>
            </div>
          </div>
        );
    }
  };

  // For stages that include their own page wrapper 
  if (stage === 'welcome' || stage === 'info' || stage === 'taking' || stage === 'result' || stage === 'password') {
    return <>{renderStage()}</>;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl p-8 bg-white rounded-3xl border border-slate-200 shadow-sm">
        {renderStage()}
      </div>
    </div>
  );
};
