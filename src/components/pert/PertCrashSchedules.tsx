/**
 * PertCrashSchedules.tsx — Programas factibles y curva tiempo-costo (secc. 10).
 *
 * Aplica el método de aceleración paso a paso: en cada tramo se acorta el
 * conjunto de actividades críticas más barato y se recalcula la ruta crítica.
 * Cada fila de la tabla es un "programa factible": una forma posible de
 * ejecutar el proyecto, con su duración y su costo. La curva dibuja todos esos
 * programas: terminar antes siempre cuesta más, y los últimos días son los más
 * caros.
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { fmt, fmtInt } from '../../utils/format';

const NORMAL = '#2e7d53'; // programa sin acelerar
const CRASHED = '#c0392b'; // programa más rápido
const CURVE = '#c47a1b';
const GRID = '#eceef2';

const PAD = { top: 22, right: 26, bottom: 46, left: 74 };
const PLOT_W = 560;
const PLOT_H = 240;

/**
 * niceScale — elige un paso "redondo" (1, 2, 2.5 o 5 por potencia de diez) y
 * devuelve los límites y las marcas del eje, para que las etiquetas no salgan
 * con cifras arbitrarias.
 */
function niceScale(min: number, max: number, target: number) {
  const span = max - min || Math.abs(max) || 1;
  const raw = span / target;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 2.5 ? 2.5 : norm <= 5 ? 5 : 10) * mag;
  const lo = Math.floor(min / step) * step;
  const hi = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = lo; v <= hi + step / 2; v += step) ticks.push(Math.round(v * 1e6) / 1e6);
  return { lo, hi, ticks };
}

export function PertCrashSchedules() {
  const { crashed } = usePert();
  if (!crashed || crashed.schedules.length < 2) return null;

  const { schedules, normalDuration, normalTotalCost, duration, totalCost } =
    crashed;

  const daysSaved = normalDuration - duration;
  const extraCost = totalCost - normalTotalCost;

  /* --- Escalas de la curva --- */
  const width = PAD.left + PLOT_W + PAD.right;
  const height = PAD.top + PLOT_H + PAD.bottom;

  const xs = schedules.map((s) => s.duration);
  const ys = schedules.map((s) => s.totalCost);
  // Un poco de aire para que los puntos extremos no toquen los bordes.
  const xSpan = Math.max(...xs) - Math.min(...xs) || 1;
  const ySpan = Math.max(...ys) - Math.min(...ys) || 1;
  const xScale = niceScale(Math.min(...xs) - xSpan * 0.06, Math.max(...xs) + xSpan * 0.06, 5);
  const yScale = niceScale(Math.min(...ys) - ySpan * 0.12, Math.max(...ys) + ySpan * 0.12, 4);
  const { lo: x0, hi: x1, ticks: xTickVals } = xScale;
  const { lo: y0, hi: y1, ticks: yTickVals } = yScale;

  const sx = (d: number) => PAD.left + ((d - x0) / (x1 - x0)) * PLOT_W;
  const sy = (c: number) => PAD.top + PLOT_H - ((c - y0) / (y1 - y0)) * PLOT_H;

  // La curva se recorre del programa más lento al más rápido.
  const linePath = schedules
    .map((s, i) => `${i === 0 ? 'M' : 'L'} ${sx(s.duration)} ${sy(s.totalCost)}`)
    .join(' ');

  const last = schedules[schedules.length - 1];

  return (
    <Card
      title="Programas factibles y curva tiempo-costo"
      subtitle={`${schedules.length} formas posibles de ejecutar el proyecto, de la más barata a la más rápida`}
      badge="Sección 10"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        El método se aplica por tramos: se mira la ruta crítica, se elige la
        actividad (o el par de actividades) más barata de acortar y se recorta
        solo hasta donde sigue adelantando la entrega; después se vuelve a
        calcular la ruta crítica, porque al acortar una cadena otra puede quedar
        igual de larga y pasar a ser crítica también [9]. Cada fila es un{' '}
        <strong>programa factible</strong>.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Programa</th>
            <th>Días del proyecto</th>
            <th>Costo total (USD)</th>
            <th>Actividad acelerada</th>
            <th>Días ganados</th>
            <th>Costo por día (USD)</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map((s) => {
            const isFirst = s.n === 0;
            const isLast = s.n === last.n;
            return (
              <tr
                key={s.n}
                className={isFirst || isLast ? 'pert-row--critical' : undefined}
              >
                <td><strong>{s.n}</strong></td>
                <td>{fmt(s.duration, 2)}</td>
                <td>{fmtInt(s.totalCost)}</td>
                <td>
                  {s.activities.length ? (
                    <strong>{s.activities.join(' y ')}</strong>
                  ) : (
                    <span className="muted">Ninguna</span>
                  )}
                </td>
                <td>{s.gained > 0 ? fmt(s.gained, 2) : <span className="muted">—</span>}</td>
                <td>
                  {s.costPerDay == null ? (
                    <span className="muted">—</span>
                  ) : (
                    fmt(s.costPerDay, 1)
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="grid-3 mt-16">
        <div className="stat stat--good">
          <div className="stat__label">Sin acelerar (programa 0)</div>
          <div className="stat__value">{fmt(normalDuration, 2)} días</div>
          <div className="stat__hint">USD {fmtInt(normalTotalCost)}</div>
        </div>
        <div className="stat stat--accent">
          <div className="stat__label">Lo más rápido (programa {last.n})</div>
          <div className="stat__value">{fmt(duration, 2)} días</div>
          <div className="stat__hint">USD {fmtInt(totalCost)}</div>
        </div>
        <div className="stat">
          <div className="stat__label">Lo que cuesta la prisa</div>
          <div className="stat__value">+ USD {fmtInt(extraCost)}</div>
          <div className="stat__hint">
            por {fmt(daysSaved, 2)} días menos · USD{' '}
            {fmt(extraCost / daysSaved, 0)} por día en promedio
          </div>
        </div>
      </div>

      <div className="chart-wrap mt-16">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ minWidth: 520 }}
          role="img"
          aria-label={`Curva de tiempo contra costo: de ${fmt(normalDuration, 2)} días y USD ${fmtInt(normalTotalCost)} a ${fmt(duration, 2)} días y USD ${fmtInt(totalCost)}`}
        >
          {/* Rejilla y eje de costo */}
          {yTickVals.map((v) => (
            <g key={`y${v}`}>
              <line x1={PAD.left} y1={sy(v)} x2={PAD.left + PLOT_W} y2={sy(v)} stroke={GRID} />
              <text x={PAD.left - 8} y={sy(v) + 4} textAnchor="end" fontSize="10" fill="#8a94a3">
                {fmtInt(v)}
              </text>
            </g>
          ))}
          {/* Rejilla y eje de días */}
          {xTickVals.map((v) => (
            <g key={`x${v}`}>
              <line x1={sx(v)} y1={PAD.top} x2={sx(v)} y2={PAD.top + PLOT_H} stroke={GRID} />
              <text x={sx(v)} y={PAD.top + PLOT_H + 16} textAnchor="middle" fontSize="10" fill="#8a94a3">
                {fmt(v, 0)}
              </text>
            </g>
          ))}

          <text
            x={PAD.left + PLOT_W / 2}
            y={height - 10}
            textAnchor="middle"
            fontSize="11"
            fontWeight={650}
            fill="#5b6472"
          >
            Duración del proyecto (días hábiles) →
          </text>
          <text
            x={14}
            y={PAD.top + PLOT_H / 2}
            textAnchor="middle"
            fontSize="11"
            fontWeight={650}
            fill="#5b6472"
            transform={`rotate(-90 14 ${PAD.top + PLOT_H / 2})`}
          >
            Costo total (USD) →
          </text>

          {/* Curva */}
          <path d={linePath} fill="none" stroke={CURVE} strokeWidth={2} strokeLinejoin="round" />

          {/* Puntos: cada uno es un programa factible */}
          {schedules.map((s) => {
            const isFirst = s.n === 0;
            const isLast = s.n === last.n;
            const color = isFirst ? NORMAL : isLast ? CRASHED : CURVE;
            return (
              <g key={s.n}>
                <circle
                  cx={sx(s.duration)}
                  cy={sy(s.totalCost)}
                  r={isFirst || isLast ? 5.5 : 3.5}
                  fill={color}
                  stroke="#fff"
                  strokeWidth={1.2}
                />
                <title>
                  {`Programa ${s.n}: ${fmt(s.duration, 2)} días · USD ${fmtInt(s.totalCost)}`}
                </title>
              </g>
            );
          })}

          {/* Etiquetas de los dos extremos */}
          <text
            x={sx(normalDuration) - 8}
            y={sy(normalTotalCost) + 16}
            textAnchor="end"
            fontSize="10.5"
            fontWeight={650}
            fill={NORMAL}
          >
            Sin acelerar: {fmt(normalDuration, 2)} d · {fmtInt(normalTotalCost)}
          </text>
          <text
            x={sx(duration) + 8}
            y={sy(totalCost) - 10}
            textAnchor="start"
            fontSize="10.5"
            fontWeight={650}
            fill={CRASHED}
          >
            Lo más rápido: {fmt(duration, 2)} d · {fmtInt(totalCost)}
          </text>
        </svg>
      </div>

      <div className="legend" style={{ marginTop: 8 }}>
        <span><i style={{ background: NORMAL }} />Costo mínimo (nada acelerado)</span>
        <span><i style={{ background: CURVE }} />Programas intermedios</span>
        <span><i style={{ background: CRASHED }} />Tiempo mínimo (todo lo acelerable)</span>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'La curva responde a la pregunta del cliente: "¿cuánto me cuesta tenerlo para tal fecha?". Cada punto es un trato posible entre tiempo y dinero, así que basta buscar la fecha deseada en el eje horizontal y leer el costo. También muestra de un vistazo hasta dónde se puede acelerar: más allá del punto rojo no hay nada que comprar.',
            how: (
              <div style={{ textAlign: 'left', lineHeight: 1.7 }}>
                <p style={{ marginTop: 0 }}>
                  Cada tramo de la tabla se calcula así, partiendo del proyecto
                  sin acelerar:
                </p>
                <ol style={{ paddingLeft: 20, margin: 0 }}>
                  <li>Se halla la ruta crítica con las duraciones actuales.</li>
                  <li>
                    Entre las actividades críticas que aún no llegaron a su Tc,
                    se busca el grupo más barato que corte <em>todas</em> las
                    rutas críticas. Si hay dos ramas críticas en paralelo hay que
                    acortar una de cada una, y el costo del tramo es la suma de
                    sus S.
                  </li>
                  <li>
                    Se acorta ese grupo, pero solo hasta donde el proyecto
                    realmente se adelanta: si otra rama se vuelve crítica antes,
                    el tramo se corta ahí.
                  </li>
                  <li>Se repite hasta que ya no se gane ni un día más.</li>
                </ol>
                <p style={{ marginBottom: 0 }}>
                  El costo del programa es el costo normal (USD{' '}
                  {fmtInt(normalTotalCost)}) más, en cada tramo, los días ganados
                  por el costo por día del tramo.
                </p>
              </div>
            ),
            meaning: (
              <div style={{ textAlign: 'left', lineHeight: 1.7 }}>
                <p style={{ marginTop: 0 }}>
                  La curva <strong>baja hacia la derecha</strong>: terminar antes
                  cuesta más. Y se vuelve <strong>más empinada hacia la
                  izquierda</strong>, porque los primeros días son baratos y los
                  últimos caros: el primer tramo cuesta USD{' '}
                  {fmt(schedules[1].costPerDay as number, 0)} por día y el último{' '}
                  USD {fmt(last.costPerDay as number, 0)}.
                </p>
                <p style={{ marginBottom: 0 }}>
                  Pasar de {fmt(normalDuration, 2)} a {fmt(duration, 2)} días
                  cuesta USD {fmtInt(extraCost)} más, cerca de un{' '}
                  {fmt((extraCost / normalTotalCost) * 100, 0)}% sobre el
                  presupuesto. Regla práctica: conviene acelerar mientras ganar un
                  día valga para el cliente más que lo que cuesta ese día.
                </p>
              </div>
            ),
          }}
        />
      </div>
    </Card>
  );
}
