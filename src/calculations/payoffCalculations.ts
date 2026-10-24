/**
 * payoffCalculations.ts
 * -----------------------------------------------------------------------------
 * Cálculos relacionados con las horas facturables y la derivación de los pagos.
 */

import type { ProblemData, PayoffCell } from '../types/problemTypes';

/**
 * calculateTotalHours
 * Entrada: número de ingenieros y horas anuales por ingeniero.
 * Fórmula:  Horas totales = ingenieros × horas/ingeniero
 * Salida:   horas facturables totales al año.
 */
export function calculateTotalHours(data: ProblemData): number {
  return data.engineers * data.hoursPerEngineer;
}

/**
 * derivePayoffValue
 * Entrada: horas totales, ocupación (0..1) y tarifa (USD/h).
 * Fórmula:  Ingreso = Horas × Ocupación × Tarifa   (en USD)
 *           Ingreso(M) = Ingreso / 1_000_000
 * Salida:   ingreso derivado en millones de USD.
 *
 * Nota: este es el valor "de derivación" que EXPLICA de dónde sale un pago.
 * El análisis de decisión usa `PayoffCell.value` como fuente de verdad.
 */
export function derivePayoffValue(
  totalHours: number,
  occupancy: number,
  tariff: number
): number {
  return (totalHours * occupancy * tariff) / 1_000_000;
}

/** Extrae la matriz numérica de pagos (millones) desde el modelo. */
export function payoffMatrix(data: ProblemData): number[][] {
  return data.payoffs.map((row) => row.map((cell) => cell.value));
}

/** Devuelve la celda de pago para índices dados. */
export function payoffAt(
  data: ProblemData,
  altIndex: number,
  stateIndex: number
): PayoffCell {
  return data.payoffs[altIndex][stateIndex];
}
