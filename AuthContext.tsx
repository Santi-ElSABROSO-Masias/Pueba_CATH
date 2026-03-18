import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser, UserRole, ROLE_PERMISSIONS, Permission } from './types';
import { apiClient } from './src/api/client';

interface AuthContextType {
  user: SystemUser | null;
  login: (credentials: { email: string; password_hash: string }) => Promise<void>;
  logout: () => void;
  can: (permission: Permission) => boolean;
  isAdminContratista: () => boolean;
  isSuperAdmin: () => boolean;
  isSuperSuperAdmin: () => boolean;
  getViewScope: () => 'own_company' | 'all_companies';
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SystemUser | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        setIsLoadingAuth(false);
        return;
      }

      try {
        // Validar expiración localmente
        const payloadBase64 = token.split('.')[1];
        const decodedJson = atob(payloadBase64);
        const decoded = JSON.parse(decodedJson);

        if (decoded.exp && decoded.exp * 1000 < Date.now()) {
          console.warn('El token ha expirado. Limpiando sesión.');
          logout();
          setIsLoadingAuth(false);
          return;
        }

        // Obtener datos de usuario del backend
        const response = await apiClient.get('/auth/me'); // o /auth/verify
        if (response.data.success) {
          // Si es válido, restaura la sesión automáticamente
          setUser(response.data.data.user);
        } else {
          logout();
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
        logout();
      } finally {
        setIsLoadingAuth(false);
      }
    };

    verifySession();
  }, []);

  const login = async (credentials: { email: string; password_hash: string }) => {
    try {
      // Nota: El backend espera 'email' y 'password'
      const response = await apiClient.post('/auth/login', {
        email: credentials.email,
        password: credentials.password_hash
      });

      if (response.data.success) {
        const { token, user } = response.data.data;
        localStorage.setItem('auth_token', token);
        setUser(user);
      }
    } catch (error) {
      console.error('Error on login:', error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  const can = (permission: Permission): boolean => {
    if (!user) return false;
    const permissions = ROLE_PERMISSIONS[user.role];
    return permissions ? (permissions[permission] as boolean) : false;
  };

  const isAdminContratista = () => user?.role === 'admin_contratista';
  const isSuperAdmin = () => user?.role === 'super_admin';
  const isSuperSuperAdmin = () => user?.role === 'super_super_admin';

  const getViewScope = (): 'own_company' | 'all_companies' => {
    if (!user) return 'own_company';
    return ROLE_PERMISSIONS[user.role].viewScope;
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600 mb-4"></div>
        <p className="text-slate-500 font-medium">Verificando sesión...</p>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      can,
      isAdminContratista,
      isSuperAdmin,
      isSuperSuperAdmin,
      getViewScope,
      isLoading: isLoadingAuth
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
