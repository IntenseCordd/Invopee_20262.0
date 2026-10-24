/**
 * regret.ts
 * -----------------------------------------------------------------------------
 * Criterios sin probabilidades (Maximin, Maximax) y con arrepentimiento
 * (Minimax Regret y Pérdida Esperada Mínima, PEM).
 */

import type {
  ProblemData,
  CriterionResult,
  RegretResult,
  ExpectedRegretResult,
} from '../types/problemTypes';
import { payoffMatrix } from './payoffCalculations';
import { priorVector } from './probabilityCalculations';

/**
 * calculateMaximin (criterio pesimista)
 * Fórmula:  para cada Ai calcular min_j Pago(Ai,Sj); elegir max de esos mínimos.
 * Salida:   peor caso por alternativa y la elegida (mejor de los peores).
 */
export function calculateMaximin(data: ProblemData): CriterionResult {
  const matrix = payoffMatrix(data);
  const perAlternative = data.alternatives.map((alt, i) => ({
    id: alt.id,
    value: Math.min(...matrix[i]),
  }));
  const chosen = perAlternative.reduce((a, b) => (b.value > a.value ? b : a));
  return { perAlternative, chosenId: chosen.id, chosenValue: chosen.value };
}

/**
 * calculateMaximax (criterio optimista)
 * Fórmula:  para cada Ai calcular max_j Pago(Ai,Sj); elegir max de esos máximos.
 * Salida:   mejor caso por alternativa y la elegida (máximo absoluto).
 */
export function calculateMaximax(data: ProblemData): CriterionResult {
  const matrix = payoffMatrix(data);
  const perAlternative = data.alternatives.map((alt, i) => ({
    id: alt.id,
    value: Math.max(...matrix[i]),
  }));
  const chosen = perAlternative.reduce((a, b) => (b.value > a.value ? b : a));
  return { perAlternative, chosenId: chosen.id, chosenValue: chosen.value };
}

/**
 * calculateRegret (matriz de arrepentimiento + Minimax Regret)
 * Fórmula:
 *   Arrepentimiento(Ai,Sj) = [max_k Pago(Ak,Sj)] − Pago(Ai,Sj)
 *   Elegir la alternativa con el MENOR arrepentimiento MÁXIMO (minimax regret).
 * Salida: matriz de arrepentimiento, máximo por alternativa y la elegida.
 */
export function calculateRegret(data: ProblemData): RegretResult {
  const matrix = payoffMatrix(data);
  const nStates = data.states.length;

  const colMax: number[] = [];
  for (let j = 0; j < nStates; j++) {
    colMax[j] = Math.max(...data.alternatives.map((_, i) => matrix[i][j]));
  }

  const regretMatrix = data.alternatives.map((_, i) =>
    data.states.map((_, j) => colMax[j] - matrix[i][j])
  );

  const maxRegretByAlt = data.alternatives.map((alt, i) => ({
    id: alt.id,
    value: Math.max(...regretMatrix[i]),
  }));

  const chosen = maxRegretByAlt.reduce((a, b) => (b.value < a.value ? b : a));
  return {
    matrix: regretMatrix,
    maxRegretByAlt,
    minimaxId: chosen.id,
    minimaxValue: chosen.value,
  };
}

/**
 * calculateExpectedRegret (Pérdida Esperada Mínima, PEM)
 * Fórmula:  PEM(Ai) = Σ_j P(Sj) × Arrepentimiento(Ai,Sj)
 *           Elegir la alternativa con menor PEM.
 *   (PEM mínimo coincide con el VEIP: pérdida de oportunidad esperada.)
 * Salida: PEM por alternativa y la elegida (mínima).
 */
export function calculateExpectedRegret(
  data: ProblemData
): ExpectedRegretResult {
  const { matrix: regretMatrix } = calculateRegret(data);
  const priors = priorVector(data);

  const perAlternative = data.alternatives.map((alt, i) => ({
    id: alt.id,
    value: regretMatrix[i].reduce((acc, r, j) => acc + priors[j] * r, 0),
  }));

  const chosen = perAlternative.reduce((a, b) => (b.value < a.value ? b : a));
  return { perAlternative, chosenId: chosen.id, chosenValue: chosen.value };
}
