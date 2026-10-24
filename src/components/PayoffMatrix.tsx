/**
 * PayoffMatrix.tsx — matriz de pagos interactiva.
 * Cada celda es seleccionable y muestra su derivación (Horas × Ocupación × Tarifa).
 */
import { useState } from 'react';
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { derivePayoffValue } from '../calculations/payoffCalculations';
import { fmt, fmtInt, fmtM } from '../utils/format';

export function PayoffMatrix() {
  const { data, results } = useProblem();
  const [sel, setSel] = useState<{ i: number; j: number } | null>({ i: 0, j: 0 });

  const dec = data.settings.payoffDecimals;
  const bestId = results.expectedValue.best.id;

  const selected = sel ? data.payoffs[sel.i][sel.j] : null;
  const selAlt = sel ? data.alternatives[sel.i] : null;
  const selState = sel ? data.states[sel.j] : null;
  const derived = selected
    ? derivePayoffValue(results.totalHours, selected.occupancy, selected.tariff)
    : 0;

  return (
    <Card
      title="Matriz de pagos"
      subtitle="Ingreso anual (millones de USD) para cada alternativa y estado. Selecciona una celda."
      badge="Ingresos"
    >
      <table className="payoff-table">
        <thead>
          <tr>
            <th></th>
            {data.states.map((s) => (
              <th key={s.id}>
                {s.name}
                <div className="muted" style={{ fontWeight: 400 }}>
                  {s.id}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.alternatives.map((alt, i) => (
            <tr key={alt.id}>
              <th className="row-head">
                {alt.name}
                <div className="muted" style={{ fontWeight: 400 }}>
                  {alt.id} · {alt.shortName}
                </div>
              </th>
              {data.states.map((_st, j) => {
                const isSel = sel?.i === i && sel?.j === j;
                return (
                  <td key={j} style={{ padding: 0 }}>
                    <div
                      className={`payoff-cell${isSel ? ' selected' : ''}`}
                      onClick={() => setSel({ i, j })}
                    >
                      <div className="payoff-cell__value">
                        {fmt(data.payoffs[i][j].value, dec)}
                      </div>
                      <div className="payoff-cell__unit">M USD</div>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {selected && selAlt && selState && (
        <div
          style={{
            marginTop: 16,
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 16,
            background: 'var(--surface-2)',
          }}
        >
          <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
            <span className={`pill ${selAlt.id === 'A1' ? 'pill--a1' : 'pill--a2'}`}>
              {selAlt.id} · {selAlt.shortName}
            </span>
            <span className="pill pill--info">{selState.name}</span>
          </div>
          <p style={{ marginTop: 0, fontSize: 14 }}>
            Si Innowise elige <strong>{selAlt.name}</strong> y ocurre{' '}
            <strong>{selState.name}</strong>, el ingreso anual estimado es{' '}
            <strong>{fmtM(selected.value, dec)}</strong>.
          </p>
          <Formula>
            <FLine>Ingreso = Horas × Ocupación × Tarifa</FLine>
            <FLine>
              = {fmtInt(results.totalHours)} × {fmt(selected.occupancy, 3)} ×{' '}
              {fmt(selected.tariff, 0)}
            </FLine>
            <FLine>
              = {fmtInt(derived * 1_000_000)} USD ≈{' '}
              <FResult>{fmtM(derived, 2)}</FResult>
            </FLine>
            <FLine>
              Pago usado en el análisis: <FResult>{fmtM(selected.value, dec)}</FResult>
            </FLine>
          </Formula>
          {Math.abs(derived - selected.value) > 0.05 && (
            <div className="note" style={{ marginTop: 10 }}>
              <strong>Nota:</strong> la derivación da {fmtM(derived, 2)}; el
              documento lo redondea a {fmtM(selected.value, dec)} para el
              análisis. Se conserva el dato del enunciado como fuente de verdad.
            </div>
          )}
        </div>
      )}

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'La matriz de pagos resume, en un solo lugar, cuánto gana Innowise con cada combinación de decisión (fila) y escenario (columna). Es la base de todos los criterios de decisión.',
            how: (
              <Formula>
                <FLine>Cada celda = Horas × Ocupación × Tarifa</FLine>
                <FLine>A1/S1 = {fmtInt(results.totalHours)} × 1.000 × 95 → 95 M</FLine>
                <FLine>A1/S2 = {fmtInt(results.totalHours)} × 0.664 × 60 → 39.84 ≈ 40 M</FLine>
                <FLine>A2/S1 = {fmtInt(results.totalHours)} × 1.000 × 75 → 75 M</FLine>
                <FLine>A2/S2 = {fmtInt(results.totalHours)} × 1.000 × 70 → 70 M</FLine>
              </Formula>
            ),
            meaning:
              'Cada número es el ingreso anual (en millones de USD) que Innowise obtendría en ese escenario. La mejor fila depende de qué tan probable sea cada estado.',
          }}
        />
      </div>
      <p className="muted mt-8" style={{ fontSize: 12.5 }}>
        Mejor alternativa por valor esperado actual:{' '}
        <strong>{bestId}</strong>.
      </p>
    </Card>
  );
}
