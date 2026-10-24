/**
 * validation.ts
 * -----------------------------------------------------------------------------
 * Validaciones de los datos de entrada del modelo. Devuelve una lista de
 * problemas legibles para mostrar en el editor de datos.
 */

import type { ProblemData, ValidationIssue } from '../types/problemTypes';

const EPS = 1e-6;

/**
 * validateProblemData
 * Reglas verificadas:
 *   - ingenieros > 0 y horas > 0
 *   - cada probabilidad a priori en [0, 1] y su suma = 1
 *   - sensibilidad y especificidad en [0, 1]
 *   - tarifas ≥ 0 y ocupaciones en [0, 1]
 * Salida: arreglo de incidencias (vacío si todo es válido).
 */
export function validateProblemData(data: ProblemData): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!(data.engineers > 0)) {
    issues.push({ field: 'engineers', message: 'El número de ingenieros debe ser mayor que 0.' });
  }
  if (!(data.hoursPerEngineer > 0)) {
    issues.push({ field: 'hoursPerEngineer', message: 'Las horas anuales deben ser mayores que 0.' });
  }

  data.states.forEach((s) => {
    if (s.probability < 0 || s.probability > 1) {
      issues.push({
        field: `prob:${s.id}`,
        message: `P(${s.id}) debe estar entre 0 y 1.`,
      });
    }
  });

  const sum = data.states.reduce((acc, s) => acc + s.probability, 0);
  if (Math.abs(sum - 1) > 1e-3) {
    issues.push({
      field: 'prob:sum',
      message: `Las probabilidades deben sumar 1 (suma actual: ${sum.toFixed(2)}).`,
    });
  }

  const { sensitivity, specificity } = data.marketStudy;
  if (sensitivity < 0 || sensitivity > 1) {
    issues.push({ field: 'sensitivity', message: 'La sensibilidad debe estar entre 0 y 1.' });
  }
  if (specificity < 0 || specificity > 1) {
    issues.push({ field: 'specificity', message: 'La especificidad debe estar entre 0 y 1.' });
  }

  data.payoffs.forEach((row, i) =>
    row.forEach((cell, j) => {
      const label = `${data.alternatives[i].id}/${data.states[j].id}`;
      if (cell.tariff < -EPS) {
        issues.push({ field: `tariff:${i}:${j}`, message: `La tarifa de ${label} no puede ser negativa.` });
      }
      if (cell.occupancy < -EPS || cell.occupancy > 1 + EPS) {
        issues.push({ field: `occ:${i}:${j}`, message: `La ocupación de ${label} debe estar entre 0 y 1.` });
      }
    })
  );

  return issues;
}
