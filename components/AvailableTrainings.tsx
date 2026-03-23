import React from 'react';
import { Training } from '../types';
import { DeadlineCountdown } from './DeadlineCountdown';

interface AvailableTrainingsProps {
  trainings: Training[];
  onSelectTraining: (trainingId: string) => void;
}

const TITLE_COLORS: Record<string, string> = {
  'induccion': '#22C55E', // verde
  'defensivo': '#F97316', // naranja
  'altura': '#EF4444', // rojo
  'confinad': '#8B5CF6', // morado
  'aislamiento': '#3B82F6', // azul
  'bloqueo': '#3B82F6', // azul
};

const getTrainingColor = (t: Training) => {
  let finalColor = '#0EA5E9';

  if (!t.title) {
    finalColor = t.color || '#0EA5E9';
  } else if (!t.color || t.color === '#0EA5E9' || t.color === '#2d6a4f' || t.color === '') {
    const normalize = (str: string) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const normalizedTitle = normalize(t.title);

    for (const [key, color] of Object.entries(TITLE_COLORS)) {
      if (normalizedTitle.includes(normalize(key))) {
         finalColor = color;
         break;
      }
    }
  } else if (t.color && t.color !== '') {
    finalColor = t.color;
  }

  console.log(`[getTrainingColor Temp] Título: "${t.title}" | DB Color: "${t.color}" | Asignado: "${finalColor}"`);
  return finalColor;
};

export const AvailableTrainings: React.FC<AvailableTrainingsProps> = ({ trainings, onSelectTraining }) => {
  if (!trainings || !Array.isArray(trainings) || trainings.length === 0) return <div className="p-8 text-center">No hay capacitaciones disponibles</div>;
  
  // Filter logic: Published, Active, and Deadline not passed (optional, maybe show closed ones as disabled?)
  // The user said "only displays published and open trainings".
  // So we filter out closed ones.
  
  const availableTrainings = trainings.filter(t => {
      if (!t) return false;
      // Must be published
      if (!t.isPublished) return false;
      // Must be active (if generated from schedule)
      if (t.is_active === false) return false;
      
      // Check deadline
      if (t.registration_deadline) {
          const deadline = new Date(t.registration_deadline);
          const now = new Date();
          if (now > deadline) return false;
      }
      
      return true;
  });

  if (availableTrainings.length === 0) {
      return (
                    <div className="text-center py-12 bg-catalina-grey/10 rounded-3xl border border-dashed border-catalina-grey/20">
                            <div className="w-16 h-16 bg-catalina-green/10 rounded-full flex items-center justify-center mx-auto mb-4 text-catalina-green text-2xl">
                  <i className="fas fa-inbox"></i>
              </div>
              <h3 className="text-catalina-forest-green font-medium text-lg">No hay capacitaciones disponibles</h3>
              <p className="text-catalina-grey/80 text-sm mt-1">Actualmente no hay cursos abiertos para inscripción.</p>
          </div>
      );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
            <div className="flex justify-between items-end border-b border-catalina-grey/20 pb-6">
        <div>
          <h2 className="text-2xl font-semibold text-catalina-forest-green tracking-tight">Capacitaciones Disponibles</h2>
          <p className="text-catalina-grey/80 text-sm mt-1">Inscribe a tu personal en los cursos abiertos.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {availableTrainings.map(t => (
                    <div 
            key={t.id} 
            className="group relative bg-white rounded-2xl border border-catalina-grey/20 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_12px_24px_rgba(0,0,0,0.08)] hover:-translate-y-1 transition-all duration-300 flex flex-col h-full overflow-hidden"
          >
            {/* Accent Line */}
            <div 
              className="absolute left-0 top-0 bottom-0 w-1.5 rounded-l-2xl z-10"
              style={{ backgroundColor: getTrainingColor(t) }}
            ></div>

            <div className="p-6 pl-7 flex flex-col h-full">
              
              <div className="flex justify-between items-start mb-3">
                                <span className="text-xs font-medium uppercase tracking-wider text-catalina-grey/80 bg-catalina-grey/10 px-2 py-1 rounded-md">
                  {t.group || 'GENERAL'}
                </span>
                <span className="text-xs font-bold text-catalina-green bg-catalina-dusty-green/20 px-2 py-1 rounded-full border border-catalina-green/20">
                    DISPONIBLE
                </span>
              </div>

              <div className="mb-4">
                <h3 
                  className="font-bold text-lg leading-snug mb-2 transition-colors group-hover:opacity-80"
                  style={{ color: t.color || '#1e293b' }}
                >
                  {t.title}
                </h3>
                <p className="text-catalina-grey/80 text-sm leading-relaxed line-clamp-2">
                  {t.description}
                </p>
              </div>

              {/* Deadline Countdown */}
              <div className="mb-4">
                  <DeadlineCountdown deadline={t.registration_deadline} />
              </div>

                            <div className="border-t border-catalina-grey/10 mb-4"></div>

              <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-6">
                 <div className="flex items-center gap-2 text-sm text-catalina-grey">
                                         <i className="far fa-calendar text-catalina-green w-4"></i>
                    <span>{t.date}</span>
                 </div>
                 <div className="flex items-center gap-2 text-sm text-catalina-grey">
                                         <i className="fas fa-users text-catalina-green w-4"></i>
                    <span>{t.maxCapacity} cupos</span>
                 </div>
                 {t.duration && (
                                      <div className="flex items-center gap-2 text-sm text-catalina-grey">
                      <i className="far fa-clock text-catalina-green w-4"></i>
                      <span>{t.duration}</span>
                   </div>
                 )}
                 {t.schedule && (
                                      <div className="flex items-center gap-2 text-sm text-catalina-grey">
                      <i className="far fa-clock text-catalina-green w-4"></i>
                      <span className="truncate">{t.schedule}</span>
                   </div>
                 )}
              </div>

              <div className="mt-auto pt-2">
                <button 
                  onClick={() => onSelectTraining(t.id)}
                                    className="w-full bg-catalina-green text-white text-sm font-bold py-2.5 rounded-xl hover:bg-catalina-forest-green shadow-lg shadow-catalina-green/20 transition-all flex items-center justify-center gap-2"
                >
                  <i className="fas fa-user-plus"></i>
                  Inscribir Personal
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
