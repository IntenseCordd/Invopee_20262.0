/**
 * MultiChannelReferences.tsx — referencias bibliográficas del caso M/M/5.
 * Cada enlace abre la fuente original en una pestaña nueva.
 */
import { useMultiChannel } from '../../state/MultiChannelContext';
import { Card } from '../common/Card';

export function MultiChannelReferences() {
  const { data } = useMultiChannel();

  return (
    <Card
      title="Referencias"
      subtitle="Fuentes del caso; cada enlace abre la fuente original"
      badge="Bibliografía"
    >
      <ol
        style={{
          textAlign: 'left',
          lineHeight: 1.8,
          paddingLeft: 24,
          listStyle: 'none',
        }}
      >
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
