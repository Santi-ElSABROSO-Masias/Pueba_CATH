
import { ProjectPhase } from './types';

export const PROJECT_PHASES: ProjectPhase[] = [
  {
    title: "Fase 1: Registro + Aprobación + Envío de Link",
    objective: "Flujo crítico funcional de punta a punta.",
    tasks: [
      "Tabla 'registrations' en Supabase con RLS desactivado para pruebas",
      "Formulario React conectado vía Fetch API a Supabase",
      "Trigger de n8n escuchando 'INSERT' o Webhook manual",
      "Nodo Email en n8n con variables {{full_name}} y {{meeting_link}}"
    ]
  },
  {
    title: "Fase 2: Control de Asistencia",
    objective: "Captura de valor post-invitación.",
    tasks: [
      "Check-in manual en Panel Admin para el moderador",
      "Validación de horario: Botón de asistencia solo activo durante el evento",
      "Actualización de estado 'attended' en DB"
    ]
  },
  {
    title: "Fase 3: Exportación Automática",
    objective: "Cierre de ciclo y reportabilidad.",
    tasks: [
      "Generación de CSV con mapeo exacto de columnas para Excel",
      "Workflow n8n programado: Backup dominical a Google Sheets"
    ]
  },
  {
    title: "Fase 4: Validaciones Opcionales",
    objective: "Robustez y seguridad.",
    tasks: [
      "Restricción de acceso al link por email verificado",
      "Límite de aforo automático por conteo de registros 'APPROVED'"
    ]
  }
];

export const DB_SCHEMA = `
Table registrations {
  id: uuid [pk]
  full_name: text
  email: text [unique]
  organization: text
  status: enum('REGISTRADO', 'APROBADO', 'LINK ENVIADO', 'RECHAZADO')
  meeting_link: text
  attended: boolean [default: false]
  created_at: timestamp
}
`;
