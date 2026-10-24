/**
 * QueuingImprovement.tsx — propuesta de mejora (μ aumenta) y comparación
 * antes vs. después de las características operativas del sistema.
 */
import { useQueuing } from '../../state/QueuingContext';
import { Card } from '../common/Card';
import { NumberField } from '../common/NumberField';
import { HintButtons } from '../common/HintButtons';
import { fmt, fmtPct } from '../../utils/format';
import {
  convertTimeToDisplay,
  normalizeTimeUnit,
} from '../../types/queuingTypes';

export function QueuingImprovement() {
  const { data, results, setImprovementFactor } = useQueuing();
  const { base, improved } = results;
  const b = base.metrics;
  const i = improved.metrics;
  const timeUnit = normalizeTimeUnit(data.labels.timeUnit);

  const comparison: { label: string; before: string; after: string; note: string }[] = [
    { label: 'P₀', before: fmt(b.p0, 4), after: fmt(i.p0, 4), note: 'Más tiempo con el sistema vacío.' },
    { label: 'Lq', before: fmt(b.lq, 5), after: fmt(i.lq, 5), note: 'La fila, ya mínima, se reduce más.' },
    { label: 'L', before: fmt(b.l, 4), after: fmt(i.l, 4), note: 'Menos clientes en el sistema.' },
    {
      label: `Wq (${timeUnit})`,
      before: fmt(convertTimeToDisplay(b.wq, timeUnit), timeUnit === 'minutos' ? 3 : 7),
      after: fmt(convertTimeToDisplay(i.wq, timeUnit), timeUnit === 'minutos' ? 3 : 7),
      note: 'Menor espera antes de ser atendido.',
    },
    {
      label: `W (${timeUnit})`,
      before: fmt(convertTimeToDisplay(b.w, timeUnit), timeUnit === 'minutos' ? 3 : 6),
      after: fmt(convertTimeToDisplay(i.w, timeUnit), timeUnit === 'minutos' ? 3 : 6),
      note: 'Menor tiempo total en el sistema.',
    },
    { label: 'Pw', before: fmt(b.pw, 4), after: fmt(i.pw, 4), note: 'Menor probabilidad de esperar.' },
  ];

  return (
    <Card
      title="Propuesta de mejora y comparación"
      subtitle="Optimizar el servicio para que cada atención dure menos (λ no cambia; solo cambia μ)"
      badge="Mejora"
    >
      <div className="grid-3">
        <NumberField
          label="Factor de mejora del servicio"
          unit="× duración"
          value={data.improvementFactor}
          min={0.05}
          max={1}
          step={0.05}
          onChange={setImprovementFactor}
        />
        <div className="stat">
          <div className="stat__label">Nueva duración</div>
          <div className="stat__value">
            {fmt(improved.serviceTimeMinutes, 4)} min
          </div>
          <div className="stat__hint">
            {fmt(improved.serviceTimeDays, 7)} días
          </div>
        </div>
        <div className={`stat ${i.stable ? 'stat--good' : ''}`}>
          <div className="stat__label">μ′ · nueva tasa de servicio</div>
          <div className="stat__value">
            {fmt(i.mu, 2)} {data.labels.rateUnit}
          </div>
          <div className="stat__hint">
            {i.stable ? 'Sistema estable' : 'Inestable'} ·{' '}
            {fmt(i.lambda, 2)} {i.stable ? '<' : '≥'} {fmt(i.mu, 2)}
          </div>
        </div>
      </div>

      <hr className="divider" />

      <h4 style={{ fontSize: 14, marginBottom: 10 }}>
        Comparación antes vs. después
      </h4>
      <table className="data-table">
        <thead>
          <tr>
            <th>Característica</th>
            <th>Antes (μ = {fmt(b.mu, 2)})</th>
            <th>Después (μ′ = {fmt(i.mu, 2)})</th>
            <th>Qué significa el cambio</th>
          </tr>
        </thead>
        <tbody>
          {comparison.map((r) => (
            <tr key={r.label}>
              <td>
                <strong>{r.label}</strong>
              </td>
              <td>{r.before}</td>
              <td>
                <strong>{r.after}</strong>
              </td>
              <td style={{ textAlign: 'left' }}>{r.note}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-3 mt-16">
        <div className="stat stat--good">
          <div className="stat__label">W: tiempo total por cliente</div>
          <div className="stat__value">
            {fmt(convertTimeToDisplay(b.w, timeUnit), timeUnit === 'minutos' ? 2 : 6)} →{' '}
            {fmt(convertTimeToDisplay(i.w, timeUnit), timeUnit === 'minutos' ? 2 : 6)}{' '}
            {timeUnit === 'minutos' ? 'min' : 'días'}
          </div>
          <div className="stat__hint">Se reduce de forma clara</div>
        </div>
        <div className="stat">
          <div className="stat__label">Utilización (Pw)</div>
          <div className="stat__value">
            {fmtPct(b.pw, 2)} → {fmtPct(i.pw, 2)}
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Prob. sistema vacío (P₀)</div>
          <div className="stat__value">
            {fmtPct(b.p0, 2)} → {fmtPct(i.p0, 2)}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'Reducir el tiempo de servicio aumenta μ sin cambiar λ. Es la palanca típica para mejorar un sistema que no puede frenar las llegadas.',
            meaning:
              'Si el sistema ya está poco cargado, la espera casi no cambia (ya era mínima); lo que mejora claramente es W, el tiempo total de cada cliente.',
          }}
        />
      </div>
    </Card>
  );
}
