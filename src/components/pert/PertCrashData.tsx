/**
 * PertCrashData.tsx — Aceleración: tiempos y costos (sección 9).
 *
 * Presenta los cuatro símbolos del método de intercambio tiempo-costo (Tn, Cn,
 * Tc, Cc) y la tabla por actividad con la reducción máxima TR = Tn − Tc y el
 * costo por día ganado S = (Cc − Cn) / TR.
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { Formula, FLine, FResult } from '../common/Formula';
import { fmt, fmtInt } from '../../utils/format';

export function PertCrashData() {
  const { data, crashed } = usePert();
  if (!crashed) return null;

  const { rows } = crashed;
  const reducible = rows.filter((r) => r.costPerDay != null);
  const cheapest = reducible.reduce((a, b) =>
    (a.costPerDay as number) <= (b.costPerDay as number) ? a : b
  );
  const dearest = reducible.reduce((a, b) =>
    (a.costPerDay as number) >= (b.costPerDay as number) ? a : b
  );
  // La actividad E sirve de ejemplo en el informe de aceleración [9].
  const sample = rows.find((r) => r.id === 'E') ?? reducible[0];

  return (
    <Card
      title="Aceleración: tiempos y costos"
      subtitle="Cuánto se puede acortar cada actividad y cuánto cuesta ganar un día"
      badge="Sección 9"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        A veces el cliente quiere el producto antes de lo planeado. Se puede
        lograr pagando más: horas extra, más personas, más equipos. Es como ir en
        taxi en vez de en bus: llegas antes, pero pagas más. Cada actividad tiene
        una forma <strong>normal</strong> de hacerse (más lenta y barata) y una{' '}
        <strong>urgente</strong> (más rápida y cara). Todos los costos y los
        tiempos urgentes son <strong>hipotéticos</strong> [9].
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Símbolo</th>
            <th>Qué es</th>
            <th>En palabras simples</th>
            <th>Ejemplo (actividad {sample.id})</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Tn</strong></td>
            <td style={{ textAlign: 'left' }}>Tiempo normal esperado</td>
            <td style={{ textAlign: 'left' }} className="muted">Lo que tarda de la forma normal</td>
            <td>{fmt(sample.normalTime, 2)} días</td>
          </tr>
          <tr>
            <td><strong>Cn</strong></td>
            <td style={{ textAlign: 'left' }}>Costo asociado con Tn</td>
            <td style={{ textAlign: 'left' }} className="muted">Lo que cuesta hacerla así</td>
            <td>USD {fmtInt(sample.normalCost)}</td>
          </tr>
          <tr>
            <td><strong>Tc</strong></td>
            <td style={{ textAlign: 'left' }}>Tiempo reducido: el menor posible</td>
            <td style={{ textAlign: 'left' }} className="muted">Lo más rápido, con el máximo de recursos</td>
            <td>{fmt(sample.crashTime, 2)} días</td>
          </tr>
          <tr>
            <td><strong>Cc</strong></td>
            <td style={{ textAlign: 'left' }}>Costo asociado al menor tiempo</td>
            <td style={{ textAlign: 'left' }} className="muted">Lo que cuesta hacerla de forma urgente</td>
            <td>USD {fmtInt(sample.crashCost)}</td>
          </tr>
        </tbody>
      </table>

      <p className="note mt-16" style={{ textAlign: 'left' }}>
        <strong>Dos reglas del método [9].</strong> Primera: hay un límite, una
        actividad no se puede acortar más allá de su Tc por mucho dinero que se
        invierta. Segunda: solo sirve acortar la ruta crítica; recortar una
        actividad con holgura no adelanta ni un día la entrega.
      </p>

      <table className="data-table mt-16">
        <thead>
          <tr>
            <th>Cód.</th>
            <th>Actividad</th>
            <th>Espera a</th>
            <th>Tn</th>
            <th>Tc</th>
            <th>TR</th>
            <th>Cn (USD)</th>
            <th>Cc (USD)</th>
            <th>S (USD por día)</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className={r.costPerDay == null ? 'muted' : undefined}>
              <td><strong>{r.id}</strong></td>
              <td style={{ textAlign: 'left' }}>{r.name}</td>
              <td>{r.predecessors.length ? r.predecessors.join(', ') : '—'}</td>
              <td>{fmt(r.normalTime, 2)}</td>
              <td>{fmt(r.crashTime, 2)}</td>
              <td>{fmt(r.maxReduction, 2)}</td>
              <td>{fmtInt(r.normalCost)}</td>
              <td>{fmtInt(r.crashCost)}</td>
              <td>
                {r.costPerDay == null ? (
                  <span className="muted">—</span>
                ) : (
                  fmt(r.costPerDay, 1)
                )}
              </td>
            </tr>
          ))}
          <tr>
            <td colSpan={6}><strong>Total</strong></td>
            <td><strong>{fmtInt(crashed.normalTotalCost)}</strong></td>
            <td colSpan={2} />
          </tr>
        </tbody>
      </table>

      <div className="grid-3 mt-16">
        <div className="stat stat--good">
          <div className="stat__label">Día más barato de ganar</div>
          <div className="stat__value">
            {cheapest.id} · USD {fmt(cheapest.costPerDay as number, 0)}
          </div>
          <div className="stat__hint">por cada día que se adelanta</div>
        </div>
        <div className="stat">
          <div className="stat__label">Día más caro de ganar</div>
          <div className="stat__value">
            {dearest.id} · USD {fmt(dearest.costPerDay as number, 0)}
          </div>
          <div className="stat__hint">por cada día que se adelanta</div>
        </div>
        <div className="stat stat--accent">
          <div className="stat__label">Actividades que no se aceleran</div>
          <div className="stat__value">
            {rows.filter((r) => r.costPerDay == null).map((r) => r.id).join(', ') || '—'}
          </div>
          <div className="stat__hint">
            su TR es 0: no hay tiempo que ganar
          </div>
        </div>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'Antes de decidir qué acortar hay que saber dos cosas de cada actividad: cuánto se puede acortar como máximo y cuánto cuesta cada día que se gana. Esta tabla responde ambas y es la entrada del método: con ella se elige, en cada paso, la actividad crítica más barata.',
            how: (
              <Formula>
                <FLine>Paso 1 · Reducción máxima: TR = Tn − Tc</FLine>
                <FLine>
                  Ejemplo {sample.id}: {fmt(sample.normalTime, 2)} −{' '}
                  {fmt(sample.crashTime, 2)} ={' '}
                  <FResult>{fmt(sample.maxReduction, 2)} días</FResult>
                </FLine>
                <FLine>Paso 2 · Costo de un día: S = (Cc − Cn) ÷ (Tn − Tc)</FLine>
                <FLine>
                  Ejemplo {sample.id}: ({fmtInt(sample.crashCost)} −{' '}
                  {fmtInt(sample.normalCost)}) ÷ {fmt(sample.maxReduction, 2)} ={' '}
                  <FResult>USD {fmt(sample.costPerDay as number, 0)} por día</FResult>
                </FLine>
              </Formula>
            ),
            meaning: (
              <div style={{ textAlign: 'left', lineHeight: 1.7 }}>
                <p style={{ marginTop: 0 }}>
                  <strong>TR</strong> dice cuánto margen de aceleración queda en
                  cada actividad y <strong>S</strong> dice su precio. Una S baja
                  es una ganga: {cheapest.id} adelanta un día por solo USD{' '}
                  {fmt(cheapest.costPerDay as number, 0)}. Una S alta, como la de{' '}
                  {dearest.id} (USD {fmt(dearest.costPerDay as number, 0)}), solo
                  conviene cuando ya no queda nada más barato en la ruta crítica.
                </p>
                <p style={{ marginBottom: 0 }}>
                  Las actividades sin S no se aceleran:{' '}
                  {rows.filter((r) => r.costPerDay == null).map((r) => r.id).join(' y ')}{' '}
                  tienen Tn = Tc, así que no hay días que ganar. En el caso de{' '}
                  {data.activities[data.activities.length - 1].id} se trata del
                  periodo de soporte, que normalmente se fija por contrato [9].
                </p>
              </div>
            ),
          }}
        />
      </div>
    </Card>
  );
}
