/**
 * queuing.ts — motor de cálculo de TEORÍA DE COLAS (modelo M/M/1).
 *
 * Fórmulas clásicas de un servidor, cola y población infinitas, disciplina
 * FIFO y estado estacionario (λ < μ):
 *   ρ  = λ/μ          P0 = 1 − ρ        Lq = λ² / [μ(μ − λ)]
 *   L  = λ/(μ − λ)    Wq = Lq/λ         W  = 1/(μ − λ)        Pw = ρ
 *   P(n=k)   = (1 − ρ)·ρᵏ              P(n>k) = ρ^(k+1)
 */
import {
  MINUTES_PER_DAY,
  type QueuingData,
  type QueuingResults,
  type QueuingScenario,
  type MM1Metrics,
  type PnRow,
} from '../types/queuingTypes';

/** Número de niveles k mostrados en la tabla de probabilidades Pn. */
const PN_LEVELS = 4;

/** Convierte un tiempo de servicio (minutos) a la tasa μ en unidades/día. */
export function serviceRateFromMinutes(serviceTimeMinutes: number): number {
  const serviceTimeDays = serviceTimeMinutes / MINUTES_PER_DAY;
  return serviceTimeDays > 0 ? 1 / serviceTimeDays : Infinity;
}

/** Calcula las características operativas M/M/1 para λ y μ dados. */
export function calculateMM1Metrics(lambda: number, mu: number): MM1Metrics {
  const rho = mu > 0 ? lambda / mu : Infinity;
  const stable = lambda < mu;
  const gap = mu - lambda; // μ − λ

  return {
    lambda,
    mu,
    rho,
    p0: 1 - rho,
    lq: stable ? (lambda * lambda) / (mu * gap) : Infinity,
    l: stable ? lambda / gap : Infinity,
    wq: stable ? (lambda * lambda) / (mu * gap) / lambda : Infinity,
    w: stable ? 1 / gap : Infinity,
    pw: rho,
    stable,
  };
}

/** Genera las filas P(n=k) y P(n>k) para k = 0..PN_LEVELS. */
export function calculatePnRows(rho: number): PnRow[] {
  const rows: PnRow[] = [];
  for (let k = 0; k <= PN_LEVELS; k++) {
    rows.push({
      k,
      pEq: (1 - rho) * Math.pow(rho, k),
      pGt: Math.pow(rho, k + 1),
    });
  }
  return rows;
}

/** Construye un escenario completo a partir de λ y el tiempo de servicio. */
export function buildScenario(
  lambda: number,
  serviceTimeMinutes: number
): QueuingScenario {
  const serviceTimeDays = serviceTimeMinutes / MINUTES_PER_DAY;
  const mu = serviceRateFromMinutes(serviceTimeMinutes);
  const metrics = calculateMM1Metrics(lambda, mu);
  return {
    serviceTimeMinutes,
    serviceTimeDays,
    metrics,
    pn: calculatePnRows(metrics.rho),
  };
}

/** Motor del módulo: escenario base y escenario con la mejora propuesta. */
export function runQueuing(data: QueuingData): QueuingResults {
  const base = buildScenario(data.lambda, data.serviceTimeMinutes);
  const improved = buildScenario(
    data.lambda,
    data.serviceTimeMinutes * data.improvementFactor
  );
  return { base, improved };
}
