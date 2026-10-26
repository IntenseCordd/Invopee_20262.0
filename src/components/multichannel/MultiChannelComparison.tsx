/**
 * MultiChannelComparison.tsx — comparación de los tres escenarios del informe:
 *   1) M/M/1 sin mejora (carga de 1 proyecto)
 *   2) M/M/1 con mejora (cada run dura menos)
 *   3) M/M/5 (carga de todos los proyectos)
 */
import { useMultiChannel } from '../../state/MultiChannelContext';
import { Card } from '../common/Card';
import { NumberField } from '../common/NumberField';
import { HintButtons } from '../common/HintButtons';
import { fmt, fmtPct } from '../../utils/format';
import {
  normalizeTimeUnit,
  convertTimeToDisplay,
  type MMsMetrics,
  type TimeDisplayUnit,
} from '../../types/multiChannelTypes';

/** Formatea un valor de tiempo (en días) a la unidad elegida. */
function timeText(valueInDays: number, unit: TimeDisplayUnit): string {
  if (!isFinite(valueInDays)) return '—';
  const v = convertTimeToDisplay(valueInDays, unit);
  return `${fmt(v, unit === 'minutos' ? 4 : 6)} ${unit === 'minutos' ? 'min' : 'días'}`;
}

interface Row {
  char: string;
  s1: string;
  s2: string;
  s3: string;
  meaning: string;
}

function buildRows(
  single: MMsMetrics,
  improved: MMsMetrics,
  multi: MMsMetrics,
  unit: TimeDisplayUnit,
  projects: number
): Row[] {
  const ratio = (m: MMsMetrics) => (isFinite(m.w) ? m.wq / (1 / m.mu) : NaN);
  const projLabel = `${projects} proyecto${projects === 1 ? '' : 's'}`;
  return [
    {
      char: 'λ (llegadas)',
      s1: `${fmt(single.lambda, 2)} (1 proyecto)`,
      s2: `${fmt(improved.lambda, 2)} (1 proyecto)`,
      s3: `${fmt(multi.lambda, 2)} (${projLabel})`,
      meaning:
        projects > 1
          ? `En el escenario 3 llegan ${projects}× más ejecuciones (la carga de todos los proyectos).`
          : 'Con n = 1, los tres escenarios reciben la misma carga; solo cambian el nº de canales y la velocidad.',
    },
    {
      char: 'μ por canal',
      s1: fmt(single.mu, 2),
      s2: `${fmt(improved.mu, 2)} (hipotético)`,
      s3: fmt(multi.mu, 2),
      meaning: 'Solo el escenario 2 cambia la velocidad del runner.',
    },
    {
      char: 's (canales)',
      s1: String(single.servers),
      s2: String(improved.servers),
      s3: String(multi.servers),
      meaning: 'Solo el escenario 3 agrega runners en paralelo.',
    },
    {
      char: 'Utilización por canal',
      s1: fmt(single.rho, 4),
      s2: fmt(improved.rho, 4),
      s3: fmt(multi.rho, 4),
      meaning: 'Fracción del tiempo que cada runner está ocupado.',
    },
    {
      char: 'P₀',
      s1: fmt(single.p0, 4),
      s2: fmt(improved.p0, 4),
      s3: fmt(multi.p0, 4),
      meaning: 'Fracción del tiempo con el sistema vacío.',
    },
    {
      char: 'Pw',
      s1: fmt(single.pw, 4),
      s2: fmt(improved.pw, 4),
      s3: fmt(multi.pw, 4),
      meaning: 'Probabilidad de que un run que llega tenga que esperar.',
    },
    {
      char: 'Lq',
      s1: fmt(single.lq, 5),
      s2: fmt(improved.lq, 5),
      s3: fmt(multi.lq, 4),
      meaning: 'Runs esperando en la fila, en promedio.',
    },
    {
      char: 'L',
      s1: fmt(single.l, 4),
      s2: fmt(improved.l, 4),
      s3: fmt(multi.l, 4),
      meaning: 'Runs en el sistema (fila + ejecución), en promedio.',
    },
    {
      char: 'Wq',
      s1: timeText(single.wq, unit),
      s2: timeText(improved.wq, unit),
      s3: timeText(multi.wq, unit),
      meaning: 'Espera promedio antes de empezar.',
    },
    {
      char: 'W',
      s1: timeText(single.w, unit),
      s2: timeText(improved.w, unit),
      s3: timeText(multi.w, unit),
      meaning: 'Tiempo total desde que llega hasta que termina.',
    },
    {
      char: 'Wq ÷ duración del run',
      s1: fmt(ratio(single), 4),
      s2: fmt(ratio(improved), 4),
      s3: fmt(ratio(multi), 4),
      meaning: 'Cuánto espera un run en relación con lo que dura.',
    },
  ];
}

export function MultiChannelComparison() {
  const { data, results, setImprovementFactor, setTimeUnit } = useMultiChannel();
  const { single, singleImproved, multi } = results.scenarios;
  const unit = normalizeTimeUnit(data.labels.timeUnit);
  const n = data.projects;
  const rows = buildRows(single, singleImproved, multi, unit, n);

  return (
    <Card
      title="Comparación de los tres escenarios"
      subtitle="Un runner (M/M/1), un runner mejorado y cinco runners (M/M/5)"
      badge="Parte 5"
    >
      <div className="note" style={{ marginBottom: 16 }}>
        {n > 1 ? (
          <>
            En los escenarios 1 y 2 la carga es la de un solo proyecto (λ ={' '}
            {fmt(single.lambda, 2)}); en el escenario 3 es la de los {n}{' '}
            proyectos (λ = {fmt(multi.lambda, 2)}). Por eso los Lq y L absolutos
            no son comparables entre el 3 y los otros dos: lo comparable es la
            utilización y la espera medida contra la duración del run.
          </>
        ) : (
          <>
            Con n = 1, los tres escenarios reciben la misma carga (λ ={' '}
            {fmt(multi.lambda, 2)}): la diferencia está solo en el número de
            canales (1 vs. 5) y, en el escenario 2, en la velocidad del runner.
            Sube n para ver cómo los 5 canales absorben la carga de varios
            proyectos.
          </>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          flexWrap: 'wrap',
          gap: 12,
          marginBottom: 12,
        }}
      >
        <div style={{ maxWidth: 260 }}>
          <NumberField
            label="Factor de mejora (escenario 2)"
            unit="× duración"
            value={data.improvementFactor}
            min={0.05}
            max={1}
            step={0.05}
            onChange={setImprovementFactor}
          />
        </div>
        <div className="mode-switch" aria-label="Unidad de tiempo">
          {(['días', 'minutos'] as const).map((u) => (
            <button
              key={u}
              type="button"
              className={unit === u ? 'active' : ''}
              onClick={() => setTimeUnit(u)}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Característica</th>
            <th>1 · M/M/1 sin mejora</th>
            <th>2 · M/M/1 con mejora</th>
            <th>3 · M/M/5</th>
            <th>Qué significa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.char}>
              <td>
                <strong>{r.char}</strong>
              </td>
              <td>{r.s1}</td>
              <td>{r.s2}</td>
              <td>
                <strong>{r.s3}</strong>
              </td>
              <td style={{ textAlign: 'left' }}>{r.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-3 mt-16">
        <div className="stat stat--good">
          <div className="stat__label">Utilización M/M/5</div>
          <div className="stat__value">{fmtPct(multi.rho, 2)}</div>
          <div className="stat__hint">
            {fmt(multi.a, 2)} de {multi.servers} runners ocupados en promedio
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Prob. de esperar (Pw)</div>
          <div className="stat__value">{fmtPct(multi.pw, 2)}</div>
          <div className="stat__hint">Muy pocos runs hacen fila</div>
        </div>
        <div className="stat">
          <div className="stat__label">W: M/M/1 vs M/M/5</div>
          <div className="stat__value">
            {timeText(single.w, unit)} → {timeText(multi.w, unit)}
          </div>
          <div className="stat__hint">
            {n > 1 ? `Casi igual pese a ${n}× más carga` : 'Misma carga; cambia el nº de canales'}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why:
              'La comparación muestra el efecto del número de canales. Con la carga de todos los proyectos (n = ' +
              n +
              '), un solo runner tendría λ/μ = ' +
              fmt(multi.lambda / multi.mu, 2) +
              (multi.lambda / multi.mu >= 1
                ? ' > 1 y sería inestable: los 5 runners son los que absorben esa carga.'
                : ', estable; al subir n se ve cómo los 5 canales evitan la saturación que tendría un solo runner.'),
            meaning:
              n > 1
                ? `Al pasar de 1 a 5 canales, W casi no cambia aunque llegan ${n}× más ejecuciones: los canales múltiples son lo que permite escalar la carga de varios proyectos.`
                : 'Con n = 1 la carga es mínima y los tres escenarios se parecen. El valor de los 5 canales se aprecia al aumentar n, cuando un solo runner empezaría a saturarse.',
          }}
        />
      </div>
    </Card>
  );
}
