
import React, { useState, useMemo } from 'react';
import { Training, EventUser, SystemUser, TrainingStatus } from '../types';
import { useAuth } from '../AuthContext';
import { useAutoCloseOnNavigate } from '../hooks/useAutoCloseOnNavigate';

interface CalendarViewProps {
  trainings: Training[];
  users: EventUser[];
  currentUser: SystemUser | null;
  onSelectTraining: (id: string) => void;
}



export const CalendarView: React.FC<CalendarViewProps> = ({ trainings, users, currentUser, onSelectTraining }) => {
  if (!trainings || !Array.isArray(trainings) || trainings.length === 0) return <div className="p-8 text-center text-slate-500">No hay capacitaciones disponibles</div>;
  const { can } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedStatus, setSelectedStatus] = useState<TrainingStatus | 'ALL'>('ALL');
  const [modalTraining, setModalTraining] = useState<{ training: Training; status: TrainingStatus; enrolled: number } | null>(null);

  useAutoCloseOnNavigate('calendar-modal', !!modalTraining, () => setModalTraining(null));

  // --- Helpers de Fecha ---
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // --- Lógica de Estado ---
  const getTrainingStatus = (t: Training, enrolledCount: number): TrainingStatus => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Asumimos que t.date es string YYYY-MM-DD. Añadimos T00:00:00 para evitar problemas de zona horaria local
    const tDate = new Date(t.date + 'T00:00:00');

    if (tDate < today) return TrainingStatus.CLOSED;
    if (enrolledCount >= t.maxCapacity) return TrainingStatus.FULL;

    // Opcional: Lógica para "UPCOMING" si faltan más de 30 días, por ahora usaremos ACTIVE
    return TrainingStatus.ACTIVE;
  };

  const getStatusLabel = (status: TrainingStatus) => {
    switch (status) {
      case 'ACTIVE': return 'Registro Abierto';
      case 'FULL': return 'Cupos Llenos';
      case 'CLOSED': return 'Finalizado';
      default: return status;
    }
  }

  // --- Procesamiento de Datos ---
  const monthTrainings = useMemo(() => {
    const monthStart = new Date(year, month, 1);
    const monthEnd = new Date(year, month + 1, 0); // Last day of month

    return trainings.filter(t => {
      const tDate = new Date(t.date + 'T00:00:00');
      const tEnd = t.endDate ? new Date(t.endDate + 'T00:00:00') : tDate;
      // Include if any part of the training overlaps with this month
      return tEnd >= monthStart && tDate <= monthEnd;
    }).map(t => {
      const enrolled = users.filter(u => u.trainingId === t.id).length;
      return {
        ...t,
        enrolled,
        calendarStatus: getTrainingStatus(t, enrolled)
      };
    }).filter(t => selectedStatus === 'ALL' || t.calendarStatus === selectedStatus);
  }, [trainings, users, month, year, selectedStatus]);

  // --- Render Helpers ---
  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const handleToday = () => setCurrentDate(new Date());

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month); // 0 = Sunday

  // Ajuste para empezar lunes (1) en lugar de domingo (0). 
  // Si firstDay es 0 (domingo), lo convertimos a 6. Si es 1 (lunes), a 0.
  const startOffset = firstDay === 0 ? 6 : firstDay - 1;

  const daysArray = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanksArray = Array.from({ length: startOffset }, (_, i) => i);

  return (
    <div className="space-y-6 animate-fadeIn pb-20">

      {/* Header y Controles */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-catalina-green/5 text-catalina-green rounded-xl">
            <i className="far fa-calendar-alt text-xl"></i>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 capitalize">
              {currentDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
            </h2>
            <p className="text-sm text-slate-500 font-medium">Gestión de cronograma y aforos</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
            className="px-4 py-2 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 outline-none focus:ring-2 focus:ring-catalina-green/20"
          >
            <option value="ALL">Todos los Estados</option>
            <option value="ACTIVE">🟢 Activos</option>
            <option value="FULL">🔴 Completos</option>
            <option value="CLOSED">⚫ Finalizados</option>
          </select>

          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"><i className="fas fa-chevron-left"></i></button>
            <button onClick={handleToday} className="px-3 text-xs font-bold text-slate-600 hover:text-catalina-green transition-colors">Hoy</button>
            <button onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white hover:shadow-sm text-slate-500 transition-all"><i className="fas fa-chevron-right"></i></button>
          </div>
        </div>
      </div>

      {/* Grid Calendario (Desktop) */}
      <div className="hidden md:block bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden">
        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map(day => (
            <div key={day} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-slate-400">
              {day}
            </div>
          ))}
        </div>

        {/* Celdas */}
        <div className="grid grid-cols-7 auto-rows-[minmax(120px,_auto)] bg-slate-50 gap-px border-slate-200">
          {blanksArray.map(i => <div key={`blank-${i}`} className="bg-white min-h-[120px]"></div>)}

          {daysArray.map(day => {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTrainings = monthTrainings.filter(t => {
              if (t.endDate) {
                return dateStr >= t.date && dateStr <= t.endDate;
              }
              return t.date === dateStr;
            });
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();
            const hasFullDay = dayTrainings.some(t => t.isFullDay);

            return (
              <div key={day} className={`bg-white p-2 min-h-[120px] transition-colors hover:bg-slate-50/50 relative group ${isToday ? 'bg-catalina-green/5/30' : ''}`}>
                <span className={`text-sm font-bold block mb-2 w-7 h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-catalina-green text-white shadow-md' : 'text-slate-400'}`}>
                  {day}
                </span>

                <div className="space-y-1">
                  {dayTrainings.map(t => (
                    <div
                      key={t.id}
                      onClick={() => setModalTraining({ training: t, status: t.calendarStatus, enrolled: t.enrolled })}
                      className={`rounded-md border cursor-pointer transition-all hover:scale-[1.02] shadow-sm ${t.isFullDay
                        ? 'text-[10px] p-2.5 min-h-[76px] flex flex-col justify-between border-l-[3px]'
                        : 'text-[10px] p-1.5 font-medium truncate'
                        }`}
                      style={{
                        backgroundColor: `${t.color}15` || '#f1f5f9',
                        borderColor: t.color || '#cbd5e1',
                        color: t.color ? '#1e293b' : '#64748b'
                      }}
                      title={`${t.title} (${t.enrolled}/${t.maxCapacity})`}
                    >
                      <div className="flex justify-between items-center">
                        <span className={`${t.isFullDay ? '' : 'truncate'}`} style={{ color: t.color, fontWeight: 'bold' }}>{t.title}</span>
                      </div>
                      {t.isFullDay ? (
                        <div className="mt-auto">
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="text-[7px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: `${t.color}25`, color: t.color }}>Jornada Completa</span>
                          </div>
                          <div className="text-[8px] opacity-60 mt-1">
                            {t.schedule}
                          </div>
                        </div>
                      ) : (
                        <div className="opacity-70 text-[8px] mt-0.5">
                          {t.schedule}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Lista Agrupada (Mobile) */}
      <div className="md:hidden space-y-4">
        {daysArray.map(day => {
          const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
          const dayTrainings = monthTrainings.filter(t => {
            if (t.endDate) {
              return dateStr >= t.date && dateStr <= t.endDate;
            }
            return t.date === dateStr;
          });

          if (dayTrainings.length === 0) return null;

          return (
            <div key={day} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-50">
                <span className="font-black text-slate-900 text-lg">{day}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">
                  {new Date(year, month, day).toLocaleDateString('es-ES', { weekday: 'long' })}
                </span>
              </div>
              <div className="space-y-3">
                {dayTrainings.map(t => (
                  <div
                    key={t.id}
                    onClick={() => setModalTraining({ training: t, status: t.calendarStatus, enrolled: t.enrolled })}
                    className="flex items-center gap-3 active:scale-95 transition-transform"
                  >
                    <div
                      className={`rounded-full ${t.isFullDay ? 'w-2 h-14' : 'w-1 h-10'}`}
                      style={{ backgroundColor: t.color || '#cbd5e1' }}
                    ></div>
                    <div className="flex-1">
                      <p className="text-xs font-bold text-slate-800 line-clamp-2">{t.title}</p>
                      <div className="flex justify-between items-center mt-1">
                        <span className="text-[10px] text-slate-500">
                          {t.isFullDay ? 'Jornada Completa' : t.schedule}
                        </span>
                        <span className="text-[10px] text-slate-400">{t.enrolled}/{t.maxCapacity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}
        {monthTrainings.length === 0 && (
          <div className="text-center py-10 text-slate-400">
            <i className="far fa-calendar-times text-4xl mb-2"></i>
            <p>No hay eventos este mes</p>
          </div>
        )}
      </div>

      {/* Modal de Detalle */}
      {modalTraining && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden transform transition-all">
            <div
              className="p-6 text-white relative"
              style={{ backgroundColor: modalTraining.training.color || '#334155' }}
            >
              <button
                onClick={() => setModalTraining(null)}
                className="absolute top-4 right-4 w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
              >
                <i className="fas fa-times"></i>
              </button>
              <span className="inline-block px-2 py-1 bg-white/20 rounded text-[10px] font-bold uppercase tracking-widest mb-3">
                {getStatusLabel(modalTraining.status)}
              </span>
              <h3 className="text-xl font-black leading-tight mb-2">{modalTraining.training.title}</h3>
              <div className="flex items-center gap-4 text-xs font-medium opacity-90">
                <span className="flex items-center gap-1"><i className="far fa-calendar"></i> {modalTraining.training.date}</span>
                <span className="flex items-center gap-1"><i className="fas fa-users"></i> {modalTraining.enrolled}/{modalTraining.training.maxCapacity}</span>
              </div>
              {(modalTraining.training.duration || modalTraining.training.schedule) && (
                <div className="mt-2 text-xs opacity-80">
                  {modalTraining.training.duration} • {modalTraining.training.schedule}
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="text-sm text-slate-600 mb-6">{modalTraining.training.description}</p>

              {modalTraining.status === 'ACTIVE' && (
                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-100 flex items-center gap-3 mb-6">
                  <i className="fas fa-clock text-emerald-600 text-xl"></i>
                  <div>
                    <p className="text-xs font-bold text-emerald-800">¡Registro Disponible!</p>
                    <p className="text-[10px] text-emerald-600">Quedan {modalTraining.training.maxCapacity - modalTraining.enrolled} cupos libres.</p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setModalTraining(null)}
                  className="px-4 py-3 rounded-xl font-bold text-slate-500 border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => {
                    onSelectTraining(modalTraining.training.id);
                    setModalTraining(null);
                  }}
                  className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold hover:bg-slate-800 shadow-lg shadow-slate-200 flex items-center justify-center gap-2 transition-all"
                >
                  <i className="fas fa-external-link-alt text-xs"></i>
                  {can('canManageCalendar') ? 'Gestionar' : 'Ir al Curso'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
