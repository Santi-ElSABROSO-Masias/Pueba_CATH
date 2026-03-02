
import React, { useState } from 'react';
import { SystemUser, ROLE_LABELS } from '../types';
import { useAuth } from '../AuthContext';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'trainings' | 'dashboard' | 'public' | 'calendar' | 'notifications' | 'users' | 'evaluaciones' | 'public_exam' | 'induccion_temporal';
  onTabChange: (tab: 'trainings' | 'dashboard' | 'public' | 'calendar' | 'notifications' | 'users' | 'evaluaciones' | 'public_exam' | 'induccion_temporal') => void;
  user: SystemUser | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout }) => {
  const { can, isAdminContratista, isSuperAdmin, isSuperSuperAdmin } = useAuth();

  // Estado para expandir/colapsar el módulo Capacitaciones
  const isCapacitacionesActive = activeTab === 'calendar' || activeTab === 'trainings' || activeTab === 'dashboard' || activeTab === 'evaluaciones';
  const [capacitacionesOpen, setCapacitacionesOpen] = useState(isCapacitacionesActive);

  // Estado para expandir/colapsar el módulo Usuarios
  const isUsuariosActive = activeTab === 'users';
  const [usuariosOpen, setUsuariosOpen] = useState(isUsuariosActive);

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar Operativo */}
      <nav className="w-full md:w-[260px] md:min-w-[240px] bg-slate-900 text-white flex flex-col sticky top-0 h-auto md:h-screen z-50 shadow-xl transition-all duration-300">
        <div className="flex items-center gap-3 p-6">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-lg shrink-0">
            <i className="fas fa-graduation-cap text-xl"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight whitespace-nowrap">EventManager</h1>
        </div>

        <ul className="flex-grow overflow-y-auto px-3 space-y-1 pb-4">

          {/* ═══════════════════════════════════════════ */}
          {/* MÓDULO 1: CAPACITACIONES                   */}
          {/* ═══════════════════════════════════════════ */}
          <li>
            <button
              onClick={() => setCapacitacionesOpen(!capacitacionesOpen)}
              className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${isCapacitacionesActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fas fa-graduation-cap w-5 shrink-0"></i>
              <span className="font-bold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Capacitaciones</span>
              <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${capacitacionesOpen ? 'rotate-180' : ''}`}></i>
            </button>

            {/* Sub-items de Capacitaciones */}
            {capacitacionesOpen && (
              <ul className="mt-1 ml-4 pl-3 border-l border-slate-700/50 space-y-1">

                {/* 1.1 Calendario (Común a todos) */}
                <li>
                  <button
                    onClick={() => onTabChange('calendar')}
                    className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'calendar' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                  >
                    <i className="far fa-calendar-alt w-4 shrink-0 text-xs"></i>
                    <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Calendario</span>
                  </button>
                </li>

                {/* 1.2 Cursos — Varía por rol */}
                {isAdminContratista() && (
                  <>
                    <li>
                      <button
                        onClick={() => onTabChange('dashboard')}
                        className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        <i className="fas fa-users-cog w-4 shrink-0 text-xs"></i>
                        <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Mis Trabajadores</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onTabChange('trainings')}
                        className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'trainings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        <i className="fas fa-chart-pie w-4 shrink-0 text-xs"></i>
                        <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Gestión de Cupos</span>
                      </button>
                    </li>
                  </>
                )}

                {isSuperAdmin() && (
                  <>
                    <li>
                      <button
                        onClick={() => onTabChange('dashboard')}
                        className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        <i className="fas fa-user-check w-4 shrink-0 text-xs"></i>
                        <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Validar Trabajadores</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onTabChange('trainings')}
                        className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'trainings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        <i className="fas fa-users w-4 shrink-0 text-xs"></i>
                        <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Todos los Inscritos</span>
                      </button>
                    </li>
                  </>
                )}

                {isSuperSuperAdmin() && (
                  <>
                    <li>
                      <button
                        onClick={() => onTabChange('dashboard')}
                        className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        <i className="fas fa-tachometer-alt w-4 shrink-0 text-xs"></i>
                        <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Dashboard</span>
                      </button>
                    </li>
                    <li>
                      <button
                        onClick={() => onTabChange('trainings')}
                        className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'trainings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                      >
                        <i className="fas fa-book-open w-4 shrink-0 text-xs"></i>
                        <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Cursos</span>
                      </button>
                    </li>
                  </>
                )}

                {/* 1.3 Evaluaciones (Super Admin y Super Super Admin) */}
                {(isSuperSuperAdmin() || isSuperAdmin()) && (
                  <li>
                    <button
                      onClick={() => onTabChange('evaluaciones')}
                      className={`w-full text-left px-3 py-2.5 min-h-[40px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'evaluaciones' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
                    >
                      <i className="fas fa-clipboard-list w-4 shrink-0 text-xs"></i>
                      <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Evaluaciones</span>
                    </button>
                  </li>
                )}

              </ul>
            )}
          </li>

          {isSuperSuperAdmin() && (
            <li className="pt-3 mt-3 border-t border-slate-700/50">

              <button
                onClick={() => setUsuariosOpen(!usuariosOpen)}
                className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${isUsuariosActive ? 'bg-indigo-600/20 text-indigo-300' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <i className="fas fa-users w-5 shrink-0 text-center"></i>
                <span className="font-bold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Gestionar Usuarios</span>
                <i className={`fas fa-chevron-down text-[10px] transition-transform duration-200 ${usuariosOpen ? 'rotate-180' : ''}`}></i>
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

          {/* MÓDULO 3: INDUCCIÓN TEMPORAL (Solo SuperSuper) (Movido Arriba de Notificaciones) */}
          {isSuperSuperAdmin() && (
            <li className="pt-3 mt-3 border-t border-slate-700/50">
              <button
                onClick={() => onTabChange('induccion_temporal')}
                className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'induccion_temporal' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
              >
                <i className="fas fa-shield-alt w-5 shrink-0"></i>
                <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Inducción Temporal</span>
              </button>
            </li>
          )}

          {/* ═══════════════════════════════════════════ */}
          {/* MÓDULO 4: NOTIFICACIONES (Movido Abajo)    */}
          {/* ═══════════════════════════════════════════ */}
          <li className="pt-3 mt-3 border-t border-slate-700/50">
            <button
              onClick={() => onTabChange('notifications')}
              className={`w-full text-left px-4 py-3 min-h-[44px] rounded-lg flex items-center gap-3 transition-all ${activeTab === 'notifications' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fas fa-bell w-5 shrink-0"></i>
              <span className="font-semibold text-sm flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Notificaciones</span>
              <span className="ml-auto bg-amber-500 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0">AUTO</span>
            </button>
          </li>

        </ul>

        <div className="mt-auto border-t border-slate-800 bg-slate-900 z-10">
          {user && (
            <div className="m-3 p-4 bg-white/10 rounded-lg">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <p className="font-semibold text-sm whitespace-normal break-words leading-tight">{user.name}</p>
              </div>
              <p className="text-xs text-white/70 whitespace-normal mt-1 pl-1">{ROLE_LABELS[user.role]}</p>
            </div>
          )}

          <div className="px-3 pb-4">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
            >
              <i className="fas fa-sign-out-alt w-5 shrink-0"></i>
              <span className="flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-grow p-4 md:p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};