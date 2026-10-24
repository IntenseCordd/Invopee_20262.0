/**
 * PerfectInformation.tsx — VECIP y valor esperado de la información perfecta.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { fmt, fmtM } from '../utils/format';

export function PerfectInformation() {
  const { data, results } = useProblem();
  const pi = results.perfectInformation;
  const priors = data.states.map((s) => s.probability);

  return (
    <Card
      title="Valor de la información perfecta"
      subtitle="¿Cuánto vale conocer con certeza el estado futuro antes de decidir?"
      badge="VEIP"
    >
      <div className="grid-3">
        <div className="stat">
          <div className="stat__label">VECIP · con información perfecta</div>
          <div className="stat__value">{fmtM(pi.vecip, 0)}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Mejor VE sin información</div>
          <div className="stat__value">{fmtM(pi.baselineBest, 0)}</div>
        </div>
        <div className="stat stat--good">
          <div className="stat__label">VEIP · valor de la información</div>
          <div className="stat__value">{fmtM(pi.veip, 0)}</div>
          <div className="stat__hint">Máximo a pagar por información</div>
        </div>
      </div>

      <div
        className="mt-16"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}
      >
        {pi.bestPerState.map((b) => {
          const state = data.states.find((s) => s.id === b.stateId)!;
          return (
            <span key={b.stateId} className="pill pill--info">
              Si ocurre {state.name} → elegir {b.altId} ({fmt(b.value, 0)}M)
            </span>
          );
        })}
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'Establece un techo económico: por más bueno que sea un estudio de mercado, nunca conviene pagar más que el VEIP por reducir la incertidumbre.',
            how: (
              <Formula>
                <FLine>
                  VECIP = Σ P(Sj) × mejor pago en Sj
                </FLine>
                <FLine>
                  ={' '}
                  {pi.bestPerState
                    .map((b, j) => `${priors[j].toFixed(2)}×${fmt(b.value, 0)}`)
                    .join(' + ')}{' '}
                  = <FResult>{fmt(pi.vecip, 0)} M</FResult>
                </FLine>
                <FLine>
                  VEIP = VECIP − mejor VE = {fmt(pi.vecip, 0)} −{' '}
                  {fmt(pi.baselineBest, 0)} ={' '}
                  <FResult>{fmt(pi.veip, 0)} M</FResult>
                </FLine>
              </Formula>
            ),
            meaning: `Conocer perfectamente el futuro aportaría hasta ${fmtM(
              pi.veip,
              0
            )}. Ese es el límite máximo que Innowise debería pagar por cualquier estudio o información experta.`,
          }}
        />
      </div>
    </Card>
  );
}
