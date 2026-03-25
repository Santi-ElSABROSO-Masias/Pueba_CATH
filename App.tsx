
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
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
import { InduccionDashboard } from './src/modules/induccion-temporal/components/InduccionDashboard';
import { LicenciasManejo } from './src/modules/autorizaciones/components/LicenciasManejo';
import { AcreditacionVehicular } from './src/modules/autorizaciones/components/AcreditacionVehicular';
import { TrabajosAltoRiesgo } from './src/modules/autorizaciones/components/TrabajosAltoRiesgo';
import { EventUser, UserStatus, SystemUser, Training, Notification, Company, TrainingStatus, Question, Exam, ExamResult } from './types';
import { createNotificationsForTraining, createCourseOpenedNotification, createRegistrationConfirmedNotification } from './utils/notificationLogic';
import { isTrainingFinished, isSixHoursAfterEnd } from './utils/time';

import { useAuth } from './AuthContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { AuthProvider } from './AuthContext';
import { useTrainings } from './src/hooks/useTrainings';
import { useUsers } from './src/hooks/useUsers';
import { useCompanies } from './src/hooks/useCompanies';
import { useSystemUsers } from './src/hooks/useSystemUsers';

const AppContent: React.FC = () => {
  const { user: currentUser, login: setCurrentUser, logout: handleLogout, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'trainings' | 'dashboard' | 'public' | 'calendar' | 'notifications' | 'users' | 'evaluaciones' | 'public_exam' | 'induccion_temporal' | 'licencias_manejo' | 'acreditacion_vehicular' | 'alto_riesgo'>('trainings');
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





  // Helper para calcular fechas relativas a la próxima semana
  const getNextDate = (dayOfWeek: number): string => {
    const d = new Date();
    d.setDate(d.getDate() + (dayOfWeek + 7 - d.getDay()) % 7);
    const today = new Date();
    if (d <= today) d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  };

  const { trainings, loading: trainingsLoading, createTraining, updateTraining, deleteTraining, setTrainings } = useTrainings();
  const { users, loading: usersLoading, registerUser, updateUserStatus, toggleAttendance, setUsers } = useUsers();
  const { companies, loading: companiesLoading, addCompany, setCompanies } = useCompanies();
  const { systemUsers, loading: systemUsersLoading, addSystemUser, updateSystemUser, toggleUserStatus, setSystemUsers } = useSystemUsers();

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
  const handleAddUser = async (user: Omit<SystemUser, 'id'>) => {
    try {
      await addSystemUser(user);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateUser = async (user: SystemUser) => {
    try {
      await updateSystemUser(user);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleUserStatus = async (id: string) => {
    try {
      await toggleUserStatus(id);
    } catch (e: any) {
      alert(e.message);
    }
  };
  // ----------------------------------

  const handleCreateTraining = async (t: Omit<Training, 'id'>) => {
    try {
      const newTraining = await createTraining(t);
      if (newTraining) {
        const newNotifs = createNotificationsForTraining(newTraining);
        const courseOpenedNotif = createCourseOpenedNotification(newTraining);
        setNotifications(prev => [...prev, ...newNotifs, courseOpenedNotif]);
      }
    } catch (e) {
      console.error(e);
      alert('Error creating training');
      throw e;
    }
  };

  const handleUpdateTraining = async (updatedTraining: Training) => {
    try {
      await updateTraining(updatedTraining.id, updatedTraining);
    } catch (e) {
      console.error(e);
      alert('Error updating training');
      throw e;
    }
  };

  const handleSelectTraining = (id: string) => {
    setSelectedTrainingId(id);
    setActiveTab('dashboard');
  };

  const handleRegister = async (data: any) => {
    try {
      const newUser: Partial<EventUser> = {
        trainingId: data.trainingId,
        name: data.name,
        email: data.email,
        phone: data.phone || '',
        dni: data.dni,
        organization: data.organization,
        area: data.area,
        role: data.role,
        status: UserStatus.REGISTERED,
        customAnswers: data.custom,
      };
      await registerUser(newUser);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleBulkRegister = async (newUsersData: Partial<EventUser>[], trainingId: string) => {
    // Ideally this goes to a backend bulk endpoint. 
    // Simulating by mapping for now until a true bulk endpoint is exposed.
    alert('Importación masiva: Conectando con API (En desarrollo en el backend)');
    /*
    const newUsers = newUsersData.map(u => ({ ...u, trainingId }));
    // await apiClient.post('/registrations/bulk', newUsers)
    */
  };

  const handleManualRegister = async (userData: Partial<EventUser>, trainingId: string, newCompany?: string) => {
    let finalOrganization = userData.organization || '';

    if (newCompany) {
      const newCompanyId = 'c' + Math.random().toString(36).substr(2, 5);
      const newCompanyObj: Company = {
        id: newCompanyId,
        name: newCompany,
        quotaMax: 0,
        quotaUsed: 0
      };
      setCompanies(prev => [...prev, newCompanyObj]); // TODO: API Integration for companies
      finalOrganization = newCompany;
    }

    try {
      const newUser: Partial<EventUser> = {
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
      };
      await registerUser(newUser);

      const training = trainings.find(t => t.id === trainingId);
      if (training) {
        setTrainings(prev => prev.map(t => 
          t.id === trainingId 
            ? { ...t, registeredCount: (t.registeredCount || 0) + 1 } 
            : t
        ));

        const regNotif = createRegistrationConfirmedNotification(training, userData.name || '', userData.email || '');
        setNotifications(prev => [...prev, regNotif]);
      }
      alert('Trabajador registrado exitosamente');
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleUpdateStatus = async (userId: string, status: UserStatus, meetingLink?: string) => {
    try {
      await updateUserStatus(userId, status, meetingLink);
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleToggleAttendance = async (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      try {
        await toggleAttendance(userId, !user.attended);
      } catch (e: any) {
        alert(e.message);
      }
    }
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

  if (isInitializing || trainingsLoading || usersLoading || companiesLoading || systemUsersLoading || authLoading) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i></div>;
  if (!currentUser) return null;

  return (
    <Layout
      activeTab={activeTab}
      onTabChange={setActiveTab}
      user={currentUser}
      onLogout={handleLogout}
      unreadCount={notifications.filter(n => (n.status === 'pending' || !n.read)).length}
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
              onDeleteTraining={deleteTraining}
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
          <NotificationCenter 
            notifications={notifications} 
            onMarkAsRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))}
          />
        )}

        {/* Nueva Pestaña solo accesible si es super_super_admin */}
        {activeTab === 'users' && currentUser.role === 'super_super_admin' && (
          <UserManagement
            users={systemUsers}
            companies={companies}
            onAddUser={handleAddUser}
            onUpdateUser={handleUpdateUser}
            onToggleStatus={handleToggleUserStatus}
            onAddCompany={addCompany}
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

        {activeTab === 'induccion_temporal' && currentUser.role === 'super_super_admin' && (
          <InduccionDashboard />
        )}

        {/* ════════════════════════════════════════════════ */}
        {/* MÓDULO AUTORIZACIONES (Protegido o global según rol) */}
        {/* ════════════════════════════════════════════════ */}
        {activeTab === 'licencias_manejo' && (
          <LicenciasManejo />
        )}

        {activeTab === 'acreditacion_vehicular' && (
          <AcreditacionVehicular />
        )}

        {activeTab === 'alto_riesgo' && (
          <TrabajosAltoRiesgo />
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

const ProtectedAppContent: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><i className="fas fa-circle-notch fa-spin text-indigo-600 text-3xl"></i></div>;
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Auth />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={<Navigate to="/" replace />} />
      <Route path="/*" element={<AppContent />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <NavigationProvider>
        <ProtectedAppContent />
      </NavigationProvider>
    </AuthProvider>
  );
};

export default App;
