
import React, { useState } from 'react';
import { SystemUser } from '../types';

interface AuthProps {
  onLogin: (user: SystemUser) => void;
}

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de autenticación (En producción conectar con Supabase Auth)
    setTimeout(() => {
      const mockUser: SystemUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: isLogin ? email.split('@')[0] : name,
        role: 'ADMIN'
      };
      
      localStorage.setItem('event_mvp_session', JSON.stringify(mockUser));
      onLogin(mockUser);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="inline-flex p-3 bg-indigo-600 rounded-2xl shadow-xl shadow-indigo-200 mb-4">
            <i className="fas fa-bolt text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">EventManager MVP</h1>
          <p className="text-slate-500 font-medium mt-2">Acceso exclusivo para personal operativo</p>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl">
          <h2 className="text-xl font-bold text-slate-900 mb-6 text-center">
            {isLogin ? 'Iniciar Sesión' : 'Registrar Cuenta Staff'}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</label>
                <input
                  required
                  type="text"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  placeholder="Ej. Juan Pérez"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Correo Institucional</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="usuario@evento.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Contraseña</label>
              <input
                required
                type="password"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <i className="fas fa-circle-notch fa-spin"></i>
              ) : (
                <>{isLogin ? 'Entrar al Sistema' : 'Crear Cuenta'}</>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-semibold text-indigo-600 hover:underline"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-6 text-slate-400">
          <div className="flex items-center gap-2 text-xs">
            <i className="fas fa-shield-alt"></i>
            <span>Acceso Seguro</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <i className="fas fa-database"></i>
            <span>Supabase Auth Ready</span>
          </div>
        </div>
      </div>
    </div>
  );
};
