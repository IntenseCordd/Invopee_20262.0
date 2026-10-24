/**
 * engine.ts
 * -----------------------------------------------------------------------------
 * MOTOR DE CÁLCULO — única fuente de verdad de los resultados.
 *
 * Toma el modelo de datos y produce el objeto agregado `ProblemResults`.
 * Ningún componente visual recalcula fórmulas: todos consumen este resultado.
 * Para agregar un método nuevo basta con crear su módulo en `calculations/` y
 * añadir su llamada aquí (sin tocar los componentes existentes).
 */

import type { ProblemData, ProblemResults } from '../types/problemTypes';
import {
  defaultRobustnessPoints,
  defaultSensitivityScenarios,
} from '../data/problemData';

import { calculateTotalHours } from './payoffCalculations';
import {
  calculateExpectedValues,
  calculateIndifference,
} from './expectedValue';
import { calculateRobustness } from './robustness';
import { calculatePerfectInformation } from './perfectInformation';
import {
  calculateMaximin,
  calculateMaximax,
  calculateRegret,
  calculateExpectedRegret,
} from './regret';
import { calculateBayes } from './bayes';
import {
  calculateSampleInformation,
  calculateSensitivityTable,
} from './sampleInformation';
import { calculateGameTheory } from './gameTheory';

export interface EngineOptions {
  robustnessPoints?: number[];
  sensitivityScenarios?: Array<{ sensitivity: number; specificity: number }>;
}

/**
 * runEngine
 * Entrada: modelo del problema (+ opciones de puntos de robustez/sensibilidad).
 * Salida: todos los resultados derivados, listos para los componentes.
 */
export function runEngine(
  data: ProblemData,
  options: EngineOptions = {}
): ProblemResults {
  const robustnessPoints = options.robustnessPoints ?? defaultRobustnessPoints;
  const sensitivityScenarios =
    options.sensitivityScenarios ?? defaultSensitivityScenarios;

  return {
    totalHours: calculateTotalHours(data),
    expectedValue: calculateExpectedValues(data),
    indifference: calculateIndifference(data),
    robustness: calculateRobustness(data, robustnessPoints),
    perfectInformation: calculatePerfectInformation(data),
    maximin: calculateMaximin(data),
    maximax: calculateMaximax(data),
    regret: calculateRegret(data),
    expectedRegret: calculateExpectedRegret(data),
    bayes: calculateBayes(data),
    sampleInformation: calculateSampleInformation(data),
    sensitivity: calculateSensitivityTable(data, sensitivityScenarios),
    gameTheory: calculateGameTheory(data),
  };
}
