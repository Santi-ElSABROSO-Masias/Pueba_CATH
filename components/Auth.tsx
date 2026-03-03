
import React, { useState } from 'react';
import { SystemUser, UserRole, ROLE_LABELS } from '../types';
import { useAuth } from '../AuthContext';

export const Auth: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  // Estado simulado para pruebas de rol
  const [simulatedRole, setSimulatedRole] = useState<UserRole>('super_super_admin');
  const [simulatedCompanyId, setSimulatedCompanyId] = useState<string>('c1');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const mockUser: SystemUser = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        name: isLogin ? email.split('@')[0] : name,
        role: simulatedRole,
        companyId: simulatedRole === 'admin_contratista' ? simulatedCompanyId : null,
        isActive: true
      };

      login(mockUser);
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen grid md:grid-cols-2 bg-white font-montserrat">
      {/* ═══ Columna Izquierda — Branding Corporativo ═══ */}
      <div className="hidden md:flex flex-col items-center justify-center bg-catalina-forest-green p-12 text-white text-center relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-catalina-green/15 rounded-full blur-sm"></div>
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-catalina-green/15 rounded-full blur-sm"></div>
        <div className="absolute top-1/4 right-10 w-32 h-32 bg-catalina-green/10 rounded-full"></div>

        <div className="relative z-10 animate-fadeIn">
          <img
            src="/assets/logo_liebre.jpg"
            alt="Mascota Catalina Huanca"
            className="w-56 h-56 mb-8 rounded-full shadow-2xl border-4 border-white/20 object-cover mx-auto"
          />
          <img
            src="/assets/logo_generico_1.jpg"
            alt="Logo Genérico"
            className="w-40 h-auto mt-4 mx-auto opacity-90"
          />
          <h1 className="text-3xl font-semibold tracking-tight mt-6">
            Plataforma de Capacitaciones
          </h1>
          <p className="mt-3 max-w-sm text-white/70 font-light text-base leading-relaxed mx-auto">
            Sistema de gestión y programación de capacitaciones de Catalina Huanca Sociedad Minera.
          </p>
        </div>
      </div>

      {/* ═══ Columna Derecha — Formulario de Acceso ═══ */}
      <div className="flex flex-col items-center justify-center p-6 bg-white">
        <div className="max-w-md w-full animate-fadeIn">
          {/* Logo + Título */}
          <div className="text-center mb-8">
            <img
              src="/assets/logo_generico_1.jpg"
              alt="Logo Catalina Huanca"
              className="w-44 h-auto mx-auto mb-5"
            />
            <h2 className="text-2xl font-semibold text-catalina-grey tracking-tight">
              {isLogin ? 'Acceso al Sistema' : 'Registro de Cuenta'}
            </h2>
            <p className="text-sm text-catalina-grey/60 mt-1 font-normal">
              {isLogin ? 'Ingresa tus credenciales institucionales' : 'Crea tu cuenta para acceder'}
            </p>
          </div>

          {/* Card del Formulario */}
          <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-5">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                    Nombre Completo
                  </label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green outline-none transition-all text-catalina-grey"
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                  Correo Institucional
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green outline-none transition-all text-catalina-grey"
                  placeholder="usuario@catalinahuanca.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-catalina-grey mb-1.5">
                  Contraseña
                </label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green outline-none transition-all text-catalina-grey"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {/* Selector de Rol — Solo DEMO/MVP */}
              <div className="pt-4 border-t border-gray-100">
                <label className="block text-xs font-semibold text-catalina-forest-green uppercase tracking-wider mb-1.5">
                  Rol Simulado (MVP)
                </label>
                <select
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-gray-50 focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green outline-none transition-all text-catalina-grey"
                  value={simulatedRole}
                  onChange={(e) => setSimulatedRole(e.target.value as any)}
                >
                  <option value="admin_contratista">{ROLE_LABELS.admin_contratista}</option>
                  <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                  <option value="super_super_admin">{ROLE_LABELS.super_super_admin}</option>
                </select>
              </div>

              {/* Botón Principal CTA */}
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-catalina-green text-white font-semibold py-3.5 rounded-xl hover:bg-catalina-green/90 active:scale-[0.98] transition-all shadow-lg shadow-catalina-green/25 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Validando...</span>
                  </>
                ) : (
                  <>{isLogin ? 'Ingresar' : 'Crear Cuenta'}</>
                )}
              </button>
            </form>

            {/* Toggle Login/Registro */}
            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-catalina-green hover:text-catalina-forest-green hover:underline transition-colors"
              >
                {isLogin ? '¿No tienes una cuenta? Regístrate' : '¿Ya tienes una cuenta? Inicia sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
