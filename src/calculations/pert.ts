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
  CrashedResults,
  CrashRow,
  CrashStep,
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
 * schedule
 * Pase hacia adelante y hacia atrás sobre la red de precedencias, con las
 * duraciones que se le pasen. Es el núcleo compartido por el cálculo con
 * tiempos normales y con tiempos acelerados.
 */
function schedule(
  data: PertData,
  durationOf: (id: string) => number,
  varianceOf: (id: string) => number
): {
  byActivity: Record<string, ActivityResult>;
  duration: number;
  criticalPath: string[];
} {
  const byId: Record<string, (typeof data.activities)[number]> = {};
  for (const a of data.activities) byId[a.id] = a;

  const order = topologicalOrder(data);

  const res: Record<string, ActivityResult> = {};
  for (const a of data.activities) {
    res[a.id] = {
      id: a.id,
      expected: durationOf(a.id),
      variance: varianceOf(a.id),
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
    const preds = byId[id].predecessors.filter((p) => res[p]);
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

  const criticalPath = data.activities
    .map((a) => a.id)
    .filter((id) => res[id].critical);

  return { byActivity: res, duration, criticalPath };
}

/**
 * runPert
 * Entrada: datos del proyecto (actividades con 3 estimaciones).
 * Salida: resultados CPM por actividad y agregados del proyecto.
 */
export function runPert(data: PertData): PertResults {
  const expectedOf: Record<string, number> = {};
  const varianceOf: Record<string, number> = {};
  for (const a of data.activities) {
    expectedOf[a.id] = expectedTime(a.optimistic, a.mostLikely, a.pessimistic);
    varianceOf[a.id] = activityVariance(a.optimistic, a.pessimistic);
  }

  const { byActivity: res, duration, criticalPath } = schedule(
    data,
    (id) => expectedOf[id],
    (id) => varianceOf[id]
  );

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

/**
 * costPerDay
 * S = (Cc − Cn) / (Tn − Tc): lo que cuesta ganar un día en una actividad.
 * Devuelve null cuando la actividad no admite reducción (Tn = Tc).
 */
export function costPerDay(
  normalTime: number,
  crashTime: number,
  normalCost: number,
  crashCost: number
): number | null {
  const gain = normalTime - crashTime;
  if (gain <= EPS) return null;
  return (crashCost - normalCost) / gain;
}

/**
 * criticalPaths
 * Enumera las rutas críticas completas. Un enlace es crítico cuando une dos
 * actividades críticas y el fin temprano de la primera coincide con el inicio
 * temprano de la segunda (es decir, no hay espera entre ellas).
 */
function criticalPaths(
  data: PertData,
  res: Record<string, ActivityResult>
): string[][] {
  const byId: Record<string, (typeof data.activities)[number]> = {};
  for (const a of data.activities) byId[a.id] = a;

  const successors: Record<string, string[]> = {};
  for (const a of data.activities) successors[a.id] = [];
  for (const a of data.activities) {
    for (const p of a.predecessors) if (successors[p]) successors[p].push(a.id);
  }

  const critSucc = (id: string) =>
    successors[id].filter(
      (s) => res[s].critical && Math.abs(res[id].ef - res[s].es) < EPS
    );
  const critPred = (id: string) =>
    byId[id].predecessors.filter(
      (p) => res[p]?.critical && Math.abs(res[p].ef - res[id].es) < EPS
    );

  const paths: string[][] = [];
  const walk = (id: string, acc: string[]) => {
    if (paths.length > 2000) return; // tope de seguridad
    const next = critSucc(id);
    if (next.length === 0) {
      paths.push([...acc, id]);
      return;
    }
    for (const s of next) walk(s, [...acc, id]);
  };
  for (const a of data.activities) {
    if (res[a.id].critical && critPred(a.id).length === 0) walk(a.id, []);
  }
  return paths;
}

/** Tamaño máximo del conjunto de actividades que se acortan a la vez. */
const MAX_CUT_SIZE = 4;

/**
 * minCostCut
 * Busca el conjunto de actividades de menor costo por día que corta todas las
 * rutas críticas: acortarlas a la vez es la forma más barata de ganar un día.
 * Ante empate gana el conjunto que aparece antes en el orden de los datos.
 */
function minCostCut(
  paths: string[][],
  candidates: string[],
  sOf: (id: string) => number
): { ids: string[]; cost: number } | null {
  let best: { ids: string[]; cost: number } | null = null;
  const covers = (combo: string[]) =>
    paths.every((p) => combo.some((c) => p.includes(c)));

  const explore = (start: number, combo: string[], cost: number) => {
    if (combo.length > 0 && covers(combo)) {
      // Añadir más actividades solo encarecería el tramo.
      if (!best || cost < best.cost - EPS) best = { ids: [...combo], cost };
      return;
    }
    if (combo.length >= MAX_CUT_SIZE) return;
    for (let i = start; i < candidates.length; i++) {
      const next = cost + sOf(candidates[i]);
      if (best && next >= best.cost - EPS) continue; // poda: todas las S son > 0
      combo.push(candidates[i]);
      explore(i + 1, combo, next);
      combo.pop();
    }
  };
  explore(0, [], 0);
  return best;
}

/**
 * runCrashed
 * Aplica el método de aceleración del curso: mientras se pueda, se acorta el
 * conjunto de actividades críticas más barato, un tramo cada vez, recalculando
 * la ruta crítica después de cada paso. Cada tramo se recorta solo hasta donde
 * sigue adelantando la entrega: si otra rama pasa a ser crítica antes, el tramo
 * se detiene ahí y en la vuelta siguiente se acortan las dos ramas a la vez.
 *
 * Devuelve la red acelerada, la tabla por actividad y todos los programas
 * factibles. null si los datos no traen el bloque de aceleración.
 */
export function runCrashed(
  data: PertData,
  normal: PertResults
): CrashedResults | null {
  const crashing = data.crashing;
  if (!crashing) return null;

  const crashById: Record<string, (typeof crashing.activities)[number]> = {};
  for (const c of crashing.activities) crashById[c.id] = c;

  const durations: Record<string, number> = {};
  const sById: Record<string, number | null> = {};
  for (const a of data.activities) {
    const tn = normal.byActivity[a.id].expected;
    const c = crashById[a.id];
    durations[a.id] = tn;
    sById[a.id] = c
      ? costPerDay(tn, c.crashTime, c.normalCost, c.crashCost)
      : null;
  }

  const normalCost = data.activities.reduce(
    (sum, a) => sum + (crashById[a.id]?.normalCost ?? 0),
    0
  );
  const noVariance = () => 0;
  const durationWith = (d: Record<string, number>) =>
    schedule(data, (id) => d[id], noVariance).duration;

  let current = schedule(data, (id) => durations[id], noVariance);
  const normalDuration = current.duration;

  let totalCost = normalCost;
  const schedules: CrashStep[] = [
    {
      n: 0,
      duration: normalDuration,
      totalCost: normalCost,
      activities: [],
      gained: 0,
      costPerDay: null,
    },
  ];

  for (let guard = 0; guard < 200; guard++) {
    const paths = criticalPaths(data, current.byActivity);
    if (paths.length === 0) break;

    // Solo son candidatas las críticas que aún no llegaron a su Tc.
    const candidates = data.activities
      .map((a) => a.id)
      .filter((id) => {
        const c = crashById[id];
        return (
          current.byActivity[id].critical &&
          c != null &&
          sById[id] != null &&
          durations[id] - c.crashTime > EPS
        );
      });

    const cut = minCostCut(paths, candidates, (id) => sById[id] as number);
    if (!cut) break;

    // Hasta dónde se puede acortar este tramo sin pasarse del Tc...
    const maxDelta = Math.min(
      ...cut.ids.map((id) => durations[id] - crashById[id].crashTime)
    );
    // ...y hasta dónde sigue adelantando de verdad la entrega.
    const trial = { ...durations };
    for (const id of cut.ids) trial[id] -= maxDelta;
    const gained = current.duration - durationWith(trial);
    if (gained <= EPS) break;

    for (const id of cut.ids) durations[id] -= gained;
    totalCost += gained * cut.cost;
    current = schedule(data, (id) => durations[id], noVariance);

    schedules.push({
      n: schedules.length,
      duration: current.duration,
      totalCost,
      activities: [...cut.ids],
      gained,
      costPerDay: cut.cost,
    });
  }

  // Red final, ya con las varianzas de las estimaciones originales.
  const final = schedule(
    data,
    (id) => durations[id],
    (id) => normal.byActivity[id].variance
  );

  const rows: CrashRow[] = data.activities.map((a) => {
    const c = crashById[a.id];
    const tn = normal.byActivity[a.id].expected;
    const tc = c ? c.crashTime : tn;
    return {
      id: a.id,
      name: a.name,
      predecessors: a.predecessors,
      normalTime: tn,
      crashTime: tc,
      maxReduction: Math.max(0, tn - tc),
      normalCost: c?.normalCost ?? 0,
      crashCost: c?.crashCost ?? 0,
      costPerDay: sById[a.id],
      crashedTime: durations[a.id],
    };
  });

  return {
    byActivity: final.byActivity,
    durationById: durations,
    duration: final.duration,
    criticalPath: final.criticalPath,
    totalCost,
    normalTotalCost: normalCost,
    rows,
    schedules,
    normalDuration,
  };
}
