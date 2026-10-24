/**
 * queuingTypes.ts
 * -----------------------------------------------------------------------------
 * Tipos del módulo de TEORÍA DE COLAS (modelo M/M/1).
 *
 * Sigue el mismo flujo del resto de la app: DATOS -> CÁLCULOS -> RESULTADOS.
 * El caso base corresponde al informe de pipelines de CI (aproximación con
 * datos públicos de CircleCI).
 */

/** Minutos por día (constante de conversión de unidades). */
export const MINUTES_PER_DAY = 1440;

export type TimeDisplayUnit = 'días' | 'minutos';

export function normalizeTimeUnit(value?: string): TimeDisplayUnit {
  return value === 'minutos' ? 'minutos' : 'días';
}

export function convertTimeToDisplay(valueInDays: number, unit: TimeDisplayUnit): number {
  return unit === 'minutos' ? valueInDays * MINUTES_PER_DAY : valueInDays;
}

/** Datos de entrada del modelo M/M/1 (única fuente de entrada). */
export interface QueuingData {
  meta: {
    company: string;
    title: string;
    context: string;
    source: string;
    sourceUrl: string;
    consulted: string;
  };
  /** Etiquetas del sistema (cliente, servidor, unidades). */
  labels: {
    customer: string; // 'Ejecución de pipeline (run)'
    server: string; // 'Runner (1 solo)'
    rateUnit: string; // 'runs/día'
    timeUnit: TimeDisplayUnit; // 'días' | 'minutos'
  };
  /** λ — tasa de llegada (en rateUnit). */
  lambda: number;
  /** Tiempo medio de servicio (minutos). μ se deriva de aquí. */
  serviceTimeMinutes: number;
  /** Factor de mejora del tiempo de servicio (0.5 = se reduce a la mitad). */
  improvementFactor: number;
}

/** Características operativas de un sistema M/M/1. */
export interface MM1Metrics {
  lambda: number; // λ
  mu: number; // μ
  rho: number; // ρ = λ/μ (utilización)
  p0: number; // prob. sistema vacío
  lq: number; // nº medio en cola
  l: number; // nº medio en sistema
  wq: number; // tiempo medio en cola (timeUnit)
  w: number; // tiempo medio en sistema (timeUnit)
  pw: number; // prob. de esperar (= ρ)
  stable: boolean; // λ < μ
}

/** Fila de la tabla de probabilidades Pn. */
export interface PnRow {
  k: number;
  pEq: number; // P(n = k)
  pGt: number; // P(n > k)
}

/** Un escenario completo (base o mejorado). */
export interface QueuingScenario {
  serviceTimeMinutes: number;
  serviceTimeDays: number;
  metrics: MM1Metrics;
  pn: PnRow[];
}

/** Resultados derivados del módulo de colas. */
export interface QueuingResults {
  base: QueuingScenario;
  improved: QueuingScenario;
}
