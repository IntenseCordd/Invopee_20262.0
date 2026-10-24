/**
 * ProbabilityView.tsx — probabilidades a priori con control y barra segmentada.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { SplitBar } from './charts/SplitBar';

export function ProbabilityView() {
  const { data, setPrimaryProbability } = useProblem();
  const p1 = data.states[0].probability;
  const p2 = data.states[1].probability;
  const sum = p1 + p2;

  return (
    <Card
      title="Probabilidades a priori"
      subtitle="¿Qué tan probable es cada estado de la naturaleza?"
      badge="Incertidumbre"
    >
      <SplitBar
        segments={[
          { label: data.states[0].name, value: p1, color: 'var(--s1)' },
          { label: data.states[1].name, value: p2, color: 'var(--s2)' },
        ]}
      />

      <div className="grid-2 mt-16">
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
          <div className="stat__label">P(S2) = 1 − P(S1)</div>
          <div className="stat__value">{(p2 * 100).toFixed(0)}%</div>
          <div className="stat__hint">
            Verificación: P(S1) + P(S2) = {sum.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'No sabemos con certeza qué escenario ocurrirá. Las probabilidades a priori resumen nuestra mejor estimación de cada estado antes de obtener información adicional.',
            how: (
              <Formula>
                <FLine>Se asigna P(S1) y el resto es su complemento:</FLine>
                <FLine>
                  P(S2) = 1 − P(S1) = 1 − {p1.toFixed(2)} ={' '}
                  <FResult>{p2.toFixed(2)}</FResult>
                </FLine>
                <FLine>P(S1) + P(S2) = {sum.toFixed(2)}</FLine>
              </Formula>
            ),
            meaning:
              'Un 40% para el Boom significa que, de cada 10 escenarios plausibles, esperaríamos que 4 fueran de crecimiento acelerado y 6 de estancamiento.',
          }}
        />
      </div>
    </Card>
  );
}
