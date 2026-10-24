/**
 * QueuingMetrics.tsx — características operativas del sistema actual (M/M/1).
 * Muestra P0, Lq, L, Wq, W y Pw con su fórmula, sustitución e interpretación.
 */
import { useQueuing } from '../../state/QueuingContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { fmt, fmtPct } from '../../utils/format';
import {
  MINUTES_PER_DAY,
  normalizeTimeUnit,
  convertTimeToDisplay,
  type MM1Metrics,
  type TimeDisplayUnit,
} from '../../types/queuingTypes';

interface Row {
  char: string;
  formula: string;
  substitution: string;
  result: string;
  meaning: string;
}

export function buildMetricRows(
  m: MM1Metrics,
  rateUnit: string,
  timeUnit: TimeDisplayUnit
): Row[] {
  const gap = m.mu - m.lambda;
  const wqDisplay = convertTimeToDisplay(m.wq, timeUnit);
  const wDisplay = convertTimeToDisplay(m.w, timeUnit);
  const timeSuffix = timeUnit === 'minutos' ? 'min' : 'días';
  const wqText = `${fmt(wqDisplay, timeUnit === 'minutos' ? 3 : 7)} ${timeSuffix}`;
  const wText = `${fmt(wDisplay, timeUnit === 'minutos' ? 3 : 6)} ${timeSuffix}`;

  return [
    {
      char: 'P₀',
      formula: '1 − λ/μ',
      substitution: `1 − ${fmt(m.lambda, 2)}/${fmt(m.mu, 2)} = 1 − ${fmt(m.rho, 6)}`,
      result: fmt(m.p0, 4),
      meaning: `~${fmtPct(m.p0, 2)} del tiempo no hay ningún cliente en el sistema.`,
    },
    {
      char: 'Lq',
      formula: 'λ² / [μ(μ − λ)]',
      substitution: `${fmt(m.lambda, 2)}² / (${fmt(m.mu, 2)} × ${fmt(gap, 2)})`,
      result: `${fmt(m.lq, 5)} ${rateUnit.split('/')[0]}`,
      meaning: 'Número medio de clientes esperando en la fila.',
    },
    {
      char: 'L',
      formula: 'λ / (μ − λ)',
      substitution: `${fmt(m.lambda, 2)} / ${fmt(gap, 2)}`,
      result: `${fmt(m.l, 4)}`,
      meaning: 'Número medio de clientes en el sistema (fila + servicio).',
    },
    {
      char: 'Wq',
      formula: 'Lq / λ',
      substitution: `${fmt(m.lq, 6)} / ${fmt(m.lambda, 2)}`,
      result: wqText,
      meaning:
        timeUnit === 'minutos'
          ? `Espera media antes de empezar a ser atendido (≈ ${fmt(m.wq * MINUTES_PER_DAY, 3)} min).`
          : `Espera media antes de empezar a ser atendido (≈ ${fmt(m.wq * MINUTES_PER_DAY, 4)} min).`,
    },
    {
      char: 'W',
      formula: '1 / (μ − λ)',
      substitution: `1 / ${fmt(gap, 2)}`,
      result: wText,
      meaning:
        timeUnit === 'minutos'
          ? `Tiempo total en el sistema, desde que llega hasta que termina (≈ ${fmt(m.w * MINUTES_PER_DAY, 3)} min).`
          : `Tiempo total en el sistema, desde que llega hasta que termina (≈ ${fmt(m.w * MINUTES_PER_DAY, 3)} min).`,
    },
    {
      char: 'Pw',
      formula: 'λ / μ',
      substitution: `${fmt(m.lambda, 2)} / ${fmt(m.mu, 2)}`,
      result: fmt(m.pw, 4),
      meaning: `~${fmtPct(m.pw, 2)} de los clientes encuentra el servidor ocupado y espera (= utilización).`,
    },
  ];
}

export function QueuingMetrics() {
  const { data, results, setTimeUnit } = useQueuing();
  const m = results.base.metrics;
  const timeUnit = normalizeTimeUnit(data.labels.timeUnit);
  const rows = buildMetricRows(m, data.labels.rateUnit, timeUnit);

  if (!m.stable) {
    return (
      <Card title="Características operativas" badge="Actual">
        <div className="note">
          El sistema es inestable (λ ≥ μ): la cola crece sin límite y no existen
          características operativas en estado estacionario.
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Características operativas"
      subtitle={`Sistema actual · λ = ${fmt(m.lambda, 2)}; μ = ${fmt(m.mu, 2)} ${data.labels.rateUnit}`}
      badge="Actual"
    >
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 12 }}>
        <div className="mode-switch" aria-label="Unidad de tiempo">
          {(['días', 'minutos'] as const).map((unit) => (
            <button
              key={unit}
              type="button"
              className={timeUnit === unit ? 'active' : ''}
              onClick={() => setTimeUnit(unit)}
            >
              {unit}
            </button>
          ))}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Característica</th>
            <th>Fórmula</th>
            <th>Sustitución</th>
            <th>Resultado</th>
            <th>Interpretación</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.char}>
              <td>
                <strong>{r.char}</strong>
              </td>
              <td className="mono" style={{ textAlign: 'left' }}>
                {r.formula}
              </td>
              <td className="mono" style={{ textAlign: 'left' }}>
                {r.substitution}
              </td>
              <td>
                <strong>{r.result}</strong>
              </td>
              <td style={{ textAlign: 'left' }}>{r.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'Estas medidas resumen el desempeño del sistema: cuánto se usa el servidor (ρ, Pw), cuántos clientes hay en promedio (L, Lq) y cuánto esperan (W, Wq).',
            meaning:
              timeUnit === 'minutos'
                ? 'Los tiempos W y Wq se muestran en minutos para facilitar su lectura; en días se usa el factor de 1440 minutos por día.'
                : 'Los tiempos W y Wq están en días porque λ y μ se expresan por día. Multiplicando por 1440 se obtienen en minutos.',
          }}
        />
      </div>
    </Card>
  );
}
