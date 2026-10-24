/**
 * sampleInformation.ts
 * -----------------------------------------------------------------------------
 * Valor de la información muestral (VFOD / VEIM), incremento (IVEIM) y
 * eficiencia del estudio. Incluye el análisis de sensibilidad sens/espec.
 */

import type {
  ProblemData,
  SampleInformationResult,
  SensitivityRow,
} from '../types/problemTypes';
import { payoffMatrix } from './payoffCalculations';
import { calculateExpectedValues } from './expectedValue';
import { calculatePerfectInformation } from './perfectInformation';
import { calculateBayes, likelihoodMatrix } from './bayes';
import { priorVector } from './probabilityCalculations';

/**
 * calculateSampleInformation
 * Entrada: modelo del problema.
 * Fórmula:
 *   Para cada dictamen Ik: elegir Ai que maximiza el VE posterior
 *       VE(Ai|Ik) = Σ_j P(Sj|Ik) · Pago(Ai,Sj)
 *   VFOD = Σ_k P(Ik) · max_i VE(Ai|Ik)
 *   IVEIM = VFOD − max_i VE(Ai)        (mejora respecto a decidir sin estudio)
 *   Eficiencia = IVEIM / VEIP          (fracción del máximo teórico alcanzada)
 * Salida: detalle por señal, VFOD, IVEIM, VEIP y eficiencia.
 */
export function calculateSampleInformation(
  data: ProblemData
): SampleInformationResult {
  const matrix = payoffMatrix(data);
  const bayes = calculateBayes(data);
  const baselineBest = calculateExpectedValues(data).best.value;
  const veip = calculatePerfectInformation(data).veip;

  const perSignal = bayes.posteriors.map((post, k) => {
    const posteriorByState = data.states.map(
      (_s, j) => post.byState[j].p
    );

    const evByAlt = data.alternatives.map((alt, i) => ({
      id: alt.id,
      value: matrix[i].reduce(
        (acc, pay, j) => acc + posteriorByState[j] * pay,
        0
      ),
    }));

    const best = evByAlt.reduce((a, b) => (b.value > a.value ? b : a));
    return {
      signal: post.signal,
      marginal: bayes.marginals[k].p,
      bestAltId: best.id,
      bestValue: best.value,
      evByAlt,
    };
  });

  const vfod = perSignal.reduce(
    (acc, s) => acc + s.marginal * s.bestValue,
    0
  );
  const iveim = vfod - baselineBest;
  const efficiency = veip > 0 ? iveim / veip : 0;

  return { perSignal, vfod, baselineBest, iveim, veip, efficiency };
}

/**
 * calculateSensitivityRow
 * Recalcula VFOD / IVEIM / eficiencia para una pareja (sensibilidad,
 * especificidad) dada, manteniendo el resto del modelo constante.
 * Reutiliza exactamente la misma lógica que `calculateSampleInformation`.
 */
export function calculateSensitivityRow(
  data: ProblemData,
  sensitivity: number,
  specificity: number
): SensitivityRow {
  const scenario: ProblemData = {
    ...data,
    marketStudy: { ...data.marketStudy, sensitivity, specificity },
  };
  const r = calculateSampleInformation(scenario);
  return {
    sensitivity,
    specificity,
    vfod: r.vfod,
    iveim: r.iveim,
    efficiency: r.efficiency,
  };
}

/** Construye la tabla de sensibilidad para una lista de escenarios. */
export function calculateSensitivityTable(
  data: ProblemData,
  scenarios: Array<{ sensitivity: number; specificity: number }>
): SensitivityRow[] {
  return scenarios.map((s) =>
    calculateSensitivityRow(data, s.sensitivity, s.specificity)
  );
}

/** Exporta utilidades internas para inspección/depuración. */
export const _internals = { priorVector, likelihoodMatrix };
