/**
 * QueuingOverview.tsx — sistema M/M/1, datos de entrada y cálculo de λ y μ.
 */
import { useQueuing } from '../../state/QueuingContext';
import { Card } from '../common/Card';
import { NumberField } from '../common/NumberField';
import { HintButtons } from '../common/HintButtons';
import { Formula, FLine, FResult } from '../common/Formula';
import { fmt, fmtPct } from '../../utils/format';
import { MINUTES_PER_DAY } from '../../types/queuingTypes';

export function QueuingOverview() {
  const { data, results, setLambda, setServiceTimeMinutes } = useQueuing();
  const { base } = results;
  const { metrics, serviceTimeDays } = base;

  return (
    <Card
      title="El sistema y sus parámetros"
      subtitle={data.meta.title}
      badge="M/M/1"
    >
      <p className="muted" style={{ marginTop: 0 }}>
        {data.meta.context}
      </p>

      <div className="note" style={{ marginBottom: 16 }}>
        <strong>Fuente:</strong> {data.meta.source}.{' '}
        <a href={data.meta.sourceUrl} target="_blank" rel="noreferrer">
          Reporte
        </a>{' '}
        · {data.meta.consulted}
      </div>

      <div
        className="mt-16"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
      >
        <span className="pill pill--info">Cliente: {data.labels.customer}</span>
        <span className="pill pill--info">Servidor: {data.labels.server}</span>
        <span className="pill pill--assumption">Llegadas Poisson (1ª M)</span>
        <span className="pill pill--assumption">
          Servicio exponencial (2ª M)
        </span>
        <span className="pill pill--assumption">Población y cola infinitas · FIFO</span>
      </div>

      <hr className="divider" />

      <h4 style={{ fontSize: 14, marginBottom: 10 }}>Datos de entrada</h4>
      <div className="grid-3">
        <NumberField
          label="λ · tasa de llegada"
          unit={data.labels.rateUnit}
          value={data.lambda}
          min={0}
          step={0.01}
          onChange={setLambda}
        />
        <NumberField
          label="Tiempo medio de servicio"
          unit="min/run"
          value={data.serviceTimeMinutes}
          min={0.0001}
          step={0.1}
          onChange={setServiceTimeMinutes}
        />
        <div className="stat stat--accent" style={{ alignSelf: 'end' }}>
          <div className="stat__label">μ · tasa de servicio</div>
          <div className="stat__value">
            {fmt(metrics.mu, 2)} {data.labels.rateUnit}
          </div>
        </div>
      </div>

      <div className="grid-3 mt-16">
        <div className="stat">
          <div className="stat__label">ρ · utilización (λ/μ)</div>
          <div className="stat__value">{fmtPct(metrics.rho, 2)}</div>
          <div className="stat__hint">Fracción de tiempo con el runner ocupado</div>
        </div>
        <div className="stat">
          <div className="stat__label">Duración en días</div>
          <div className="stat__value">{fmt(serviceTimeDays, 7)}</div>
          <div className="stat__hint">
            {fmt(data.serviceTimeMinutes, 4)} min ÷ {MINUTES_PER_DAY}
          </div>
        </div>
        <div className={`stat ${metrics.stable ? 'stat--good' : ''}`}>
          <div className="stat__label">Estabilidad (λ &lt; μ)</div>
          <div className="stat__value">
            {metrics.stable ? 'Sistema estable' : 'Inestable'}
          </div>
          <div className="stat__hint">
            {fmt(metrics.lambda, 2)} {metrics.stable ? '<' : '≥'}{' '}
            {fmt(metrics.mu, 2)}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'El modelo M/M/1 describe un sistema con un único servidor, llegadas aleatorias (Poisson) y tiempos de servicio exponenciales. Es la base para estimar esperas y uso del recurso cuando solo se conoce el promedio.',
            how: (
              <Formula>
                <FLine>μ = 1 ÷ (tiempo de servicio en días)</FLine>
                <FLine>
                  tiempo (días) = {fmt(data.serviceTimeMinutes, 4)} ÷{' '}
                  {MINUTES_PER_DAY} = {fmt(serviceTimeDays, 7)}
                </FLine>
                <FLine>
                  μ = 1 ÷ {fmt(serviceTimeDays, 7)} ={' '}
                  <FResult>
                    {fmt(metrics.mu, 2)} {data.labels.rateUnit}
                  </FResult>
                </FLine>
              </Formula>
            ),
            meaning: metrics.stable
              ? 'Como λ < μ, el servidor atiende más rápido de lo que llegan los clientes: el sistema alcanza un estado estacionario y las fórmulas son válidas.'
              : 'Si λ ≥ μ la cola crece sin límite y el sistema no tiene estado estacionario.',
          }}
        />
      </div>
    </Card>
  );
}
