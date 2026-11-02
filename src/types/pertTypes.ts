/**
 * pertTypes.ts
 * -----------------------------------------------------------------------------
 * Tipos del módulo de GESTIÓN DE PROYECTOS con PERT/CPM (método de la ruta
 * crítica con tres estimaciones de tiempo).
 *
 * Sigue el mismo flujo del resto de la app: DATOS -> CÁLCULOS -> RESULTADOS.
 * Caso: proyecto de ejemplo "PanDía" (Innowise Group), 14 actividades (A–N).
 */

/** Una actividad del proyecto (nodo de la red de precedencias). */
export interface Activity {
  id: string; // 'A' .. 'N'
  name: string; // descripción corta
  stage: string; // etapa del proceso ('1 Descubrimiento', etc.)
  predecessors: string[]; // ids de actividades que deben terminar antes
  /** Estimación optimista (días hábiles). */
  optimistic: number;
  /** Estimación más probable (días hábiles). */
  mostLikely: number;
  /** Estimación pesimista (días hábiles). */
  pessimistic: number;
  /** Nota de respaldo / fuente (real o hipotético). */
  support?: string;
}

/** Una etapa del proceso de 11 pasos de Innowise. */
export interface ProcessStage {
  n: number;
  name: string;
  does: string; // "lo que se hace" (real)
  ifSkipped: string; // "si se saltara" (explicación)
  source: string;
}

/** Fila de la tabla "qué es real / qué es inventado". */
export interface ProjectFact {
  label: string;
  content: string;
  type: string; // 'REAL', 'HIPOTÉTICO', etc.
}

/** Término del glosario. */
export interface GlossaryTerm {
  term: string;
  meaning: string;
}

/** Referencia bibliográfica. */
export interface Reference {
  id: string; // '[1]'
  text: string;
  url?: string;
}

/**
 * Datos de aceleración ("crashing") de una actividad.
 * Tn (tiempo normal) no se guarda: es el tiempo esperado Tₑ ya calculado.
 */
export interface CrashActivity {
  id: string;
  /** Tc: tiempo reducido, el menor posible con el máximo de recursos. */
  crashTime: number;
  /** Cn: costo con tiempo normal (USD). */
  normalCost: number;
  /** Cc: costo con tiempo reducido (USD). */
  crashCost: number;
}

/** Bloque de datos del método de aceleración (intercambio tiempo-costo). */
export interface CrashingData {
  /** Costo del proyecto sin acelerar (suma de Cn). */
  normalTotalCost: number;
  /** Costo del programa acelerado elegido. */
  crashedTotalCost: number;
  activities: CrashActivity[];
}

/** Modelo central de datos del proyecto. Única fuente de entrada. */
export interface PertData {
  meta: {
    title: string;
    project: string;
    company: string;
    course: string;
    date: string;
    timeUnit: string; // 'días hábiles'
    startDate: string; // fecha de inicio hipotética (texto)
    startDateISO: string; // fecha de inicio en formato ISO (YYYY-MM-DD)
    summary: string[]; // párrafos del resumen
  };
  stages: ProcessStage[];
  projectFacts: ProjectFact[];
  activities: Activity[];
  monitoring: string[]; // puntos de seguimiento (sección 9)
  traceability: { real: string[]; hypothetical: string[]; limitations: string[] };
  glossary: GlossaryTerm[];
  references: Reference[];
  /** Datos de aceleración; opcional porque no todo caso los tiene. */
  crashing?: CrashingData;
}

/* ------------------------------------------------------------------ */
/* Tipos de RESULTADOS (derivados por el motor CPM)                   */
/* ------------------------------------------------------------------ */

/** Resultado por actividad tras el cálculo CPM/PERT. */
export interface ActivityResult {
  id: string;
  /** Tiempo esperado Tₑ = (o + 4m + p)/6. */
  expected: number;
  /** Varianza = ((p − o)/6)². */
  variance: number;
  es: number; // inicio temprano
  ef: number; // fin temprano
  ls: number; // inicio lejano
  lf: number; // fin lejano
  slack: number; // holgura = LS − ES
  critical: boolean; // holgura ≈ 0
}

/** Agregado de resultados del proyecto. */
export interface PertResults {
  byActivity: Record<string, ActivityResult>;
  /** Actividades en el orden de los datos, con su resultado. */
  rows: ActivityResult[];
  /** Duración esperada del proyecto (máximo EF). */
  duration: number;
  /** Ruta crítica (ids en orden). */
  criticalPath: string[];
  /** Varianza del proyecto (suma de varianzas de la ruta crítica). */
  projectVariance: number;
  /** Desviación estándar del proyecto = √(varianza). */
  projectStdDev: number;
  /** Duración solo hasta el lanzamiento (sin la actividad de soporte final). */
  durationToLaunch: number;
}

/** Resultado del programa acelerado: misma red, con las duraciones reducidas. */
export interface CrashedResults {
  byActivity: Record<string, ActivityResult>;
  /** Duración de cada actividad en el programa acelerado. */
  durationById: Record<string, number>;
  /** Duración del proyecto acelerado. */
  duration: number;
  criticalPath: string[];
  /** Costo total del programa acelerado (USD). */
  totalCost: number;
  /** Costo del proyecto sin acelerar (USD). */
  normalTotalCost: number;
  /** Tabla de datos por actividad: Tn, Tc, TR, Cn, Cc y S. */
  rows: CrashRow[];
  /** Programas factibles, del más lento y barato al más rápido y caro. */
  schedules: CrashStep[];
  /** Duración del proyecto sin acelerar. */
  normalDuration: number;
}

/** Fila de la tabla de aceleración de una actividad. */
export interface CrashRow {
  id: string;
  name: string;
  predecessors: string[];
  /** Tn: tiempo normal esperado. */
  normalTime: number;
  /** Tc: tiempo reducido. */
  crashTime: number;
  /** TR = Tn − Tc: reducción máxima posible. */
  maxReduction: number;
  /** Cn: costo normal. */
  normalCost: number;
  /** Cc: costo reducido. */
  crashCost: number;
  /** S = (Cc − Cn) / TR; null si la actividad no admite reducción. */
  costPerDay: number | null;
  /** Duración de la actividad en el programa más acelerado. */
  crashedTime: number;
}

/** Un programa factible: una forma posible de ejecutar el proyecto. */
export interface CrashStep {
  /** Número de programa; 0 es el proyecto sin acelerar. */
  n: number;
  /** Duración del proyecto en este programa. */
  duration: number;
  /** Costo total del proyecto en este programa (USD). */
  totalCost: number;
  /** Actividades acortadas en este tramo (vacío en el programa 0). */
  activities: string[];
  /** Días ganados respecto del programa anterior. */
  gained: number;
  /** Costo por día del tramo: suma de las S de `activities`. */
  costPerDay: number | null;
}
