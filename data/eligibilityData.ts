import { OccupationalFamily, OccupationalRole, EligibilityRule, EligibilityStatus } from '../types';

// ═══════════════════════════════════════════════════
// CATÁLOGO DE FAMILIAS OCUPACIONALES
// ═══════════════════════════════════════════════════

export const OCCUPATIONAL_FAMILIES: OccupationalFamily[] = [
    {
        id: 'fam-conductores',
        name: 'Conductores',
        description: 'Personal que opera vehículos livianos, pesados o equipos móviles',
        isActive: true
    },
    {
        id: 'fam-altura',
        name: 'Trabajadores en Altura',
        description: 'Personal que realiza labores a más de 1.80m del suelo',
        isActive: true
    },
    {
        id: 'fam-mantenimiento',
        name: 'Mantenimiento',
        description: 'Personal de mantenimiento mecánico, eléctrico e instrumentación',
        isActive: true
    },
    {
        id: 'fam-operaciones',
        name: 'Operaciones',
        description: 'Personal de operaciones de planta y procesos',
        isActive: true
    },
    {
        id: 'fam-supervision',
        name: 'Supervisión',
        description: 'Supervisores de área, jefes de turno y líderes de grupo',
        isActive: true
    },
    {
        id: 'fam-administrativo',
        name: 'Administrativo',
        description: 'Personal administrativo y de soporte',
        isActive: true
    }
];

// ═══════════════════════════════════════════════════
// CATÁLOGO DE ROLES OCUPACIONALES
// ═══════════════════════════════════════════════════

export const OCCUPATIONAL_ROLES: OccupationalRole[] = [
    // Conductores
    { id: 'rol-conductor-liviano', name: 'Conductor Liviano', familyId: 'fam-conductores', isActive: true },
    { id: 'rol-conductor-pesado', name: 'Conductor Pesado', familyId: 'fam-conductores', isActive: true },
    { id: 'rol-operador-grua', name: 'Operador de Grúa', familyId: 'fam-conductores', isActive: true },
    { id: 'rol-operador-camion', name: 'Operador de Camión', familyId: 'fam-conductores', isActive: true },

    // Trabajadores en Altura
    { id: 'rol-andamiero', name: 'Andamiero', familyId: 'fam-altura', isActive: true },
    { id: 'rol-electricista-altura', name: 'Electricista en Altura', familyId: 'fam-altura', isActive: true },
    { id: 'rol-pintor-industrial', name: 'Pintor Industrial', familyId: 'fam-altura', isActive: true },

    // Mantenimiento
    { id: 'rol-mecanico', name: 'Mecánico', familyId: 'fam-mantenimiento', isActive: true },
    { id: 'rol-soldador', name: 'Soldador', familyId: 'fam-mantenimiento', isActive: true },
    { id: 'rol-electricista', name: 'Electricista', familyId: 'fam-mantenimiento', isActive: true },
    { id: 'rol-instrumentista', name: 'Instrumentista', familyId: 'fam-mantenimiento', isActive: true },

    // Operaciones
    { id: 'rol-operador-planta', name: 'Operador de Planta', familyId: 'fam-operaciones', isActive: true },
    { id: 'rol-tecnico-procesos', name: 'Técnico de Procesos', familyId: 'fam-operaciones', isActive: true },

    // Supervisión
    { id: 'rol-supervisor-ssoma', name: 'Supervisor SSOMA', familyId: 'fam-supervision', isActive: true },
    { id: 'rol-jefe-turno', name: 'Jefe de Turno', familyId: 'fam-supervision', isActive: true },
    { id: 'rol-ingeniero-seguridad', name: 'Ingeniero de Seguridad', familyId: 'fam-supervision', isActive: true },

    // Administrativo
    { id: 'rol-asistente-admin', name: 'Asistente Administrativo', familyId: 'fam-administrativo', isActive: true },
    { id: 'rol-almacenero', name: 'Almacenero', familyId: 'fam-administrativo', isActive: true },
];

// ═══════════════════════════════════════════════════
// REGLAS DE ELEGIBILIDAD (Familia → Curso)
// ═══════════════════════════════════════════════════
// Solo se definen las combinaciones 'required' y 'eligible'.
// Las combinaciones no listadas se consideran 'blocked'.

export const ELIGIBILITY_RULES: EligibilityRule[] = [
    // ── Inducción Básica: OBLIGATORIA para TODOS ──
    { familyId: 'fam-conductores', templateId: 'tpl-induccion', status: 'required' },
    { familyId: 'fam-altura', templateId: 'tpl-induccion', status: 'required' },
    { familyId: 'fam-mantenimiento', templateId: 'tpl-induccion', status: 'required' },
    { familyId: 'fam-operaciones', templateId: 'tpl-induccion', status: 'required' },
    { familyId: 'fam-supervision', templateId: 'tpl-induccion', status: 'required' },
    { familyId: 'fam-administrativo', templateId: 'tpl-induccion', status: 'required' },

    // ── Manejo Defensivo: Conductores obligatorio, Supervisión elegible ──
    { familyId: 'fam-conductores', templateId: 'tpl-manejo-defensivo', status: 'required' },
    { familyId: 'fam-supervision', templateId: 'tpl-manejo-defensivo', status: 'eligible' },

    // ── Espacios Confinados: Mantenimiento y Operaciones ──
    { familyId: 'fam-mantenimiento', templateId: 'tpl-espacios-confinados', status: 'required' },
    { familyId: 'fam-operaciones', templateId: 'tpl-espacios-confinados', status: 'eligible' },
    { familyId: 'fam-supervision', templateId: 'tpl-espacios-confinados', status: 'eligible' },

    // ── Trabajos en Altura: Altura obligatorio, Mantenimiento elegible ──
    { familyId: 'fam-altura', templateId: 'tpl-altura', status: 'required' },
    { familyId: 'fam-mantenimiento', templateId: 'tpl-altura', status: 'eligible' },
    { familyId: 'fam-supervision', templateId: 'tpl-altura', status: 'eligible' },

    // ── Trabajos en Caliente: Mantenimiento obligatorio ──
    { familyId: 'fam-mantenimiento', templateId: 'tpl-caliente', status: 'required' },
    { familyId: 'fam-operaciones', templateId: 'tpl-caliente', status: 'eligible' },
    { familyId: 'fam-supervision', templateId: 'tpl-caliente', status: 'eligible' },

    // ── Aislamiento y Bloqueo: Mantenimiento y Operaciones ──
    { familyId: 'fam-mantenimiento', templateId: 'tpl-aislamiento', status: 'required' },
    { familyId: 'fam-operaciones', templateId: 'tpl-aislamiento', status: 'eligible' },
    { familyId: 'fam-supervision', templateId: 'tpl-aislamiento', status: 'eligible' },

    // ── Izajes: Conductores (grúas) y Mantenimiento ──
    { familyId: 'fam-conductores', templateId: 'tpl-izajes', status: 'required' },
    { familyId: 'fam-mantenimiento', templateId: 'tpl-izajes', status: 'eligible' },
    { familyId: 'fam-supervision', templateId: 'tpl-izajes', status: 'eligible' },
];

// ═══════════════════════════════════════════════════
// FUNCIONES HELPER PURAS
// ═══════════════════════════════════════════════════

/**
 * Mapeo de nombre de curso → templateId para vincular trainings del mock
 * con las reglas de elegibilidad basadas en templates.
 */
const TRAINING_TITLE_TO_TEMPLATE: Record<string, string> = {
    'Inducción Básica de Seguridad': 'tpl-induccion',
    'Manejo Defensivo - RITRA - Fatiga y Somnolencia': 'tpl-manejo-defensivo',
    'Trabajos de Alto Riesgo en Espacios Confinados': 'tpl-espacios-confinados',
    'Trabajos de Alto Riesgo en Altura': 'tpl-altura',
    'Trabajos de Alto Riesgo en Caliente': 'tpl-caliente',
    'Trabajos de Aislamiento y Bloqueo de Energías': 'tpl-aislamiento',
    'Trabajos de Alto Riesgo en Izajes': 'tpl-izajes',
};

/** Obtener la familia de un rol */
export function getFamilyForRole(roleId: string): OccupationalFamily | undefined {
    const role = OCCUPATIONAL_ROLES.find(r => r.id === roleId);
    if (!role) return undefined;
    return OCCUPATIONAL_FAMILIES.find(f => f.id === role.familyId);
}

/** Obtener el templateId a partir del título del training */
export function getTemplateIdFromTitle(trainingTitle: string): string | undefined {
    return TRAINING_TITLE_TO_TEMPLATE[trainingTitle];
}

/**
 * Determinar elegibilidad de un rol para un curso específico.
 * Retorna 'required', 'eligible', o 'blocked'.
 */
export function getEligibilityStatus(roleId: string, trainingTitle: string): EligibilityStatus {
    const role = OCCUPATIONAL_ROLES.find(r => r.id === roleId);
    if (!role) return 'blocked';

    const templateId = getTemplateIdFromTitle(trainingTitle);
    if (!templateId) return 'eligible'; // Cursos sin template → permitir

    const rule = ELIGIBILITY_RULES.find(
        r => r.familyId === role.familyId && r.templateId === templateId
    );

    return rule?.status || 'blocked';
}

/**
 * Obtener todos los roles agrupados por familia para UI de selector.
 */
export function getRolesGroupedByFamily(): { family: OccupationalFamily; roles: OccupationalRole[] }[] {
    return OCCUPATIONAL_FAMILIES
        .filter(f => f.isActive)
        .map(family => ({
            family,
            roles: OCCUPATIONAL_ROLES.filter(r => r.familyId === family.id && r.isActive)
        }))
        .filter(group => group.roles.length > 0);
}
