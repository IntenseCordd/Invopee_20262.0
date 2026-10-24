/**
 * DataEditor.tsx — "Modificar datos del problema".
 * Edita el modelo central; cualquier cambio recalcula toda la aplicación.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { NumberField } from './common/NumberField';
import { fmtInt } from '../utils/format';

export function DataEditor() {
  const {
    data,
    results,
    issues,
    setScalar,
    setPayoff,
    setPrimaryProbability,
    setMarketStudy,
    reset,
  } = useProblem();

  const err = (field: string) =>
    issues.find((i) => i.field === field)?.message;
  const p1 = data.states[0].probability;

  return (
    <Card
      title="Modificar datos del problema"
      subtitle="Cambia cualquier valor y observa cómo se actualizan resultados, gráficas, árboles y decisiones."
      badge="Editor"
    >
      {issues.length > 0 && (
        <div className="note" style={{ marginBottom: 16 }}>
          <strong>Revisa los datos:</strong>
          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
            {issues.map((i, k) => (
              <li key={k}>{i.message}</li>
            ))}
          </ul>
        </div>
      )}

      <h4 style={{ fontSize: 14, marginBottom: 10 }}>Capacidad</h4>
      <div className="grid-3">
        <NumberField
          label="Ingenieros"
          value={data.engineers}
          min={1}
          onChange={(v) => setScalar('engineers', v)}
          invalid={!!err('engineers')}
          error={err('engineers')}
        />
        <NumberField
          label="Horas por ingeniero / año"
          value={data.hoursPerEngineer}
          min={1}
          onChange={(v) => setScalar('hoursPerEngineer', v)}
          invalid={!!err('hoursPerEngineer')}
          error={err('hoursPerEngineer')}
        />
        <div className="stat stat--accent" style={{ alignSelf: 'end' }}>
          <div className="stat__label">Horas totales</div>
          <div className="stat__value">{fmtInt(results.totalHours)}</div>
        </div>
      </div>

      <hr className="divider" />

      <h4 style={{ fontSize: 14, marginBottom: 4 }}>
        Matriz de pagos (millones de USD)
      </h4>
      <p className="muted" style={{ fontSize: 12.5, margin: '0 0 12px' }}>
        El <strong>pago</strong> es el valor usado por todo el análisis. La
        tarifa y la ocupación solo explican de dónde sale (Horas × Ocupación ×
        Tarifa).
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {data.alternatives.map((alt, i) =>
          data.states.map((st, j) => (
            <div
              key={`${i}-${j}`}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 10,
                padding: 12,
              }}
            >
              <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 8 }}>
                {alt.id} / {st.id} —{' '}
                <span className="muted">
                  {alt.shortName} · {st.name}
                </span>
              </div>
              <div className="grid-3">
                <NumberField
                  label="Pago"
                  unit="M USD"
                  value={data.payoffs[i][j].value}
                  onChange={(v) => setPayoff(i, j, 'value', v)}
                />
                <NumberField
                  label="Tarifa"
                  unit="USD/h"
                  value={data.payoffs[i][j].tariff}
                  min={0}
                  onChange={(v) => setPayoff(i, j, 'tariff', v)}
                  invalid={!!err(`tariff:${i}:${j}`)}
                  error={err(`tariff:${i}:${j}`)}
                />
                <NumberField
                  label="Ocupación"
                  unit="0–1"
                  value={data.payoffs[i][j].occupancy}
                  min={0}
                  max={1}
                  step={0.001}
                  onChange={(v) => setPayoff(i, j, 'occupancy', v)}
                  invalid={!!err(`occ:${i}:${j}`)}
                  error={err(`occ:${i}:${j}`)}
                />
              </div>
            </div>
          ))
        )}
      </div>

      <hr className="divider" />

      <h4 style={{ fontSize: 14, marginBottom: 10 }}>Probabilidades a priori</h4>
      <div className="grid-2">
        <div className="field">
          <label>
            P(S1) — {data.states[0].name}:{' '}
            <strong>{(p1 * 100).toFixed(0)}%</strong>
          </label>
          <div className="slider-row">
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={p1}
              onChange={(e) => setPrimaryProbability(Number(e.target.value))}
            />
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">
            P(S2) = 1 − P(S1) — {data.states[1].name}
          </div>
          <div className="stat__value">
            {(data.states[1].probability * 100).toFixed(0)}%
          </div>
        </div>
      </div>

      <hr className="divider" />

      <h4 style={{ fontSize: 14, marginBottom: 4 }}>Estudio de mercado</h4>
      <p className="muted" style={{ fontSize: 12.5, margin: '0 0 12px' }}>
        Supuestos de diseño del estudio (no datos medidos por Innowise).
      </p>
      <div className="grid-2">
        <NumberField
          label="Sensibilidad · P(I1|S1)"
          value={data.marketStudy.sensitivity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setMarketStudy('sensitivity', v)}
          invalid={!!err('sensitivity')}
          error={err('sensitivity')}
        />
        <NumberField
          label="Especificidad · P(I2|S2)"
          value={data.marketStudy.specificity}
          min={0}
          max={1}
          step={0.01}
          onChange={(v) => setMarketStudy('specificity', v)}
          invalid={!!err('specificity')}
          error={err('specificity')}
        />
      </div>

      <div className="mt-16" style={{ display: 'flex', gap: 10 }}>
        <button className="btn" onClick={reset}>
          Restablecer datos del caso
        </button>
      </div>
    </Card>
  );
}
