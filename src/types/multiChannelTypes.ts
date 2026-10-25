/**
 * multiChannelTypes.ts
 * -----------------------------------------------------------------------------
 * Tipos del módulo de TEORÍA DE COLAS con CANALES MÚLTIPLES (modelo M/M/s).
 *
 * Sigue el mismo flujo del resto de la app: DATOS -> CÁLCULOS -> RESULTADOS.
 * Caso base: sistema de ejecución de pipelines de CI con 5 runners (M/M/5),
 * aproximado con datos públicos de CircleCI y la escala de Innowise.
 *
 * Reutiliza las utilidades de unidades de tiempo del módulo M/M/1 para no
 * duplicar constantes ni conversiones.
 */
export {
  MINUTES_PER_DAY,
  normalizeTimeUnit,
  convertTimeToDisplay,
} from './queuingTypes';
export type { TimeDisplayUnit } from './queuingTypes';

import type { TimeDisplayUnit } from './queuingTypes';

/** Referencia bibliográfica del caso. */
export interface MultiChannelReference {
  id: string; // '[1]'
  text: string;
  url?: string;
}

/** Datos de entrada del modelo M/M/s (única fuente de entrada). */
export interface MultiChannelData {
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
    server: string; // 'Runner (5 en paralelo)'
    rateUnit: string; // 'runs/día'
    timeUnit: TimeDisplayUnit; // 'días' | 'minutos'
  };
  /** λ por proyecto — tasa de llegada de un solo proyecto (en rateUnit). */
  lambdaPerProject: number;
  /** n — número de proyectos que comparten la fila. λ total = n · λ por proyecto. */
  projects: number;
  /** Tiempo medio de servicio (minutos). μ se deriva de aquí. */
  serviceTimeMinutes: number;
  /** s — número de canales (runners) en paralelo. */
  servers: number;
  /** Factor de mejora de la duración para el escenario comparativo M/M/1. */
  improvementFactor: number;
  /** Número de niveles k mostrados en la tabla de probabilidades Pn. */
  pnLevels: number;
  /** Referencias bibliográficas del caso. */
  references: MultiChannelReference[];
}

/** Características operativas de un sistema M/M/s (fórmulas de Erlang C). */
export interface MMsMetrics {
  lambda: number; // λ (tasa de llegada total)
  mu: number; // μ (tasa de servicio por canal)
  servers: number; // s (número de canales)
  a: number; // a = λ/μ (carga ofrecida; canales ocupados en promedio)
  rho: number; // ρ = a/s = λ/(s·μ) (utilización por canal)
  p0: number; // P0 — prob. sistema vacío
  pw: number; // Pw — prob. de esperar (Erlang C)
  lq: number; // nº medio en cola
  l: number; // nº medio en sistema
  wq: number; // tiempo medio en cola (días)
  w: number; // tiempo medio en sistema (días)
  stable: boolean; // λ < s·μ
}

/** Fila de la tabla de probabilidades Pn (incluye acumulada). */
export interface MCPnRow {
  k: number;
  pEq: number; // P(n = k)
  pLe: number; // P(n ≤ k) — acumulada
  pGt: number; // P(n > k)
}

/** Resultados derivados del módulo de canales múltiples. */
export interface MultiChannelResults {
  /** λ total = n · λ por proyecto. */
  lambdaTotal: number;
  /** Tiempo de servicio en días (min ÷ 1440). */
  serviceTimeDays: number;
  /** Sistema principal M/M/s con la carga de todos los proyectos. */
  main: MMsMetrics;
  /** Distribución Pn del sistema principal. */
  pn: MCPnRow[];
  /** Tres escenarios comparativos del informe. */
  scenarios: {
    /** Escenario 1: M/M/1 sin mejora (carga de 1 proyecto). */
    single: MMsMetrics;
    /** Escenario 2: M/M/1 con mejora (la duración se reduce por improvementFactor). */
    singleImproved: MMsMetrics;
    /** Escenario 3: M/M/s (carga de todos los proyectos) — igual a `main`. */
    multi: MMsMetrics;
  };
}
