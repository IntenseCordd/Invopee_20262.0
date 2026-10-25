/**
 * PertGlossary.tsx — glosario de términos de gestión de proyectos (sección 11).
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';

export function PertGlossary() {
  const { data } = usePert();

  return (
    <Card title="Glosario" subtitle="Términos clave de gestión de proyectos" badge="Sección 11">
      <table className="data-table">
        <thead>
          <tr>
            <th>Palabra</th>
            <th>Qué significa</th>
          </tr>
        </thead>
        <tbody>
          {data.glossary.map((g) => (
            <tr key={g.term}>
              <td>
                <strong>{g.term}</strong>
              </td>
              <td style={{ textAlign: 'left' }}>{g.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  );
}
