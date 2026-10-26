/**
 * multiChannel.ts — motor de cálculo de TEORÍA DE COLAS con CANALES MÚLTIPLES
 * (modelo M/M/s).
 *
 * Fórmulas clásicas de s servidores, cola y población infinitas, disciplina
 * FIFO y estado estacionario (λ < s·μ). Con a = λ/μ y ρ = a/s:
 *
 *   P0 = 1 / [ Σ(n=0..s−1) aⁿ/n!  +  aˢ/(s!·(1 − ρ)) ]
 *   Pw = [ aˢ / (s!·(1 − ρ)) ] · P0          (fórmula de Erlang C)
 *   Lq = Pw · ρ/(1 − ρ)        L  = Lq + a
 *   Wq = Lq/λ                  W  = Wq + 1/μ
 *   P(n = k) = aᵏ/k! · P0                    (k < s)
 *   P(n = k) = aᵏ/(s!·s^(k−s)) · P0          (k ≥ s)
 *
 * Con s = 1 estas fórmulas se reducen exactamente al modelo M/M/1.
 */
import {
  MINUTES_PER_DAY,
  type MultiChannelData,
  type MultiChannelResults,
  type MMsMetrics,
  type MCPnRow,
} from '../types/multiChannelTypes';

/** Factorial de un entero no negativo. */
function factorial(n: number): number {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

/** Convierte un tiempo de servicio (minutos) a la tasa μ en unidades/día. */
export function serviceRateFromMinutes(serviceTimeMinutes: number): number {
  const serviceTimeDays = serviceTimeMinutes / MINUTES_PER_DAY;
  return serviceTimeDays > 0 ? 1 / serviceTimeDays : Infinity;
}

/** Calcula las características operativas M/M/s para λ, μ y s dados. */
export function calculateMMsMetrics(
  lambda: number,
  mu: number,
  servers: number
): MMsMetrics {
  const s = servers;
  const a = mu > 0 ? lambda / mu : Infinity;
  const rho = s > 0 && mu > 0 ? lambda / (s * mu) : Infinity;
  const stable = lambda < s * mu;

  if (!stable || !isFinite(a)) {
    return {
      lambda,
      mu,
      servers: s,
      a,
      rho,
      p0: NaN,
      pw: NaN,
      sumTerms: NaN,
      erlangTerm: NaN,
      lq: Infinity,
      l: Infinity,
      wq: Infinity,
      w: Infinity,
      stable: false,
    };
  }

  // Σ(n=0..s−1) aⁿ/n!
  let sum = 0;
  for (let n = 0; n < s; n++) sum += Math.pow(a, n) / factorial(n);

  // Último término: aˢ / (s!·(1 − ρ))
  const lastTerm = Math.pow(a, s) / (factorial(s) * (1 - rho));

  const p0 = 1 / (sum + lastTerm);
  const pw = lastTerm * p0; // Erlang C
  const lq = (pw * rho) / (1 - rho);
  const l = lq + a;
  const wq = lq / lambda;
  const w = wq + 1 / mu;

  return {
    lambda,
    mu,
    servers: s,
    a,
    rho,
    p0,
    pw,
    sumTerms: sum,
    erlangTerm: lastTerm,
    lq,
    l,
    wq,
    w,
    stable: true,
  };
}

/** Genera las filas P(n=k), P(n≤k) y P(n>k) para k = 0..levels. */
export function calculatePnRows(
  a: number,
  servers: number,
  p0: number,
  levels: number
): MCPnRow[] {
  const s = servers;
  const rows: MCPnRow[] = [];
  let cumulative = 0;

  for (let k = 0; k <= levels; k++) {
    const pEq =
      k < s
        ? (Math.pow(a, k) / factorial(k)) * p0
        : (Math.pow(a, k) / (factorial(s) * Math.pow(s, k - s))) * p0;
    cumulative += pEq;
    rows.push({ k, pEq, pLe: cumulative, pGt: 1 - cumulative });
  }

  return rows;
}

/**
 * runMultiChannel
 * Entrada: datos del modelo M/M/s.
 * Salida: sistema principal, distribución Pn y los tres escenarios del informe.
 */
export function runMultiChannel(
  data: MultiChannelData
): MultiChannelResults {
  const mu = serviceRateFromMinutes(data.serviceTimeMinutes);
  const lambdaTotal = data.projects * data.lambdaPerProject;
  const serviceTimeDays = data.serviceTimeMinutes / MINUTES_PER_DAY;

  const main = calculateMMsMetrics(lambdaTotal, mu, data.servers);
  const pn = isFinite(main.p0)
    ? calculatePnRows(main.a, data.servers, main.p0, data.pnLevels)
    : [];

  // Escenario 1: un solo runner con la carga de un proyecto.
  const single = calculateMMsMetrics(data.lambdaPerProject, mu, 1);

  // Escenario 2: un solo runner, pero cada run dura menos (mejora de μ).
  const muImproved = serviceRateFromMinutes(
    data.serviceTimeMinutes * data.improvementFactor
  );
  const singleImproved = calculateMMsMetrics(
    data.lambdaPerProject,
    muImproved,
    1
  );

  return {
    lambdaTotal,
    serviceTimeDays,
    main,
    pn,
    scenarios: { single, singleImproved, multi: main },
  };
}
