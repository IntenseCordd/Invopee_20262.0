/**
 * PertGantt.tsx — Diagrama de Gantt (sección 8): el proyecto como calendario.
 * Cada actividad es una barra horizontal que empieza en su inicio temprano y
 * mide su duración esperada. La ruta crítica va resaltada; las actividades con
 * holgura muestran su margen disponible. Marca el lanzamiento y el fin.
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { fmt } from '../../utils/format';
import { addBusinessDays, formatShortDate } from '../../calculations/pert';

const CRIT = '#c47a1b'; // ruta crítica
const SLACK = '#5b6b86'; // actividad con holgura
const MARGIN_FILL = '#f0d79a'; // margen disponible
const LAUNCH = '#c0392b'; // lanzamiento
const END = '#3f51b5'; // fin del proyecto

const ROW_H = 30;
const LABEL_W = 230;
const PAD = { top: 44, right: 120, bottom: 36, left: 12 };

export function PertGantt() {
  const { data, results } = usePert();
  const { duration, durationToLaunch } = results;

  const rows = data.activities.map((a) => ({
    id: a.id,
    name: a.name,
    res: results.byActivity[a.id],
  }));

  const chartW = 640;
  const width = LABEL_W + chartW + PAD.right;
  const height = PAD.top + rows.length * ROW_H + PAD.bottom;

  const x0 = LABEL_W;
  const sx = (day: number) => x0 + (day / duration) * chartW;

  // Marcas de tiempo cada ~7 días hábiles (una semana laboral + margen).
  const tickStep = 7;
  const ticks: number[] = [];
  for (let d = 0; d <= duration; d += tickStep) ticks.push(d);
  if (ticks[ticks.length - 1] !== Math.round(duration)) ticks.push(duration);

  const launchDate = addBusinessDays(data.meta.startDateISO, durationToLaunch);
  const endDate = addBusinessDays(data.meta.startDateISO, duration);

  return (
    <Card
      title="Diagrama de Gantt"
      subtitle={`Inicio: ${data.meta.startDate} · tiempos en días hábiles`}
      badge="Sección 8"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        De izquierda a derecha avanza el tiempo en días hábiles desde el inicio.
        Cada barra empieza en el inicio temprano de la actividad y mide su
        duración esperada. Las barras de la ruta crítica van resaltadas.
      </p>

      <div className="chart-wrap" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} role="img" style={{ maxWidth: 'none' }}>
          {/* Rejilla vertical + eje de días */}
          {ticks.map((t, i) => (
            <g key={`t${i}`}>
              <line x1={sx(t)} y1={PAD.top - 8} x2={sx(t)} y2={PAD.top + rows.length * ROW_H} stroke="#eceef2" />
              <text x={sx(t)} y={PAD.top - 14} textAnchor="middle" fontSize="10" fill="#8a94a3">{fmt(t, 0)}</text>
            </g>
          ))}
          <text x={x0} y={14} fontSize="11" fontWeight={650} fill="#5b6472">Día hábil →</text>

          {/* Marcador de lanzamiento (fin de despliegue) */}
          <line x1={sx(durationToLaunch)} y1={PAD.top - 8} x2={sx(durationToLaunch)} y2={PAD.top + rows.length * ROW_H} stroke={LAUNCH} strokeDasharray="5 4" strokeWidth={1.3} />
          <text x={sx(durationToLaunch)} y={PAD.top + rows.length * ROW_H + 14} textAnchor="middle" fontSize="10" fontWeight={650} fill={LAUNCH}>Lanzamiento</text>
          <text x={sx(durationToLaunch)} y={PAD.top + rows.length * ROW_H + 26} textAnchor="middle" fontSize="9.5" fill={LAUNCH}>{formatShortDate(launchDate)}</text>

          {/* Marcador de fin del proyecto */}
          <line x1={sx(duration)} y1={PAD.top - 8} x2={sx(duration)} y2={PAD.top + rows.length * ROW_H} stroke={END} strokeDasharray="5 4" strokeWidth={1.3} />
          <text x={sx(duration)} y={PAD.top + rows.length * ROW_H + 14} textAnchor="middle" fontSize="10" fontWeight={650} fill={END}>Fin del proyecto</text>
          <text x={sx(duration)} y={PAD.top + rows.length * ROW_H + 26} textAnchor="middle" fontSize="9.5" fill={END}>{formatShortDate(endDate)}</text>

          {/* Filas */}
          {rows.map((r, i) => {
            const y = PAD.top + i * ROW_H;
            const barY = y + 5;
            const barH = ROW_H - 12;
            const xs = sx(r.res.es);
            const xe = sx(r.res.ef);
            const xl = sx(r.res.lf);
            const color = r.res.critical ? CRIT : SLACK;
            return (
              <g key={r.id}>
                <text x={8} y={y + ROW_H / 2 + 4} fontSize="11" fill="#1d2430">
                  <tspan fontWeight={700}>{r.id}</tspan> {r.name.length > 34 ? r.name.slice(0, 33) + '…' : r.name}
                </text>
                {/* margen disponible (holgura) */}
                {r.res.slack > 1e-6 && (
                  <rect x={xe} y={barY} width={Math.max(0, xl - xe)} height={barH} rx={3} fill={MARGIN_FILL} />
                )}
                {/* barra de la actividad */}
                <rect x={xs} y={barY} width={Math.max(2, xe - xs)} height={barH} rx={3} fill={color} />
                <text x={xe + 5} y={y + ROW_H / 2 + 4} fontSize="9.5" fill="#5b6472">{fmt(r.res.expected, 2)} d</text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="legend" style={{ marginTop: 8 }}>
        <span><i style={{ background: CRIT }} />Ruta crítica (sin margen)</span>
        <span><i style={{ background: SLACK }} />Actividad con holgura</span>
        <span><i style={{ background: MARGIN_FILL }} />Margen disponible</span>
      </div>
    </Card>
  );
}
