import React, { useState } from 'react';
import { Training, Exam, EventUser } from '../types';
import { QuestionBank } from './QuestionBank';
import { ExamAccess } from './ExamAccess';
import { ExamParticipantInfo } from './ExamParticipantInfo';
import { ExamPublish } from './ExamPublish';
import { ExamEmailShare } from './ExamEmailShare';
import { ExamAnalytics } from './ExamAnalytics';

interface EvaluacionesModuleProps {
  trainings: Training[];
  exams: Exam[];
  onCreateExam: (trainingId: string) => void;
  onUpdateExam: (updatedExam: Exam) => void;
  currentUserRole: 'super_super_admin' | 'super_admin' | 'admin_contratista';
  users: EventUser[];
}

type ActiveSection = 
  | 'home'
  | 'preguntas' 
  | 'puntuacion' 
  | 'certificacion' 
  | 'pagina_inicio'
  | 'acceso' 
  | 'participante' 
  | 'publicar' 
  | 'email' 
  | 'resultados';

export const EvaluacionesModule: React.FC<EvaluacionesModuleProps> = ({ 
  trainings, 
  exams, 
  onCreateExam,
  onUpdateExam,
  currentUserRole,
  users
}) => {
  const [selectedTrainingId, setSelectedTrainingId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<ActiveSection>('home');

  const selectedExam = selectedTrainingId ? exams.find(e => e.trainingId === selectedTrainingId) : null;

  const getProgressPercentage = () => {
    if (!selectedExam) return 0;
    let progress = 0;
    if (selectedExam.questions.length > 0) progress += 40;
    if (selectedExam.isPublished) progress += 30;
    if (selectedExam.results.length > 0) progress += 30;
    return progress;
  };

  const renderContent = () => {
    if (activeSection !== 'home' && selectedExam) {
      return (
        <div>
          <div className="mb-6 flex items-center gap-2 text-sm">
            <button 
              onClick={() => setActiveSection('home')}
              className="text-indigo-600 hover:text-indigo-700 font-medium"
            >
              ← Volver al panel principal
            </button>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 font-medium capitalize">
              {activeSection.replace('_', ' ')}
            </span>
          </div>
          {/* Placeholder for section content */}
          <div className="mt-4">
            {activeSection === 'preguntas' && selectedExam && (
              <QuestionBank 
                exam={selectedExam}
                trainings={trainings}
                currentUserRole={currentUserRole}
                onUpdateExam={onUpdateExam}
              />
            )}
            {activeSection === 'acceso' && selectedExam && <ExamAccess exam={selectedExam} onUpdateExam={onUpdateExam} />}
            {activeSection === 'participante' && selectedExam && <ExamParticipantInfo exam={selectedExam} onUpdateExam={onUpdateExam} />}
            {activeSection === 'publicar' && selectedExam && <ExamPublish exam={selectedExam} onUpdateExam={onUpdateExam} trainings={trainings} users={users} />}
            {activeSection === 'email' && selectedExam && <ExamEmailShare exam={selectedExam} />}
            {activeSection === 'resultados' && selectedExam && <ExamAnalytics exam={selectedExam} currentUserRole={currentUserRole} />}

            {!['preguntas', 'acceso', 'participante', 'publicar', 'email', 'resultados'].includes(activeSection) && (
              <div className="p-8 bg-slate-50 rounded-lg">
                <p>Contenido para la sección: {activeSection}</p>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (!selectedExam) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-6">
          <div className="w-20 h-20 rounded-full bg-indigo-100 flex items-center justify-center mb-4">
            <span className="text-4xl">📝</span>
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No hay un examen creado para esta capacitación</h3>
          <p className="text-slate-500 text-center mb-6 max-w-md">Crea un nuevo examen para evaluar a los participantes de esta capacitación.</p>
          <button 
            onClick={() => selectedTrainingId && onCreateExam(selectedTrainingId)}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          >
            Crear Nuevo Examen
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Columna Crear */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Crear</h3>
              <p className="text-xs text-slate-500">Configuración del examen</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => setActiveSection('preguntas')} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeSection === 'preguntas' ? 'bg-indigo-50 border-2 border-indigo-500' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">❓</span>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Preguntas</div>
                    <div className="text-xs text-slate-500">{selectedExam.questions.length} preguntas creadas</div>
                  </div>
                </div>
                {selectedExam.questions.length > 0 ? <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span> : <span className="text-slate-300">○</span>}
              </div>
            </button>
            <button onClick={() => setActiveSection('puntuacion')} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeSection === 'puntuacion' ? 'bg-indigo-50 border-2 border-indigo-500' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📊</span>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Puntuación</div>
                    <div className="text-xs text-slate-500">Mínimo {selectedExam.minPassingScore}% para aprobar</div>
                  </div>
                </div>
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>
              </div>
            </button>
          </div>
        </div>

        {/* Columna Compartir */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Compartir</h3>
              <p className="text-xs text-slate-500">Publicación y distribución</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => setActiveSection('acceso')} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeSection === 'acceso' ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🔐</span>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Acceso</div>
                    <div className="text-xs text-slate-500">{selectedExam.accessType === 'public' ? 'Público' : 'Con contraseña'}</div>
                  </div>
                </div>
                <span className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg></span>
              </div>
            </button>
            <button onClick={() => setActiveSection('publicar')} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeSection === 'publicar' ? 'bg-emerald-50 border-2 border-emerald-500' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">🚀</span>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Publicar</div>
                    <div className="text-xs text-slate-500">{selectedExam.isPublished ? 'Publicado' : 'No publicado'}</div>
                  </div>
                </div>
                {selectedExam.isPublished && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Activo</span>}
              </div>
            </button>
          </div>
        </div>

        {/* Columna Analizar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-slate-900">Analizar</h3>
              <p className="text-xs text-slate-500">Resultados y estadísticas</p>
            </div>
          </div>
          <div className="space-y-3">
            <button onClick={() => setActiveSection('resultados')} className={`w-full text-left px-4 py-3 rounded-lg transition-all ${activeSection === 'resultados' ? 'bg-violet-50 border-2 border-violet-500' : 'bg-slate-50 border border-slate-200 hover:bg-slate-100'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📈</span>
                  <div>
                    <div className="font-medium text-sm text-slate-900">Resultados</div>
                    <div className="text-xs text-slate-500">{selectedExam.results.length} participaciones</div>
                  </div>
                </div>
                {selectedExam.results.length > 0 && <span className="px-2 py-1 bg-violet-100 text-violet-700 text-xs rounded-full font-medium">{selectedExam.results.length}</span>}
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-8 bg-slate-100 rounded-3xl">
      <div className="max-w-md mb-8">
        <label htmlFor="training-select" className="block text-sm font-medium text-slate-700 mb-2">Selecciona una Capacitación</label>
        <select 
          id="training-select"
          value={selectedTrainingId || ''}
          onChange={e => setSelectedTrainingId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all shadow-sm"
        >
          <option value="" disabled>-- Elige una capacitación --</option>
          {trainings.map(t => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </select>
      </div>

      {selectedTrainingId && selectedExam && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Progreso del examen</span>
              {selectedExam.status === 'published' && <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Publicado</span>}
              {selectedExam.status === 'draft' && <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full">Borrador</span>}
            </div>
            <span className="text-sm font-bold text-indigo-600">{getProgressPercentage()}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div className="bg-indigo-600 h-2 rounded-full transition-all duration-300" style={{ width: `${getProgressPercentage()}%` }} />
          </div>
          <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
            <span>{selectedExam.questions.length > 0 ? '✓' : '○'} Preguntas</span>
            <span>{selectedExam.isPublished ? '✓' : '○'} Publicado</span>
            <span>{selectedExam.results.length > 0 ? '✓' : '○'} Resultados</span>
          </div>
        </div>
      )}

      {selectedTrainingId && renderContent()}
    </div>
  );
};
