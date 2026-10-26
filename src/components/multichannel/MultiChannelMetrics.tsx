/**
 * MultiChannelMetrics.tsx — características operativas del sistema M/M/s con las
 * fórmulas de Erlang C. Muestra P0, Pw, Lq, L, Wq y W con fórmula, sustitución,
 * resultado e interpretación.
 */
import { useMultiChannel } from '../../state/MultiChannelContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { fmt, fmtPct } from '../../utils/format';
import {
  MINUTES_PER_DAY,
  normalizeTimeUnit,
  convertTimeToDisplay,
  type MMsMetrics,
  type TimeDisplayUnit,
} from '../../types/multiChannelTypes';

interface Row {
  char: string;
  formula: string;
  substitution: string;
  result: string;
  meaning: string;
}

function buildRows(
  m: MMsMetrics,
  rateUnit: string,
  timeUnit: TimeDisplayUnit
): Row[] {
  const unitBase = rateUnit.split('/')[0];
  const wqDisplay = convertTimeToDisplay(m.wq, timeUnit);
  const wDisplay = convertTimeToDisplay(m.w, timeUnit);
  const timeSuffix = timeUnit === 'minutos' ? 'min' : 'días';
  const wqText = `${fmt(wqDisplay, timeUnit === 'minutos' ? 4 : 6)} ${timeSuffix}`;
  const wText = `${fmt(wDisplay, timeUnit === 'minutos' ? 4 : 6)} ${timeSuffix}`;

  return [
    {
      char: 'P₀',
      formula: '1 / [ Σ aⁿ/n! + aˢ/(s!(1−ρ)) ]',
      substitution: `1 / (${fmt(m.sumTerms, 4)} + ${fmt(m.erlangTerm, 4)}) = 1 / ${fmt(m.sumTerms + m.erlangTerm, 4)}`,
      result: fmt(m.p0, 4),
      meaning: `~${fmtPct(m.p0, 2)} del tiempo no hay ningún run: los ${m.servers} canales están libres.`,
    },
    {
      char: 'Pw',
      formula: '[ aˢ/(s!(1−ρ)) ] · P₀  (Erlang C)',
      substitution: `${fmt(m.erlangTerm, 6)} × ${fmt(m.p0, 6)}`,
      result: fmt(m.pw, 4),
      meaning: `Solo ~${fmtPct(m.pw, 2)} de los runs encuentra todos los canales ocupados y debe esperar.`,
    },
    {
      char: 'Lq',
      formula: 'Pw · ρ/(1−ρ)',
      substitution: `${fmt(m.pw, 6)} × ${fmt(m.rho, 4)}/${fmt(1 - m.rho, 4)}`,
      result: `${fmt(m.lq, 4)} ${unitBase}`,
      meaning: 'Número medio de runs esperando en la fila (muy pocos).',
    },
    {
      char: 'L',
      formula: 'Lq + a',
      substitution: `${fmt(m.lq, 4)} + ${fmt(m.a, 4)}`,
      result: `${fmt(m.l, 4)} ${unitBase}`,
      meaning: 'Número medio de runs en el sistema (fila + en ejecución).',
    },
    {
      char: 'Wq',
      formula: 'Lq / λ',
      substitution: `${fmt(m.lq, 6)} / ${fmt(m.lambda, 2)}`,
      result: wqText,
      meaning: `Espera media antes de empezar a ejecutarse (≈ ${fmt(m.wq * MINUTES_PER_DAY, 4)} min).`,
    },
    {
      char: 'W',
      formula: 'Wq + 1/μ',
      substitution: `${fmt(m.wq, 6)} + 1/${fmt(m.mu, 2)}`,
      result: wText,
      meaning: `Tiempo total desde que llega hasta que termina (≈ ${fmt(m.w * MINUTES_PER_DAY, 3)} min).`,
    },
  ];
}

export function MultiChannelMetrics() {
  const { data, results, setTimeUnit } = useMultiChannel();
  const m = results.main;
  const timeUnit = normalizeTimeUnit(data.labels.timeUnit);

  if (!m.stable) {
    return (
      <Card title="Características operativas" badge="M/M/5">
        <div className="note">
          El sistema es inestable (λ ≥ s·μ): la cola crece sin límite y no
          existen características operativas en estado estacionario.
        </div>
      </Card>
    );
  }

  const rows = buildRows(m, data.labels.rateUnit, timeUnit);

  return (
    <Card
      title="Características operativas (Erlang C)"
      subtitle={`λ = ${fmt(m.lambda, 2)}; μ = ${fmt(m.mu, 2)} ${data.labels.rateUnit}; s = ${m.servers}`}
      badge="M/M/5"
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
            why: 'En un sistema M/M/s, la probabilidad de esperar no es la utilización (como en M/M/1) sino la fórmula de Erlang C: un cliente solo espera si los s canales están ocupados simultáneamente.',
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
