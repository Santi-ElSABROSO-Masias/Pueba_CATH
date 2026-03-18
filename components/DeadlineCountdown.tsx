import React, { useState, useEffect } from 'react';

interface DeadlineCountdownProps {
  deadline: string;
  trainingName?: string;
}

export function DeadlineCountdown({ deadline, trainingName }: DeadlineCountdownProps) {
  if (!deadline) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
        <i className="fas fa-clock"></i>
        <span>Sin fecha límite</span>
      </div>
    );
  }

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft(deadline));
  const [status, setStatus] = useState(getDeadlineStatus(deadline));
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft(deadline));
      setStatus(getDeadlineStatus(deadline));
    }, 60000); // Actualizar cada minuto
    
    return () => clearInterval(timer);
  }, [deadline]);
  
  if (status === 'closed') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500 border border-slate-200">
        <span className="w-2 h-2 rounded-full bg-slate-400"></span>
        CERRADO - Inscripción finalizada
      </div>
    );
  }
  
  const statusClasses = {
    open: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    warning: 'bg-amber-50 text-amber-700 border-amber-100',
    urgent: 'bg-red-50 text-red-700 border-red-100 animate-pulse'
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${statusClasses[status]}`}>
      <i className="fas fa-clock"></i>
      <span>
        Cierra en: {timeLeft.days}d {timeLeft.hours}h {timeLeft.minutes}m
      </span>
    </div>
  );
}

function calculateTimeLeft(deadline: string) {
  const now = new Date();
  const target = new Date(deadline);
  const diff = target.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0 };
  }
  
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60)
  };
}

function getDeadlineStatus(deadline: string): 'open' | 'warning' | 'urgent' | 'closed' {
  const now = new Date();
  const target = new Date(deadline);
  const hoursLeft = (target.getTime() - now.getTime()) / (1000 * 60 * 60);
  
  if (hoursLeft <= 0) return 'closed';
  if (hoursLeft < 24) return 'urgent';    // Menos de 24 horas
  if (hoursLeft < 72) return 'warning';   // Menos de 3 días
  return 'open';                           // Más de 3 días
}
