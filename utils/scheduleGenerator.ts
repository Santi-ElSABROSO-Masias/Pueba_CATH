import { TrainingTemplate, MonthlySchedule, Training } from '../types';

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

// In-memory storage for schedules (simulating DB)
let SCHEDULES_DB: MonthlySchedule[] = [];

export const getTrainingTemplates = async (): Promise<TrainingTemplate[]> => {
  return TEMPLATES;
};

export const getMonthlySchedule = async (month: number, year: number): Promise<MonthlySchedule | undefined> => {
  return SCHEDULES_DB.find(s => s.month === month && s.year === year);
};

export const getMonthlySchedules = async (filter?: { status?: 'published' | 'draft' | 'completed' }): Promise<MonthlySchedule[]> => {
    if (filter?.status) {
        return SCHEDULES_DB.filter(s => s.status === filter.status);
    }
    return SCHEDULES_DB;
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
  SCHEDULES_DB.push(newSchedule);
  return newSchedule;
};

export const updateMonthlySchedule = async (id: string, updates: Partial<MonthlySchedule>): Promise<MonthlySchedule> => {
    const index = SCHEDULES_DB.findIndex(s => s.id === id);
    if (index === -1) throw new Error("Schedule not found");
    
    SCHEDULES_DB[index] = { ...SCHEDULES_DB[index], ...updates };
    return SCHEDULES_DB[index];
};

function getSecondWeekOfMonth(month: number, year: number): Date[] {
  // Month is 1-12, Date constructor expects 0-11
  const firstDay = new Date(year, month - 1, 1);
  const firstDayOfWeek = firstDay.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  
  // Calculate days until the first Monday of the month
  // If starts on Monday (1), offset is 0. If Sunday (0), offset is 1. If Tuesday (2), offset is 6.
  // Actually, requirement is "2nd week of the month".
  // Usually this means the week starting with the 2nd Monday, OR simply the 8th to 14th?
  // Let's assume standard ISO weeks or simply the week containing the 8th day of the month?
  // The user prompt says: "La empresa tiene un cronograma FIJO de capacitaciones que se repite la 2da semana de cada mes."
  // Let's interpret "2nd week" as the week starting from the second Monday of the month.
  // OR, simpler interpretation: The week that contains the dates 8-14.
  // Let's stick to the user provided logic in the prompt snippet if possible, or implement robust logic.
  // User snippet:
  // const daysUntilSecondWeek = firstDayOfWeek === 0 ? 8 : (8 - firstDayOfWeek + 1);
  // Let's trace this:
  // If 1st is Mon (1): daysUntilSecondWeek = 8 - 1 + 1 = 8. So 2nd week starts on 8th. Correct (1st week is 1-7).
  // If 1st is Sun (0): daysUntilSecondWeek = 8. So 2nd week starts on 8th. Wait.
  // If 1st is Sun, the week is 1st(Sun) ...
  // Let's assume "Week" starts on Monday.
  // If 1st is Sun: 1st week is just the 1st? Or does it belong to prev month?
  // Let's use a simpler heuristic: The Monday of the second full week.
  // Let's use the logic provided in the prompt for consistency.
  
  const daysUntilSecondWeekStart = firstDayOfWeek === 0 ? 1 : (8 - firstDayOfWeek + 1);
  // Wait, if firstDayOfWeek is 1 (Mon), 8 - 1 + 1 = 8. So 2nd week starts on 8th.
  // If firstDayOfWeek is 0 (Sun), user code says 8. So 2nd week starts on 8th.
  // If firstDayOfWeek is 5 (Fri), 8 - 5 + 1 = 4. So 2nd week starts on 4th? That seems like the 1st week.
  
  // Let's refine "2nd week".
  // Let's find the FIRST Monday.
  let dayOffset = (1 - firstDayOfWeek + 7) % 7; // Days to add to reach first Monday.
  let firstMonday = 1 + dayOffset;
  let secondMonday = firstMonday + 7;
  
  const secondWeekStart = new Date(year, month - 1, secondMonday);
  
  // Generate 7 days starting from that Monday
  const dates = [];
  for (let i = 0; i < 7; i++) {
    dates.push(new Date(secondWeekStart.getTime() + i * 24 * 60 * 60 * 1000));
  }
  
  return dates;
}

function getDateForDayOfWeek(dates: Date[], dayOfWeek: string): Date {
  const dayMap: Record<string, number> = {
    sunday: 0,
    monday: 1,
    tuesday: 2,
    wednesday: 3,
    thursday: 4,
    friday: 5,
    saturday: 6
  };
  
  return dates.find(d => d.getDay() === dayMap[dayOfWeek])!;
}

function calculateDeadline(courseDate: Date): string {
    // 1 day before at 6 PM
    const deadline = new Date(courseDate);
    deadline.setDate(deadline.getDate() - 1);
    deadline.setHours(18, 0, 0, 0);
    return deadline.toISOString();
}

function getFormatDuration(hours: number, isMultiDay: boolean): string {
    return isMultiDay ? `${hours / 8} días` : `${hours} horas`;
}

function getScheduleString(startTime: string, endTime: string): string {
    // Convert 24h to 12h format
    const formatTime = (time: string) => {
        const [h, m] = time.split(':').map(Number);
        const ampm = h >= 12 ? 'pm' : 'am';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
    };
    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export async function generateMonthlySchedule(month: number, year: number): Promise<MonthlySchedule> {
  // 1. Check if exists
  const existing = await getMonthlySchedule(month, year);
  if (existing) {
    throw new Error(`El cronograma de ${month}/${year} ya existe`);
  }
  
  // 2. Get templates
  const templates = await getTrainingTemplates();
  
  // 3. Calculate 2nd week dates
  const secondWeekDates = getSecondWeekOfMonth(month, year);
  
  // 4. Create schedule draft
  const schedule = await createMonthlySchedule({
    month,
    year,
    status: 'draft'
  });
  
  // 5. Generate trainings
  const trainings: Training[] = [];
  
  for (const template of templates) {
    // Note: We generate ALL, but mark inactive ones as is_active=false
    // The prompt said "Saltando... si desactivado", but later said "Solo se activa manualmente".
    // To allow manual activation, it's better to generate it but mark it as inactive/hidden or simply not generate it and allow "Add from template".
    // The prompt's "TrainingCard" has a toggle: "{training.is_active ? 'Desactivar' : 'Activar'}".
    // This implies the training object EXISTS but has a flag.
    // So let's generate ALL, but set is_active based on template default.
    
    const startDate = getDateForDayOfWeek(
      secondWeekDates,
      template.day_of_week
    );
    
    const training: Training = {
      id: `tr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: template.name,
      description: `Capacitación automática - ${month}/${year}`,
      date: startDate.toISOString().split('T')[0], // YYYY-MM-DD
      maxCapacity: template.max_capacity,
      isPublished: false, // Draft initially, published when schedule is published
      customQuestions: [],
      color: '#64748b', // Default gray
      duration: getFormatDuration(template.duration_hours, template.is_multi_day),
      schedule: getScheduleString(template.start_time, template.end_time),
      group: 'Grupo 1',
      companyId: null,
      registration_deadline: calculateDeadline(startDate),
      monthly_schedule_id: schedule.id,
      template_id: template.id,
      is_active: template.is_active_by_default
    };
    
    trainings.push(training);
  }
  
  // Update schedule with trainings
  const updatedSchedule = await updateMonthlySchedule(schedule.id, { trainings });
  
  return updatedSchedule;
}
