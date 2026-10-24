/**
 * DecisionTree.tsx — árbol de decisión interactivo en SVG.
 * Nodo de decisión (cuadrado) -> alternativas -> nodos de azar (círculo) ->
 * hojas con pago y probabilidad. Muestra el VE en cada rama.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { fmt } from '../utils/format';

export function DecisionTree() {
  const { data, results } = useProblem();
  const { byAlternative, best } = results.expectedValue;

  const nAlt = data.alternatives.length;
  const nState = data.states.length;
  const leafGap = 58;
  const groupGap = 26;
  const totalLeaves = nAlt * nState;
  const height = totalLeaves * leafGap + (nAlt - 1) * groupGap + 60;
  const width = 660;

  const xRoot = 40;
  const xAlt = 250;
  const xChance = 250;
  const xLeaf = 540;

  // Posición vertical de cada hoja y de cada nodo de alternativa
  const altColors = ['var(--a1)', 'var(--a2)'];
  const stateColors = ['var(--s1)', 'var(--s2)'];

  let leafIndex = 0;
  const altNodes = data.alternatives.map((alt, i) => {
    const leaves = data.states.map((st, j) => {
      const y = 40 + leafIndex * leafGap + i * groupGap;
      leafIndex++;
      return {
        y,
        state: st,
        payoff: data.payoffs[i][j].value,
        prob: st.probability,
      };
    });
    const yNode = (leaves[0].y + leaves[leaves.length - 1].y) / 2;
    return { alt, leaves, yNode, ve: byAlternative[i].value, color: altColors[i % 2] };
  });

  const yRoot = (altNodes[0].yNode + altNodes[altNodes.length - 1].yNode) / 2;

  return (
    <Card
      title="Árbol de decisión"
      subtitle="Decisión → alternativa → azar (estados) → resultado. El VE se calcula en cada rama."
      badge="Estructura"
    >
      <div className="chart-wrap">
        <svg
          className="tree-svg"
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
        >
          {/* Nodo raíz de decisión */}
          <rect x={xRoot - 10} y={yRoot - 10} width={20} height={20} rx={3} fill="#1d2430" />
          <text x={xRoot} y={yRoot - 16} textAnchor="middle" fontSize="11" fontWeight={600} fill="#1d2430">
            Decisión
          </text>

          {altNodes.map((node, i) => {
            const isBest = byAlternative[i].id === best.id;
            return (
              <g key={node.alt.id}>
                {/* rama raíz -> alternativa */}
                <path
                  d={`M ${xRoot + 10} ${yRoot} C ${(xRoot + xAlt) / 2} ${yRoot}, ${(xRoot + xAlt) / 2} ${node.yNode}, ${xChance - 12} ${node.yNode}`}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={isBest ? 2.6 : 1.6}
                />
                <text
                  x={(xRoot + xAlt) / 2}
                  y={(yRoot + node.yNode) / 2 - 6}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={600}
                  fill={node.color}
                >
                  {node.alt.id} · {node.alt.shortName}
                </text>

                {/* nodo de azar */}
                <circle cx={xChance} cy={node.yNode} r={9} fill="#fff" stroke={node.color} strokeWidth={2} />
                {/* VE en el nodo */}
                <text
                  x={xChance}
                  y={node.yNode - 16}
                  textAnchor="middle"
                  fontSize="11.5"
                  fontWeight={700}
                  fill={isBest ? 'var(--a2)' : '#5b6472'}
                >
                  VE = {fmt(node.ve, 1)}M
                </text>

                {/* ramas azar -> hojas */}
                {node.leaves.map((leaf, j) => (
                  <g key={j}>
                    <path
                      d={`M ${xChance + 12} ${node.yNode} C ${(xChance + xLeaf) / 2} ${node.yNode}, ${(xChance + xLeaf) / 2} ${leaf.y}, ${xLeaf - 4} ${leaf.y}`}
                      fill="none"
                      stroke={stateColors[j % 2]}
                      strokeWidth={1.4}
                    />
                    <text
                      x={(xChance + xLeaf) / 2}
                      y={(node.yNode + leaf.y) / 2 - 5}
                      textAnchor="middle"
                      fontSize="10.5"
                      fill={stateColors[j % 2]}
                    >
                      {leaf.state.shortName} · {(leaf.prob * 100).toFixed(0)}%
                    </text>
                    {/* hoja */}
                    <rect
                      x={xLeaf}
                      y={leaf.y - 14}
                      width={96}
                      height={28}
                      rx={6}
                      fill="var(--surface-2)"
                      stroke="var(--border)"
                    />
                    <text x={xLeaf + 48} y={leaf.y + 5} textAnchor="middle" fontSize="12.5" fontWeight={650} fill="#1d2430">
                      {fmt(leaf.payoff, 0)}M USD
                    </text>
                  </g>
                ))}
              </g>
            );
          })}
        </svg>
      </div>

      <p className="muted" style={{ fontSize: 12.5 }}>
        La rama resaltada corresponde a la alternativa con mayor valor esperado:{' '}
        <strong>{best.id}</strong> ({fmt(best.value, 1)}M).
      </p>

      <div className="mt-8">
        <HintButtons
          hints={{
            why: 'El árbol separa lo que Innowise controla (la decisión) de lo que no controla (el estado de la naturaleza), y muestra en cada rama el resultado y su probabilidad.',
            how: 'En cada nodo de azar se calcula VE = Σ P(estado) × pago. Se elige la rama de decisión con mayor VE (regla de valor esperado).',
            meaning:
              'Es la representación visual del problema: primero decides una alternativa, luego el azar determina el estado, y obtienes un ingreso. El VE resume cada rama en un número.',
          }}
        />
      </div>
    </Card>
  );
}
