
import React, { useState, useEffect, useMemo } from 'react';
import { Layout } from './components/Layout';
import { AdminDashboard } from './components/AdminDashboard';
import { TrainingManager } from './components/TrainingManager';
import { PublicRegistration } from './components/PublicRegistration';
import { CalendarView } from './components/CalendarView';
import { NotificationCenter } from './components/NotificationCenter';
import { UserManagement } from './components/UserManagement'; // Nuevo Import
import { Auth } from './components/Auth';
import { EventUser, UserStatus, SystemUser, Training, Notification, Company } from './types';
import { createNotificationsForTraining } from './utils/notificationLogic';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trainings' | 'dashboard' | 'public' | 'calendar' | 'notifications' | 'users'>('trainings');
  const [currentUser, setCurrentUser] = useState<SystemUser | null>(null);
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [isInitializing, setIsInitializing] = useState(true);

  // Estado para el enrutamiento público
  const [isPublicView, setIsPublicView] = useState(false);
  const [publicTrainingId, setPublicTrainingId] = useState<string | null>(null);

  // --- DATOS MOCK PARA MVP DE ROLES ---
  const [companies, setCompanies] = useState<Company[]>([
      { id: 'c1', name: 'TechFlow S.A.' },
      { id: 'c2', name: 'Minera Los Andes' }
  ]);

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
      { id: 'su1', name: 'Admin Global', email: 'admin@system.com', role: 'superadmin', companyId: null, isActive: true },
      { id: 'su2', name: 'Operador TechFlow', email: 'ops@techflow.com', role: 'user', companyId: 'c1', isActive: true }
  ]);
  // -------------------------------------

  // Helper para calcular fechas relativas a la próxima semana
  const getNextDate = (dayOfWeek: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + (dayOfWeek + 7 - d.getDay()) % 7);
    const today = new Date();
    if (d <= today) d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const [trainings, setTrainings] = useState<Training[]>(() => {
    const mondayDate = getNextDate(1);
    const fridayDate = getNextDate(5);
    const saturdayDate = getNextDate(6);
    const sundayDate = getNextDate(0);

    return [
      {
        id: 't1',
        title: 'Inducción Básica de Seguridad',
        description: 'Capacitación integral de seguridad obligatoria para ingreso a planta. Abarca normativa interna y EPP.',
        date: mondayDate,
        maxCapacity: 60,
        isPublished: true,
        customQuestions: ['¿Posee examen médico vigente?'],
        instructorName: 'Equipo SSOMA',
        color: '#0EA5E9',
        duration: '4 días',
        schedule: '8:00 am - 6:00 pm',
        group: 'Grupo 1',
        companyId: null // Global
      },
      {
        id: 't2',
        title: 'Manejo Defensivo - RITRA - Fatiga y Somnolencia',
        description: 'Curso mandatorio para conductores internos y externos. Enfoque en prevención de accidentes vehiculares.',
        date: fridayDate,
        maxCapacity: 60,
        isPublished: true,
        customQuestions: ['Licencia de conducir', 'Categoría'],
        instructorName: 'Carlos Vial',
        color: '#10B981',
        duration: '4 horas',
        schedule: '8:00 am - 12:00 m',
        group: 'Grupo 1',
        companyId: 'c1' // Específico para TechFlow
      },
      {
        id: 't3',
        title: 'Trabajos de Alto Riesgo en Espacios Confinados',
        description: 'Protocolos de entrada, monitoreo de atmósfera y rescate en espacios confinados.',
        date: fridayDate,
        maxCapacity: 60,
        isPublished: true,
        customQuestions: [],
        instructorName: 'Seguridad Industrial',
        color: '#F97316',
        duration: '4 horas',
        schedule: '2:00 pm - 6:00 pm',
        group: 'Grupo 1',
        companyId: null
      },
      {
        id: 't4',
        title: 'Trabajos de Alto Riesgo en Altura',
        description: 'Uso correcto de arnés, líneas de vida y prevención de caídas a distinto nivel.',
        date: saturdayDate,
        maxCapacity: 60,
        isPublished: true,
        customQuestions: ['¿Sufre de vértigo?'],
        instructorName: 'Seguridad Industrial',
        color: '#8B5CF6',
        duration: '4 horas',
        schedule: '8:00 am - 12:00 m',
        group: 'Grupo 1',
        companyId: null
      },
      {
        id: 't5',
        title: 'Trabajos de Alto Riesgo en Caliente',
        description: 'Prevención de incendios en trabajos de soldadura, corte y esmerilado.',
        date: saturdayDate,
        maxCapacity: 60,
        isPublished: true,
        customQuestions: [],
        instructorName: 'Seguridad Industrial',
        color: '#EF4444',
        duration: '4 horas',
        schedule: '2:00 pm - 6:00 pm',
        group: 'Grupo 1',
        companyId: 'c2' // Específico Minera Los Andes
      },
      {
        id: 't6',
        title: 'Trabajos de Aislamiento y Bloqueo de Energías',
        description: 'Procedimiento LOTOTO para intervención segura de maquinaria y equipos energizados.',
        date: sundayDate,
        maxCapacity: 60,
        isPublished: true,
        customQuestions: [],
        instructorName: 'Mantenimiento & Seguridad',
        color: '#F59E0B',
        duration: '4 horas',
        schedule: '8:00 am - 12:00 m',
        group: 'Grupo 1',
        companyId: null
      },
      {
        id: 't7',
        title: 'Trabajos de Alto Riesgo en Izajes',
        description: 'Estrobado, señalización y seguridad en operaciones con grúas y cargas suspendidas.',
        date: sundayDate,
        maxCapacity: 60,
        isPublished: true,
        customQuestions: [],
        instructorName: 'Certificador Externo',
        color: '#EC4899',
        duration: '4 horas',
        schedule: '2:00 pm - 6:00 pm',
        group: 'Grupo 1',
        companyId: null
      }
    ];
  });

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

  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Lógica de Filtrado por Rol
  const filteredTrainings = useMemo(() => {
      if (!currentUser) return [];
      if (currentUser.role === 'superadmin') return trainings;
      // Usuarios ven cursos globales (null) o de su empresa
      return trainings.filter(t => !t.companyId || t.companyId === currentUser.companyId);
  }, [trainings, currentUser]);

  const filteredUsers = useMemo(() => {
      // Nota: Idealmente users tendría companyId, pero por ahora filtramos por el training
      // Si el usuario es admin ve todos, si es user ve solo los inscritos en trainings visibles
      // Ojo: En un MVP real, deberíamos filtrar los inscritos que pertenezcan a la empresa del usuario
      // si quisiéramos ser estrictos, pero aquí simplificamos basándonos en el training visible.
      if (!currentUser) return [];
      if (currentUser.role === 'superadmin') return users;
      const visibleTrainingIds = filteredTrainings.map(t => t.id);
      return users.filter(u => visibleTrainingIds.includes(u.trainingId));
  }, [users, filteredTrainings, currentUser]);


  useEffect(() => {
    if (trainings.length > 0 && notifications.length === 0) {
        const t1 = trainings[0];
        setNotifications(createNotificationsForTraining(t1));
    }
  }, []);

  useEffect(() => {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if ((path === '/registro' || path === '/registro/') && id) {
      setIsPublicView(true);
      setPublicTrainingId(id);
    }

    const savedSession = localStorage.getItem('event_mvp_session');
    if (savedSession) setCurrentUser(JSON.parse(savedSession));
    setIsInitializing(false);
  }, []);

  // --- Handlers de Usuario Sistema ---
  const handleAddUser = (user: Omit<SystemUser, 'id'>) => {
      const newUser = { ...user, id: Math.random().toString(36).substr(2, 5) };
      setSystemUsers(prev => [...prev, newUser]);
  };

  const handleUpdateUser = (user: SystemUser) => {
      setSystemUsers(prev => prev.map(u => u.id === user.id ? user : u));
  };

  const handleToggleUserStatus = (id: string) => {
      setSystemUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };
  // ----------------------------------

  const handleCreateTraining = (t: Omit<Training, 'id'>) => {
    const newId = 't' + Math.random().toString(36).substr(2, 5);
    const newTraining = { ...t, id: newId, companyId: currentUser?.role === 'superadmin' ? null : currentUser?.companyId };
    setTrainings(prev => [newTraining, ...prev]);

    const newNotifs = createNotificationsForTraining(newTraining);
    setNotifications(prev => [...prev, ...newNotifs]);
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

  const handleBulkRegister = (newUsersData: Partial<EventUser>[], trainingId: string) => {
    const newUsers: EventUser[] = newUsersData.map(u => ({
        id: 'u' + Math.random().toString(36).substr(2, 7),
        trainingId: trainingId,
        name: u.name || '',
        email: u.email || '',
        dni: u.dni || '',
        organization: u.organization || '',
        area: u.area || '',
        role: u.role || '',
        brevete: u.brevete,
        status: UserStatus.REGISTERED,
        attended: false,
        registeredAt: new Date().toISOString(),
        customAnswers: {}
    }));
    setUsers(prev => [...newUsers, ...prev]);
  };

  const handleUpdateStatus = (userId: string, status: UserStatus, meetingLink?: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status, meetingLink: meetingLink || u.meetingLink } : u));
  };

  const handleToggleAttendance = (userId: string) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, attended: !u.attended } : u));
  };

  const handleConsolidate = (trainingId: string) => {
    setTrainings(prev => prev.map(t => 
        t.id === trainingId 
        ? { ...t, isConsolidated: true, consolidatedAt: new Date().toISOString() } 
        : t
    ));
  };

  const handleExport = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    const headers = ['Nombres y Apellidos', 'DNI', 'Email', 'Empresa', 'Área', 'Cargo', 'Brevete', 'Estado', 'Asistencia'];
    const trainingUsers = users.filter(u => u.trainingId === trainingId);
    
    const rows = trainingUsers.map(u => [
      u.name, 
      u.dni, 
      u.email, 
      u.organization, 
      u.area, 
      u.role, 
      u.brevete || '',
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

  if (isPublicView && publicTrainingId) {
    const targetTraining = trainings.find(t => t.id === publicTrainingId);
    if (!targetTraining) return <div className="p-10 text-center">No encontrado</div>; // Simplified error
    if (targetTraining.isConsolidated) return <div className="p-10 text-center">Cerrado</div>; // Simplified error

    return (
      <div className="min-h-screen bg-slate-50 py-10">
        <PublicRegistration training={targetTraining} onSubmit={handleRegister} />
      </div>
    );
  }

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
            trainings={filteredTrainings} 
            onCreateTraining={handleCreateTraining}
            onUpdateTraining={handleUpdateTraining}
            onSelectTraining={handleSelectTraining}
            userRole={currentUser.role}
          />
        )}
        {activeTab === 'calendar' && (
          <CalendarView
            trainings={filteredTrainings}
            users={filteredUsers}
            currentUser={currentUser}
            onSelectTraining={handleSelectTraining}
          />
        )}
        {activeTab === 'dashboard' && (
          <AdminDashboard
            users={filteredUsers}
            trainings={filteredTrainings}
            selectedTrainingId={selectedTrainingId}
            onUpdateStatus={handleUpdateStatus}
            onToggleAttendance={handleToggleAttendance}
            onExport={handleExport}
            onBulkRegister={handleBulkRegister}
            onConsolidate={handleConsolidate}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationCenter notifications={notifications} />
        )}
        
        {/* Nueva Pestaña solo accesible si es superadmin (Layout ya protege el botón, pero aquí protegemos render) */}
        {activeTab === 'users' && currentUser.role === 'superadmin' && (
            <UserManagement 
                users={systemUsers}
                companies={companies}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onToggleStatus={handleToggleUserStatus}
            />
        )}

        {/* Mantenemos la vista pública para demo */}
        {activeTab === 'public' && trainings.length > 0 && (
          <div className="p-8 bg-indigo-50 rounded-3xl border border-indigo-100">
            <PublicRegistration training={trainings[0]} onSubmit={handleRegister} />
          </div>
        )}
      </div>
    </Layout>
  );
};

export default App;
