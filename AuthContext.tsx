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
    const token = localStorage.getItem('auth_token');
    if (token) {
      // Intentar cargar la sesión con el backend
      apiClient.get('/auth/me')
        .then(response => {
          if (response.data.success) {
            setUser(response.data.data.user);
          }
        })
        .catch(() => {
          logout();
        })
        .finally(() => {
          setIsLoadingAuth(false);
        });
    } else {
      setIsLoadingAuth(false);
    }
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
