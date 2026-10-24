/**
 * RobustnessAnalysis.tsx — cómo cambia la mejor decisión al variar P(S1).
 */
import { useMemo } from 'react';
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { LineChart, type Series, type Marker } from './charts/LineChart';
import { calculateRobustness } from '../calculations/robustness';
import { fmt, fmtPct } from '../utils/format';

export function RobustnessAnalysis() {
  const { data, results } = useProblem();
  const { lines, p } = results.indifference;
  const colors = ['var(--a1)', 'var(--a2)'];

  // Curva continua para la gráfica (0 a 1 en pasos de 0.02)
  const fineSeries: Series[] = lines.map((ln, i) => ({
    id: ln.id,
    label: `VE(${ln.id})`,
    color: colors[i % 2],
    points: Array.from({ length: 51 }, (_, k) => {
      const x = k / 50;
      return { x, y: ln.slope * x + ln.intercept };
    }),
  }));

  const markers: Marker[] =
    p != null && p >= 0 && p <= 1
      ? [
          {
            x: p,
            y: lines[0].slope * p + lines[0].intercept,
            label: `indiferencia ${fmtPct(p, 0)}`,
            color: '#1d2430',
          },
        ]
      : [];

  // Puntos evaluados de la tabla de robustez (del documento).
  const rows = results.robustness;

  // Evaluación en el valor actual de P(S1), para señalarlo en la tabla.
  const currentRows = useMemo(
    () => calculateRobustness(data, [data.states[0].probability]),
    [data]
  );

  return (
    <Card
      title="Análisis de robustez"
      subtitle="La decisión no depende del valor exacto de P(S1)."
      badge="Sensibilidad"
    >
      <LineChart
        series={fineSeries}
        markers={markers}
        xLabel="P(S1)"
        yLabel="Valor esperado (M USD)"
        xDomain={[0, 1]}
        xTickFormat={(v) => `${(v * 100).toFixed(0)}%`}
        yTickFormat={(v) => fmt(v, 0)}
      />

      <table className="data-table mt-16">
        <thead>
          <tr>
            <th>P(S1)</th>
            {data.alternatives.map((a) => (
              <th key={a.id}>VE({a.id})</th>
            ))}
            <th>Mejor</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, k) => (
            <tr key={k}>
              <td>{fmtPct(r.p, 0)}</td>
              {r.values.map((v) => (
                <td key={v.id}>{fmt(v.value, 2)}</td>
              ))}
              <td>
                <strong>{r.bestId}</strong>
              </td>
            </tr>
          ))}
          <tr style={{ background: 'var(--primary-soft)' }}>
            <td>
              <strong>{fmtPct(data.states[0].probability, 0)} (actual)</strong>
            </td>
            {currentRows[0].values.map((v) => (
              <td key={v.id}>
                <strong>{fmt(v.value, 2)}</strong>
              </td>
            ))}
            <td>
              <strong>{currentRows[0].bestId}</strong>
            </td>
          </tr>
        </tbody>
      </table>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'Nuestra estimación de P(S1) es incierta. La robustez comprueba si la decisión recomendada se mantiene aunque la probabilidad cambie dentro de un rango razonable.',
            how: 'Se recalcula VE(A1) y VE(A2) para varios valores de P(S1) y se observa cuál alternativa gana en cada caso. El cambio de ganador ocurre en el punto de indiferencia.',
            meaning:
              p != null
                ? `Mientras P(S1) se mantenga por debajo de ${fmtPct(
                    p,
                    0
                  )}, la decisión no cambia. Por eso la recomendación es robusta.`
                : 'Las alternativas no se cruzan: una domina siempre.',
          }}
        />
      </div>
    </Card>
  );
}
