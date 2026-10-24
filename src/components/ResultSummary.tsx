/**
 * ResultSummary.tsx — conclusión: la decisión recomendada y por qué.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { fmt, fmtM } from '../utils/format';

export function ResultSummary() {
  const { data, results } = useProblem();
  const { expectedValue, maximin, maximax, regret, expectedRegret, perfectInformation, sampleInformation, gameTheory } =
    results;

  const best = expectedValue.best;
  const bestAlt = data.alternatives.find((a) => a.id === best.id)!;

  const rows: { criterio: string; recomienda: string; valor: string }[] = [
    { criterio: 'Valor esperado (VEM)', recomienda: best.id, valor: fmtM(best.value, 0) },
    { criterio: 'Maximin (pesimista)', recomienda: maximin.chosenId, valor: fmtM(maximin.chosenValue, 0) },
    { criterio: 'Maximax (optimista)', recomienda: maximax.chosenId, valor: fmtM(maximax.chosenValue, 0) },
    { criterio: 'Minimax Regret', recomienda: regret.minimaxId, valor: `${fmt(regret.minimaxValue, 0)}M arrep.` },
    { criterio: 'PEM (pérdida esperada)', recomienda: expectedRegret.chosenId, valor: fmtM(expectedRegret.chosenValue, 0) },
  ];

  return (
    <Card
      title="Resultado y recomendación"
      subtitle="Síntesis de todos los criterios de decisión."
      badge="Conclusión"
    >
      <div className="question-block" style={{ marginBottom: 18 }}>
        <div className="kicker">Decisión recomendada</div>
        <h1 style={{ fontSize: 22 }}>
          {bestAlt.id} · {bestAlt.name} — {fmtM(best.value, 0)}
        </h1>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>Criterio</th>
            <th>Recomienda</th>
            <th>Valor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k}>
              <td style={{ textAlign: 'left' }}>{r.criterio}</td>
              <td>
                <strong>{r.recomienda}</strong>
              </td>
              <td>{r.valor}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-3 mt-16">
        <div className="stat">
          <div className="stat__label">Info. perfecta (VEIP)</div>
          <div className="stat__value">{fmtM(perfectInformation.veip, 0)}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Info. muestral (IVEIM)</div>
          <div className="stat__value">{fmtM(sampleInformation.iveim, 1)}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Teoría de juegos</div>
          <div className="stat__value">
            {gameTheory.saddle
              ? `(${data.gameTheory.strategies[gameTheory.saddle.rowIndex].id}, ${
                  data.gameTheory.strategies[gameTheory.saddle.colIndex].id
                })`
              : 'mixta'}
          </div>
          <div className="stat__hint">
            {gameTheory.saddle ? `silla ${fmt(gameTheory.maximin.value, 2)}M` : 'sin silla pura'}
          </div>
        </div>
      </div>

      <p className="muted mt-16" style={{ fontSize: 13.5 }}>
        La mayoría de los criterios coinciden en <strong>{best.id}</strong>. Es
        la decisión más equilibrada: maximiza el ingreso esperado, garantiza un
        piso frente al peor escenario y minimiza el costo de oportunidad si el
        mercado no evoluciona como se predice.
      </p>
    </Card>
  );
}
