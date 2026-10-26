/**
 * PertNetwork.tsx — Grafo PERT (sección 7): dibujo de la red del proyecto.
 * Cada actividad es un nodo dividido en cuatro: arriba izq. el inicio temprano
 * y arriba der. el fin temprano; en el centro la letra; abajo izq. el inicio
 * lejano y abajo der. el fin lejano. Bajo el nodo, la duración esperada. La
 * ruta crítica va resaltada (naranja) y los nodos con holgura en gris.
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { fmt } from '../../utils/format';
import type { ActivityResult } from '../../types/pertTypes';

/* Paleta coherente con el informe. */
const CRIT = '#c47a1b'; // naranja (ruta crítica)
const CRIT_DARK = '#9a5e12';
const SLACK = '#5b6b86'; // gris azulado (con holgura)
const SLACK_DARK = '#3f4c63';
const EDGE = '#9aa4b2';

interface Node {
  id: string;
  level: number;
  lane: number;
  res: ActivityResult;
  duration: number;
  slack: number;
  critical: boolean;
}

const NODE_W = 84;
const NODE_H = 58;
const COL_W = 122;
const LANE_H = 118;
const PAD_X = 70; // espacio para INICIO
const PAD_TOP = 24;

export function PertNetwork() {
  const { data, results } = usePert();

  // Nivel (profundidad) = cadena más larga de predecesores.
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

  // Agrupa por nivel y asigna "carril": la crítica en el carril 0.
  const nodes: Node[] = [];
  for (let lv = 0; lv <= maxLevel; lv++) {
    const ids = data.activities
      .map((a) => a.id)
      .filter((id) => level[id] === lv);
    ids.sort((a, b) => Number(results.byActivity[b].critical) - Number(results.byActivity[a].critical));
    ids.forEach((id, lane) => {
      const res = results.byActivity[id];
      nodes.push({
        id,
        level: lv,
        lane,
        res,
        duration: res.expected,
        slack: res.slack,
        critical: res.critical,
      });
    });
  }

  const nodeById: Record<string, Node> = {};
  for (const n of nodes) nodeById[n.id] = n;

  const xOf = (lv: number) => PAD_X + lv * COL_W;
  const yOf = (lane: number) => PAD_TOP + lane * LANE_H;

  const width = PAD_X + (maxLevel + 1) * COL_W + PAD_X;
  const lanes = Math.max(...nodes.map((n) => n.lane)) + 1;
  const height = PAD_TOP + lanes * LANE_H + 40;

  // Posición de INICIO y FIN.
  const startX = 8;
  const startY = yOf(0);
  const endX = xOf(maxLevel + 1);
  const endY = yOf(0);

  // Aristas: predecesor -> sucesor, más INICIO y FIN.
  interface Edge {
    x1: number; y1: number; x2: number; y2: number; critical: boolean; key: string;
  }
  const edges: Edge[] = [];
  const rightOf = (n: Node) => ({ x: xOf(n.level) + NODE_W, y: yOf(n.lane) + NODE_H / 2 });
  const leftOf = (n: Node) => ({ x: xOf(n.level), y: yOf(n.lane) + NODE_H / 2 });

  for (const a of data.activities) {
    const target = nodeById[a.id];
    const preds = a.predecessors.filter((p) => nodeById[p]);
    if (preds.length === 0) {
      edges.push({ x1: startX + 48, y1: startY + NODE_H / 2, x2: leftOf(target).x, y2: leftOf(target).y, critical: target.critical, key: `start-${a.id}` });
    }
    for (const p of preds) {
      const src = nodeById[p];
      edges.push({ x1: rightOf(src).x, y1: rightOf(src).y, x2: leftOf(target).x, y2: leftOf(target).y, critical: src.critical && target.critical, key: `${p}-${a.id}` });
    }
  }
  // Sumideros -> FIN.
  const hasSucc: Record<string, boolean> = {};
  for (const a of data.activities) for (const p of a.predecessors) hasSucc[p] = true;
  for (const n of nodes) {
    if (!hasSucc[n.id]) {
      edges.push({ x1: rightOf(n).x, y1: rightOf(n).y, x2: endX, y2: endY + NODE_H / 2, critical: n.critical, key: `${n.id}-end` });
    }
  }

  return (
    <Card
      title="Grafo PERT"
      subtitle="Cada actividad es un nodo; las flechas muestran qué debe terminar antes de qué"
      badge="Sección 7"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        En cada nodo: arriba el inicio y el fin tempranos; en el centro la
        actividad; abajo el inicio y el fin lejanos. El número bajo el nodo es la
        duración esperada en días hábiles. La ruta crítica va en naranja.
      </p>

      <div className="chart-wrap" style={{ overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${width} ${height}`} width={width} role="img" style={{ maxWidth: 'none' }}>
          <defs>
            <marker id="arrow-crit" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={CRIT} />
            </marker>
            <marker id="arrow-edge" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L7,3 L0,6 Z" fill={EDGE} />
            </marker>
          </defs>

          {/* Aristas */}
          {edges.map((e) => (
            <line
              key={e.key}
              x1={e.x1}
              y1={e.y1}
              x2={e.x2 - 2}
              y2={e.y2}
              stroke={e.critical ? CRIT : EDGE}
              strokeWidth={e.critical ? 2.4 : 1.4}
              markerEnd={e.critical ? 'url(#arrow-crit)' : 'url(#arrow-edge)'}
            />
          ))}

          {/* INICIO */}
          <g>
            <rect x={startX} y={startY} width={48} height={NODE_H} rx={8} fill="#2b3442" />
            <text x={startX + 24} y={startY + NODE_H / 2 + 4} textAnchor="middle" fontSize="11" fontWeight={700} fill="#fff">INICIO</text>
          </g>

          {/* FIN */}
          <g>
            <rect x={endX} y={endY} width={48} height={NODE_H} rx={8} fill="#2b3442" />
            <text x={endX + 24} y={endY + NODE_H / 2 + 4} textAnchor="middle" fontSize="12" fontWeight={700} fill="#fff">FIN</text>
          </g>

          {/* Nodos */}
          {nodes.map((n) => {
            const x = xOf(n.level);
            const y = yOf(n.lane);
            const fill = n.critical ? CRIT : SLACK;
            const stroke = n.critical ? CRIT_DARK : SLACK_DARK;
            return (
              <g key={n.id}>
                <rect x={x} y={y} width={NODE_W} height={NODE_H} rx={8} fill={fill} stroke={stroke} strokeWidth={1.5} />
                {/* líneas divisorias */}
                <line x1={x} y1={y + NODE_H / 2} x2={x + NODE_W} y2={y + NODE_H / 2} stroke={stroke} strokeWidth={1} opacity={0.7} />
                <line x1={x + NODE_W / 2} y1={y} x2={x + NODE_W / 2} y2={y + 14} stroke={stroke} strokeWidth={1} opacity={0.7} />
                <line x1={x + NODE_W / 2} y1={y + NODE_H - 14} x2={x + NODE_W / 2} y2={y + NODE_H} stroke={stroke} strokeWidth={1} opacity={0.7} />
                {/* esquinas: ES EF / LS LF */}
                <text x={x + NODE_W / 4} y={y + 13} textAnchor="middle" fontSize="10.5" fill="#fff">{fmt(n.res.es, 2)}</text>
                <text x={x + (NODE_W * 3) / 4} y={y + 13} textAnchor="middle" fontSize="10.5" fill="#fff">{fmt(n.res.ef, 2)}</text>
                <text x={x + NODE_W / 4} y={y + NODE_H - 5} textAnchor="middle" fontSize="10.5" fill="#fff">{fmt(n.res.ls, 2)}</text>
                <text x={x + (NODE_W * 3) / 4} y={y + NODE_H - 5} textAnchor="middle" fontSize="10.5" fill="#fff">{fmt(n.res.lf, 2)}</text>
                {/* centro: letra */}
                <circle cx={x + NODE_W / 2} cy={y + NODE_H / 2} r={11} fill="#fff" opacity={0.95} />
                <text x={x + NODE_W / 2} y={y + NODE_H / 2 + 4} textAnchor="middle" fontSize="13" fontWeight={800} fill={stroke}>{n.id}</text>
                {/* duración y holgura */}
                <text x={x + NODE_W / 2} y={y + NODE_H + 15} textAnchor="middle" fontSize="11" fontWeight={650} fill="#1d2430">{fmt(n.duration, 2)}</text>
                {!n.critical && (
                  <text x={x + NODE_W / 2} y={y + NODE_H + 28} textAnchor="middle" fontSize="9.5" fill="#8a94a3">holgura {fmt(n.slack, 2)}</text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="legend" style={{ marginTop: 8 }}>
        <span><i style={{ background: CRIT }} />Ruta crítica (sin margen)</span>
        <span><i style={{ background: SLACK }} />Actividad con holgura</span>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'El grafo PERT dibuja el proyecto como una red: cada actividad es un nodo y las flechas muestran qué debe terminar antes de qué. Sirve para ver de un vistazo el orden de las tareas, cuáles se hacen en paralelo y cuál es el camino sin margen (la ruta crítica) que define la duración total.',
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
                    tienen margen. Por ejemplo, B puede retrasarse{' '}
                    {fmt(results.byActivity['B']?.slack ?? 0, 2)} días y H{' '}
                    {fmt(results.byActivity['H']?.slack ?? 0, 2)} día sin afectar
                    la entrega; su holgura aparece bajo el nodo.
                  </li>
                </ul>
                <p style={{ marginBottom: 0 }}>
                  Las flechas que salen de F hacia G y H son dos trabajos en
                  paralelo; I solo empieza cuando terminan ambos. La cadena
                  naranja fija la duración total:{' '}
                  <strong>{fmt(results.duration, 2)} días hábiles</strong>.
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
 * NodeAnatomy — mini diagrama que explica las cuatro esquinas de un nodo del
 * grafo (inicio/fin temprano y lejano) y la duración bajo el nodo.
 */
function NodeAnatomy() {
  const x = 150;
  const y = 16;
  const w = 96;
  const h = 66;
  const line = '#9a5e12';
  return (
    <div style={{ textAlign: 'left', lineHeight: 1.7 }}>
      <p style={{ marginTop: 0 }}>
        Cada nodo se divide en cuatro. Así se lee:
      </p>
      <svg viewBox="0 0 400 110" width="100%" style={{ maxWidth: 420 }} role="img">
        {/* nodo de ejemplo */}
        <rect x={x} y={y} width={w} height={h} rx={8} fill={CRIT} stroke={line} strokeWidth={1.5} />
        <line x1={x} y1={y + h / 2} x2={x + w} y2={y + h / 2} stroke={line} opacity={0.7} />
        <line x1={x + w / 2} y1={y} x2={x + w / 2} y2={y + 16} stroke={line} opacity={0.7} />
        <line x1={x + w / 2} y1={y + h - 16} x2={x + w / 2} y2={y + h} stroke={line} opacity={0.7} />
        <text x={x + w / 4} y={y + 15} textAnchor="middle" fontSize="12" fill="#fff">ES</text>
        <text x={x + (w * 3) / 4} y={y + 15} textAnchor="middle" fontSize="12" fill="#fff">EF</text>
        <text x={x + w / 4} y={y + h - 6} textAnchor="middle" fontSize="12" fill="#fff">LS</text>
        <text x={x + (w * 3) / 4} y={y + h - 6} textAnchor="middle" fontSize="12" fill="#fff">LF</text>
        <circle cx={x + w / 2} cy={y + h / 2} r={13} fill="#fff" opacity={0.95} />
        <text x={x + w / 2} y={y + h / 2 + 5} textAnchor="middle" fontSize="15" fontWeight={800} fill={line}>X</text>
        <text x={x + w / 2} y={y + h + 16} textAnchor="middle" fontSize="12" fontWeight={650} fill="#1d2430">Tₑ</text>
        {/* llamadas */}
        <text x={x - 8} y={y + 15} textAnchor="end" fontSize="11" fill="#5b6472">Inicio temprano</text>
        <text x={x + w + 8} y={y + 15} textAnchor="start" fontSize="11" fill="#5b6472">Fin temprano</text>
        <text x={x - 8} y={y + h - 6} textAnchor="end" fontSize="11" fill="#5b6472">Inicio lejano</text>
        <text x={x + w + 8} y={y + h - 6} textAnchor="start" fontSize="11" fill="#5b6472">Fin lejano</text>
      </svg>
      <ul style={{ paddingLeft: 20, margin: '8px 0 0' }}>
        <li><strong>ES</strong> (inicio temprano): lo más pronto que la actividad puede empezar.</li>
        <li><strong>EF</strong> (fin temprano): ES + duración esperada.</li>
        <li><strong>LS</strong> (inicio lejano): lo más tarde que puede empezar sin retrasar el proyecto.</li>
        <li><strong>LF</strong> (fin lejano): lo más tarde que puede terminar sin retrasar el proyecto.</li>
        <li><strong>X</strong>: la letra de la actividad; <strong>Tₑ</strong>: su duración esperada (bajo el nodo).</li>
      </ul>
    </div>
  );
}
