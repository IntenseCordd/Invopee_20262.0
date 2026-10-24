/**
 * DecisionMethods.tsx — criterios de decisión: Maximin, Maximax, Minimax Regret
 * y Pérdida Esperada Mínima (PEM). Reúne los criterios sin y con probabilidades.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { fmt } from '../utils/format';

export function DecisionMethods() {
  const { data, results } = useProblem();
  const { maximin, maximax, regret, expectedRegret } = results;
  const priors = data.states.map((s) => s.probability);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      {/* Maximin y Maximax */}
      <Card
        title="Maximin y Maximax"
        subtitle="Criterios sin probabilidades: el pesimista y el optimista."
        badge="Criterios clásicos"
      >
        <div className="grid-2">
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>
              Maximin · pesimista
            </h4>
            {data.alternatives.map((a, i) => (
              <div key={a.id} className="muted" style={{ fontSize: 13 }}>
                Peor caso de {a.id} → {fmt(maximin.perAlternative[i].value, 0)}
              </div>
            ))}
            <div className="pill pill--good" style={{ marginTop: 8 }}>
              Decisión: {maximin.chosenId} ({fmt(maximin.chosenValue, 0)}M)
            </div>
          </div>
          <div>
            <h4 style={{ fontSize: 14, marginBottom: 8 }}>
              Maximax · optimista
            </h4>
            {data.alternatives.map((a, i) => (
              <div key={a.id} className="muted" style={{ fontSize: 13 }}>
                Mejor caso de {a.id} → {fmt(maximax.perAlternative[i].value, 0)}
              </div>
            ))}
            <div className="pill pill--a1" style={{ marginTop: 8 }}>
              Decisión: {maximax.chosenId} ({fmt(maximax.chosenValue, 0)}M)
            </div>
          </div>
        </div>

        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'Cuando no se confía en las probabilidades, estos criterios muestran los extremos: protegerse del peor escenario (Maximin) o apostar por el mejor (Maximax).',
              how: (
                <Formula>
                  <FLine>Maximin = max_i ( min_j Pago ) = {fmt(maximin.chosenValue, 0)} → {maximin.chosenId}</FLine>
                  <FLine>Maximax = max_i ( max_j Pago ) = {fmt(maximax.chosenValue, 0)} → {maximax.chosenId}</FLine>
                </Formula>
              ),
              meaning: `Maximin es una estrategia conservadora (garantiza un piso). Maximax es agresiva (busca el máximo absoluto). Aquí recomiendan alternativas distintas: ${maximin.chosenId} vs ${maximax.chosenId}.`,
            }}
          />
        </div>
      </Card>

      {/* Matriz de arrepentimiento + Minimax Regret */}
      <Card
        title="Matriz de arrepentimiento (Minimax Regret)"
        subtitle="Costo de oportunidad de equivocarse en la predicción."
        badge="Arrepentimiento"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th></th>
              {data.states.map((s) => (
                <th key={s.id}>{s.id}</th>
              ))}
              <th>Máx.</th>
            </tr>
          </thead>
          <tbody>
            {data.alternatives.map((a, i) => (
              <tr key={a.id}>
                <td>{a.id}</td>
                {regret.matrix[i].map((r, j) => (
                  <td key={j}>{fmt(r, 0)}</td>
                ))}
                <td>
                  <strong>{fmt(regret.maxRegretByAlt[i].value, 0)}</strong>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="pill pill--good mt-16">
          Minimax Regret: {regret.minimaxId} (máximo arrepentimiento{' '}
          {fmt(regret.minimaxValue, 0)}M)
        </div>

        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'Modela la frustración de haber elegido mal. Se elige la alternativa cuyo peor arrepentimiento posible sea el menor.',
              how: (
                <Formula>
                  <FLine>Arrepentimiento = (mejor pago de la columna) − pago</FLine>
                  {data.states.map((s, j) => {
                    const colMax = Math.max(
                      ...data.alternatives.map((_a, i) => data.payoffs[i][j].value)
                    );
                    return (
                      <FLine key={s.id}>
                        {s.id}: mejor = {fmt(colMax, 0)} →{' '}
                        {data.alternatives
                          .map(
                            (a, i) =>
                              `${a.id}: ${fmt(colMax, 0)}−${fmt(
                                data.payoffs[i][j].value,
                                0
                              )}=${fmt(regret.matrix[i][j], 0)}`
                          )
                          .join('  ')}
                      </FLine>
                    );
                  })}
                  <FLine>
                    min de máximos ={' '}
                    <FResult>{fmt(regret.minimaxValue, 0)} → {regret.minimaxId}</FResult>
                  </FLine>
                </Formula>
              ),
              meaning: `Elegir ${regret.minimaxId} limita el peor arrepentimiento a ${fmt(
                regret.minimaxValue,
                0
              )}M, frente a valores mayores de las otras alternativas.`,
            }}
          />
        </div>
      </Card>

      {/* PEM */}
      <Card
        title="Pérdida Esperada Mínima (PEM)"
        subtitle="Arrepentimiento ponderado por las probabilidades."
        badge="Con probabilidades"
      >
        <div className="grid-2">
          {data.alternatives.map((a, i) => {
            const isBest = expectedRegret.chosenId === a.id;
            return (
              <div key={a.id} className={`stat ${isBest ? 'stat--good' : ''}`}>
                <div className="stat__label">PEM({a.id})</div>
                <div className="stat__value">
                  {fmt(expectedRegret.perAlternative[i].value, 0)} M
                </div>
                {isBest && <div className="stat__hint">mínima pérdida</div>}
              </div>
            );
          })}
        </div>

        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'Combina el arrepentimiento con la probabilidad de cada estado. Selecciona la alternativa con menor pérdida de oportunidad esperada.',
              how: (
                <Formula>
                  {data.alternatives.map((a, i) => (
                    <FLine key={a.id}>
                      PEM({a.id}) ={' '}
                      {data.states
                        .map(
                          (_s, j) =>
                            `${priors[j].toFixed(2)}×${fmt(
                              regret.matrix[i][j],
                              0
                            )}`
                        )
                        .join(' + ')}{' '}
                      ={' '}
                      <FResult>
                        {fmt(expectedRegret.perAlternative[i].value, 0)} M
                      </FResult>
                    </FLine>
                  ))}
                </Formula>
              ),
              meaning: `Se elige el menor valor: ${expectedRegret.chosenId} con ${fmt(
                expectedRegret.chosenValue,
                0
              )}M. Coincide con el VEIP (${fmt(
                results.perfectInformation.veip,
                0
              )}M): la pérdida de oportunidad esperada es exactamente lo que evitaría la información perfecta.`,
            }}
          />
        </div>
      </Card>
    </div>
  );
}
