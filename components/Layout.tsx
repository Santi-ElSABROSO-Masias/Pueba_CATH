
import React, { useState } from 'react';
import { SystemUser, ROLE_LABELS } from '../types';
import { useAuth } from '../AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'trainings' | 'dashboard' | 'public' | 'calendar' | 'notifications' | 'users' | 'evaluaciones' | 'public_exam' | 'induccion_temporal' | 'licencias_manejo' | 'acreditacion_vehicular' | 'alto_riesgo';
  onTabChange: (tab: 'trainings' | 'dashboard' | 'public' | 'calendar' | 'notifications' | 'users' | 'evaluaciones' | 'public_exam' | 'induccion_temporal' | 'licencias_manejo' | 'acreditacion_vehicular' | 'alto_riesgo') => void;
  user: SystemUser | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout }) => {
  const { can, isAdminContratista, isSuperAdmin, isSuperSuperAdmin } = useAuth();

  const isCapacitacionesActive = activeTab === 'calendar' || activeTab === 'trainings' || activeTab === 'dashboard' || activeTab === 'evaluaciones';
  const [capacitacionesOpen, setCapacitacionesOpen] = useState(isCapacitacionesActive);

<<<<<<< HEAD
  // Estado para expandir/colapsar el módulo Usuarios
  const isUsuariosActive = activeTab === 'users';
  const [usuariosOpen, setUsuariosOpen] = useState(isUsuariosActive);

  // Estado para expandir/colapsar el módulo Autorizaciones
  const isAutorizacionesActive = activeTab === 'licencias_manejo' || activeTab === 'acreditacion_vehicular' || activeTab === 'alto_riesgo';
  const [autorizacionesOpen, setAutorizacionesOpen] = useState(isAutorizacionesActive);
=======
  // Helper: Nav item classes
  const navItemClass = (isActive: boolean) =>
    `w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${isActive
      ? 'bg-catalina-green text-white shadow-md shadow-catalina-green/20'
      : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`;

  const parentNavClass = (isActive: boolean) =>
    `w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${isActive
      ? 'bg-catalina-green/20 text-white'
      : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`;
>>>>>>> ab054b6 (feat: avances de UXUI y mejoras de componentes)

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-catalina-grey font-montserrat">
      {/* ═══ Sidebar Corporativo ═══ */}
      <nav className="w-full md:w-[260px] md:min-w-[240px] bg-catalina-forest-green text-white flex flex-col sticky top-0 h-auto md:h-screen z-50 shadow-xl transition-all duration-300">
        {/* Logo */}
        <div className="flex items-center gap-3 p-6">
          <div className="p-2 bg-catalina-green rounded-lg shadow-lg shrink-0">
            <i className="fas fa-graduation-cap text-xl"></i>
          </div>
          <h1 className="font-semibold text-xl tracking-tight whitespace-nowrap">EventManager</h1>
        </div>

        {/* Navigation */}
        <ul className="flex-grow overflow-y-auto px-3 space-y-1 pb-4">

          {/* ═══ MÓDULO 1: CAPACITACIONES ═══ */}
          <li>
            <button
              onClick={() => setCapacitacionesOpen(!capacitacionesOpen)}
              className={parentNavClass(isCapacitacionesActive)}
            >
              <i className="fas fa-graduation-cap w-5 shrink-0"></i>
              <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Capacitaciones</span>
              <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${capacitacionesOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Sub-items de Capacitaciones */}
            {capacitacionesOpen && (
              <ul className="mt-1 ml-4 pl-3 border-l border-white/15 space-y-1">

                {/* 1.1 Calendario (Común a todos) */}
                <li>
                  <button
                    onClick={() => onTabChange('calendar')}
                    className={navItemClass(activeTab === 'calendar')}
                  >
                    <i className="far fa-calendar-alt w-4 shrink-0 text-xs"></i>
                    <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Calendario</span>
                  </button>
                </li>

                {/* 1.2 Cursos — Varía por rol */}
                {isAdminContratista() && (
                  <>
                    <li>
                      <button
                        onClick={() => onTabChange('dashboard')}
                        className={navItemClass(activeTab === 'dashboard')}
                      >
                        <i className="fas fa-users-cog w-4 shrink-0 text-xs"></i>
                        <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Mis Trabajadores</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onTabChange('trainings')}
                        className={navItemClass(activeTab === 'trainings')}
                      >
                        <i className="fas fa-chart-pie w-4 shrink-0 text-xs"></i>
                        <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Gestión de Cupos</span>
                      </button>
                    </li>
                  </>
                )}

                {isSuperAdmin() && (
                  <>
                    <li>
                      <button
                        onClick={() => onTabChange('dashboard')}
                        className={navItemClass(activeTab === 'dashboard')}
                      >
                        <i className="fas fa-user-check w-4 shrink-0 text-xs"></i>
                        <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Validar Trabajadores</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onTabChange('trainings')}
                        className={navItemClass(activeTab === 'trainings')}
                      >
                        <i className="fas fa-users w-4 shrink-0 text-xs"></i>
                        <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Todos los Inscritos</span>
                      </button>
                    </li>
                  </>
                )}

                {isSuperSuperAdmin() && (
                  <>
                    <li>
                      <button
                        onClick={() => onTabChange('dashboard')}
                        className={navItemClass(activeTab === 'dashboard')}
                      >
                        <i className="fas fa-tachometer-alt w-4 shrink-0 text-xs"></i>
                        <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Dashboard</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onTabChange('trainings')}
                        className={navItemClass(activeTab === 'trainings')}
                      >
                        <i className="fas fa-book-open w-4 shrink-0 text-xs"></i>
                        <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Cursos</span>
                      </button>
                    </li>
                  </>
                )}

                {/* 1.3 Evaluaciones (Super Admin y Super Super Admin) */}
                {(isSuperSuperAdmin() || isSuperAdmin()) && (
                  <li>
                    <button
                      onClick={() => onTabChange('evaluaciones')}
                      className={navItemClass(activeTab === 'evaluaciones')}
                    >
                      <i className="fas fa-clipboard-list w-4 shrink-0 text-xs"></i>
                      <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Evaluaciones</span>
                    </button>
                  </li>
                )}

              </ul>
            )}
          </li>

<<<<<<< HEAD
          {isSuperSuperAdmin() && (
            <li className="pt-3 mt-3 border-t border-slate-700/50">

              <button
                onClick={() => setUsuariosOpen(!usuariosOpen)}
                className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${isUsuariosActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <i className="fas fa-users w-5 shrink-0 text-center"></i>
                <span className="font-bold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Gestionar Usuarios</span>
                <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${usuariosOpen ? 'rotate-180' : ''}`}></i>
=======
          {/* ═══ MÓDULO 2: AUTORIZACIONES (Solo SuperSuper) ═══ */}
          {isSuperSuperAdmin() && (
            <li className="pt-3 mt-3 border-t border-white/10">
              <p className="px-4 text-[10px] font-semibold text-catalina-dusty-green uppercase tracking-widest mb-2">Autorizaciones</p>
              <button
                onClick={() => onTabChange('users')}
                className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-catalina-green text-white shadow-md shadow-catalina-green/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
              >
                <i className="fas fa-users-shield w-5 shrink-0"></i>
                <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Gestionar Usuarios</span>
>>>>>>> ab054b6 (feat: avances de UXUI y mejoras de componentes)
              </button>

              {usuariosOpen && (
                <ul className="mt-1 ml-4 pl-3 border-l border-slate-700/50 space-y-1">
                  <li>
                    <button
                      onClick={() => onTabChange('users')}
                      className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <i className="fas fa-user-tie w-4 shrink-0 text-xs"></i>
                      <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Usuarios</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* MÓDULO 3: AUTORIZACIONES Y LICENCIAS       */}
          {/* ═══════════════════════════════════════════ */}
          <li className="pt-3 mt-3 border-t border-slate-700/50">
            <button
              onClick={() => setAutorizacionesOpen(!autorizacionesOpen)}
              className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${isAutorizacionesActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fas fa-id-card-alt w-5 shrink-0 text-center"></i>
              <span className="font-bold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Autorizaciones</span>
              <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${autorizacionesOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {autorizacionesOpen && (
              <ul className="mt-1 ml-4 pl-3 border-l border-slate-700/50 space-y-1">
                <li>
                  <button
                    onClick={() => onTabChange('licencias_manejo')}
                    className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'licencias_manejo' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <i className="fas fa-id-badge w-4 shrink-0 text-xs text-center"></i>
                    <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Licencias de Manejo</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onTabChange('acreditacion_vehicular')}
                    className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'acreditacion_vehicular' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <i className="fas fa-truck-pickup w-4 shrink-0 text-xs text-center"></i>
                    <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Acreditación Vehicular</span>
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onTabChange('alto_riesgo')}
                    className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'alto_riesgo' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <i className="fas fa-exclamation-triangle w-4 shrink-0 text-xs text-center"></i>
                    <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Trabajos de Riesgo</span>
                  </button>
                </li>
              </ul>
            )}
          </li>

          {/* MÓDULO 3: INDUCCIÓN TEMPORAL (Solo SuperSuper) (Movido Arriba de Notificaciones) */}
          {isSuperSuperAdmin() && (
            <li className="pt-3 mt-3 border-t border-slate-700/50">
              <button
<<<<<<< HEAD
                onClick={() => onTabChange('induccion_temporal')}
                className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'induccion_temporal' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <i className="fas fa-shield-alt w-5 shrink-0"></i>
                <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Inducción Temporal</span>
=======
                onClick={() => onTabChange('users')}
                className="w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all text-white/70 hover:bg-white/10 hover:text-white"
              >
                <i className="fas fa-building w-5 shrink-0"></i>
                <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Empresas</span>
>>>>>>> ab054b6 (feat: avances de UXUI y mejoras de componentes)
              </button>
            </li>
          )}

<<<<<<< HEAD
          {/* ═══════════════════════════════════════════ */}
          {/* MÓDULO 4: NOTIFICACIONES (Movido Abajo)    */}
          {/* ═══════════════════════════════════════════ */}
          <li className="pt-3 mt-3 border-t border-slate-700/50">
=======
          {/* ═══ MÓDULO 3: NOTIFICACIONES ═══ */}
          <li className={`${isSuperSuperAdmin() ? '' : 'pt-3 mt-3 border-t border-white/10'}`}>
>>>>>>> ab054b6 (feat: avances de UXUI y mejoras de componentes)
            <button
              onClick={() => onTabChange('notifications')}
              className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'notifications' ? 'bg-catalina-green text-white shadow-md shadow-catalina-green/20' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}
            >
              <i className="fas fa-bell w-5 shrink-0"></i>
              <span className="font-medium text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Notificaciones</span>
              <span className="ml-auto bg-catalina-highlight-orange text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0">AUTO</span>
            </button>
          </li>

        </ul>

        {/* ═══ User Profile Footer ═══ */}
        <div className="mt-auto border-t border-white/10 bg-catalina-forest-green z-10">
          {user && (
            <div className="m-3 p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-catalina-green text-white rounded-full flex items-center justify-center font-semibold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-medium text-sm whitespace-normal break-words leading-tight">{user.name}</p>
              </div>
              <p className="text-xs text-white/60 whitespace-normal mt-1 pl-1 font-normal">{ROLE_LABELS[user.role]}</p>
            </div>
          )}

          <div className="px-3 pb-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-medium text-white/60 hover:text-red-300 hover:bg-red-400/10 rounded-xl transition-all"
            >
              <i className="fas fa-sign-out-alt w-5 shrink-0"></i>
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* ═══ Main Content Area ═══ */}
      <main className="flex-grow p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};