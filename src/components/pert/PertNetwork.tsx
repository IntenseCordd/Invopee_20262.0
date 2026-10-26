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
            meaning:
              'Las flechas que salen de F hacia G y H muestran dos trabajos que se hacen al mismo tiempo; I solo empieza cuando terminan ambos. La cadena en naranja es la ruta crítica: define la duración total (' +
              fmt(results.duration, 2) +
              ' días).',
          }}
        />
      </div>
    </Card>
  );
}
