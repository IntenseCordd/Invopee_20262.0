/**
 * PertDurations.tsx — las tres estimaciones de tiempo y el tiempo esperado
 * (sección 5). Las estimaciones (optimista, más probable, pesimista) son
 * editables y el tiempo esperado Tₑ se recalcula en vivo.
 *   Tₑ = (o + 4·m + p) / 6
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { Formula, FLine, FResult } from '../common/Formula';
import { fmt } from '../../utils/format';

type TimeField = 'optimistic' | 'mostLikely' | 'pessimistic';

export function PertDurations() {
  const { data, results, setEstimate } = usePert();

  const onChange = (id: string, field: TimeField, raw: string) => {
    const v = raw === '' ? NaN : Number(raw);
    setEstimate(id, field, v);
  };

  return (
    <Card
      title="¿Cuánto tarda cada actividad?"
      subtitle="Tres estimaciones por actividad; el tiempo esperado da más peso al caso normal"
      badge="Sección 5 · editable"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        Optimista (todo sale perfecto), más probable (un día normal) y pesimista
        (todo sale mal). Edita cualquier valor y la tabla de resultados y la ruta
        crítica se recalculan. Todas las cifras están en días hábiles.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Optimista</th>
            <th>Más probable</th>
            <th>Pesimista</th>
            <th>Esperado</th>
            <th>Respaldo</th>
          </tr>
        </thead>
        <tbody>
          {data.activities.map((a) => {
            const te = results.byActivity[a.id]?.expected ?? NaN;
            return (
              <tr key={a.id}>
                <td>
                  <strong>{a.id}</strong>
                </td>
                {(['optimistic', 'mostLikely', 'pessimistic'] as TimeField[]).map(
                  (field) => (
                    <td key={field}>
                      <input
                        type="number"
                        className="pert-input"
                        min={0}
                        step={1}
                        value={Number.isFinite(a[field]) ? a[field] : ''}
                        onChange={(e) => onChange(a.id, field, e.target.value)}
                        style={{ width: 64 }}
                      />
                    </td>
                  )
                )}
                <td>
                  <strong>{fmt(te, 2)}</strong>
                </td>
                <td className="muted" style={{ textAlign: 'left' }}>
                  {a.support}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="mt-16">
        <HintButtons
          hints={{
            how: (
              <Formula>
                <FLine>Tₑ = (optimista + 4 × más probable + pesimista) ÷ 6</FLine>
                <FLine>
                  Ejemplo A: (2 + 4×3 + 4) ÷ 6 = 18 ÷ 6 ={' '}
                  <FResult>3 días</FResult>
                </FLine>
                <FLine>Varianza = ((pesimista − optimista) ÷ 6)²</FLine>
              </Formula>
            ),
            why: 'Con tres estimaciones se captura la incertidumbre de cada tarea. El tiempo esperado es un promedio ponderado que da más peso al caso más probable.',
          }}
        />
      </div>
    </Card>
  );
}
