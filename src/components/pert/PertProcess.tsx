/**
 * PertProcess.tsx — el proceso real de Innowise en 11 etapas (sección 2).
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';

export function PertProcess() {
  const { data } = usePert();

  return (
    <Card
      title="El proceso real de Innowise, paso a paso"
      subtitle="Unión de las descripciones de 8 etapas [1] y 10 pasos [2] en 11 etapas"
      badge="Sección 2"
    >
      <p className="muted" style={{ marginTop: 0, textAlign: 'left' }}>
        La columna “Lo que se hace” es información real; “Si se saltara” es una
        explicación propia para entender por qué existe la etapa.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Etapa</th>
            <th>Lo que se hace (real)</th>
            <th>Si se saltara</th>
            <th>Fuente</th>
          </tr>
        </thead>
        <tbody>
          {data.stages.map((s) => (
            <tr key={s.n}>
              <td>
                <strong>
                  {s.n}. {s.name}
                </strong>
              </td>
              <td style={{ textAlign: 'left' }}>{s.does}</td>
              <td style={{ textAlign: 'left' }}>{s.ifSkipped}</td>
              <td className="muted">{s.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
