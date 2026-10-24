/**
 * expectedValue.ts
 * -----------------------------------------------------------------------------
 * Valor Esperado Monetario (VEM) y punto de indiferencia.
 */

import type {
  ProblemData,
  ExpectedValueResult,
  IndifferenceResult,
} from '../types/problemTypes';
import { payoffMatrix } from './payoffCalculations';
import { priorVector } from './probabilityCalculations';

/**
 * expectedValueForAlternative
 * Entrada: pagos de una alternativa (por estado) y probabilidades a priori.
 * Fórmula:  VE(Ai) = Σ_j  P(Sj) × Pago(Ai, Sj)
 * Salida:   valor esperado de la alternativa.
 */
export function expectedValueForAlternative(
  payoffs: number[],
  priors: number[]
): number {
  return payoffs.reduce((acc, pay, j) => acc + priors[j] * pay, 0);
}

/**
 * calculateExpectedValues
 * Entrada: modelo del problema.
 * Fórmula:  VE(Ai) = Σ_j P(Sj)·Pago(Ai,Sj) para cada alternativa.
 * Salida:   VE por alternativa + la mejor (máximo VE).
 */
export function calculateExpectedValues(
  data: ProblemData
): ExpectedValueResult {
  const priors = priorVector(data);
  const matrix = payoffMatrix(data);

  const byAlternative = data.alternatives.map((alt, i) => ({
    id: alt.id,
    value: expectedValueForAlternative(matrix[i], priors),
  }));

  const best = byAlternative.reduce((a, b) => (b.value > a.value ? b : a));
  return { byAlternative, best };
}

/**
 * calculateIndifference
 * Para dos estados, expresa VE(Ai) como recta en función de p = P(S1):
 *   VE(Ai) = Pago(Ai,S1)·p + Pago(Ai,S2)·(1 - p)
 *          = [Pago(Ai,S1) - Pago(Ai,S2)]·p + Pago(Ai,S2)
 *   => slope = Pago(Ai,S1) - Pago(Ai,S2),  intercept = Pago(Ai,S2)
 *
 * El punto de indiferencia entre las dos primeras alternativas es el p donde
 * ambas rectas se cruzan:  slopeA·p + interceptA = slopeB·p + interceptB.
 * Salida: rectas por alternativa y el punto de cruce (p, valor) si existe.
 */
export function calculateIndifference(data: ProblemData): IndifferenceResult {
  const matrix = payoffMatrix(data);
  const lines = data.alternatives.map((alt, i) => ({
    id: alt.id,
    slope: matrix[i][0] - matrix[i][1],
    intercept: matrix[i][1],
  }));

  let p: number | null = null;
  let value: number | null = null;
  if (lines.length >= 2) {
    const [a, b] = lines;
    const denom = a.slope - b.slope;
    if (Math.abs(denom) > 1e-9) {
      p = (b.intercept - a.intercept) / denom;
      value = a.slope * p + a.intercept;
    }
  }
  return { lines, p, value };
}
