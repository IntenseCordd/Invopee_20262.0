/**
 * BarChart.tsx — gráfica de barras verticales en SVG (comparaciones simples).
 */
export interface Bar {
  label: string;
  value: number;
  color: string;
  sublabel?: string;
}

interface BarChartProps {
  bars: Bar[];
  width?: number;
  height?: number;
  valueFormat?: (v: number) => string;
  baseline?: number;
}

export function BarChart({
  bars,
  width = 520,
  height = 260,
  valueFormat = (v) => v.toFixed(2),
  baseline = 0,
}: BarChartProps) {
  const pad = { l: 16, r: 16, t: 26, b: 46 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;
  const maxV = Math.max(...bars.map((b) => b.value), baseline, 0);
  const minV = Math.min(...bars.map((b) => b.value), baseline, 0);
  const range = maxV - minV || 1;

  const bw = (iw / bars.length) * 0.6;
  const gap = (iw / bars.length) * 0.4;
  const sy = (v: number) => pad.t + ih - ((v - minV) / range) * ih;

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" role="img">
        <line
          x1={pad.l}
          x2={pad.l + iw}
          y1={sy(baseline)}
          y2={sy(baseline)}
          stroke="#cbd2dc"
        />
        {bars.map((b, i) => {
          const x = pad.l + i * (bw + gap) + gap / 2;
          const yTop = sy(Math.max(b.value, baseline));
          const yBot = sy(Math.min(b.value, baseline));
          const h = Math.max(2, yBot - yTop);
          return (
            <g key={i}>
              <rect
                x={x}
                y={yTop}
                width={bw}
                height={h}
                rx={5}
                fill={b.color}
              />
              <text
                x={x + bw / 2}
                y={yTop - 7}
                textAnchor="middle"
                fontSize="13"
                fontWeight={650}
                fill="#1d2430"
              >
                {valueFormat(b.value)}
              </text>
              <text
                x={x + bw / 2}
                y={pad.t + ih + 18}
                textAnchor="middle"
                fontSize="12"
                fill="#5b6472"
              >
                {b.label}
              </text>
              {b.sublabel && (
                <text
                  x={x + bw / 2}
                  y={pad.t + ih + 34}
                  textAnchor="middle"
                  fontSize="11"
                  fill="#8a94a3"
                >
                  {b.sublabel}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
