/**
 * Formula.tsx — muestra fórmulas / sustituciones / resultados en monoespaciado.
 * `lines` acepta texto plano; usa <Formula.Result> para resaltar el resultado.
 */
import type { ReactNode } from 'react';

export function Formula({ children }: { children: ReactNode }) {
  return <div className="formula">{children}</div>;
}

export function FLine({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

export function FRule() {
  return <span className="rule">─────────────</span>;
}

export function FResult({ children }: { children: ReactNode }) {
  return <span className="res">{children}</span>;
}

export function FOp({ children }: { children: ReactNode }) {
  return <span className="op">{children}</span>;
}
