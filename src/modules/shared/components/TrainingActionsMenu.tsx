  import React, { useState, useRef, useEffect } from 'react';
  import { Training, TrainingStatus } from '../../../../types';
  import { useAuth } from '../../../../AuthContext';

  interface TrainingActionsMenuProps {
    training: Training;
    onEdit: () => void;
    onDeactivate: () => void;
    onActivate: () => void;
    onSuspend: () => void;
    onShare: () => void;
    onDelete: () => void;
  }

  export function TrainingActionsMenu({ 
    training, 
    onEdit, 
    onDeactivate, 
    onActivate,
    onSuspend,
    onShare,
    onDelete
  }: TrainingActionsMenuProps) {
    const [isOpen, setIsOpen] = useState(false);
    const { user } = useAuth();
    const menuRef = useRef<HTMLDivElement>(null);
    
    const isSuperSuperAdmin = user?.role === 'super_super_admin';
    
    // Close menu when clicking outside
    useEffect(() => {
      function handleClickOutside(event: MouseEvent) {
        if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      }
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [menuRef]);

    if (!isSuperSuperAdmin) {
      return null; 
    }

    const currentStatus = training.status || (training.is_active ? TrainingStatus.ACTIVE_IS_ACTIVE : TrainingStatus.INACTIVE);
    
    return (
      <div className="relative" ref={menuRef}>
        {/* Botón de configuración */}
        <button 
          className="w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-catalina-green hover:bg-catalina-green/5 transition-colors"
          onClick={() => setIsOpen(!isOpen)}
          title="Opciones"
        >
          <i className="fas fa-cog"></i>
        </button>
        
        {/* Menú desplegable */}
        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-20 animate-fadeIn">
            <button 
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-catalina-green flex items-center gap-2 transition-colors"
              onClick={() => { onEdit(); setIsOpen(false); }}
            >
              <i className="fas fa-pencil-alt w-4"></i> Editar
            </button>
            
            {currentStatus === 'active' && (
              <>
                <button 
                  className="w-full text-left px-4 py-2.5 text-sm text-amber-600 hover:bg-amber-50 flex items-center gap-2 transition-colors"
                  onClick={() => { onSuspend(); setIsOpen(false); }}
                >
                  <i className="fas fa-pause w-4"></i> Suspender
                </button>
                <button 
                  className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-red-600 flex items-center gap-2 transition-colors"
                  onClick={() => { onDeactivate(); setIsOpen(false); }}
                >
                  <i className="fas fa-eye-slash w-4"></i> Desactivar
                </button>
              </>
            )}
            
            {currentStatus === TrainingStatus.SUSPENDED && (
              <button 
                  className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                  onClick={() => { onActivate(); setIsOpen(false); }}
              >
                <i className="fas fa-play w-4"></i> Reactivar
              </button>
            )}
            
            {currentStatus === 'inactive' && (
              <>
                <button 
                    className="w-full text-left px-4 py-2.5 text-sm text-emerald-600 hover:bg-emerald-50 flex items-center gap-2 transition-colors"
                    onClick={() => { onActivate(); setIsOpen(false); }}
                >
                  <i className="fas fa-check w-4"></i> Activar
                </button>
                <button 
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                    onClick={() => { onDelete(); setIsOpen(false); }}
                >
                  <i className="fas fa-trash-alt w-4"></i> Eliminar
                </button>
              </>
            )}
            
            <div className="h-px bg-slate-100 my-1"></div>

            <button 
              className="w-full text-left px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 hover:text-catalina-green flex items-center gap-2 transition-colors"
              onClick={() => { onShare(); setIsOpen(false); }}
            >
              <i className="fas fa-share-alt w-4"></i> Compartir
            </button>
          </div>
        )}
      </div>
    );
  }
