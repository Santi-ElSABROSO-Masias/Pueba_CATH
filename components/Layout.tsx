
import React from 'react';
import { SystemUser } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'trainings' | 'dashboard' | 'public';
  onTabChange: (tab: 'trainings' | 'dashboard' | 'public') => void;
  user: SystemUser | null;
  onLogout: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, user, onLogout }) => {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50 text-slate-900">
      {/* Sidebar Operativo */}
      <nav className="w-full md:w-64 bg-slate-900 text-white flex flex-col p-6 sticky top-0 h-auto md:h-screen z-50">
        <div className="flex items-center gap-3 mb-10">
          <div className="p-2 bg-indigo-500 rounded-lg shadow-lg">
            <i className="fas fa-graduation-cap text-xl"></i>
          </div>
          <h1 className="font-bold text-xl tracking-tight">EventManager</h1>
        </div>

        <ul className="space-y-2 flex-grow">
          <li>
            <button
              onClick={() => onTabChange('trainings')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'trainings' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fas fa-folder-plus"></i>
              <span className="font-semibold text-sm">Capacitaciones</span>
            </button>
          </li>
          <li>
            <button
              onClick={() => onTabChange('dashboard')}
              className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:bg-slate-800'}`}
            >
              <i className="fas fa-users-cog"></i>
              <span className="font-semibold text-sm">Gestionar Inscritos</span>
            </button>
          </li>
        </ul>

        <div className="mt-auto pt-6 border-t border-slate-800 space-y-4">
          {user && (
            <div className="flex items-center gap-3 bg-slate-800/50 p-3 rounded-xl border border-white/5">
              <div className="w-8 h-8 bg-indigo-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-bold truncate">{user.name}</p>
                <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
              </div>
            </div>
          )}
          
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-xs font-semibold text-slate-400 hover:text-red-400 hover:bg-red-400/5 rounded-xl transition-all"
          >
            <i className="fas fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
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
