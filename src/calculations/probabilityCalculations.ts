/**
 * probabilityCalculations.ts
 * -----------------------------------------------------------------------------
 * Utilidades sobre las probabilidades a priori de los estados de la naturaleza.
 */

import type { ProblemData } from '../types/problemTypes';

/** Vector de probabilidades a priori en el orden de los estados. */
export function priorVector(data: ProblemData): number[] {
  return data.states.map((s) => s.probability);
}

/**
 * complementaryProbabilities
 * Para el caso de DOS estados: si se fija P(S1) = p, entonces P(S2) = 1 - p.
 * Entrada: p (probabilidad del primer estado).
 * Salida:  arreglo [p, 1 - p].
 */
export function complementaryProbabilities(p: number): [number, number] {
  return [p, 1 - p];
}

/** Suma de todas las probabilidades a priori (debe ser 1). */
export function probabilitySum(data: ProblemData): number {
  return data.states.reduce((acc, s) => acc + s.probability, 0);
}
