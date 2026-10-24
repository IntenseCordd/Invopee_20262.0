/**
 * ExpectedValue.tsx — valor esperado por alternativa, con derivación y gráfica.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { BarChart } from './charts/BarChart';
import { fmt, fmtM } from '../utils/format';

export function ExpectedValue() {
  const { data, results } = useProblem();
  const { byAlternative, best } = results.expectedValue;
  const priors = data.states.map((s) => s.probability);

  return (
    <Card
      title="Valor esperado monetario (VEM)"
      subtitle="Ingreso promedio esperado de cada alternativa, ponderado por las probabilidades."
      badge="Decisión bajo riesgo"
    >
      <div className="grid-2">
        {data.alternatives.map((alt, i) => {
          const ve = byAlternative[i].value;
          const isBest = byAlternative[i].id === best.id;
          return (
            <div
              key={alt.id}
              className={`stat ${isBest ? 'stat--good' : ''}`}
            >
              <div className="stat__label">
                VE({alt.id}) · {alt.shortName}
              </div>
              <div className="stat__value">{fmtM(ve, 2)}</div>
              <div className="stat__hint">
                {data.states
                  .map((_s, j) => `${priors[j].toFixed(2)}×${fmt(data.payoffs[i][j].value, 0)}`)
                  .join(' + ')}
                {isBest && ' · óptima'}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16">
        <BarChart
          bars={data.alternatives.map((alt, i) => ({
            label: `${alt.id} · ${alt.shortName}`,
            value: byAlternative[i].value,
            color:
              byAlternative[i].id === best.id
                ? 'var(--a2)'
                : 'var(--border-strong)',
            sublabel: byAlternative[i].id === best.id ? 'óptima' : undefined,
          }))}
          valueFormat={(v) => fmt(v, 1)}
        />
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'Existen varios escenarios posibles y cada uno tiene una probabilidad diferente. El valor esperado combina todos en un único número comparable por alternativa.',
            how: (
              <Formula>
                {data.alternatives.map((alt, i) => (
                  <FLine key={alt.id}>
                    VE({alt.id}) ={' '}
                    {data.states
                      .map(
                        (_s, j) =>
                          `${priors[j].toFixed(2)}×${fmt(
                            data.payoffs[i][j].value,
                            0
                          )}`
                      )
                      .join(' + ')}{' '}
                    = <FResult>{fmt(byAlternative[i].value, 2)} M</FResult>
                  </FLine>
                ))}
              </Formula>
            ),
            meaning: `Es el ingreso promedio esperado de cada alternativa considerando los escenarios y sus probabilidades. Con los datos actuales, la mejor es ${best.id} con ${fmtM(
              best.value,
              2
            )}.`,
          }}
        />
      </div>
    </Card>
  );
}
