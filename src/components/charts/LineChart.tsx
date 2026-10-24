/**
 * LineChart.tsx — gráfica de líneas en SVG (sin dependencias externas).
 * Dibuja una o varias series y opcionalmente marca puntos destacados.
 */
import { useId } from 'react';

export interface Series {
  id: string;
  label: string;
  color: string;
  points: { x: number; y: number }[];
}

export interface Marker {
  x: number;
  y: number;
  label?: string;
  color?: string;
}

interface LineChartProps {
  series: Series[];
  markers?: Marker[];
  width?: number;
  height?: number;
  xLabel?: string;
  yLabel?: string;
  xDomain?: [number, number];
  yDomain?: [number, number];
  xTickFormat?: (v: number) => string;
  yTickFormat?: (v: number) => string;
}

export function LineChart({
  series,
  markers = [],
  width = 640,
  height = 320,
  xLabel,
  yLabel,
  xDomain,
  yDomain,
  xTickFormat = (v) => String(v),
  yTickFormat = (v) => String(v),
}: LineChartProps) {
  const id = useId();
  const pad = { l: 54, r: 18, t: 16, b: 40 };
  const iw = width - pad.l - pad.r;
  const ih = height - pad.t - pad.b;

  const allX = series.flatMap((s) => s.points.map((p) => p.x));
  const allY = series.flatMap((s) => s.points.map((p) => p.y));
  const [x0, x1] = xDomain ?? [Math.min(...allX), Math.max(...allX)];
  const yMinRaw = yDomain ? yDomain[0] : Math.min(...allY);
  const yMaxRaw = yDomain ? yDomain[1] : Math.max(...allY);
  const yPad = (yMaxRaw - yMinRaw) * 0.08 || 1;
  const y0 = yDomain ? yMinRaw : yMinRaw - yPad;
  const y1 = yDomain ? yMaxRaw : yMaxRaw + yPad;

  const sx = (x: number) => pad.l + ((x - x0) / (x1 - x0 || 1)) * iw;
  const sy = (y: number) => pad.t + ih - ((y - y0) / (y1 - y0 || 1)) * ih;

  const xTicks = ticks(x0, x1, 5);
  const yTicks = ticks(y0, y1, 5);

  return (
    <div className="chart-wrap">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width="100%"
        role="img"
        aria-labelledby={`${id}-title`}
      >
        <title id={`${id}-title`}>{xLabel && yLabel ? `${yLabel} vs ${xLabel}` : 'Gráfica'}</title>

        {/* grid + ejes Y */}
        {yTicks.map((t, i) => (
          <g key={`y${i}`}>
            <line
              x1={pad.l}
              x2={pad.l + iw}
              y1={sy(t)}
              y2={sy(t)}
              stroke="#eceef2"
            />
            <text
              x={pad.l - 8}
              y={sy(t) + 4}
              textAnchor="end"
              fontSize="11"
              fill="#8a94a3"
            >
              {yTickFormat(t)}
            </text>
          </g>
        ))}

        {/* eje X */}
        {xTicks.map((t, i) => (
          <g key={`x${i}`}>
            <line
              x1={sx(t)}
              x2={sx(t)}
              y1={pad.t}
              y2={pad.t + ih}
              stroke="#f2f4f7"
            />
            <text
              x={sx(t)}
              y={pad.t + ih + 18}
              textAnchor="middle"
              fontSize="11"
              fill="#8a94a3"
            >
              {xTickFormat(t)}
            </text>
          </g>
        ))}

        {/* series */}
        {series.map((s) => (
          <polyline
            key={s.id}
            fill="none"
            stroke={s.color}
            strokeWidth={2.4}
            points={s.points.map((p) => `${sx(p.x)},${sy(p.y)}`).join(' ')}
          />
        ))}

        {/* marcadores */}
        {markers.map((m, i) => (
          <g key={`m${i}`}>
            <line
              x1={sx(m.x)}
              x2={sx(m.x)}
              y1={pad.t}
              y2={pad.t + ih}
              stroke={m.color ?? '#1d2430'}
              strokeDasharray="4 4"
              strokeWidth={1}
            />
            <circle cx={sx(m.x)} cy={sy(m.y)} r={5} fill={m.color ?? '#1d2430'} />
            {m.label && (
              <text
                x={sx(m.x)}
                y={pad.t - 4}
                textAnchor="middle"
                fontSize="11"
                fontWeight={600}
                fill={m.color ?? '#1d2430'}
              >
                {m.label}
              </text>
            )}
          </g>
        ))}

        {xLabel && (
          <text
            x={pad.l + iw / 2}
            y={height - 4}
            textAnchor="middle"
            fontSize="12"
            fill="#5b6472"
          >
            {xLabel}
          </text>
        )}
        {yLabel && (
          <text
            x={14}
            y={pad.t + ih / 2}
            textAnchor="middle"
            fontSize="12"
            fill="#5b6472"
            transform={`rotate(-90 14 ${pad.t + ih / 2})`}
          >
            {yLabel}
          </text>
        )}
      </svg>

      <div className="legend">
        {series.map((s) => (
          <span key={s.id}>
            <i style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Genera `count` marcas equiespaciadas entre min y max. */
function ticks(min: number, max: number, count: number): number[] {
  if (min === max) return [min];
  const step = (max - min) / (count - 1);
  return Array.from({ length: count }, (_, i) => min + i * step);
}
