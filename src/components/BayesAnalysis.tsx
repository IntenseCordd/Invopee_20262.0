/**
 * BayesAnalysis.tsx — confiabilidad del estudio y revisión bayesiana paso a paso.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { likelihoodMatrix } from '../calculations/bayes';
import { fmt, fmtPct } from '../utils/format';

export function BayesAnalysis() {
  const { data, results } = useProblem();
  const bayes = results.bayes;
  const like = likelihoodMatrix(data);
  const priors = data.states.map((s) => s.probability);
  const { sensitivity, specificity } = data.marketStudy;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Card
        title="¿Qué tan confiable es el estudio?"
        subtitle="Verosimilitudes del estudio de mercado (información muestral)."
        badge="Supuesto de diseño"
      >
        <div className="note" style={{ marginBottom: 16 }}>
          <strong>Importante:</strong> la sensibilidad y la especificidad son
          <em> supuestos de diseño</em> de un "estudio bueno pero imperfecto", no
          datos reales medidos por Innowise.
        </div>
        <div className="grid-2">
          <div className="stat">
            <div className="stat__label">Sensibilidad · P(I1|S1)</div>
            <div className="stat__value">{fmtPct(sensitivity, 0)}</div>
            <div className="stat__hint">
              Acierta el Boom cuando ocurre. Falso negativo:{' '}
              {fmtPct(1 - sensitivity, 0)}
            </div>
          </div>
          <div className="stat">
            <div className="stat__label">Especificidad · P(I2|S2)</div>
            <div className="stat__value">{fmtPct(specificity, 0)}</div>
            <div className="stat__hint">
              Acierta el Estancamiento. Falsa alarma:{' '}
              {fmtPct(1 - specificity, 0)}
            </div>
          </div>
        </div>
      </Card>

      <Card
        title="Bayes paso a paso"
        subtitle="Probabilidades marginales y posteriores según el dictamen del estudio."
        badge="Teorema de Bayes"
      >
        {/* Marginales */}
        <h4 style={{ fontSize: 14, marginBottom: 8 }}>
          1 · Probabilidades marginales P(Ik)
        </h4>
        <Formula>
          {bayes.marginals.map((m, k) => (
            <FLine key={k}>
              P({signalTag(k)}) ={' '}
              {data.states
                .map(
                  (_s, j) => `${fmt(like[k][j], 2)}×${priors[j].toFixed(2)}`
                )
                .join(' + ')}{' '}
              = <FResult>{fmt(m.p, 2)}</FResult>
            </FLine>
          ))}
          <FLine>
            Verificación: {bayes.marginals.map((m) => fmt(m.p, 2)).join(' + ')} ={' '}
            {fmt(
              bayes.marginals.reduce((a, m) => a + m.p, 0),
              2
            )}
          </FLine>
        </Formula>

        {/* Posteriores */}
        <h4 style={{ fontSize: 14, margin: '18px 0 8px' }}>
          2 · Probabilidades posteriores P(Sj|Ik)
        </h4>
        <table className="data-table">
          <thead>
            <tr>
              <th>Dictamen</th>
              {data.states.map((s) => (
                <th key={s.id}>P({s.id}|·)</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bayes.posteriors.map((post, k) => (
              <tr key={k}>
                <td>{signalTag(k)}</td>
                {post.byState.map((b) => (
                  <td key={b.stateId}>{fmtPct(b.p, 2)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Árbol de Bayes */}
        <div className="mt-16">
          <BayesTree
            states={data.states.map((s) => s.shortName)}
            marginals={bayes.marginals.map((m) => m.p)}
            posteriors={bayes.posteriors.map((p) => p.byState.map((b) => b.p))}
          />
        </div>

        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'El estudio no es infalible. Bayes combina la creencia previa (priori) con el dictamen del estudio para obtener una probabilidad revisada (posterior) más precisa.',
              how: (
                <Formula>
                  <FLine>P(Ik) = Σ_j P(Ik|Sj)·P(Sj)</FLine>
                  <FLine>P(Sj|Ik) = P(Ik|Sj)·P(Sj) / P(Ik)</FLine>
                  <FLine>
                    Ej. P(S1|I1) = {fmt(like[0][0], 2)}×{priors[0].toFixed(2)} /{' '}
                    {fmt(bayes.marginals[0].p, 2)} ={' '}
                    <FResult>
                      {fmtPct(bayes.posteriors[0].byState[0].p, 2)}
                    </FResult>
                  </FLine>
                </Formula>
              ),
              meaning:
                'Un dictamen favorable eleva la probabilidad de Boom del 40% a más del 84%. Un dictamen desfavorable la reduce a cerca del 13%. El estudio "afina" nuestra creencia.',
            }}
          />
        </div>
      </Card>
    </div>
  );
}

function signalTag(k: number): string {
  return k === 0 ? 'I1' : 'I2';
}

/** Árbol de Bayes en SVG: raíz -> dictámenes -> estados con posteriores. */
function BayesTree({
  states,
  marginals,
  posteriors,
}: {
  states: string[];
  marginals: number[];
  posteriors: number[][];
}) {
  const width = 560;
  const rowH = 46;
  const height = marginals.length * states.length * rowH + 30;
  const xRoot = 30;
  const xSig = 180;
  const xLeaf = 380;
  const colors = ['var(--s1)', 'var(--s2)'];

  let leaf = 0;
  const sigNodes = marginals.map((m, k) => {
    const leaves = posteriors[k].map((p, j) => {
      const y = 24 + leaf * rowH;
      leaf++;
      return { y, p, state: states[j], color: colors[j % 2] };
    });
    const yNode = (leaves[0].y + leaves[leaves.length - 1].y) / 2;
    return { yNode, marginal: m, leaves, label: k === 0 ? 'I1 favorable' : 'I2 desfav.' };
  });
  const yRoot = (sigNodes[0].yNode + sigNodes[sigNodes.length - 1].yNode) / 2;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" className="tree-svg">
        <circle cx={xRoot} cy={yRoot} r={7} fill="#1d2430" />
        {sigNodes.map((sig, k) => (
          <g key={k}>
            <line x1={xRoot + 7} y1={yRoot} x2={xSig - 8} y2={sig.yNode} stroke="var(--primary)" strokeWidth={1.6} />
            <text x={(xRoot + xSig) / 2} y={(yRoot + sig.yNode) / 2 - 5} textAnchor="middle" fontSize="11" fontWeight={600} fill="var(--primary)">
              {sig.label} · {(sig.marginal * 100).toFixed(0)}%
            </text>
            <circle cx={xSig} cy={sig.yNode} r={6} fill="#fff" stroke="var(--primary)" strokeWidth={2} />
            {sig.leaves.map((lf, j) => (
              <g key={j}>
                <line x1={xSig + 6} y1={sig.yNode} x2={xLeaf - 4} y2={lf.y} stroke={lf.color} strokeWidth={1.3} />
                <text x={(xSig + xLeaf) / 2} y={(sig.yNode + lf.y) / 2 - 4} textAnchor="middle" fontSize="10.5" fill={lf.color}>
                  {lf.state} · {(lf.p * 100).toFixed(1)}%
                </text>
                <rect x={xLeaf} y={lf.y - 13} width={150} height={26} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
                <text x={xLeaf + 75} y={lf.y + 4} textAnchor="middle" fontSize="12" fill="#1d2430">
                  P({lf.state}) = {(lf.p * 100).toFixed(2)}%
                </text>
              </g>
            ))}
          </g>
        ))}
      </svg>
    </div>
  );
}
