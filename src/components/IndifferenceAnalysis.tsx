/**
 * IndifferenceAnalysis.tsx — punto de indiferencia y rectas VE(Ai) vs P(S1).
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { LineChart, type Series, type Marker } from './charts/LineChart';
import { fmt, fmtPct } from '../utils/format';

export function IndifferenceAnalysis() {
  const { data, results } = useProblem();
  const { lines, p, value } = results.indifference;
  const colors = ['var(--a1)', 'var(--a2)'];

  // Genera las rectas VE(Ai) = slope·p + intercept para p en [0,1]
  const series: Series[] = lines.map((ln, i) => ({
    id: ln.id,
    label: `VE(${ln.id})`,
    color: colors[i % 2],
    points: [0, 1].map((x) => ({ x, y: ln.slope * x + ln.intercept })),
  }));

  const markers: Marker[] =
    p != null && value != null && p >= 0 && p <= 1
      ? [{ x: p, y: value, label: `p = ${fmtPct(p, 0)}`, color: '#1d2430' }]
      : [];

  return (
    <Card
      title="Punto de indiferencia"
      subtitle="¿A partir de qué probabilidad de Boom conviene cambiar de alternativa?"
      badge="Análisis algebraico"
    >
      <LineChart
        series={series}
        markers={markers}
        xLabel="P(S1) — probabilidad de Boom de IA"
        yLabel="Valor esperado (M USD)"
        xDomain={[0, 1]}
        xTickFormat={(v) => `${(v * 100).toFixed(0)}%`}
        yTickFormat={(v) => fmt(v, 0)}
      />

      {p != null && value != null && (
        <div className="stat stat--accent mt-16">
          <div className="stat__label">Punto de indiferencia</div>
          <div className="stat__value">
            P(S1) = {fmtPct(p, 0)} → VE = {fmt(value, 2)} M
          </div>
          <div className="stat__hint">
            Por debajo de {fmtPct(p, 0)} domina una alternativa; por encima, la
            otra.
          </div>
        </div>
      )}

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'Sirve para saber qué tan sensible es la decisión a la probabilidad del Boom. Identifica el umbral exacto donde ambas alternativas rinden lo mismo.',
            how: (
              <Formula>
                {lines.map((ln) => (
                  <FLine key={ln.id}>
                    VE({ln.id}) = {fmt(ln.slope, 0)}p + {fmt(ln.intercept, 0)}
                  </FLine>
                ))}
                <FLine>Igualando: {igualdad(lines)}</FLine>
                {p != null && (
                  <FLine>
                    p = <FResult>{fmt(p, 2)}</FResult> ({fmtPct(p, 0)})
                  </FLine>
                )}
              </Formula>
            ),
            meaning:
              p != null
                ? `Si la probabilidad real de Boom fuera exactamente ${fmtPct(
                    p,
                    0
                  )}, daría igual qué alternativa elegir. Como la estimación actual (${fmtPct(
                    data.states[0].probability,
                    0
                  )}) está por debajo, conviene la alternativa más estable.`
                : 'Las rectas son paralelas: no hay punto de cruce.',
          }}
        />
      </div>
    </Card>
  );
}

/** Construye la ecuación "slopeA·p + interceptA = slopeB·p + interceptB". */
function igualdad(lines: { slope: number; intercept: number }[]): string {
  if (lines.length < 2) return '—';
  const [a, b] = lines;
  return `${fmt(a.slope, 0)}p + ${fmt(a.intercept, 0)} = ${fmt(
    b.slope,
    0
  )}p + ${fmt(b.intercept, 0)}`;
}
