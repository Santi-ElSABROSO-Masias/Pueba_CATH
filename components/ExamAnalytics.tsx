import React, { useState, useMemo } from 'react';
import { Exam, ExamResult, UserRole } from '../types';
import { useExamStats } from '../utils/useExamStats';
import { DonutChart } from './DonutChart';

interface ExamAnalyticsProps {
  exam: Exam;
  currentUserRole: UserRole;
}

const VariationBadge: React.FC<{ value: number; text: string }> = ({ value, text }) => (
  <span className={`text-sm font-medium ${value >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
    {value >= 0 ? '↑' : '↓'} {Math.abs(value)} {text}
  </span>
);

export const ExamAnalytics: React.FC<ExamAnalyticsProps> = ({ exam, currentUserRole }) => {
  const stats = useExamStats(exam.results);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notifyAdmin, setNotifyAdmin] = useState(false);

  const filteredResults = useMemo(() => {
    return exam.results
      .filter(r => {
        if (statusFilter === 'all') return true;
        return statusFilter === 'passed' ? r.passed : !r.passed;
      })
      .filter(r => 
        r.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        r.dni.toLowerCase().includes(searchTerm.toLowerCase())
      );
  }, [exam.results, searchTerm, statusFilter]);

  const handleExportResults = () => {
    const headers = ['Nombre', 'DNI', 'Puntaje', 'Estado', 'Fecha y hora'];
    const rows = filteredResults.map(r => [
      r.participantName,
      r.dni,
      `${r.score.toFixed(0)}%`,
      r.passed ? 'Aprobó' : 'Reprobó',
      new Date(r.completedAt).toLocaleString('es-PE'),
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `resultados_${exam.trainingTitle.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (exam.results.length === 0) {
    return <div className="text-center p-10 bg-slate-50 rounded-2xl">Aún no hay participaciones para este examen.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Calificación</h3>
          <div className="flex items-center justify-center">
            <DonutChart passed={stats.passRate} failed={stats.failRate} size={160} />
          </div>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-emerald-500 mr-2"></span>Aprobado</span>
              <span className="font-semibold">{stats.passRate}% ({stats.totalPassed})</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center"><span className="h-2 w-2 rounded-full bg-violet-500 mr-2"></span>Desaprobado</span>
              <span className="font-semibold">{stats.failRate}% ({stats.totalFailed})</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Total participaciones</h3>
          <p className="text-4xl font-bold text-slate-800">{stats.totalParticipations}</p>
          <div className="mt-2">
            <VariationBadge value={stats.lastMonthCount} text="en el último mes" />
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
          <h3 className="text-sm font-medium text-slate-500 mb-4">Puntuación media</h3>
          <p className="text-4xl font-bold text-slate-800">{stats.averageScore}%</p>
          <div className="mt-2">
            <VariationBadge value={stats.scoreVariation} text="% vs mes anterior" />
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
        <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
          <h3 className="text-lg font-bold text-slate-800">Resultados individuales</h3>
          <button onClick={handleExportResults} className="text-sm bg-slate-100 text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-200 font-medium">Exportar CSV</button>
        </div>
        <div className="flex flex-wrap gap-4 mb-4">
          <input 
            type="text"
            placeholder="Buscar por nombre o DNI..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border border-slate-200 text-sm"
          />
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-4 py-2 rounded-lg border border-slate-200 text-sm bg-white"
          >
            <option value="all">Todos</option>
            <option value="passed">Solo Aprobados</option>
            <option value="failed">Solo Reprobados</option>
          </select>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th className="px-6 py-3">Nombre</th>
                <th className="px-6 py-3">DNI</th>
                <th className="px-6 py-3">Puntaje</th>
                <th className="px-6 py-3">Estado</th>
                <th className="px-6 py-3">Fecha y hora</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map(r => (
                <tr key={r.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900">{r.participantName}</td>
                  <td className="px-6 py-4">{r.dni}</td>
                  <td className="px-6 py-4 font-semibold">{r.score.toFixed(0)}%</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${r.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {r.passed ? '✅ Aprobó' : '❌ Reprobó'}
                    </span>
                  </td>
                  <td className="px-6 py-4">{new Date(r.completedAt).toLocaleString('es-PE')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configurations */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80">
        <h3 className="text-lg font-bold text-slate-800 mb-4">Configuraciones</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
            <span className="font-medium">⚙️ Integraciones</span>
            <span className="text-sm text-slate-500">Próximamente: integración con Microsoft Teams</span>
          </div>
          <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50">
            <span className="font-medium">🔔 Notificaciones</span>
            <label className="flex items-center cursor-pointer">
              <span className="mr-3 text-sm text-slate-600">Notificar al admin por cada resultado</span>
              <div className="relative">
                <input type="checkbox" checked={notifyAdmin} onChange={() => setNotifyAdmin(!notifyAdmin)} className="sr-only" />
                <div className={`block w-10 h-6 rounded-full ${notifyAdmin ? 'bg-indigo-600' : 'bg-slate-300'}`}></div>
                <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${notifyAdmin ? 'transform translate-x-4' : ''}`}></div>
              </div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};
