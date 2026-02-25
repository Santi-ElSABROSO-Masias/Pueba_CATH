
import React, { createContext, useContext, useState, useEffect } from 'react';
import { SystemUser, UserRole, ROLE_PERMISSIONS, Permission } from './types';

interface AuthContextType {
  user: SystemUser | null;
  login: (user: SystemUser) => void;
  logout: () => void;
  can: (permission: Permission) => boolean;
  isAdminContratista: () => boolean;
  isSuperAdmin: () => boolean;
  isSuperSuperAdmin: () => boolean;
  getViewScope: () => 'own_company' | 'all_companies';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<SystemUser | null>(null);

  useEffect(() => {
    const savedSession = localStorage.getItem('event_mvp_session');
    if (savedSession) {
      setUser(JSON.parse(savedSession));
    }
  }, []);

  const login = (user: SystemUser) => {
    setUser(user);
    localStorage.setItem('event_mvp_session', JSON.stringify(user));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('event_mvp_session');
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
      getViewScope
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
