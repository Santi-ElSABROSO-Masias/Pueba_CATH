import { UserRole, UserStatus } from '../types';

interface StatusDisplay {
  label: string;
  colorClass: string;
  description: string;
}

export function getStatusDisplayForRole(
  workerStatus: UserStatus,
  userRole: UserRole
): StatusDisplay {
  
  // Definición de estilos base (Tailwind classes)
  const styles = {
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    red: 'bg-red-50 text-red-600 border-red-100',
  };

  // Mapeo por Rol
  const statusMap: Record<UserRole, Record<UserStatus, StatusDisplay>> = {
    admin_contratista: {
      [UserStatus.REGISTERED]: { 
        label: 'REGISTRADO', 
        colorClass: styles.amber, 
        description: 'Esperando validación por Super Admin' 
      },
      [UserStatus.APPROVED]: { 
        label: 'APROBADO', 
        colorClass: styles.blue, 
        description: 'Validado. Esperando link de Super Super Admin' 
      },
      [UserStatus.LINK_SENT]: { 
        label: 'LINK ENVIADO', 
        colorClass: styles.emerald, 
        description: 'Capacitación confirmada. Link enviado.' 
      },
      [UserStatus.REJECTED]: { 
        label: 'RECHAZADO', 
        colorClass: styles.red, 
        description: 'No cumple requisitos o cupo lleno' 
      },
      [UserStatus.PENDING_LINK]: {
        label: 'PENDIENTE DE LINK',
        colorClass: styles.yellow,
        description: 'Validado, esperando que el admin configure el link de la reunión.'
      }
    },

    super_admin: {
      [UserStatus.REGISTERED]: { 
        label: 'REGISTRADO', 
        colorClass: styles.amber, 
        description: 'Requiere tu validación (Nivel 2)' 
      },
      [UserStatus.APPROVED]: { 
        label: 'APROBADO', 
        colorClass: styles.blue, 
        description: 'Has validado este registro' 
      },
      [UserStatus.LINK_SENT]: { 
        label: 'LINK ENVIADO', 
        colorClass: styles.emerald, 
        description: 'Proceso finalizado por Nivel 1' 
      },
      [UserStatus.REJECTED]: { 
        label: 'RECHAZADO', 
        colorClass: styles.red, 
        description: 'Has rechazado este registro' 
      },
      [UserStatus.PENDING_LINK]: {
        label: 'PENDIENTE DE LINK',
        colorClass: styles.yellow,
        description: 'Validado, esperando que el admin configure el link de la reunión.'
      }
    },

    super_super_admin: {
      [UserStatus.REGISTERED]: { 
        label: 'REGISTRADO', 
        colorClass: styles.amber, 
        description: 'Pendiente de validación Nivel 2' 
      },
      [UserStatus.APPROVED]: { 
        label: 'APROBADO', 
        colorClass: styles.blue, 
        description: 'Validado. Requiere envío de link (Nivel 1)' 
      },
      [UserStatus.LINK_SENT]: { 
        label: 'LINK ENVIADO', 
        colorClass: styles.emerald, 
        description: 'Has enviado el link de acceso' 
      },
      [UserStatus.REJECTED]: { 
        label: 'RECHAZADO', 
        colorClass: styles.red, 
        description: 'Registro rechazado' 
      },
      [UserStatus.PENDING_LINK]: {
        label: 'PENDIENTE DE LINK',
        colorClass: styles.yellow,
        description: 'Validado, esperando que configures el link de la reunión.'
      }
    }
  };

  return statusMap[userRole][workerStatus] || { 
    label: workerStatus, 
    colorClass: 'bg-slate-100 text-slate-500 border-slate-200', 
    description: '' 
  };
}
