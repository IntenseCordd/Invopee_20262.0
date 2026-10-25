/**
 * PertReferences.tsx — referencias bibliográficas (sección 12).
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';

export function PertReferences() {
  const { data } = usePert();

  return (
    <Card
      title="Referencias"
      subtitle="Todas las páginas web se consultaron el 25 de octubre de 2026"
      badge="Sección 12"
    >
      <ol style={{ textAlign: 'left', lineHeight: 1.8, paddingLeft: 24, listStyle: 'none' }}>
        {data.references.map((r) => (
          <li key={r.id} style={{ marginBottom: 8 }}>
            <strong>{r.id}</strong> {r.text}{' '}
            {r.url && (
              <a href={r.url} target="_blank" rel="noreferrer">
                {r.url}
              </a>
            )}
          </li>
        ))}
      </ol>
    </Card>
  );
}
