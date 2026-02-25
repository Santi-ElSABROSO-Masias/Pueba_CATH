
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Layout } from './components/Layout';
import { AdminDashboard } from './components/AdminDashboard';
import { TrainingManager } from './components/TrainingManager';
import { AvailableTrainings } from './components/AvailableTrainings';
import { PublicRegistration } from './components/PublicRegistration';
import { CalendarView } from './components/CalendarView';
import { NotificationCenter } from './components/NotificationCenter';
import { UserManagement } from './components/UserManagement'; // Nuevo Import
import { PublicExam } from './components/PublicExam';
import { EvaluacionesModule } from './components/EvaluacionesModule';
import { IdentityValidationPage } from './components/IdentityValidationPage';
import { Auth } from './components/Auth';
import { EventUser, UserStatus, SystemUser, Training, Notification, Company, TrainingStatus, Question, Exam, ExamResult } from './types';
import { createNotificationsForTraining } from './utils/notificationLogic';
import { isTrainingFinished, isSixHoursAfterEnd } from './utils/time';

import { AuthProvider, useAuth } from './AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';

const AppContent: React.FC = () => {
  const { user: currentUser, login: setCurrentUser, logout: handleLogout } = useAuth();
  const [activeTab, setActiveTab] = useState<'trainings' | 'dashboard' | 'public' | 'calendar' | 'notifications' | 'users' | 'evaluaciones' | 'public_exam'>('trainings');
  const [selectedTrainingId, setSelectedTrainingId] = useState<string>('');
  const [exams, setExams] = useState<Exam[]>(() => {
    const saved = localStorage.getItem('eventmanager_exams');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('eventmanager_exams', JSON.stringify(exams));
  }, [exams]);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [isInitializing, setIsInitializing] = useState(true);

  // Estado para el enrutamiento público
  const [isPublicView, setIsPublicView] = useState(false);
  const [isExamView, setIsExamView] = useState(false);
  const [publicTrainingId, setPublicTrainingId] = useState<string | null>(null);
  const [publicExamId, setPublicExamId] = useState<string | null>(null);
  const [isValidationView, setIsValidationView] = useState(false);



  const sendEmail = async (to: string, subject: string, body: string) => {
    console.log(`Simulating email to ${to}:\nSubject: ${subject}\nBody: ${body}`);
    return Promise.resolve();
  };

  const sendWhatsApp = async (to: string, body: string) => {
    console.log(`Simulating WhatsApp to ${to}:\n${body}`);
    return Promise.resolve();
  };

  const sendExamLinkToUser = async (user: EventUser, exam: Exam) => {
    const examLink = `${window.location.origin}/examen?id=${exam.id}`;
    const training = trainingsRef.current.find((t: Training) => t.id === exam.trainingId);

    await sendEmail(
      user.email,
      `Examen disponible: ${training?.title}`,
      `Hola ${user.name}, ya puedes rendir tu examen: ${examLink}`
    );

    await sendWhatsApp(
      user.phone,
      `✅ Capacitación finalizada\n📝 ${training?.title}\n🔗 ${examLink}\n⏱️ ${exam.timeLimit} min`
    );

    setExams(prev => prev.map(e =>
      e.id === exam.id
        ? { ...e, sentTo: [...(e.sentTo || []), user.id], dispatchedAt: new Date().toISOString() }
        : e
    ));
  };

  const evaluateExamDispatch = () => {
    const currentExams = examsRef.current;
    const currentTrainings = trainingsRef.current;
    const currentUsers = usersRef.current;

    currentExams.forEach((exam: Exam) => {
      const training = currentTrainings.find((t: Training) => t.id === exam.trainingId);
      if (!training) return;

      if (isTrainingFinished(training) && !exam.isPublished) {
        setExams(prev => prev.map(e =>
          e.id === exam.id ? { ...e, pendingDispatch: true } : e
        ));
      }

      if (!exam.isPublished) return;

      const eligibleUsers = currentUsers.filter((u: EventUser) =>
        u.trainingId === exam.trainingId &&
        u.status === UserStatus.LINK_SENT
      );

      const pendingUsers = eligibleUsers.filter((u: EventUser) =>
        !(exam.sentTo || []).includes(u.id)
      );

      if (pendingUsers.length === 0) return;

      if (isSixHoursAfterEnd(training)) {
        pendingUsers.forEach((user: EventUser) => sendExamLinkToUser(user, exam));
      }
    });
  };

  useEffect(() => {
    const interval = setInterval(() => {
      evaluateExamDispatch();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateExam = (updatedExam: Exam) => {
    setExams(prev => prev.map(e => 
      e.id === updatedExam.id ? updatedExam : e
    ));
  };

  const handleSubmitResult = (examId: string, result: Omit<ExamResult, 'id' | 'examId' | 'completedAt'>) => {
    setExams(prev => prev.map(e => 
      e.id === examId 
        ? { ...e, results: [...e.results, { ...result, id: `res_${Date.now()}`, examId, completedAt: new Date().toISOString() }] } 
        : e
    ));
  };

  const [currentExamId, setCurrentExamId] = useState<string | null>(null); // Needed for public exam link simulation

  const handleCreateExam = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId);
    if (!training) return;

    const newExam: Exam = {
      id: 'ex' + Math.random().toString(36).substr(2, 5),
      trainingId,
      trainingTitle: training.title,
      createdAt: new Date().toISOString(),
      status: 'draft',
      questions: [],
      timeLimit: 30,
      minPassingScore: 70,
      results: [],
      accessType: 'public',
      requiresPassword: false,
      participantFields: {
        name: true,
        dni: true,
        email: false,
        organization: false,
      },
      isPublished: false,
    };
    setExams(prev => [...prev, newExam]);
  };

  const currentExam = useMemo(() => 
    (activeTab === 'public_exam' && currentExamId) 
      ? exams.find(e => e.id === currentExamId) 
      : null, 
    [activeTab, currentExamId, exams]
  );



  // --- DATOS MOCK PARA MVP DE ROLES ---
  const [companies, setCompanies] = useState<Company[]>([
      { id: 'c1', name: 'TechFlow S.A.', quotaMax: 100, quotaUsed: 10 },
      { id: 'c2', name: 'Minera Los Andes', quotaMax: 50, quotaUsed: 5 }
  ]);

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>([
      { id: 'su1', name: 'Admin Global', email: 'admin@system.com', role: 'super_super_admin', companyId: null, isActive: true },
      { id: 'su2', name: 'Operador TechFlow', email: 'ops@techflow.com', role: 'admin_contratista', companyId: 'c1', isActive: true },
      { id: 'su3', name: 'Validador Nivel 2', email: 'validador@system.com', role: 'super_admin', companyId: null, isActive: true }
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
        registration_deadline: new Date(new Date(mondayDate).getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 día antes
        maxCapacity: 60,
        isPublished: true,
        customQuestions: ['¿Posee examen médico vigente?'],
        instructorName: 'Equipo SSOMA',
        color: '#0EA5E9',
        duration: '4 días',
        schedule: '8:00 am - 6:00 pm',
        group: 'Grupo 1',
        companyId: null, // Global
        status: TrainingStatus.ACTIVE
      },
      {
        id: 't2',
        title: 'Manejo Defensivo - RITRA - Fatiga y Somnolencia',
        description: 'Curso mandatorio para conductores internos y externos. Enfoque en prevención de accidentes vehiculares.',
        date: fridayDate,
        registration_deadline: new Date(new Date(fridayDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
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
        registration_deadline: new Date(new Date(fridayDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
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
        registration_deadline: new Date(new Date(saturdayDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
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
        registration_deadline: new Date(new Date(saturdayDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
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
        registration_deadline: new Date(new Date(sundayDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
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
        registration_deadline: new Date(new Date(sundayDate).getTime() - 24 * 60 * 60 * 1000).toISOString(),
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
      phone: '987654321',
      dni: '12345678',
      organization: 'TechFlow S.A.',
      area: 'Sistemas',
      role: 'Analista Senior',
      status: UserStatus.LINK_SENT,
      meetingLink: 'https://teams.live.com/123456789',
      attended: true,
      registeredAt: new Date().toISOString(),
      identity_validated: false,
      validation_link: '',
      validation_completed: false
    }
  ]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const examsRef = useRef(exams);
  const usersRef = useRef(users);
  const trainingsRef = useRef(trainings);

  useEffect(() => { examsRef.current = exams; }, [exams]);
  useEffect(() => { usersRef.current = users; }, [users]);
  useEffect(() => { trainingsRef.current = trainings; }, [trainings]);

  // Lógica de Filtrado por Rol
  const filteredTrainings = useMemo(() => {
      if (!currentUser) return [];
      if (currentUser.role === 'super_super_admin' || currentUser.role === 'super_admin') return trainings;
      // Usuarios ven cursos globales (null) o de su empresa
      return trainings.filter(t => !t.companyId || t.companyId === currentUser.companyId);
  }, [trainings, currentUser]);

  const filteredUsers = useMemo(() => {
      if (!currentUser) return [];
      if (currentUser.role === 'super_super_admin' || currentUser.role === 'super_admin') return users;
      
      const visibleTrainingIds = filteredTrainings.map(t => t.id);
      const userCompany = companies.find(c => c.id === currentUser.companyId);
      
      return users.filter(u => 
        visibleTrainingIds.includes(u.trainingId) && 
        (!userCompany || u.organization === userCompany.name)
      );
  }, [users, filteredTrainings, currentUser, companies]);


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
    } else if (path.startsWith('/validar-identidad')) {
      setIsValidationView(true);
    } else if (path.startsWith('/examen') && id) {
      setIsExamView(true);
      setPublicExamId(id);
    }

    const savedSession = localStorage.getItem('event_mvp_session');
    // if (savedSession) setCurrentUser(JSON.parse(savedSession)); // Ahora manejado por AuthContext
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
    const newTraining = { ...t, id: newId, companyId: currentUser?.role === 'super_super_admin' ? null : currentUser?.companyId };
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
      phone: data.phone || '',
      dni: data.dni,
      organization: data.organization,
      area: data.area,
      role: data.role,
      status: UserStatus.REGISTERED,
      attended: false,
      registeredAt: new Date().toISOString(),
      customAnswers: data.custom,
      identity_validated: false,
      validation_link: '',
      validation_completed: false
    };
    setUsers(prev => [newUser, ...prev]);
  };

  const handleBulkRegister = (newUsersData: Partial<EventUser>[], trainingId: string) => {
    const newUsers: EventUser[] = newUsersData.map(u => ({
        id: 'u' + Math.random().toString(36).substr(2, 7),
        trainingId: trainingId,
        name: u.name || '',
        email: u.email || '',
        phone: u.phone || '',
        dni: u.dni || '',
        organization: u.organization || '',
        area: u.area || '',
        role: u.role || '',
        brevete: u.brevete,
        status: UserStatus.REGISTERED,
        attended: false,
        registeredAt: new Date().toISOString(),
        customAnswers: {},
        identity_validated: false,
        validation_link: '',
        validation_completed: false
    }));
    setUsers(prev => [...newUsers, ...prev]);
  };

  const handleManualRegister = (userData: Partial<EventUser>, trainingId: string, newCompany?: string) => {
    let finalOrganization = userData.organization || '';
    
    if (newCompany) {
      const newCompanyId = 'c' + Math.random().toString(36).substr(2, 5);
      const newCompanyObj: Company = {
        id: newCompanyId,
        name: newCompany,
        quotaMax: 0,
        quotaUsed: 0
      };
      setCompanies(prev => [...prev, newCompanyObj]);
      finalOrganization = newCompany;
    }

    const newUser: EventUser = {
      id: 'u' + Math.random().toString(36).substr(2, 7),
      trainingId: trainingId,
      name: userData.name || '',
      email: userData.email || '',
      phone: userData.phone || '',
      dni: userData.dni || '',
      organization: finalOrganization,
      area: userData.area || '',
      role: userData.role || '',
      brevete: userData.brevete,
      dniPhoto: userData.dniPhoto,
      status: UserStatus.REGISTERED,
      attended: false,
      registeredAt: new Date().toISOString(),
      customAnswers: {},
      identity_validated: false,
      validation_link: '',
      validation_completed: false
    };
    setUsers(prev => [newUser, ...prev]);
    alert('Trabajador registrado exitosamente');
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
    const headers = ['Nombres y Apellidos', 'DNI', 'Email', 'Teléfono', 'Empresa', 'Área', 'Cargo', 'Brevete', 'Estado', 'Asistencia'];
    const trainingUsers = users.filter(u => u.trainingId === trainingId);
    
    const rows = trainingUsers.map(u => [
      u.name, 
      u.dni, 
      u.email, 
      u.phone,
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

  if (isValidationView) {
    return <IdentityValidationPage />;
  }

  if (isExamView && publicExamId) {
    const exam = exams.find(e => e.id === publicExamId);
    if (!exam) return <div>Examen no encontrado</div>;
    if (!exam.isPublished) return <div>Examen no disponible</div>;
    return <PublicExam examId={exam.id} onSubmitResult={handleSubmitResult} />;
  }

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
  if (!currentUser) return <Auth />;

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      user={currentUser} 
      onLogout={handleLogout}
    >
      <div className="animate-fadeIn">
        {activeTab === 'trainings' && (
          currentUser.role === 'admin_contratista' ? (
              <AvailableTrainings 
                trainings={filteredTrainings}
                onSelectTraining={handleSelectTraining}
              />
          ) : (
              <TrainingManager 
                trainings={filteredTrainings} 
                onCreateTraining={handleCreateTraining}
                onUpdateTraining={handleUpdateTraining}
                onSelectTraining={handleSelectTraining}
                userRole={currentUser.role}
                onScheduleGenerated={(schedule) => {
                    setTrainings(prev => {
                        const scheduleTrainingIds = schedule.trainings.map((t: Training) => t.id);
                        const otherTrainings = prev.filter(t => !scheduleTrainingIds.includes(t.id));
                        return [...otherTrainings, ...schedule.trainings];
                    });
                }}
                users={users}
              />
          )
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
            onManualRegister={handleManualRegister}
            onConsolidate={handleConsolidate}
            companyName={companies.find(c => c.id === currentUser.companyId)?.name}
            companies={companies}
            currentUserCompanyId={currentUser.companyId}
            exams={exams}
            examResults={examResults}
          />
        )}
        {activeTab === 'notifications' && (
          <NotificationCenter notifications={notifications} />
        )}
        
        {/* Nueva Pestaña solo accesible si es super_super_admin */}
        {activeTab === 'users' && currentUser.role === 'super_super_admin' && (
            <UserManagement 
                users={systemUsers}
                companies={companies}
                onAddUser={handleAddUser}
                onUpdateUser={handleUpdateUser}
                onToggleStatus={handleToggleUserStatus}
            />
        )}

        {activeTab === 'evaluaciones' && currentUser.role !== 'admin_contratista' && (
          <EvaluacionesModule 
            trainings={filteredTrainings}
            exams={exams}
            onCreateExam={handleCreateExam}
            onUpdateExam={handleUpdateExam}
            currentUserRole={currentUser.role}
            users={filteredUsers}
          />
        )}

        {activeTab === 'public_exam' && currentExam && (
          <PublicExam 
            examId={currentExam.id}
            onSubmitResult={handleSubmitResult}
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

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <AppContent />
      </NavigationProvider>
    </AuthProvider>
  );
};

export default App;
