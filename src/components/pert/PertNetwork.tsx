/**
 * PertNetwork.tsx — Grafo PERT (sección 7): dibujo de la red del proyecto.
 *
 * Cada actividad es un círculo dividido en cuatro: arriba izq. el inicio
 * temprano y arriba der. el fin temprano; en el centro la letra; abajo izq. el
 * inicio lejano y abajo der. el fin lejano. Bajo el círculo, la duración. La
 * ruta crítica va resaltada (naranja) y los nodos con holgura en gris.
 *
 * La red se dibuja en varias filas ("bandas") para que las 14 actividades
 * quepan sin desplazamiento horizontal; el salto de una banda a la siguiente se
 * traza con una flecha que rodea el gráfico.
 *
 * Dos escenarios: con los tiempos normales (Tₑ) y con los tiempos acelerados
 * del método de intercambio tiempo-costo [9].
 */
import { useState } from 'react';
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { fmt, fmtInt } from '../../utils/format';
import type { ActivityResult } from '../../types/pertTypes';

/* Paleta coherente con el informe. */
const CRIT = '#c47a1b'; // naranja (ruta crítica)
const CRIT_DARK = '#9a5e12';
const SLACK = '#5b6b86'; // gris azulado (con holgura)
const SLACK_DARK = '#3f4c63';
const TERMINAL = '#2b3442'; // INICIO y FIN
const EDGE = '#9aa4b2';

/* Geometría del dibujo. */
const R = 33; // radio de cada nodo
const R_TERM = 28; // radio de INICIO y FIN
const COL_W = 118; // ancho de cada columna
const LANE_H = 136; // alto de cada carril (nodo + etiquetas)
const PER_BAND = 8; // columnas por fila antes de envolver
const PAD_X = 28;
const PAD_TOP = 12;
const WRAP_GAP = 52; // espacio bajo una banda para la flecha de retorno
const ARROW = 9; // separación del nodo para que se vea la punta de flecha

type Scenario = 'normal' | 'crashed';

interface Node {
  id: string;
  col: number; // columna lógica (0 = INICIO)
  lane: number;
  res: ActivityResult;
  duration: number;
  slack: number;
  critical: boolean;
  terminal?: 'start' | 'end';
}

export function PertNetwork() {
  const { data, results, crashed } = usePert();
  const [scenario, setScenario] = useState<Scenario>('normal');

  const showCrashed = scenario === 'crashed' && crashed != null;
  const byActivity = showCrashed ? crashed!.byActivity : results.byActivity;
  const duration = showCrashed ? crashed!.duration : results.duration;

  /* --- Niveles: profundidad = cadena más larga de predecesores. --- */
  const level: Record<string, number> = {};
  const byId: Record<string, (typeof data.activities)[number]> = {};
  for (const a of data.activities) byId[a.id] = a;
  const computeLevel = (id: string): number => {
    if (level[id] != null) return level[id];
    const preds = byId[id].predecessors.filter((p) => byId[p]);
    level[id] = preds.length ? Math.max(...preds.map(computeLevel)) + 1 : 0;
    return level[id];
  };
  for (const a of data.activities) computeLevel(a.id);
  const maxLevel = Math.max(...Object.values(level));

  /* --- Nodos: una columna por nivel, con INICIO delante y FIN al final. --- */
  const nodes: Node[] = [];
  for (let lv = 0; lv <= maxLevel; lv++) {
    const ids = data.activities.map((a) => a.id).filter((id) => level[id] === lv);
    // La crítica ocupa el carril 0 para que la cadena naranja quede recta.
    ids.sort(
      (a, b) => Number(byActivity[b].critical) - Number(byActivity[a].critical)
    );
    ids.forEach((id, lane) => {
      const res = byActivity[id];
      nodes.push({
        id,
        col: lv + 1,
        lane,
        res,
        duration: res.expected,
        slack: res.slack,
        critical: res.critical,
      });
    });
  }

  const emptyRes: ActivityResult = {
    id: '', expected: 0, variance: 0, es: 0, ef: 0, ls: 0, lf: 0,
    slack: 0, critical: true,
  };
  const startNode: Node = {
    id: 'INICIO', col: 0, lane: 0, res: emptyRes, duration: 0, slack: 0,
    critical: true, terminal: 'start',
  };
  const endNode: Node = {
    id: 'FIN', col: maxLevel + 2, lane: 0,
    res: { ...emptyRes, es: duration, ef: duration, ls: duration, lf: duration },
    duration: 0, slack: 0, critical: true, terminal: 'end',
  };
  const allNodes = [startNode, ...nodes, endNode];

  const nodeById: Record<string, Node> = {};
  for (const n of allNodes) nodeById[n.id] = n;

  /* --- Bandas: las columnas se reparten en filas de PER_BAND. --- */
  const bandOf = (col: number) => Math.floor(col / PER_BAND);
  const slotOf = (col: number) => col % PER_BAND;
  const bandCount = bandOf(endNode.col) + 1;

  const lanesInBand: number[] = Array(bandCount).fill(1);
  for (const n of allNodes) {
    const b = bandOf(n.col);
    lanesInBand[b] = Math.max(lanesInBand[b], n.lane + 1);
  }

  const bandTop: number[] = [];
  for (let b = 0; b < bandCount; b++) {
    bandTop[b] =
      b === 0 ? PAD_TOP : bandTop[b - 1] + lanesInBand[b - 1] * LANE_H + WRAP_GAP;
  }

  const cx = (n: Node) => PAD_X + slotOf(n.col) * COL_W + COL_W / 2;
  const cy = (n: Node) => bandTop[bandOf(n.col)] + n.lane * LANE_H + R + 8;
  const radiusOf = (n: Node) => (n.terminal ? R_TERM : R);

  const width = PAD_X * 2 + PER_BAND * COL_W;
  const contentHeight =
    bandTop[bandCount - 1] + lanesInBand[bandCount - 1] * LANE_H + 8;
  const wrapLeft = PAD_X / 2;
  const wrapRight = width - PAD_X / 2;

  /* --- Aristas: predecesor -> sucesor, más INICIO y FIN. --- */
  interface Edge {
    key: string;
    d: string;
    critical: boolean;
  }
  const edges: Edge[] = [];

  /** Traza una arista; si cruza de banda, la rodea por fuera del gráfico. */
  const connect = (src: Node, dst: Node, critical: boolean, key: string) => {
    const x1 = cx(src);
    const y1 = cy(src);
    const x2 = cx(dst);
    const y2 = cy(dst);
    const r1 = radiusOf(src);
    const r2 = radiusOf(dst);
    const srcBand = bandOf(src.col);
    const dstBand = bandOf(dst.col);

    if (srcBand === dstBand) {
      const dx = x2 - x1;
      const dy = y2 - y1;
      const dist = Math.hypot(dx, dy) || 1;
      const sx = x1 + (dx / dist) * r1;
      const sy = y1 + (dy / dist) * r1;
      const tx = x2 - (dx / dist) * (r2 + ARROW);
      const ty = y2 - (dy / dist) * (r2 + ARROW);
      edges.push({ key, d: `M ${sx} ${sy} L ${tx} ${ty}`, critical });
      return;
    }

    // Salto de banda: sale por la derecha, baja y vuelve por la izquierda.
    const wrapY = bandTop[srcBand + 1] - WRAP_GAP / 2;
    edges.push({
      key,
      critical,
      d:
        `M ${x1 + r1} ${y1} L ${wrapRight} ${y1} L ${wrapRight} ${wrapY} ` +
        `L ${wrapLeft} ${wrapY} L ${wrapLeft} ${y2} L ${x2 - r2 - ARROW} ${y2}`,
    });
  };

  for (const a of data.activities) {
    const target = nodeById[a.id];
    const preds = a.predecessors.filter((p) => nodeById[p]);
    if (preds.length === 0) {
      connect(startNode, target, target.critical, `start-${a.id}`);
    }
    for (const p of preds) {
      const src = nodeById[p];
      connect(src, target, src.critical && target.critical, `${p}-${a.id}`);
    }
  }
  const hasSucc: Record<string, boolean> = {};
  for (const a of data.activities) for (const p of a.predecessors) hasSucc[p] = true;
  for (const n of nodes) {
    if (!hasSucc[n.id]) connect(n, endNode, n.critical, `${n.id}-end`);
  }

  /* --- Recuadro de lectura, en el hueco que deja la última banda. --- */
  const lastUsedSlot = Math.max(
    ...allNodes.filter((n) => bandOf(n.col) === bandCount - 1).map((n) => slotOf(n.col))
  );
  const boxX = PAD_X + (lastUsedSlot + 1) * COL_W - COL_W / 4;
  const boxW = width - PAD_X - boxX;
  const boxY = bandTop[bandCount - 1] + 4;
  const legendFits = boxW > 190;

  const legendLines: Array<{ text: string; color?: string; bold?: boolean }> = [
    { text: 'Cómo leer cada círculo', bold: true },
    { text: 'Arriba: inicio | fin temprano' },
    { text: 'Abajo: inicio | fin lejano' },
    { text: 'Centro: la actividad' },
    { text: 'Bajo el círculo: su duración' },
    { text: 'Naranja: ruta crítica (holgura 0)', color: CRIT_DARK },
    { text: 'Gris: actividad con holgura', color: SLACK_DARK },
  ];
  if (showCrashed) {
    legendLines.push(
      { text: `Duración: ${fmt(duration, 2)} días` },
      { text: `(antes ${fmt(results.duration, 2)})` },
      { text: `Costo: USD ${fmtInt(crashed!.totalCost)}` }
    );
  } else {
    legendLines.push(
      { text: `Duración: ${fmt(duration, 2)} días hábiles` },
      { text: `Desviación estándar: ${fmt(results.projectStdDev, 2)}` }
    );
  }

  const criticalCount = allNodes.filter((n) => !n.terminal && n.critical).length;

  // El alto deja sitio al recuadro aunque sea más alto que la última banda.
  const boxH = legendLines.length * 14 + 14;
  const height = legendFits
    ? Math.max(contentHeight, boxY + boxH + 8)
    : contentHeight;

  return (
    <Card
      title="Grafo PERT"
      subtitle="Cada actividad es un círculo; las flechas muestran qué debe terminar antes de qué"
      badge="Sección 7"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        En cada círculo: arriba el inicio y el fin tempranos; en el centro la
        actividad; abajo el inicio y el fin lejanos. El número bajo el círculo es
        la duración en días hábiles. La ruta crítica va en naranja.
        {bandCount > 1 &&
          ' La red se dibuja en varias filas: la flecha que rodea el gráfico une el final de una fila con el comienzo de la siguiente.'}
      </p>

      {crashed && (
        <div
          className="mode-switch"
          role="group"
          aria-label="Escenario de la red"
          style={{ marginBottom: 12 }}
        >
          <button
            type="button"
            className={scenario === 'normal' ? 'active' : undefined}
            aria-pressed={scenario === 'normal'}
            onClick={() => setScenario('normal')}
          >
            Tiempos normales ({fmt(results.duration, 2)} días)
          </button>
          <button
            type="button"
            className={scenario === 'crashed' ? 'active' : undefined}
            aria-pressed={scenario === 'crashed'}
            onClick={() => setScenario('crashed')}
          >
            Tiempos acelerados ({fmt(crashed.duration, 2)} días)
          </button>
        </div>
      )}

      <div className="chart-wrap">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          style={{ minWidth: 720 }}
          role="img"
          aria-label={
            showCrashed
              ? `Red del proyecto con tiempos acelerados: ${fmt(duration, 2)} días hábiles`
              : `Red del proyecto con tiempos normales: ${fmt(duration, 2)} días hábiles`
          }
        >
          <defs>
            <marker id="pert-arrow-crit" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={CRIT} />
            </marker>
            <marker id="pert-arrow-edge" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={EDGE} />
            </marker>
          </defs>

          {/* Aristas */}
          {edges.map((e) => (
            <path
              key={e.key}
              d={e.d}
              fill="none"
              stroke={e.critical ? CRIT : EDGE}
              strokeWidth={e.critical ? 2.4 : 1.4}
              strokeLinejoin="round"
              markerEnd={e.critical ? 'url(#pert-arrow-crit)' : 'url(#pert-arrow-edge)'}
            />
          ))}

          {/* Nodos */}
          {allNodes.map((n) => {
            const x = cx(n);
            const y = cy(n);
            const r = radiusOf(n);

            if (n.terminal) {
              return (
                <g key={n.id}>
                  <circle cx={x} cy={y} r={r} fill={TERMINAL} />
                  <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight={700} fill="#fff">
                    {n.id}
                  </text>
                </g>
              );
            }

            const fill = n.critical ? CRIT : SLACK;
            const stroke = n.critical ? CRIT_DARK : SLACK_DARK;
            const qx = r * 0.5; // separación horizontal de las cifras
            const crashedTime = crashed?.durationById[n.id];
            const normalTime = results.byActivity[n.id].expected;
            const subLabel = showCrashed
              ? crashedTime != null && Math.abs(crashedTime - normalTime) > 1e-6
                ? `antes ${fmt(normalTime, 2)}`
                : null
              : n.slack > 1e-6
                ? `holgura ${fmt(n.slack, 2)}`
                : null;

            return (
              <g key={n.id}>
                <circle cx={x} cy={y} r={r} fill={fill} stroke={stroke} strokeWidth={1.6} />
                {/* divisorias: horizontal partida en dos para no cruzar la letra */}
                <line x1={x - r} y1={y} x2={x - 13} y2={y} stroke={stroke} strokeWidth={1} opacity={0.75} />
                <line x1={x + 13} y1={y} x2={x + r} y2={y} stroke={stroke} strokeWidth={1} opacity={0.75} />
                <line x1={x} y1={y - r} x2={x} y2={y - 13} stroke={stroke} strokeWidth={1} opacity={0.75} />
                <line x1={x} y1={y + 13} x2={x} y2={y + r} stroke={stroke} strokeWidth={1} opacity={0.75} />
                {/* esquinas: ES EF / LS LF */}
                <text x={x - qx} y={y - 12} textAnchor="middle" fontSize="10" fill="#fff">{fmt(n.res.es, 2)}</text>
                <text x={x + qx} y={y - 12} textAnchor="middle" fontSize="10" fill="#fff">{fmt(n.res.ef, 2)}</text>
                <text x={x - qx} y={y + 20} textAnchor="middle" fontSize="10" fill="#fff">{fmt(n.res.ls, 2)}</text>
                <text x={x + qx} y={y + 20} textAnchor="middle" fontSize="10" fill="#fff">{fmt(n.res.lf, 2)}</text>
                {/* centro: letra de la actividad */}
                <text x={x} y={y + 6} textAnchor="middle" fontSize="17" fontWeight={800} fill="#fff">{n.id}</text>
                <title>{`${n.id} — ${byId[n.id].name}`}</title>
                {/* duración y nota bajo el nodo */}
                <text x={x} y={y + r + 16} textAnchor="middle" fontSize="11.5" fontWeight={650} fill="#1d2430">
                  {fmt(n.duration, 2)}
                </text>
                {subLabel && (
                  <text x={x} y={y + r + 29} textAnchor="middle" fontSize="9.5" fill="#8a94a3">
                    {subLabel}
                  </text>
                )}
              </g>
            );
          })}

          {/* Recuadro "cómo leer cada círculo" */}
          {legendFits && (
            <g>
              <rect
                x={boxX}
                y={boxY}
                width={boxW}
                height={boxH}
                rx={8}
                fill="none"
                stroke="#d7dce4"
                strokeWidth={1}
              />
              {legendLines.map((l, i) => (
                <text
                  key={l.text}
                  x={boxX + 10}
                  y={boxY + 19 + i * 14}
                  fontSize="9.5"
                  fontWeight={l.bold ? 700 : 400}
                  fill={l.color ?? '#5b6472'}
                >
                  {l.text}
                </text>
              ))}
            </g>
          )}
        </svg>
      </div>

      <div className="legend" style={{ marginTop: 8 }}>
        <span><i style={{ background: CRIT }} />Ruta crítica (sin margen): {criticalCount} de {data.activities.length} actividades</span>
        <span><i style={{ background: SLACK }} />Actividad con holgura</span>
        <span><i style={{ background: TERMINAL }} />Inicio y fin del proyecto</span>
      </div>

      {showCrashed && (
        <p className="note mt-16" style={{ textAlign: 'left' }}>
          <strong>Red acelerada.</strong> Con el método de intercambio
          tiempo-costo [9] el proyecto baja de {fmt(results.duration, 2)} a{' '}
          {fmt(duration, 2)} días hábiles ({fmt(results.duration - duration, 2)}{' '}
          días menos) y el costo sube de USD{' '}
          {fmtInt(crashed!.normalTotalCost)} a USD {fmtInt(crashed!.totalCost)}.
          Todas las actividades quedan con holgura cero: ya no hay margen en
          ninguna rama. B y H no se reducen hasta su mínimo técnico porque
          acortarlas más no adelantaría la entrega. Los costos y los tiempos
          urgentes son <strong>hipotéticos</strong>.
        </p>
      )}

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'El grafo PERT dibuja el proyecto como una red: cada actividad es un nodo y las flechas muestran qué debe terminar antes de qué. Sirve para ver de un vistazo el orden de las tareas, cuáles se hacen en paralelo y cuál es el camino sin margen (la ruta crítica) que define la duración total. Volver a dibujar la red con los tiempos acelerados muestra cómo cambia esa ruta cuando se paga por terminar antes.',
            how: <NodeAnatomy />,
            meaning: (
              <div style={{ textAlign: 'left', lineHeight: 1.7 }}>
                <p style={{ marginTop: 0 }}>
                  <strong>Holgura = LS − ES = LF − EF.</strong> Es el margen que
                  una actividad puede retrasarse sin mover la fecha final del
                  proyecto.
                </p>
                <ul style={{ paddingLeft: 20, margin: 0 }}>
                  <li>
                    <strong style={{ color: CRIT }}>Nodos naranjas (holgura 0):</strong>{' '}
                    forman la <strong>ruta crítica</strong>. Si una se atrasa un
                    día, todo el proyecto se atrasa un día.
                  </li>
                  <li>
                    <strong style={{ color: SLACK }}>Nodos grises (holgura &gt; 0):</strong>{' '}
                    tienen margen. Con tiempos normales B puede retrasarse{' '}
                    {fmt(results.byActivity['B']?.slack ?? 0, 2)} días y H{' '}
                    {fmt(results.byActivity['H']?.slack ?? 0, 2)} día sin afectar
                    la entrega; su holgura aparece bajo el nodo.
                  </li>
                </ul>
                <p style={{ marginBottom: 0 }}>
                  Las flechas que salen de F hacia G y H son dos trabajos en
                  paralelo; I solo empieza cuando terminan ambos. La cadena
                  naranja fija la duración total:{' '}
                  <strong>{fmt(duration, 2)} días hábiles</strong>
                  {showCrashed && ' en el escenario acelerado'}.
                </p>
              </div>
            ),
          }}
        />
      </div>
    </Card>
  );
}

/**
 * NodeAnatomy — mini diagrama que explica las cuatro partes de un nodo del
 * grafo (inicio/fin temprano y lejano) y la duración bajo el nodo.
 */
function NodeAnatomy() {
  const x = 200;
  const y = 58;
  const r = 40;
  const line = CRIT_DARK;
  return (
    <div style={{ textAlign: 'left', lineHeight: 1.7 }}>
      <p style={{ marginTop: 0 }}>Cada círculo se divide en cuatro. Así se lee:</p>
      <svg viewBox="0 0 400 130" width="100%" style={{ maxWidth: 440 }} role="img">
        <circle cx={x} cy={y} r={r} fill={CRIT} stroke={line} strokeWidth={1.6} />
        <line x1={x - r} y1={y} x2={x - 15} y2={y} stroke={line} opacity={0.75} />
        <line x1={x + 15} y1={y} x2={x + r} y2={y} stroke={line} opacity={0.75} />
        <line x1={x} y1={y - r} x2={x} y2={y - 15} stroke={line} opacity={0.75} />
        <line x1={x} y1={y + 15} x2={x} y2={y + r} stroke={line} opacity={0.75} />
        <text x={x - 20} y={y - 14} textAnchor="middle" fontSize="12" fill="#fff">ES</text>
        <text x={x + 20} y={y - 14} textAnchor="middle" fontSize="12" fill="#fff">EF</text>
        <text x={x - 20} y={y + 24} textAnchor="middle" fontSize="12" fill="#fff">LS</text>
        <text x={x + 20} y={y + 24} textAnchor="middle" fontSize="12" fill="#fff">LF</text>
        <text x={x} y={y + 7} textAnchor="middle" fontSize="18" fontWeight={800} fill="#fff">X</text>
        <text x={x} y={y + r + 17} textAnchor="middle" fontSize="12" fontWeight={650} fill="#1d2430">Tₑ</text>
        <text x={x - r - 8} y={y - 14} textAnchor="end" fontSize="11" fill="#5b6472">Inicio temprano</text>
        <text x={x + r + 8} y={y - 14} textAnchor="start" fontSize="11" fill="#5b6472">Fin temprano</text>
        <text x={x - r - 8} y={y + 24} textAnchor="end" fontSize="11" fill="#5b6472">Inicio lejano</text>
        <text x={x + r + 8} y={y + 24} textAnchor="start" fontSize="11" fill="#5b6472">Fin lejano</text>
      </svg>
      <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
        <li><strong>ES</strong> (inicio temprano): lo más pronto que la actividad puede empezar.</li>
        <li><strong>EF</strong> (fin temprano): ES + duración.</li>
        <li><strong>LS</strong> (inicio lejano): lo más tarde que puede empezar sin retrasar el proyecto.</li>
        <li><strong>LF</strong> (fin lejano): lo más tarde que puede terminar sin retrasar el proyecto.</li>
        <li><strong>X</strong>: la letra de la actividad; <strong>Tₑ</strong>: su duración (bajo el nodo).</li>
      </ul>
      <p style={{ marginBottom: 0 }}>
        Al pasar el cursor sobre un nodo aparece el nombre completo de la
        actividad.
      </p>
    </div>
  );
}
