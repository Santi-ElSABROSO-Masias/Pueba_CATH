import React, { useState, useEffect } from 'react';
import { MonthlySchedule, Training, EventUser } from '../types';
import { generateMonthlySchedule, getMonthlySchedules, updateMonthlySchedule } from '../utils/scheduleGenerator';
import { useAuth } from '../AuthContext';
import { DeadlineCountdown } from './DeadlineCountdown';
import { EditTrainingModal } from './EditTrainingModal';
import { useAutoCloseOnNavigate } from '../hooks/useAutoCloseOnNavigate';

interface MonthlyScheduleManagerProps {
  onScheduleGenerated?: (schedule: MonthlySchedule) => void;
  users?: EventUser[];
}

export function MonthlyScheduleManager({ onScheduleGenerated, users = [] }: MonthlyScheduleManagerProps) {
  const [currentSchedule, setCurrentSchedule] = useState<MonthlySchedule | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(false);
  const [editingTraining, setEditingTraining] = useState<Training | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; training: Training | null }>({ show: false, training: null });
  const { user, can } = useAuth();
  
  useAutoCloseOnNavigate('monthly-schedule-edit', !!editingTraining, () => setEditingTraining(null));
  useAutoCloseOnNavigate('monthly-schedule-delete', deleteConfirm.show, () => setDeleteConfirm({ show: false, training: null }));
  
  const isSuperSuperAdmin = user?.role === 'super_super_admin';
  
  useEffect(() => {
    loadSchedule();
  }, [selectedMonth, selectedYear]);
  
  async function loadSchedule() {
    setLoading(true);
    try {
      const schedules = await getMonthlySchedules();
      const found = schedules.find(s => s.month === selectedMonth && s.year === selectedYear);
      setCurrentSchedule(found || null);
    } catch (error) {
      console.error("Error loading schedule:", error);
    } finally {
      setLoading(false);
    }
  }
  
  async function handleGenerate() {
    if (!isSuperSuperAdmin) return;
    setLoading(true);
    try {
      const schedule = await generateMonthlySchedule(selectedMonth, selectedYear);
      setCurrentSchedule(schedule);
      if (onScheduleGenerated) onScheduleGenerated(schedule);
      alert(`Cronograma de ${getMonthName(selectedMonth)}/${selectedYear} generado exitosamente.`);
    } catch (error: any) {
      alert(error.message || "Error al generar cronograma");
    } finally {
      setLoading(false);
    }
  }
  
  async function handlePublish() {
    if (!currentSchedule || !isSuperSuperAdmin) return;
    
    if (confirm("¿Estás seguro de publicar este cronograma? Será visible para todos los administradores.")) {
        try {
            const updatedTrainings = currentSchedule.trainings.map(t => ({ ...t, isPublished: true }));
            const updated = await updateMonthlySchedule(currentSchedule.id, {
              status: 'published',
              published_at: new Date().toISOString(),
              published_by: user?.id,
              trainings: updatedTrainings
            });
            setCurrentSchedule(updated);
            if (onScheduleGenerated) onScheduleGenerated(updated);
            alert('Cronograma publicado correctamente.');
        } catch (error) {
            console.error(error);
            alert("Error al publicar cronograma");
        }
    }
  }

  const handleEditTraining = (training: Training) => {
      setEditingTraining(training);
  };

  const handleSaveTraining = async (updatedTraining: Training) => {
      if (!currentSchedule) return;

      const updatedTrainings = currentSchedule.trainings.map(t => 
          t.id === updatedTraining.id ? updatedTraining : t
      );

      try {
          const updatedSchedule = await updateMonthlySchedule(currentSchedule.id, {
              trainings: updatedTrainings
          });
          setCurrentSchedule(updatedSchedule);
          setEditingTraining(null);
          if (onScheduleGenerated) onScheduleGenerated(updatedSchedule); // Update parent
      } catch (error) {
          console.error("Error updating training:", error);
          alert("Error al actualizar la capacitación.");
      }
  };

  const handleToggleActive = async (training: Training) => {
      if (!currentSchedule) return;
      
      const updatedTraining = { ...training, is_active: !training.is_active };
      const updatedTrainings = currentSchedule.trainings.map(t => 
          t.id === training.id ? updatedTraining : t
      );

      try {
          const updatedSchedule = await updateMonthlySchedule(currentSchedule.id, {
              trainings: updatedTrainings
          });
          setCurrentSchedule(updatedSchedule);
          if (onScheduleGenerated) onScheduleGenerated(updatedSchedule); // Update parent
      } catch (error) {
          console.error("Error toggling active status:", error);
          alert("Error al cambiar estado.");
      }
  };

  const getRegisteredCount = (trainingId: string) => {
      return users.filter(u => u.trainingId === trainingId).length;
  };

  const canDeleteTraining = (training: Training) => {
      const registeredCount = getRegisteredCount(training.id);
      if (registeredCount > 0) return false;
      if (new Date(training.date) < new Date()) return false;
      return true;
  };

  const getDeleteDisabledReason = (training: Training) => {
      const registeredCount = getRegisteredCount(training.id);
      if (registeredCount > 0) return `Tiene ${registeredCount} inscritos`;
      if (new Date(training.date) < new Date()) return 'Fecha pasada';
      return '';
  };

  const handleDeleteClick = (training: Training) => {
      if (!canDeleteTraining(training)) {
          alert(`No se puede eliminar: ${getDeleteDisabledReason(training)}`);
          return;
      }
      setDeleteConfirm({ show: true, training });
  };

  const confirmDelete = async () => {
      if (!currentSchedule || !deleteConfirm.training) return;

      try {
          const updatedTrainings = currentSchedule.trainings.filter(t => t.id !== deleteConfirm.training!.id);
          const updatedSchedule = await updateMonthlySchedule(currentSchedule.id, {
              trainings: updatedTrainings
          });
          setCurrentSchedule(updatedSchedule);
          if (onScheduleGenerated) onScheduleGenerated(updatedSchedule);
          setDeleteConfirm({ show: false, training: null });
          alert("Capacitación eliminada correctamente.");
      } catch (error) {
          console.error("Error deleting training:", error);
          alert("Error al eliminar capacitación.");
      }
  };

  const cancelDelete = () => {
      setDeleteConfirm({ show: false, training: null });
  };

  const getMonthName = (m: number) => {
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    return months[m - 1];
  };
  
  if (!isSuperSuperAdmin) {
    return <div className="p-4 text-red-500">Acceso denegado: Solo Super Super Admin puede gestionar cronogramas.</div>;
  }
  
  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
        <h2 className="font-bold text-slate-800 text-lg">Gestión de Cronograma Mensual</h2>
        {currentSchedule && (
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                currentSchedule.status === 'published' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
            }`}>
                {currentSchedule.status === 'published' ? '✅ Publicado' : '📝 Borrador'}
            </span>
        )}
      </div>
      
      <div className="p-6">
        {/* Selector de mes/año */}
        <div className="flex flex-wrap gap-4 items-end mb-8 bg-slate-50 p-4 rounded-xl border border-slate-100">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Mes</label>
            <select 
                className="px-4 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-catalina-green/20 font-medium text-slate-700"
                value={selectedMonth} 
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
            >
              {[1,2,3,4,5,6,7,8,9,10,11,12].map(m => (
                <option key={m} value={m}>{getMonthName(m)}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Año</label>
            <input 
              type="number" 
              className="px-4 py-2 rounded-lg border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-catalina-green/20 font-medium text-slate-700 w-24"
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              min={2024}
              max={2030}
            />
          </div>
          
          {!currentSchedule ? (
              <button 
                onClick={handleGenerate}
                disabled={loading}
                className="bg-catalina-green text-white px-6 py-2 rounded-lg font-bold hover:bg-catalina-forest-green shadow-lg shadow-catalina-green/10 transition-all disabled:opacity-50"
              >
                {loading ? 'Generando...' : 'Generar Cronograma Automático'}
              </button>
          ) : (
              currentSchedule.status === 'draft' && (
                  <button 
                    onClick={handlePublish}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-100 transition-all ml-auto"
                  >
                    Publicar Cronograma
                  </button>
              )
          )}
        </div>
        
        {/* Vista previa del cronograma */}
        {currentSchedule ? (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide border-b border-slate-100 pb-2">
                Capacitaciones Generadas ({currentSchedule.trainings.length})
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {currentSchedule.trainings.map(training => (
                <div key={training.id} className={`p-4 rounded-xl border ${training.is_active ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200 opacity-75'} shadow-sm relative group transition-all hover:shadow-md`}>
                  {!training.is_active && (
                      <div className="absolute top-2 right-2 bg-slate-200 text-slate-500 text-[10px] font-bold px-2 py-1 rounded uppercase">
                          Inactivo
                      </div>
                  )}
                  
                  <div className="mb-3">
                    <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1">{training.title}</h4>
                    <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                        {training.date}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-xs text-slate-500 mb-4">
                    <p className="flex items-center gap-2">
                        <i className="fas fa-clock w-4 text-center"></i> 
                        {training.schedule}
                    </p>
                    <p className="flex items-center gap-2">
                        <i className="fas fa-users w-4 text-center"></i> 
                        Aforo: {training.maxCapacity}
                    </p>
                    <p className="flex items-center gap-2 text-amber-600 font-medium">
                        <i className="fas fa-hourglass-end w-4 text-center"></i> 
                        Deadline: {new Date(training.registration_deadline).toLocaleDateString()}
                    </p>
                  </div>
                  
                  {currentSchedule.status === 'draft' && (
                      <div className="flex gap-2 mt-auto pt-3 border-t border-slate-50">
                        <button 
                            className="flex-1 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-catalina-green text-xs font-bold py-1.5 rounded-lg transition-colors"
                            onClick={() => handleEditTraining(training)}
                        >
                            <i className="fas fa-pencil-alt mr-1"></i> Editar
                        </button>
                        <button 
                            className={`flex-1 border text-xs font-bold py-1.5 rounded-lg transition-colors ${training.is_active ? 'bg-red-50 border-red-100 text-red-600 hover:bg-red-100' : 'bg-emerald-50 border-emerald-100 text-emerald-600 hover:bg-emerald-100'}`}
                            onClick={() => handleToggleActive(training)}
                        >
                            {training.is_active ? 'Desactivar' : 'Activar'}
                        </button>
                        <button 
                            className="flex-1 bg-white border border-slate-200 text-red-500 hover:bg-red-50 hover:border-red-200 text-xs font-bold py-1.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            onClick={() => handleDeleteClick(training)}
                            disabled={!canDeleteTraining(training)}
                            title={getDeleteDisabledReason(training)}
                        >
                            <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300 text-2xl">
                    <i className="fas fa-calendar-alt"></i>
                </div>
                <p className="text-slate-500 font-medium">No hay cronograma generado para este mes.</p>
                <p className="text-slate-400 text-sm mt-1">Selecciona un mes y año para comenzar.</p>
            </div>
        )}
      </div>

      {/* Modal de Edición */}
      {editingTraining && (
          <EditTrainingModal 
            training={editingTraining} 
            onClose={() => setEditingTraining(null)} 
            onSave={handleSaveTraining} 
          />
      )}

      {/* Modal de Confirmación de Eliminación */}
      {deleteConfirm.show && deleteConfirm.training && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fadeIn" onClick={cancelDelete}>
          <div className="bg-white rounded-xl p-6 max-w-md w-[90%] shadow-2xl transform transition-all scale-100" onClick={(e) => e.stopPropagation()}>
            <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500 text-2xl">
                    <i className="fas fa-exclamation-triangle"></i>
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">¿Eliminar capacitación?</h3>
                <p className="text-slate-500 text-sm">
                    Estás a punto de eliminar <strong>"{deleteConfirm.training.title}"</strong>.
                </p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 text-red-800 text-sm font-medium mb-2">
                    <i className="fas fa-info-circle"></i>
                    <span>Detalles del evento:</span>
                </div>
                <ul className="text-xs text-red-700 space-y-1 ml-7 list-disc">
                    <li>Fecha: {deleteConfirm.training.date}</li>
                    <li>Horario: {deleteConfirm.training.schedule}</li>
                </ul>
            </div>
            
            <div className="bg-amber-50 border border-amber-100 rounded-lg p-3 text-center font-medium text-amber-800 text-xs mb-6">
              ⚠️ Esta acción no se puede deshacer.
            </div>
            
            <div className="flex gap-3">
              <button 
                className="flex-1 bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg font-bold hover:bg-slate-50 transition-colors"
                onClick={cancelDelete}
              >
                Cancelar
              </button>
              <button 
                className="flex-1 bg-red-600 text-white py-2.5 rounded-lg font-bold hover:bg-red-700 shadow-lg shadow-red-100 transition-colors"
                onClick={confirmDelete}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
