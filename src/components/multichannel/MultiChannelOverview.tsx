/**
 * MultiChannelOverview.tsx — sistema M/M/5: elementos, datos de entrada y
 * cálculo de λ total, μ, carga ofrecida (a), utilización (ρ) y estabilidad.
 */
import { useMultiChannel } from '../../state/MultiChannelContext';
import { Card } from '../common/Card';
import { NumberField } from '../common/NumberField';
import { HintButtons } from '../common/HintButtons';
import { Formula, FLine, FResult } from '../common/Formula';
import { fmt, fmtPct } from '../../utils/format';
import { MINUTES_PER_DAY } from '../../types/multiChannelTypes';

export function MultiChannelOverview() {
  const {
    data,
    results,
    setLambdaPerProject,
    setProjects,
    setServiceTimeMinutes,
    setServers,
  } = useMultiChannel();
  const { main, lambdaTotal, serviceTimeDays } = results;

  return (
    <Card
      title="El sistema y sus parámetros"
      subtitle={data.meta.title}
      badge="M/M/5"
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
        <span className="pill pill--info">Servidores: {data.labels.server}</span>
        <span className="pill pill--assumption">Llegadas Poisson (1ª M)</span>
        <span className="pill pill--assumption">
          Servicio exponencial (2ª M)
        </span>
        <span className="pill pill--assumption">
          s canales idénticos · 1 sola fila · FIFO
        </span>
      </div>

      <hr className="divider" />

      <h4 style={{ fontSize: 14, marginBottom: 10 }}>Datos de entrada</h4>
      <div className="grid-3">
        <NumberField
          label="λ por proyecto"
          unit={data.labels.rateUnit}
          value={data.lambdaPerProject}
          min={0}
          step={0.01}
          onChange={setLambdaPerProject}
        />
        <NumberField
          label="n · proyectos que comparten la fila"
          unit="proyectos"
          value={data.projects}
          min={1}
          step={1}
          onChange={setProjects}
        />
        <NumberField
          label="Tiempo medio de servicio"
          unit="min/run"
          value={data.serviceTimeMinutes}
          min={0.0001}
          step={0.1}
          onChange={setServiceTimeMinutes}
        />
        <NumberField
          label="s · canales (runners)"
          unit="runners"
          value={data.servers}
          min={1}
          step={1}
          onChange={setServers}
        />
        <div className="stat stat--accent" style={{ alignSelf: 'end' }}>
          <div className="stat__label">λ total = n · λ por proyecto</div>
          <div className="stat__value">
            {fmt(lambdaTotal, 2)} {data.labels.rateUnit}
          </div>
          <div className="stat__hint">
            {data.projects} × {fmt(data.lambdaPerProject, 2)}
          </div>
        </div>
        <div className="stat stat--accent" style={{ alignSelf: 'end' }}>
          <div className="stat__label">μ por canal</div>
          <div className="stat__value">
            {fmt(main.mu, 2)} {data.labels.rateUnit}
          </div>
          <div className="stat__hint">1 ÷ {fmt(serviceTimeDays, 7)} días</div>
        </div>
      </div>

      <div className="grid-3 mt-16">
        <div className="stat">
          <div className="stat__label">a · carga ofrecida (λ/μ)</div>
          <div className="stat__value">{fmt(main.a, 4)}</div>
          <div className="stat__hint">Canales ocupados en promedio</div>
        </div>
        <div className="stat">
          <div className="stat__label">ρ · utilización por canal</div>
          <div className="stat__value">{fmtPct(main.rho, 2)}</div>
          <div className="stat__hint">ρ = a/s = λ/(s·μ)</div>
        </div>
        <div className={`stat ${main.stable ? 'stat--good' : ''}`}>
          <div className="stat__label">Estabilidad (λ &lt; s·μ)</div>
          <div className="stat__value">
            {main.stable ? 'Sistema estable' : 'Inestable'}
          </div>
          <div className="stat__hint">
            {fmt(main.lambda, 2)} {main.stable ? '<' : '≥'}{' '}
            {fmt(data.servers * main.mu, 2)}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'El modelo M/M/s describe un sistema con s servidores idénticos en paralelo que comparten una sola fila, con llegadas Poisson y servicio exponencial. Con un solo canal la carga a = λ/μ = ' +
              fmt(main.a, 2) +
              ' sería > 1 y el sistema sería inestable; por eso hacen falta varios canales.',
            how: (
              <Formula>
                <FLine>
                  λ total = n · λ = {data.projects} × {fmt(data.lambdaPerProject, 2)} ={' '}
                  <FResult>{fmt(lambdaTotal, 2)}</FResult>
                </FLine>
                <FLine>
                  μ = 1 ÷ ({fmt(data.serviceTimeMinutes, 4)} ÷ {MINUTES_PER_DAY}) ={' '}
                  <FResult>{fmt(main.mu, 2)}</FResult>
                </FLine>
                <FLine>
                  a = λ/μ = {fmt(lambdaTotal, 2)} / {fmt(main.mu, 2)} ={' '}
                  <FResult>{fmt(main.a, 4)}</FResult>
                </FLine>
                <FLine>
                  ρ = a/s = {fmt(main.a, 4)} / {data.servers} ={' '}
                  <FResult>{fmt(main.rho, 4)}</FResult>
                </FLine>
              </Formula>
            ),
            meaning: main.stable
              ? 'Como λ < s·μ, los s canales atienden en conjunto más rápido de lo que llegan los clientes: el sistema alcanza estado estacionario y las fórmulas de Erlang son válidas.'
              : 'Si λ ≥ s·μ la cola crece sin límite y el sistema no tiene estado estacionario.',
          }}
        />
      </div>
    </Card>
  );
}
