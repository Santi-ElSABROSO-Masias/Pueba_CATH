import React, { createContext, useContext, useState, ReactNode } from 'react';

interface NavigationContextType {
  registerModal: (id: string, closeFn: () => void) => void;
  unregisterModal: (id: string) => void;
  closeAllModals: () => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [modals, setModals] = useState<Map<string, () => void>>(new Map());
  
  function registerModal(id: string, closeFn: () => void) {
    setModals(prev => {
      const newMap = new Map(prev);
      newMap.set(id, closeFn);
      return newMap;
    });
  }
  
  function unregisterModal(id: string) {
    setModals(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      return newMap;
    });
  }
  
  function closeAllModals() {
    modals.forEach(closeFn => closeFn());
  }
  
  return (
    <NavigationContext.Provider value={{ registerModal, unregisterModal, closeAllModals }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) throw new Error('useNavigation must be used within NavigationProvider');
  return context;
}
