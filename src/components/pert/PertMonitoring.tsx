/**
 * PertMonitoring.tsx — cómo se vigilaría el proyecto (sección 9).
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';

export function PertMonitoring() {
  const { data } = usePert();

  return (
    <Card
      title="Cómo se vigilaría el proyecto"
      subtitle="Controlar un proyecto es comparar lo planeado con lo que de verdad pasó"
      badge="Sección 9"
    >
      <ul style={{ textAlign: 'left', lineHeight: 1.7, paddingLeft: 20 }}>
        {data.monitoring.map((m, i) => (
          <li key={i}>{m}</li>
        ))}
      </ul>
    </Card>
  );
}
