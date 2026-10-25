/**
 * PertProject.tsx — datos del proyecto de ejemplo PanDía (sección 3).
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';

/** Elige la clase de "pill" según el tipo de dato (real / hipotético). */
function pillClass(type: string): string {
  return type.startsWith('REAL') ? 'pill pill--info' : 'pill pill--assumption';
}

export function PertProject() {
  const { data } = usePert();

  return (
    <Card
      title="El proyecto de ejemplo: PanDía"
      subtitle="Todo lo de esta tabla es inventado, salvo lo que tiene fuente"
      badge="Sección 3"
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>Dato</th>
            <th>Contenido</th>
            <th>Tipo</th>
          </tr>
        </thead>
        <tbody>
          {data.projectFacts.map((f) => (
            <tr key={f.label}>
              <td>
                <strong>{f.label}</strong>
              </td>
              <td style={{ textAlign: 'left' }}>{f.content}</td>
              <td>
                <span className={pillClass(f.type)}>{f.type}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
