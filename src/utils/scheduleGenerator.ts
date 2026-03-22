import { TrainingTemplate, MonthlySchedule, Training } from './types';
import { apiClient } from './api/client';
import { mapTraining } from './hooks/useTrainings';

// Mock database for templates
const TEMPLATES: TrainingTemplate[] = [
  {
    id: 'tpl-induccion',
    name: 'Inducción Básica de Seguridad',
    duration_hours: 32,
    day_of_week: 'monday',
    start_time: '08:00',
    end_time: '18:00',
    max_capacity: 60,
    is_active_by_default: true,
    week_of_month: 2,
    is_multi_day: true
  },
  {
    id: 'tpl-manejo-defensivo',
    name: 'Manejo Defensivo - RITRA - Fatiga y Somnolencia',
    duration_hours: 4,
    day_of_week: 'friday',
    start_time: '08:00',
    end_time: '12:00',
    max_capacity: 60,
    is_active_by_default: true,
    week_of_month: 2,
    is_multi_day: false
  },
  {
    id: 'tpl-espacios-confinados',
    name: 'Trabajos de Alto Riesgo en Espacios Confinados',
    duration_hours: 4,
    day_of_week: 'friday',
    start_time: '14:00',
    end_time: '18:00',
    max_capacity: 60,
    is_active_by_default: true,
    week_of_month: 2,
    is_multi_day: false
  },
  {
    id: 'tpl-altura',
    name: 'Trabajos de Alto Riesgo en Altura',
    duration_hours: 4,
    day_of_week: 'saturday',
    start_time: '08:00',
    end_time: '12:00',
    max_capacity: 60,
    is_active_by_default: true,
    week_of_month: 2,
    is_multi_day: false
  },
  {
    id: 'tpl-caliente',
    name: 'Trabajos de Alto Riesgo en Caliente',
    duration_hours: 4,
    day_of_week: 'saturday',
    start_time: '14:00',
    end_time: '18:00',
    max_capacity: 60,
    is_active_by_default: true,
    week_of_month: 2,
    is_multi_day: false
  },
  {
    id: 'tpl-aislamiento',
    name: 'Trabajos de Aislamiento y Bloqueo de Energías',
    duration_hours: 4,
    day_of_week: 'sunday',
    start_time: '08:00',
    end_time: '12:00',
    max_capacity: 60,
    is_active_by_default: false, // DESACTIVADO por default
    week_of_month: 2,
    is_multi_day: false
  },
  {
    id: 'tpl-izajes',
    name: 'Trabajos de Alto Riesgo en Izajes',
    duration_hours: 4,
    day_of_week: 'sunday',
    start_time: '14:00',
    end_time: '18:00',
    max_capacity: 60,
    is_active_by_default: true,
    week_of_month: 2,
    is_multi_day: false
  }
];

const STORAGE_KEY = 'eventmanager_monthly_schedules';

const getSchedulesDB = (): MonthlySchedule[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    return [];
  }
};

const saveSchedulesDB = (schedules: MonthlySchedule[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(schedules));
};

export const getTrainingTemplates = async (): Promise<TrainingTemplate[]> => {
  return TEMPLATES;
};

export const getMonthlySchedule = async (month: number, year: number): Promise<MonthlySchedule | undefined> => {
  return getSchedulesDB().find(s => s.month === month && s.year === year);
};

export const getMonthlySchedules = async (filter?: { status?: 'published' | 'draft' | 'completed' }): Promise<MonthlySchedule[]> => {
  const db = getSchedulesDB();
  if (filter?.status) {
    return db.filter(s => s.status === filter.status);
  }
  return db;
};

export const createMonthlySchedule = async (schedule: Partial<MonthlySchedule>): Promise<MonthlySchedule> => {
  const newSchedule: MonthlySchedule = {
    id: `sched-${schedule.month}-${schedule.year}-${Date.now()}`,
    month: schedule.month!,
    year: schedule.year!,
    status: schedule.status || 'draft',
    generated_at: new Date().toISOString(),
    trainings: []
  };
  const db = getSchedulesDB();
  db.push(newSchedule);
  saveSchedulesDB(db);
  return newSchedule;
};

export const updateMonthlySchedule = async (id: string, updates: Partial<MonthlySchedule>): Promise<MonthlySchedule> => {
  const db = getSchedulesDB();
  const index = db.findIndex(s => s.id === id);
  if (index === -1) throw new Error("Schedule not found");

  db[index] = { ...db[index], ...updates };
  saveSchedulesDB(db);
  return db[index];
};

function getSecondWeekOfMonth(month: number, year: number): Date[] {
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay();

  let dayOffset = (1 - firstDayOfWeek + 7) % 7; 
  let firstMonday = 1 + dayOffset;
  let secondMonday = firstMonday + 7;

  const secondWeekStart = new Date(year, month - 1, secondMonday);

  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(secondWeekStart.getTime() + i * 24 * 60 * 60 * 1000));
  }
  return dates;
}

function getDateForDayOfWeek(dates: Date[], dayOfWeek: string): Date {
  const dayMap: Record<string, number> = {
    sunday: 0, monday: 1, tuesday: 2, wednesday: 3, thursday: 4, friday: 5, saturday: 6
  };
  return dates.find(d => d.getDay() === dayMap[dayOfWeek])!;
}

function calculateDeadline(courseDate: Date): string {
  const deadline = new Date(courseDate);
  deadline.setDate(deadline.getDate() - 1);
  deadline.setHours(18, 0, 0, 0);
  return deadline.toISOString();
}

function getFormatDuration(hours: number, isMultiDay: boolean): string {
  return isMultiDay ? `${hours / 8} días` : `${hours} horas`;
}

function getScheduleString(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    const ampm = h >= 12 ? 'pm' : 'am';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  };
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export async function generateMonthlySchedule(month: number, year: number): Promise<MonthlySchedule> {
  const existing = await getMonthlySchedule(month, year);
  if (existing) {
    throw new Error(`El cronograma de ${month}/${year} ya existe`);
  }

  const templates = await getTrainingTemplates();
  const secondWeekDates = getSecondWeekOfMonth(month, year);

  const schedule = await createMonthlySchedule({ month, year, status: 'draft' });

  const trainings: Training[] = [];

  for (const template of templates) {
    const startDate = getDateForDayOfWeek(secondWeekDates, template.day_of_week);

    const durationDays = template.is_multi_day ? Math.round(template.duration_hours / 8) : 1;
    const endDate = template.is_multi_day
      ? new Date(startDate.getTime() + (durationDays - 1) * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : undefined;

    // We build the object strictly as DTO expects
    const backendCreateData = {
        title: template.name,
        description: `Capacitación automática - ${month}/${year}`,
        start_date: new Date(startDate.toISOString().split('T')[0] + 'T00:00:00').toISOString(),
        start_time: template.start_time,
        end_time: template.end_time,
        max_capacity: template.max_capacity,
        duration_hours: template.duration_hours,
        color: '#64748b',
        group_number: 1,
        registration_deadline: calculateDeadline(startDate),
        status: 'active',
        is_active: template.is_active_by_default,
        is_published: false,
    };

    try {
        const response = await apiClient.post('/trainings', backendCreateData);
        if (response.data.success) {
            const realTraining = mapTraining(response.data.data);
            
            realTraining.isFullDay = template.is_multi_day || undefined;
            realTraining.schedule = getScheduleString(template.start_time, template.end_time); 
            trainings.push(realTraining);
        }
    } catch (error) {
        console.error('Error al generar capacitación ' + template.name, error);
        // We continue with the rest of the templates even if one fails
    }
  }

  const updatedSchedule = await updateMonthlySchedule(schedule.id, { trainings });
  return updatedSchedule;
}
