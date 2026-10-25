/**
 * PertTraceability.tsx — qué es real, qué es inventado y qué falta (sección 10).
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';

export function PertTraceability() {
  const { data } = usePert();
  const { real, hypothetical, limitations } = data.traceability;

  return (
    <Card
      title="Qué es real, qué es inventado y qué falta"
      subtitle="Trazabilidad de los datos usados en el trabajo"
      badge="Sección 10"
    >
      <div className="grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <h4 style={{ fontSize: 14, marginBottom: 8 }}>
            <span className="pill pill--info">Datos reales (con fuente)</span>
          </h4>
          <ul style={{ textAlign: 'left', lineHeight: 1.7, paddingLeft: 20 }}>
            {real.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4 style={{ fontSize: 14, marginBottom: 8 }}>
            <span className="pill pill--assumption">Datos hipotéticos</span>
          </h4>
          <ul style={{ textAlign: 'left', lineHeight: 1.7, paddingLeft: 20 }}>
            {hypothetical.map((h, i) => (
              <li key={i}>{h}</li>
            ))}
          </ul>
        </div>
      </div>

      <hr className="divider" />

      <h4 style={{ fontSize: 14, marginBottom: 8 }}>Limitaciones y pendientes</h4>
      <ul style={{ textAlign: 'left', lineHeight: 1.7, paddingLeft: 20 }}>
        {limitations.map((l, i) => (
          <li key={i}>{l}</li>
        ))}
      </ul>
    </Card>
  );
}
