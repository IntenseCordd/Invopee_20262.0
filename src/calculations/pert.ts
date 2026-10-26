/**
 * pert.ts — motor de cálculo de GESTIÓN DE PROYECTOS con PERT/CPM.
 *
 * Método de la ruta crítica (CPM) con tres estimaciones de tiempo (PERT):
 *   Tₑ = (o + 4m + p) / 6             Varianza = ((p − o) / 6)²
 *   Pase hacia adelante:  ES = max(EF de predecesores),  EF = ES + Tₑ
 *   Duración = max(EF)
 *   Pase hacia atrás:  LF = min(LS de sucesores) (o duración si no hay),
 *                      LS = LF − Tₑ
 *   Holgura = LS − ES          Ruta crítica = actividades con holgura ≈ 0
 *   σ_proyecto = √(Σ varianzas de las actividades de la ruta crítica)
 */
import type {
  PertData,
  PertResults,
  ActivityResult,
} from '../types/pertTypes';

/** Tolerancia para considerar una holgura como cero (ruta crítica). */
const EPS = 1e-6;

/** Tₑ = (o + 4m + p) / 6. */
export function expectedTime(
  optimistic: number,
  mostLikely: number,
  pessimistic: number
): number {
  return (optimistic + 4 * mostLikely + pessimistic) / 6;
}

/**
 * Suma `businessDays` días hábiles (lun–vie) a una fecha ISO (YYYY-MM-DD),
 * sin contar festivos. Devuelve la fecha resultante.
 */
export function addBusinessDays(startISO: string, businessDays: number): Date {
  const [y, m, d] = startISO.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  let added = 0;
  const target = Math.max(0, Math.floor(businessDays));
  while (added < target) {
    date.setDate(date.getDate() + 1);
    const dow = date.getDay();
    if (dow !== 0 && dow !== 6) added++;
  }
  return date;
}

/** Formatea una fecha a texto corto en español: "19 feb 2027". */
export function formatShortDate(date: Date): string {
  return date.toLocaleDateString('es', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/** Varianza = ((p − o) / 6)². */
export function activityVariance(
  optimistic: number,
  pessimistic: number
): number {
  const d = (pessimistic - optimistic) / 6;
  return d * d;
}

/**
 * Ordena las actividades topológicamente (predecesores antes que sucesores).
 * Respeta el orden original de los datos ante empates.
 */
function topologicalOrder(data: PertData): string[] {
  const ids = data.activities.map((a) => a.id);
  const preds: Record<string, string[]> = {};
  for (const a of data.activities) preds[a.id] = a.predecessors;

  const visited = new Set<string>();
  const order: string[] = [];

  const visit = (id: string, stack: Set<string>) => {
    if (visited.has(id)) return;
    if (stack.has(id)) return; // evita ciclos (datos inválidos)
    stack.add(id);
    for (const p of preds[id] ?? []) {
      if (ids.includes(p)) visit(p, stack);
    }
    stack.delete(id);
    visited.add(id);
    order.push(id);
  };

  for (const id of ids) visit(id, new Set());
  return order;
}

/**
 * runPert
 * Entrada: datos del proyecto (actividades con 3 estimaciones).
 * Salida: resultados CPM por actividad y agregados del proyecto.
 */
export function runPert(data: PertData): PertResults {
  const byId: Record<string, (typeof data.activities)[number]> = {};
  for (const a of data.activities) byId[a.id] = a;

  const order = topologicalOrder(data);

  const res: Record<string, ActivityResult> = {};
  for (const a of data.activities) {
    res[a.id] = {
      id: a.id,
      expected: expectedTime(a.optimistic, a.mostLikely, a.pessimistic),
      variance: activityVariance(a.optimistic, a.pessimistic),
      es: 0,
      ef: 0,
      ls: 0,
      lf: 0,
      slack: 0,
      critical: false,
    };
  }

  // Pase hacia adelante: ES / EF.
  for (const id of order) {
    const act = byId[id];
    const preds = act.predecessors.filter((p) => res[p]);
    const es = preds.length ? Math.max(...preds.map((p) => res[p].ef)) : 0;
    res[id].es = es;
    res[id].ef = es + res[id].expected;
  }

  const duration = Math.max(...Object.values(res).map((r) => r.ef));

  // Sucesores de cada actividad.
  const successors: Record<string, string[]> = {};
  for (const a of data.activities) successors[a.id] = [];
  for (const a of data.activities) {
    for (const p of a.predecessors) {
      if (successors[p]) successors[p].push(a.id);
    }
  }

  // Pase hacia atrás: LF / LS / holgura.
  for (const id of [...order].reverse()) {
    const succ = successors[id];
    const lf = succ.length ? Math.min(...succ.map((s) => res[s].ls)) : duration;
    res[id].lf = lf;
    res[id].ls = lf - res[id].expected;
    res[id].slack = res[id].ls - res[id].es;
    res[id].critical = Math.abs(res[id].slack) < EPS;
  }

  // Ruta crítica en el orden de los datos.
  const criticalPath = data.activities
    .map((a) => a.id)
    .filter((id) => res[id].critical);

  const projectVariance = criticalPath.reduce(
    (sum, id) => sum + res[id].variance,
    0
  );
  const projectStdDev = Math.sqrt(projectVariance);

  // Duración hasta el lanzamiento: excluye la última actividad (soporte).
  const lastId = data.activities[data.activities.length - 1]?.id;
  const durationToLaunch = lastId ? res[lastId].es : duration;

  const rows = data.activities.map((a) => res[a.id]);

  return {
    byActivity: res,
    rows,
    duration,
    criticalPath,
    projectVariance,
    projectStdDev,
    durationToLaunch,
  };
}
