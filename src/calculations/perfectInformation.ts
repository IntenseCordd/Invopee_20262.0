/**
 * perfectInformation.ts
 * -----------------------------------------------------------------------------
 * Valor Esperado con Información Perfecta (VECIP) y VEIP.
 */

import type {
  ProblemData,
  PerfectInformationResult,
} from '../types/problemTypes';
import { payoffMatrix } from './payoffCalculations';
import { priorVector } from './probabilityCalculations';
import { calculateExpectedValues } from './expectedValue';

/**
 * calculatePerfectInformation
 * Entrada: modelo del problema.
 * Fórmula:
 *   VECIP = Σ_j P(Sj) × max_i Pago(Ai, Sj)     (elegir lo mejor en cada estado)
 *   VEIP  = VECIP − max_i VE(Ai)               (mejora sobre la mejor decisión)
 * Salida: mejor alternativa por estado, VECIP, VE base y VEIP.
 */
export function calculatePerfectInformation(
  data: ProblemData
): PerfectInformationResult {
  const matrix = payoffMatrix(data);
  const priors = priorVector(data);

  const bestPerState = data.states.map((state, j) => {
    let bestI = 0;
    for (let i = 1; i < data.alternatives.length; i++) {
      if (matrix[i][j] > matrix[bestI][j]) bestI = i;
    }
    return {
      stateId: state.id,
      altId: data.alternatives[bestI].id,
      value: matrix[bestI][j],
    };
  });

  const vecip = bestPerState.reduce(
    (acc, b, j) => acc + priors[j] * b.value,
    0
  );

  const baselineBest = calculateExpectedValues(data).best.value;
  const veip = vecip - baselineBest;

  return { bestPerState, vecip, baselineBest, veip };
}
