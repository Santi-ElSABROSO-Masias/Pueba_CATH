
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { AdminDashboard } from './components/AdminDashboard';
import { TrainingManager } from './components/TrainingManager';
import { PublicRegistration } from './components/PublicRegistration';
import { Auth } from './components/Auth';
import { EventUser, UserStatus, SystemUser, Training } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trainings' | 'dashboard' | 'public'>('trainings');
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  const [trainings, setTrainings] = useState<Training[]>([
    {
      id: 't1',
      title: 'Workshop: Estrategia de Productos Digitales',
      description: 'Aprende a diseñar MVPs exitosos centrados en la entrega de valor continua y validación de hipótesis de negocio.',
      date: '2025-10-15',
      maxCapacity: 30,
      isPublished: true,
      customQuestions: ['¿Experiencia previa en gestión de proyectos?']
    }
  ]);

  const [users, setUsers] = useState<EventUser[]>([
    {
      id: 'u1',
      trainingId: 't1',
      name: 'Andrés López',
      email: 'andres@product.com',
      dni: '12345678',
      organization: 'TechFlow S.A.',
      area: 'Sistemas',
      role: 'Analista Senior',
      status: UserStatus.LINK_SENT,
      meetingLink: 'https://teams.live.com/123456789',
      attended: true,
      registeredAt: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    const savedSession = localStorage.getItem('event_mvp_session');
    if (savedSession) setCurrentUser(JSON.parse(savedSession));
    setIsInitializing(false);
  }, []);

  const handleCreateTraining = (t: Omit<Training, 'id'>) => {
    const newTraining = { ...t, id: 't' + Math.random().toString(36).substr(2, 5) };
    setTrainings(prev => [newTraining, ...prev]);
  };

  const handleUpdateTraining = (updatedTraining: Training) => {
    setTrainings(prev => prev.map(t => t.id === updatedTraining.id ? updatedTraining : t));
  };

  const handleSelectTraining = (id: string) => {
    setSelectedTrainingId(id);
    setActiveTab('dashboard');
  };

  const handleRegister = (data: any) => {
    const newUser: EventUser = {
      id: 'u' + Math.random().toString(36).substr(2, 7),
      trainingId: data.trainingId,
      name: data.name,
      email: data.email,
      dni: data.dni,
      organization: data.organization,
      area: data.area,
      role: data.role,
      status: UserStatus.REGISTERED,
      attended: false,
      registeredAt: new Date().toISOString(),
      customAnswers: data.custom
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const handleUpdateStatus = (userId: string, status: UserStatus, meetingLink?: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status, meetingLink: meetingLink || u.meetingLink } : u));
  };

  const handleToggleAttendance = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, attended: !u.attended } : u));
  };

  const handleExport = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    const headers = ['Nombres y Apellidos', 'DNI', 'Email', 'Empresa', 'Área', 'Cargo', 'Estado', 'Asistencia'];
    const trainingUsers = users.filter(u => u.trainingId === trainingId);
    
    const rows = trainingUsers.map(u => [
      u.name, 
      u.dni, 
      u.email, 
      u.organization, 
      u.area, 
      u.role, 
      u.status, 
      u.attended ? 'SÍ' : 'NO'
    ]);

    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(",") + "\n" 
      + rows.map(e => e.join(",")).join("\n");
    
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `asistencia_${training?.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isInitializing) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i></div>;
  if (!currentUser) return <Auth onLogin={setCurrentUser} />;

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      user={currentUser} 
      onLogout={() => { localStorage.removeItem('event_mvp_session'); setCurrentUser(null); }}
    >
      <div className="animate-fadeIn">
        {activeTab === 'trainings' && (
          <TrainingManager 
            trainings={trainings} 
            onCreateTraining={handleCreateTraining}
            onUpdateTraining={handleUpdateTraining}
            onSelectTraining={handleSelectTraining}
          />
        )}
        {activeTab === 'dashboard' && (
          <AdminDashboard
            users={users}
            trainings={trainings}
            selectedTrainingId={selectedTrainingId}
            onUpdateStatus={handleUpdateStatus}
            onToggleAttendance={handleToggleAttendance}
            onExport={handleExport}
          />
        )}
        {activeTab === 'public' && trainings.length > 0 && (
          <PublicRegistration 
            training={trainings[0]} 
            onSubmit={handleRegister} 
          />
        )}
      </div>
    </Layout>
  );
};

export default App;
