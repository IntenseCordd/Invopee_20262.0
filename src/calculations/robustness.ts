/**
 * robustness.ts
 * -----------------------------------------------------------------------------
 * Análisis de robustez: cómo cambia la mejor decisión al variar P(S1).
 */

import type { ProblemData, RobustnessRow } from '../types/problemTypes';
import { payoffMatrix } from './payoffCalculations';
import { expectedValueForAlternative } from './expectedValue';
import { complementaryProbabilities } from './probabilityCalculations';

/**
 * calculateRobustness
 * Entrada: modelo + lista de valores de p = P(S1) a evaluar.
 * Fórmula:  para cada p, VE(Ai) = Σ_j P(Sj)·Pago(Ai,Sj), con P(S2)=1-p.
 * Salida:   por cada p, el VE de cada alternativa y cuál es la mejor.
 *
 * Solo aplica de forma directa a problemas de DOS estados (usa p y 1-p).
 */
export function calculateRobustness(
  data: ProblemData,
  points: number[]
): RobustnessRow[] {
  const matrix = payoffMatrix(data);

  return points.map((p) => {
    const priors = complementaryProbabilities(p);
    const values = data.alternatives.map((alt, i) => ({
      id: alt.id,
      value: expectedValueForAlternative(matrix[i], priors),
    }));
    const bestId = values.reduce((a, b) => (b.value > a.value ? b : a)).id;
    return { p, values, bestId };
  });
}
