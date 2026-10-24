/**
 * bayes.ts
 * -----------------------------------------------------------------------------
 * Revisión bayesiana de probabilidades a partir del dictamen del estudio.
 */

import type { ProblemData, BayesResult } from '../types/problemTypes';
import { priorVector } from './probabilityCalculations';

/**
 * likelihoodMatrix
 * Construye la matriz de verosimilitudes P(Ik | Sj) para dos señales y dos
 * estados a partir de la sensibilidad y la especificidad del estudio:
 *   P(I1|S1) = sensibilidad          P(I2|S1) = 1 − sensibilidad
 *   P(I1|S2) = 1 − especificidad     P(I2|S2) = especificidad
 * Salida: likelihood[signalIndex][stateIndex].
 */
export function likelihoodMatrix(data: ProblemData): number[][] {
  const { sensitivity, specificity } = data.marketStudy;
  // Filas = señales (I1, I2); columnas = estados (S1, S2)
  return [
    [sensitivity, 1 - specificity], // P(I1|S1), P(I1|S2)
    [1 - sensitivity, specificity], // P(I2|S1), P(I2|S2)
  ];
}

/**
 * calculateBayes
 * Entrada: modelo (priors + verosimilitudes derivadas de sens/espec).
 * Fórmula:
 *   Marginal:  P(Ik) = Σ_j P(Ik|Sj) · P(Sj)
 *   Posterior: P(Sj|Ik) = P(Ik|Sj) · P(Sj) / P(Ik)     (Teorema de Bayes)
 * Salida: marginales por señal y posteriores por (señal, estado).
 */
export function calculateBayes(data: ProblemData): BayesResult {
  const priors = priorVector(data);
  const likelihood = likelihoodMatrix(data);
  const signals = data.marketStudy.signalLabels;

  const marginals = signals.map((signal, k) => {
    const p = data.states.reduce(
      (acc, _s, j) => acc + likelihood[k][j] * priors[j],
      0
    );
    return { signal, p };
  });

  const posteriors = signals.map((signal, k) => {
    const marginal = marginals[k].p;
    const byState = data.states.map((state, j) => ({
      stateId: state.id,
      p: marginal > 0 ? (likelihood[k][j] * priors[j]) / marginal : 0,
    }));
    return { signal, byState };
  });

  return { marginals, posteriors };
}
