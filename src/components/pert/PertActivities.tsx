/**
 * PertActivities.tsx — lista de actividades y su orden (EDT, sección 4).
 * Muestra las 14 actividades (A–N), su etapa y de qué actividades depende cada
 * una (precedencia).
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';

export function PertActivities() {
  const { data } = usePert();

  return (
    <Card
      title="Las actividades y su orden (EDT)"
      subtitle="14 actividades (A–N) repartidas en las 11 etapas, con sus precedencias"
      badge="Sección 4"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        Algunas actividades no pueden empezar hasta que otras terminen, igual
        que no puedes pintar una pared antes de levantarla: a eso se le llama
        precedencia. El orden entre etapas es real [1][2]; el paralelismo de A
        con B y de G con H es hipotético.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Qué se hace</th>
            <th>Etapa</th>
            <th>Debe esperar a</th>
          </tr>
        </thead>
        <tbody>
          {data.activities.map((a) => (
            <tr key={a.id}>
              <td>
                <strong>{a.id}</strong>
              </td>
              <td style={{ textAlign: 'left' }}>{a.name}</td>
              <td className="muted">{a.stage}</td>
              <td>
                {a.predecessors.length ? a.predecessors.join(', ') : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-16">
        <HintButtons
          hints={{
            why: 'La estructura de desglose del trabajo (EDT) parte el proyecto en tareas pequeñas y ordenadas, como el índice de un libro. Las precedencias definen la red que luego se usa para hallar la ruta crítica.',
            meaning:
              'A y B pueden hacerse a la vez (ninguna espera a la otra); G y H también. I solo empieza cuando terminan G y H.',
          }}
        />
      </div>
    </Card>
  );
}
