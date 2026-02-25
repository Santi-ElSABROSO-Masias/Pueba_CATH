
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
  const [simulatedCompanyId, setSimulatedCompanyId] = useState<string>('c1'); // ID de ejemplo

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulación de autenticación (En producción conectar con Supabase Auth)
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
    <div className="min-h-screen grid md:grid-cols-2 bg-white">
      {/* Columna Izquierda - Branding */}
      <div className="hidden md:flex flex-col items-center justify-center bg-catalina-forest-green p-12 text-white text-center relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-catalina-green/20 rounded-full"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-catalina-green/20 rounded-full"></div>
                <img src="/assets/logo_liebre.jpg" alt="Mascota Catalina Huanca" className="w-64 h-auto mb-8 rounded-full shadow-2xl" />
        <img src="/assets/logo_generico_1.jpg" alt="Logo Generico" className="w-48 h-auto mt-4" />
        <h1 className="text-3xl font-bold tracking-tight">Plataforma de Capacitaciones</h1>
        <p className="mt-2 max-w-sm text-catalina-dusty-green/80">
          Bienvenido al sistema de gestión y programación de capacitaciones de Catalina Huanca.
        </p>
      </div>

      {/* Columna Derecha - Formulario */}
      <div className="flex flex-col items-center justify-center p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <img src="/assets/logo_generico_1.jpg" alt="Logo Catalina Huanca" className="w-48 h-auto mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-catalina-grey tracking-tight">
              {isLogin ? 'Acceso al Sistema' : 'Registro de Cuenta'}
            </h2>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-catalina-grey mb-1">Nombre Completo</label>
                  <input
                    required
                    type="text"
                    className="w-full px-4 py-3 rounded-lg border border-catalina-grey/40 focus:ring-1 focus:ring-catalina-green focus:border-catalina-green outline-none transition"
                    placeholder="Ej. Juan Pérez"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-catalina-grey mb-1">Correo Institucional</label>
                <input
                  required
                  type="email"
                  className="w-full px-4 py-3 rounded-lg border border-catalina-grey/40 focus:ring-1 focus:ring-catalina-green focus:border-catalina-green outline-none transition"
                  placeholder="usuario@catalinahuanca.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-catalina-grey mb-1">Contraseña</label>
                <input
                  required
                  type="password"
                  className="w-full px-4 py-3 rounded-lg border border-catalina-grey/40 focus:ring-1 focus:ring-catalina-green focus:border-catalina-green outline-none transition"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              
              {/* SELECTOR DE ROL SOLO PARA DEMO/MVP */}
              <div className="pt-3 border-t border-slate-200">
                   <label className="block text-xs font-bold text-catalina-forest-green uppercase tracking-wider mb-1">Rol Simulado (MVP)</label>
                   <select 
                      className="w-full px-4 py-2 rounded-lg border border-catalina-grey/40 text-sm bg-catalina-grey/10 focus:ring-1 focus:ring-catalina-green focus:border-catalina-green"
                      value={simulatedRole}
                      onChange={(e) => setSimulatedRole(e.target.value as any)}
                   >
                       <option value="admin_contratista">{ROLE_LABELS.admin_contratista}</option>
                       <option value="super_admin">{ROLE_LABELS.super_admin}</option>
                       <option value="super_super_admin">{ROLE_LABELS.super_super_admin}</option>
                   </select>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-catalina-green text-white font-bold py-3 rounded-lg hover:bg-catalina-forest-green transition-all shadow-lg shadow-catalina-green/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <span>Validando...</span>
                ) : (
                  <>{isLogin ? 'Ingresar' : 'Crear Cuenta'}</>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-sm font-medium text-catalina-green hover:underline"
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
