/**
 * format.ts — utilidades de formato numérico para toda la aplicación.
 */

/** Formatea un número con `decimals` decimales (coma decimal es opcional). */
export function fmt(value: number, decimals = 2): string {
  if (!isFinite(value)) return '—';
  return value.toLocaleString('es', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/** Millones de USD: "72.00 M". */
export function fmtM(value: number, decimals = 2): string {
  return `${fmt(value, decimals)} M`;
}

/** Porcentaje a partir de una fracción 0..1: 0.4 -> "40%". */
export function fmtPct(fraction: number, decimals = 0): string {
  return `${fmt(fraction * 100, decimals)}%`;
}

/** Entero con separador de miles. */
export function fmtInt(value: number): string {
  return Math.round(value).toLocaleString('es');
}

/** Redondea a n decimales (numérico). */
export function round(value: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(value * f) / f;
}
