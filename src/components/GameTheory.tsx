/**
 * GameTheory.tsx — juego de suma cero Innowise vs. competidor.
 * Tarifas del competidor, supuestos de ocupación, matriz de ventaja esperada,
 * cálculo por celda y punto de silla.
 */
import { useState } from 'react';
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { fmt, fmtInt, fmtPct } from '../utils/format';

export function GameTheory() {
  const { data, results } = useProblem();
  const gt = results.gameTheory;
  const cfg = data.gameTheory;
  const strategies = cfg.strategies;
  const [sel, setSel] = useState<{ r: number; c: number }>({ r: 0, c: 0 });

  const detail = gt.cells[sel.r][sel.c];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Card
        title={`Teoría de juegos · ${cfg.player1Name} vs. ${cfg.player2Name}`}
        subtitle="Juego de suma cero: el pago es la ventaja de ingresos del jugador 1 sobre el 2."
        badge="Competencia"
      >
        <p className="muted" style={{ marginTop: 0, fontSize: 13.5 }}>
          Ambas empresas eligen de qué vive su equipo: <strong>IA</strong>{' '}
          (proyectos por resultados) o <strong>SA</strong> (staff augmentation
          por hora). Como los clientes son limitados, lo que gana una lo pierde
          la otra.
        </p>
      </Card>

      {/* Tarifas del competidor */}
      <Card
        title="Tarifas del competidor"
        subtitle={`${cfg.player2Name} = ${cfg.player1Name} × razón de tarifas`}
        badge="Derivación"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Estrategia / estado</th>
              <th>{cfg.player1Name} (USD/h)</th>
              <th>Razón</th>
              <th>{cfg.player2Name} (USD/h)</th>
            </tr>
          </thead>
          <tbody>
            {strategies.map((s) =>
              data.states.map((st) => (
                <tr key={`${s.id}-${st.id}`}>
                  <td>
                    {s.id} · {st.id}
                  </td>
                  <td>{fmt(cfg.tariffs[s.id][st.id], 2)}</td>
                  <td>{fmt(cfg.tariffRatio, 4)}</td>
                  <td>{fmt(gt.competitorTariffs[s.id][st.id], 2)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'Necesitamos las tarifas del competidor para comparar ingresos. Se estiman a partir de la razón entre los puntos medios de las bandas de tarifas publicadas.',
              how: (
                <Formula>
                  <FLine>{cfg.player1Name}: banda $50–$99/h → medio (50+99)/2 = 74.5</FLine>
                  <FLine>{cfg.player2Name}: banda $25–$49/h → medio (25+49)/2 = 37</FLine>
                  <FLine>
                    Razón = 37 / 74.5 ≈ <FResult>{fmt(cfg.tariffRatio, 4)}</FResult>
                  </FLine>
                  <FLine>
                    Tarifa competidor = Tarifa {cfg.player1Name} × {fmt(cfg.tariffRatio, 4)}
                  </FLine>
                </Formula>
              ),
              meaning:
                'El competidor cobra aproximadamente la mitad por hora. Esa proporción se aplica a cada tarifa para estimar sus ingresos en cada escenario.',
            }}
          />
        </div>
      </Card>

      {/* Supuestos de ocupación */}
      <Card
        title="Supuestos de ocupación"
        subtitle="El mercado prefiere IA en Boom y SA en Estancamiento."
        badge="Supuestos del modelo"
      >
        <div className="grid-3">
          <div className="stat">
            <div className="stat__label">Ambas coinciden con el mercado</div>
            <div className="stat__value">{fmtPct(cfg.occupancy.matchedShared, 1)}</div>
            <div className="stat__hint">Se reparten la demanda</div>
          </div>
          <div className="stat">
            <div className="stat__label">Solo esta empresa coincide</div>
            <div className="stat__value">{fmtPct(cfg.occupancy.matchedSolo, 0)}</div>
            <div className="stat__hint">Capta más demanda</div>
          </div>
          <div className="stat">
            <div className="stat__label">No coincide con el mercado</div>
            <div className="stat__value">{fmtPct(cfg.occupancy.unmatched, 1)}</div>
            <div className="stat__hint">Ocupación mínima</div>
          </div>
        </div>
        <div className="note mt-16">
          <strong>Nota:</strong> estos porcentajes de ocupación son{' '}
          <em>supuestos</em> del modelo para representar cómo se reparte la
          demanda según lo que pide el mercado.
        </div>
      </Card>

      {/* Matriz del juego */}
      <Card
        title="Matriz del juego (ventaja esperada)"
        subtitle="Selecciona una celda para ver su cálculo. La celda de silla se resalta."
        badge="Resultado"
      >
        <table className="payoff-table">
          <thead>
            <tr>
              <th></th>
              <th colSpan={strategies.length} style={{ color: 'var(--text-soft)' }}>
                {cfg.player2Name}
              </th>
            </tr>
            <tr>
              <th></th>
              {strategies.map((s) => (
                <th key={s.id}>{s.id}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {strategies.map((rowS, r) => (
              <tr key={rowS.id}>
                <th className="row-head">
                  {cfg.player1Name}
                  <div className="muted" style={{ fontWeight: 400 }}>
                    {rowS.id}
                  </div>
                </th>
                {strategies.map((_colS, c) => {
                  const isSaddle =
                    gt.saddle?.rowIndex === r && gt.saddle?.colIndex === c;
                  const isSel = sel.r === r && sel.c === c;
                  return (
                    <td key={c} style={{ padding: 0 }}>
                      <div
                        className={`payoff-cell${isSel ? ' selected' : ''}${
                          isSaddle ? ' best' : ''
                        }`}
                        onClick={() => setSel({ r, c })}
                      >
                        <div className="payoff-cell__value">
                          {fmt(gt.matrix[r][c], 2)}
                        </div>
                        <div className="payoff-cell__unit">
                          {isSaddle ? 'punto de silla' : 'M USD'}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Detalle de celda */}
        <div
          style={{
            marginTop: 16,
            border: '1px solid var(--border)',
            borderRadius: 10,
            padding: 16,
            background: 'var(--surface-2)',
          }}
        >
          <div style={{ fontWeight: 600, marginBottom: 8 }}>
            {cfg.player1Name} {detail.rowStrategy} vs. {cfg.player2Name}{' '}
            {detail.colStrategy}
          </div>
          <Formula>
            {detail.byState.map((b) => {
              const state = data.states.find((s) => s.id === b.stateId)!;
              return (
                <FLine key={b.stateId}>
                  {state.shortName}: {fmtInt(results.totalHours)}×
                  {fmt(b.p1Occupancy, 3)}×tarifa → {cfg.player1Name}{' '}
                  {fmt(b.p1Revenue, 2)} − {cfg.player2Name}{' '}
                  {fmt(b.p2Revenue, 2)} = <FResult>{fmt(b.advantage, 2)}</FResult>
                </FLine>
              );
            })}
            <FLine>
              Ventaja esperada ={' '}
              {detail.byState
                .map((b, j) => `${data.states[j].probability.toFixed(2)}×${fmt(b.advantage, 2)}`)
                .join(' + ')}{' '}
              = <FResult>{fmt(detail.expectedAdvantage, 2)} M</FResult>
            </FLine>
          </Formula>
        </div>
      </Card>

      {/* Punto de silla */}
      <Card
        title="Punto de silla"
        subtitle="Estrategia estable: ninguno gana desviándose unilateralmente."
        badge="Equilibrio"
      >
        <div className="grid-2">
          <div className="stat">
            <div className="stat__label">Maximin (filas)</div>
            <div className="stat__value">{fmt(gt.maximin.value, 2)}</div>
            <div className="stat__hint">
              Mejor de los mínimos por fila:{' '}
              {gt.rowMins.map((m) => fmt(m, 2)).join(', ')}
            </div>
          </div>
          <div className="stat">
            <div className="stat__label">Minimax (columnas)</div>
            <div className="stat__value">{fmt(gt.minimax.value, 2)}</div>
            <div className="stat__hint">
              Menor de los máximos por columna:{' '}
              {gt.colMaxs.map((m) => fmt(m, 2)).join(', ')}
            </div>
          </div>
        </div>

        {gt.saddle ? (
          <div className="pill pill--good mt-16">
            Punto de silla en (
            {strategies[gt.saddle.rowIndex].id},{' '}
            {strategies[gt.saddle.colIndex].id}) · valor {fmt(gt.maximin.value, 2)}M
          </div>
        ) : (
          <div className="note mt-16">
            No hay punto de silla puro (Maximin ≠ Minimax): el juego requeriría
            estrategias mixtas.
          </div>
        )}

        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'El punto de silla identifica una estrategia estable en un juego competitivo: la mejor respuesta de cada empresa dada la del rival.',
              how: (
                <Formula>
                  <FLine>Maximin = max(mín. de cada fila) = {fmt(gt.maximin.value, 2)}</FLine>
                  <FLine>Minimax = mín(máx. de cada columna) = {fmt(gt.minimax.value, 2)}</FLine>
                  <FLine>
                    {gt.saddle
                      ? `Maximin = Minimax = ${fmt(gt.maximin.value, 2)} → hay silla`
                      : 'Maximin ≠ Minimax → no hay silla pura'}
                  </FLine>
                </Formula>
              ),
              meaning: gt.saddle
                ? `Ambas empresas eligen ${strategies[gt.saddle.rowIndex].id}. Es un equilibrio: a ninguna le conviene cambiar sola. La ventaja esperada de ${cfg.player1Name} es ${fmt(
                    gt.maximin.value,
                    2
                  )}M.`
                : 'Sin punto de silla, la solución óptima implica mezclar estrategias con ciertas probabilidades.',
            }}
          />
        </div>
      </Card>
    </div>
  );
}
