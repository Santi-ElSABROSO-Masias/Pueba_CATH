import React, { useState, useRef } from 'react';
import { Exam, Question, Training } from '../../../../types';
import * as XLSX from 'xlsx';
import * as mammoth from 'mammoth';

interface QuestionBankProps {
  exam: Exam;
  trainings: Training[];
  currentUserRole: 'super_super_admin' | 'super_admin' | 'admin_contratista';
  onUpdateExam: (updatedExam: Exam) => void;
}

export const QuestionBank: React.FC<QuestionBankProps> = ({ exam, trainings, currentUserRole, onUpdateExam }) => {
  if (!trainings || !Array.isArray(trainings) || trainings.length === 0) return <div className="p-8 text-center text-slate-500">No hay capacitaciones disponibles</div>;
  const [activeTab, setActiveTab] = useState('resumen');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  const handleOpenModal = (question: Question | null = null) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (questionData: Omit<Question, 'id' | 'type'>) => {
    let updatedQuestions;
    if (editingQuestion) {
      updatedQuestions = exam.questions.map(q =>
        q.id === editingQuestion.id ? { ...q, ...questionData, type: 'multiple' as const } : q
      );
    } else {
      const newQuestion: Question = {
        ...questionData,
        id: `q_${Date.now()}`,
        type: 'multiple',
      };
      updatedQuestions = [...exam.questions, newQuestion];
    }
    onUpdateExam({ ...exam, questions: updatedQuestions });
    setIsModalOpen(false);
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta pregunta?')) {
      const updatedQuestions = exam.questions.filter(q => q.id !== questionId);
      onUpdateExam({ ...exam, questions: updatedQuestions });
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-slate-200">
      <div className="border-b border-slate-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          {['Resumen', 'Importar', 'Exportar'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab.toLowerCase().replace(' ', '_'))}
              className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === tab.toLowerCase().replace(' ', '_')
                ? 'border-catalina-green text-catalina-green'
                : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                }`}>
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'resumen' && (
        <div>
          <div className="flex justify-between items-center mb-4">
            <input type="text" placeholder="Filtrar por Pregunta..." className="w-1/3 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-1 focus:ring-catalina-green" />
            {currentUserRole === 'super_super_admin' && (
              <button onClick={() => handleOpenModal()} className="bg-catalina-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-catalina-forest-green">Crear nueva pregunta</button>
            )}
          </div>
          <table className="w-full text-left">
            <thead>
              <tr className="text-xs text-slate-500 bg-slate-50">
                <th className="p-3">#</th>
                <th className="p-3">Pregunta</th>
                <th className="p-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {exam.questions.map((q, index) => (
                <tr key={q.id} className="border-b border-slate-100">
                  <td className="p-3 text-sm text-slate-500">{index + 1}</td>
                  <td className="p-3 text-sm text-slate-800">{q.text}</td>
                  <td className="p-3">
                    {currentUserRole === 'super_super_admin' && (
                      <div className="flex gap-2">
                        <button onClick={() => handleOpenModal(q)} className="text-slate-400 hover:text-catalina-green">Editar</button>
                        <button onClick={() => handleDeleteQuestion(q.id)} className="text-slate-400 hover:text-red-600">Eliminar</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'importar' && <ImportTab exam={exam} trainings={trainings} onUpdateExam={onUpdateExam} currentUserRole={currentUserRole} />}

      {isModalOpen &&
        <QuestionModal
          trainings={trainings}
          question={editingQuestion}
          onSave={handleSaveQuestion}
          onClose={() => setIsModalOpen(false)}
        />
      }
    </div>
  );
};

// Import Tab Component
const ImportTab: React.FC<QuestionBankProps> = ({ exam, trainings, onUpdateExam }) => {
  const [importSource, setImportSource] = useState<'none' | 'excel' | 'word' | 'drive'>('none');
  const [previewQuestions, setPreviewQuestions] = useState<Partial<Question>[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [driveUrl, setDriveUrl] = useState('');
  const [driveStatus, setDriveStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [driveError, setDriveError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setPreviewQuestions([]);
    setErrors([]);
    setDriveUrl('');
    setDriveStatus('idle');
    setDriveError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  const handleSourceSelection = (source: 'excel' | 'word' | 'drive') => {
    resetState();
    setImportSource(source);
  }

  const validateRow = (row: any, index: number, trainings: Training[]) => {
    const rowErrors: string[] = [];
    if (!row['Pregunta']) rowErrors.push(`Fila ${index + 2}: falta el enunciado`);
    if (!row['Opción A']) rowErrors.push(`Fila ${index + 2}: falta Opción A`);
    if (!row['Opción B']) rowErrors.push(`Fila ${index + 2}: falta Opción B`);
    if (!row['Opción C']) rowErrors.push(`Fila ${index + 2}: falta Opción C`);
    if (!row['Opción D']) rowErrors.push(`Fila ${index + 2}: falta Opción D`);
    if (!['A', 'B', 'C', 'D'].includes(row['Correcta']?.toUpperCase()))
      rowErrors.push(`Fila ${index + 2}: "Correcta" debe ser A, B, C o D`);
    const trainingExists = trainings.some(t => t.title === row['Capacitación']);
    if (!trainingExists)
      rowErrors.push(`Fila ${index + 2}: la capacitación "${row['Capacitación']}" no existe`);
    return rowErrors;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (importSource === 'excel') {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
          processData(worksheet);
        } else if (importSource === 'word') {
          mammoth.extractRawText({ arrayBuffer: event.target?.result as ArrayBuffer })
            .then(result => {
              const parsed = parseWordContent(result.value);
              processData(parsed, true);
            })
            .catch(err => setErrors(['Error al leer el archivo Word.']));
        }
      } catch (err) {
        setErrors(['Error al procesar el archivo. Asegúrate de que el formato es correcto.']);
      }
    };

    if (importSource === 'excel') {
      reader.readAsArrayBuffer(file);
    } else if (importSource === 'word') {
      reader.readAsArrayBuffer(file);
    }
  };

  const parseWordContent = (text: string) => {
    const blocks = text.split(/\n\s*\n/);  // Separar por bloques vacíos
    return blocks.map(block => {
      const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
      const text = lines[0]?.replace(/^\d+\.\s*/, '');
      const optionA = lines[1]?.replace(/^A\)\s*/, '');
      const optionB = lines[2]?.replace(/^B\)\s*/, '');
      const optionC = lines[3]?.replace(/^C\)\s*/, '');
      const optionD = lines[4]?.replace(/^D\)\s*/, '');
      const correctaRaw = lines[5]?.replace(/^Respuesta:\s*/i, '').toUpperCase();
      const tag = lines[6]?.replace(/^Capacitación:\s*/i, '');
      return {
        'Pregunta': text,
        'Opción A': optionA,
        'Opción B': optionB,
        'Opción C': optionC,
        'Opción D': optionD,
        'Correcta': correctaRaw,
        'Capacitación': tag
      };
    });
  };

  const processData = (data: any[], isWord = false) => {
    const allErrors: string[] = [];
    const questionsToPreview: Partial<Question>[] = [];

    data.forEach((row, index) => {
      const rowErrors = validateRow(row, index, trainings);
      if (rowErrors.length > 0) {
        allErrors.push(...rowErrors);
      } else {
        const correctAnswerIndex = ['A', 'B', 'C', 'D'].indexOf(row['Correcta'].toUpperCase());
        questionsToPreview.push({
          text: row['Pregunta'],
          options: [row['Opción A'], row['Opción B'], row['Opción C'], row['Opción D']],
          correctAnswer: correctAnswerIndex,
          trainingTag: row['Capacitación'],
        });
      }
    });

    setErrors(allErrors);
    setPreviewQuestions(questionsToPreview);
  };

  const handleConfirmImport = () => {
    const newQuestions = previewQuestions.filter(pq => !errors.length).map(pq => ({
      ...pq,
      id: `q_${Date.now()}_${Math.random()}`,
      type: 'multiple',
    })) as Question[];

    const uniqueNewQuestions = newQuestions.filter(
      (q) => !exam.questions.some((eq) => eq.text === q.text)
    );

    onUpdateExam({ ...exam, questions: [...exam.questions, ...uniqueNewQuestions] });
    setImportSource('none');
    resetState();
  };

  const handleDownloadTemplate = () => {
    const template = [
      ['Pregunta', 'Opción A', 'Opción B', 'Opción C', 'Opción D', 'Correcta', 'Capacitación'],
      ['¿Ejemplo de pregunta?', 'Resp A', 'Resp B', 'Resp C', 'Resp D', 'A', 'Inducción Básica']
    ];
    const ws = XLSX.utils.aoa_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Plantilla');
    XLSX.writeFile(wb, 'plantilla_preguntas.xlsx');
  };

  const handleGoogleDriveImport = async () => {
    const docId = driveUrl.match(/\/d\/([a-zA-Z0-9-_]+)/)?.[1];
    if (!docId) {
      setDriveError('URL inválida. Asegúrate de pegar el link completo del documento.');
      return;
    }
    setDriveStatus('loading');
    setDriveError('');
    const exportUrl = `https://docs.google.com/document/d/${docId}/export?format=txt`;
    try {
      const response = await fetch(exportUrl);
      if (!response.ok) throw new Error('No se pudo acceder al documento');
      const text = await response.text();
      const parsed = parseWordContent(text);
      processData(parsed, true);
      setDriveStatus('success');
    } catch (err) {
      setDriveError('No se pudo acceder. Verifica que el documento sea público.');
      setDriveStatus('error');
    }
  };

  return (
    <div>
      {importSource === 'none' && (
        <div className="text-center">
          <h3 className="text-lg font-medium mb-4">¿Desde dónde quieres importar preguntas?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button onClick={() => handleSourceSelection('excel')} className="p-6 border rounded-lg hover:bg-slate-50">
              <span className="text-4xl">📊</span>
              <h4 className="font-bold mt-2">Excel</h4>
              <p className="text-sm text-slate-500">.xlsx / .xls (Recomendado)</p>
            </button>
            <button onClick={() => handleSourceSelection('word')} className="p-6 border rounded-lg hover:bg-slate-50">
              <span className="text-4xl">📄</span>
              <h4 className="font-bold mt-2">Word</h4>
              <p className="text-sm text-slate-500">.docx (Beta)</p>
            </button>
            <button onClick={() => handleSourceSelection('drive')} className="p-6 border rounded-lg hover:bg-slate-50">
              <span className="text-4xl">☁️</span>
              <h4 className="font-bold mt-2">Google Drive</h4>
              <p className="text-sm text-slate-500">Google Docs (Requiere acceso)</p>
            </button>
          </div>
        </div>
      )}

      {importSource !== 'none' && (
        <div>
          <button onClick={() => setImportSource('none')} className="text-sm text-catalina-green hover:underline mb-4">{'< Cambiar fuente'}</button>

          {importSource === 'excel' && (
            <div>
              <h4 className="font-bold mb-2">Importar desde Excel</h4>
              <button onClick={handleDownloadTemplate} className="text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 font-medium mb-4">Descargar plantilla</button>
              <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} ref={fileInputRef} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
            </div>
          )}

          {importSource === 'word' && (
            <div>
              <h4 className="font-bold mb-2">Importar desde Word</h4>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4 text-sm">
                ⚠️ <strong>Modo Beta:</strong> El archivo Word debe seguir el formato exacto.
              </div>
              <input type="file" accept=".docx" onChange={handleFileUpload} ref={fileInputRef} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100" />
            </div>
          )}

          {importSource === 'drive' && (
            <div>
              <h4 className="font-bold mb-2">Importar desde Google Drive</h4>
              <div className="p-4 border rounded-lg bg-slate-50 text-sm">
                <p><strong>PASO 1:</strong> Abre tu Google Doc con las preguntas.</p>
                <p><strong>PASO 2:</strong> Ve a Archivo → Descargar → Microsoft Word (.docx).</p>
                <p><strong>PASO 3:</strong> Usa la opción "Importar Word" de arriba.</p>
                <hr className="my-2" />
                <p className="font-bold">O si tienes el link público del Doc:</p>
                <div className="flex gap-2 mt-2">
                  <input type="text" value={driveUrl} onChange={e => setDriveUrl(e.target.value)} placeholder="https://docs.google.com/..." className="flex-grow px-3 py-2 rounded-lg border border-slate-300 text-sm" />
                  <button onClick={handleGoogleDriveImport} disabled={driveStatus === 'loading'} className="bg-catalina-green text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-catalina-forest-green disabled:bg-catalina-green/40">
                    {driveStatus === 'loading' ? 'Conectando...' : 'Conectar'}
                  </button>
                </div>
                {driveStatus === 'error' && <p className="text-red-500 text-xs mt-1">{driveError}</p>}
                {driveStatus === 'success' && <p className="text-green-500 text-xs mt-1">✅ Documento encontrado: {previewQuestions.length} preguntas detectadas.</p>}
              </div>
            </div>
          )}

          {errors.length > 0 && (
            <div className="mt-4 bg-red-50 p-4 rounded-lg">
              <h4 className="font-bold text-red-700">Errores encontrados:</h4>
              <ul className="list-disc list-inside text-sm text-red-600">
                {errors.map((err, i) => <li key={i}>{err}</li>)}
              </ul>
            </div>
          )}

          {previewQuestions.length > 0 && !errors.length && (
            <div className="mt-4">
              <h4 className="font-bold mb-2">Previsualización: {previewQuestions.length} preguntas listas para importar.</h4>
              <div className="max-h-60 overflow-y-auto border rounded-lg">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 sticky top-0">
                    <tr>
                      <th className="p-2">#</th>
                      <th className="p-2">Pregunta</th>
                      <th className="p-2">Capacitación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {previewQuestions.map((q, i) => (
                      <tr key={i} className="border-b">
                        <td className="p-2">{i + 1}</td>
                        <td className="p-2">{q.text}</td>
                        <td className="p-2">{q.trainingTag}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button onClick={resetState} className="px-4 py-2 rounded bg-slate-200 text-slate-800">Cancelar</button>
                <button onClick={handleConfirmImport} className="px-4 py-2 rounded bg-catalina-green text-white">Confirmar importación</button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Modal Component
interface QuestionModalProps {
  trainings: Training[];
  question: Question | null;
  onSave: (questionData: Omit<Question, 'id' | 'type'>) => void;
  onClose: () => void;
}

const QuestionModal: React.FC<QuestionModalProps> = ({ trainings, question, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    text: question?.text || '',
    options: question?.options || ['', '', '', ''],
    correctAnswer: question?.correctAnswer ?? -1,
    trainingTag: question?.trainingTag || '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.correctAnswer === -1) {
      alert('Por favor, marca una respuesta como correcta.');
      return;
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-lg">
        <form onSubmit={handleSubmit}>
          <h2 className="text-lg font-bold mb-4">{question ? 'Editar' : 'Nueva'} Pregunta</h2>
          <textarea
            value={formData.text}
            onChange={e => setFormData({ ...formData, text: e.target.value })}
            placeholder="Enunciado de la pregunta"
            className="w-full p-2 border rounded mb-4"
            required
          />
          <div className="space-y-2 mb-4">
            {formData.options.map((opt, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="correctAnswer"
                  checked={formData.correctAnswer === i}
                  onChange={() => setFormData({ ...formData, correctAnswer: i })}
                />
                <input
                  type="text"
                  value={opt}
                  onChange={e => {
                    const newOptions = [...formData.options] as [string, string, string, string];
                    newOptions[i] = e.target.value;
                    setFormData({ ...formData, options: newOptions });
                  }}
                  placeholder={`Opción ${String.fromCharCode(65 + i)}`}
                  className="w-full p-2 border rounded"
                  required
                />
              </div>
            ))}
          </div>
          <select
            value={formData.trainingTag}
            onChange={e => setFormData({ ...formData, trainingTag: e.target.value })}
            className="w-full p-2 border rounded mb-4"
            required
          >
            <option value="" disabled>Selecciona una capacitación</option>
            {trainings.map(t => <option key={t.id} value={t.title}>{t.title}</option>)}
          </select>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-slate-200 text-slate-800">Cancelar</button>
            <button type="submit" className="px-4 py-2 rounded bg-catalina-green text-white">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
};
