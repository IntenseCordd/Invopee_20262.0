/**
 * ProblemOverview.tsx — pregunta principal, alternativas, estados y horas.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { fmtInt } from '../utils/format';
import type { CSSProperties } from 'react';

export function ProblemOverview() {
  const { data, results } = useProblem();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <div className="question-block">
        <div className="kicker">
          {data.meta.company} · Problema de decisión bajo incertidumbre
        </div>
        <h1>{data.meta.question}</h1>
      </div>

      <Card title="Contexto" badge="El problema">
        <p className="muted" style={{ margin: 0 }}>
          {data.meta.context}
        </p>
      </Card>

      <div className="grid-2">
        <Card title="Alternativas de decisión" subtitle="¿Qué puede hacer Innowise?">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.alternatives.map((a, i) => (
              <div
                key={a.id}
                className="option-card"
                style={{ '--accent': i === 0 ? 'var(--a1)' : 'var(--a2)' } as CSSProperties}
              >
                <div className="tag">
                  {a.id} · {a.shortName}
                </div>
                <h4>{a.name}</h4>
                <p>{a.description}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Estados de la naturaleza" subtitle="¿Qué escenarios pueden ocurrir?">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {data.states.map((s, i) => (
              <div
                key={s.id}
                className="option-card"
                style={{ '--accent': i === 0 ? 'var(--s1)' : 'var(--s2)' } as CSSProperties}
              >
                <div className="tag">
                  {s.id} · {(s.probability * 100).toFixed(0)}%
                </div>
                <h4>{s.name}</h4>
                <p>{s.description}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card
        title="Capacidad: horas facturables"
        subtitle="La base de todos los ingresos"
        badge="Datos"
      >
        <div className="grid-3">
          <div className="stat">
            <div className="stat__label">Ingenieros</div>
            <div className="stat__value">{fmtInt(data.engineers)}</div>
          </div>
          <div className="stat">
            <div className="stat__label">Horas por ingeniero / año</div>
            <div className="stat__value">{fmtInt(data.hoursPerEngineer)}</div>
          </div>
          <div className="stat stat--accent">
            <div className="stat__label">Horas facturables totales</div>
            <div className="stat__value">{fmtInt(results.totalHours)}</div>
          </div>
        </div>

        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'Las horas facturables son la capacidad productiva de la empresa. Todos los ingresos de la matriz de pagos se derivan de estas horas.',
              how: (
                <Formula>
                  <FLine>Horas = Ingenieros × Horas por ingeniero</FLine>
                  <FLine>
                    Horas = {fmtInt(data.engineers)} × {fmtInt(data.hoursPerEngineer)}
                  </FLine>
                  <FLine>
                    = <FResult>{fmtInt(results.totalHours)} horas</FResult>
                  </FLine>
                </Formula>
              ),
              meaning:
                'Es el total de horas que Innowise puede facturar en el año. Si cambian los ingenieros o las horas, cambia toda la capacidad y, con ella, los ingresos.',
            }}
          />
        </div>
      </Card>
    </div>
  );
}
