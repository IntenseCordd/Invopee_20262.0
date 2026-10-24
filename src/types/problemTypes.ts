/**
 * problemTypes.ts
 * -----------------------------------------------------------------------------
 * Tipos centrales del dominio de Investigación de Operaciones.
 *
 * La aplicación sigue el flujo:  DATOS -> CÁLCULOS -> RESULTADOS -> COMPONENTES.
 * Estos tipos describen tanto los DATOS de entrada (`ProblemData`) como los
 * RESULTADOS derivados (`ProblemResults`). Están diseñados de forma genérica
 * (N alternativas × M estados) para permitir futuras ampliaciones sin reescribir
 * el modelo (más estados, más alternativas, nuevos métodos, otros casos).
 */

/** Una alternativa de decisión (fila de la matriz de pagos). */
export interface Alternative {
  id: string; // 'A1'
  name: string; // 'Enfoque en IA y Big Data'
  shortName: string; // 'IA'
  description?: string;
}

/** Un estado de la naturaleza (columna de la matriz de pagos). */
export interface NatureState {
  id: string; // 'S1'
  name: string; // 'Boom de IA'
  shortName: string; // 'Boom'
  description?: string;
  /** Probabilidad a priori P(Si). La suma de todos los estados debe ser 1. */
  probability: number;
}

/**
 * Celda de la matriz de pagos.
 * `value` (millones de USD) es la FUENTE DE VERDAD que usan todos los métodos
 * de decisión. `tariff` y `occupancy` son parámetros de DERIVACIÓN usados solo
 * para EXPLICAR de dónde sale `value` (Horas × Ocupación × Tarifa).
 */
export interface PayoffCell {
  value: number; // ingreso anual en millones de USD
  tariff: number; // USD por hora
  occupancy: number; // fracción 0..1
}

/** Parámetros del estudio de mercado (información muestral / Bayes). */
export interface MarketStudyParams {
  /** P(I1|S1): probabilidad de dictamen favorable dado que ocurre S1. */
  sensitivity: number;
  /** P(I2|S2): probabilidad de dictamen desfavorable dado que ocurre S2. */
  specificity: number;
  /** Etiquetas de los dos posibles dictámenes del estudio. */
  signalLabels: [string, string]; // ['Favorable (I1)', 'Desfavorable (I2)']
}

/** Configuración del juego de suma cero (teoría de juegos). */
export interface GameTheoryConfig {
  player1Name: string; // 'Innowise'
  player2Name: string; // 'Itransition'
  /** Razón tarifa competidor / tarifa jugador 1 (punto medio de bandas). */
  tariffRatio: number;
  /** Estrategias disponibles (mismas para ambos jugadores). */
  strategies: { id: string; name: string }[];
  /** Tarifas del jugador 1: tariffs[strategyId][stateId] en USD/h. */
  tariffs: Record<string, Record<string, number>>;
  /** Estrategia que el mercado prefiere en cada estado. preferred[stateId]. */
  marketPreference: Record<string, string>;
  /** Supuestos de ocupación del modelo (fracción 0..1). */
  occupancy: {
    matchedShared: number; // ambos ofrecen lo que el mercado quiere
    matchedSolo: number; // solo esta empresa lo ofrece
    unmatched: number; // esta empresa no lo ofrece
  };
}

/** Ajustes generales de presentación/cálculo. */
export interface ProblemSettings {
  payoffDecimals: number; // decimales al mostrar millones
  currency: string; // 'USD'
  unit: string; // 'M' (millones)
}

/** Modelo central de datos del problema. Única fuente de entrada. */
export interface ProblemData {
  meta: {
    company: string;
    title: string;
    question: string;
    context: string;
  };
  engineers: number; // número de ingenieros
  hoursPerEngineer: number; // horas anuales por ingeniero
  alternatives: Alternative[];
  states: NatureState[];
  /** payoffs[alternativeIndex][stateIndex] */
  payoffs: PayoffCell[][];
  marketStudy: MarketStudyParams;
  gameTheory: GameTheoryConfig;
  settings: ProblemSettings;
}

/* ------------------------------------------------------------------ */
/* Tipos de RESULTADOS (derivados por el motor de cálculo)            */
/* ------------------------------------------------------------------ */

export interface ExpectedValueResult {
  byAlternative: { id: string; value: number }[];
  best: { id: string; value: number };
}

export interface IndifferenceResult {
  /** Coeficientes VE(Ai) = slope·p + intercept, con p = P(S1). */
  lines: { id: string; slope: number; intercept: number }[];
  /** Punto p donde se cruzan las dos primeras alternativas (o null). */
  p: number | null;
  value: number | null;
}

export interface RobustnessRow {
  p: number;
  values: { id: string; value: number }[];
  bestId: string;
}

export interface PerfectInformationResult {
  bestPerState: { stateId: string; altId: string; value: number }[];
  vecip: number; // VE con información perfecta
  baselineBest: number; // mejor VE sin información
  veip: number; // valor esperado de la información perfecta
}

export interface RegretResult {
  matrix: number[][]; // arrepentimiento[alt][state]
  maxRegretByAlt: { id: string; value: number }[];
  minimaxId: string;
  minimaxValue: number;
}

export interface CriterionResult {
  perAlternative: { id: string; value: number }[]; // valor del criterio por alt
  chosenId: string;
  chosenValue: number;
}

export interface ExpectedRegretResult {
  perAlternative: { id: string; value: number }[]; // PEM(Ai)
  chosenId: string;
  chosenValue: number;
}

export interface BayesResult {
  marginals: { signal: string; p: number }[]; // P(I1), P(I2)
  posteriors: {
    signal: string;
    byState: { stateId: string; p: number }[];
  }[];
}

export interface SampleInformationResult {
  perSignal: {
    signal: string;
    marginal: number;
    bestAltId: string;
    bestValue: number;
    evByAlt: { id: string; value: number }[];
  }[];
  vfod: number; // VE con información muestral
  baselineBest: number;
  iveim: number; // incremento por información muestral
  veip: number; // valor de información perfecta (referencia)
  efficiency: number; // iveim / veip
}

export interface SensitivityRow {
  sensitivity: number;
  specificity: number;
  vfod: number;
  iveim: number;
  efficiency: number;
}

export interface GameCellDetail {
  rowStrategy: string;
  colStrategy: string;
  byState: {
    stateId: string;
    p1Occupancy: number;
    p2Occupancy: number;
    p1Revenue: number;
    p2Revenue: number;
    advantage: number;
  }[];
  expectedAdvantage: number;
}

export interface GameTheoryResult {
  competitorTariffs: Record<string, Record<string, number>>;
  cells: GameCellDetail[][]; // [rowStrategy][colStrategy]
  matrix: number[][]; // valor esperado (ventaja) por celda
  rowMins: number[];
  colMaxs: number[];
  maximin: { value: number; rowIndex: number };
  minimax: { value: number; colIndex: number };
  saddle: { exists: boolean; rowIndex: number; colIndex: number } | null;
}

/** Agregado de todos los resultados. Consumido por todos los componentes. */
export interface ProblemResults {
  totalHours: number;
  expectedValue: ExpectedValueResult;
  indifference: IndifferenceResult;
  robustness: RobustnessRow[];
  perfectInformation: PerfectInformationResult;
  maximin: CriterionResult;
  maximax: CriterionResult;
  regret: RegretResult;
  expectedRegret: ExpectedRegretResult;
  bayes: BayesResult;
  sampleInformation: SampleInformationResult;
  sensitivity: SensitivityRow[];
  gameTheory: GameTheoryResult;
}

/** Resultado de la validación de datos de entrada. */
export interface ValidationIssue {
  field: string;
  message: string;
}
