
import React, { useState, useEffect } from 'react';
import { SystemUser, UserRole, ROLE_LABELS } from '../types';
import { useAuth } from '../AuthContext';

export const Auth: React.FC = () => {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = isLogin ? 'Login — Plataforma de Capacitaciones' : 'Registro — Plataforma de Capacitaciones';
    return () => {
      document.title = 'Plataforma de Capacitaciones — Catalina Huanca'; // Reset on unmount
    };
  }, [isLogin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        await login({ email, password_hash: password });
      } else {
        // En una app real, aquí llamarías a un endpoint de registro `/api/auth/register`
        // Por ahora simularemos un error para indicar que el registro no está abierto al público
        throw new Error('El registro público está deshabilitado. Solicite cuenta a su administrador.');
      }
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Error de conexión con el servidor.');
      }
    } finally {
      setLoading(false);
    }
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
              {isLogin ? 'Ingresa tus credenciales' : 'Crea tu cuenta para acceder'}
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
                  Correo
                </label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-catalina-green/20 focus:border-catalina-green outline-none transition-all text-catalina-grey"
                  placeholder="ejemplo@correo.com"
                  autoComplete="off"
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
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              {error && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-100 text-sm font-medium mb-4">
                  {error}
                </div>
              )}

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
