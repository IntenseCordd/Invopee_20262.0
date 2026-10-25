/**
 * PertSummary.tsx — resumen / introducción del trabajo (sección 1) con los
 * indicadores clave calculados por el motor CPM.
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { fmt } from '../../utils/format';

export function PertSummary() {
  const { data, results } = usePert();
  const { meta } = data;

  return (
    <Card title="Resumen" subtitle={meta.title} badge="PERT · CPM">
      <div
        className="mt-16"
        style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}
      >
        <span className="pill pill--info">Proyecto: {meta.project}</span>
        <span className="pill pill--info">Empresa: {meta.company}</span>
        <span className="pill pill--assumption">Tiempo en {meta.timeUnit}</span>
      </div>

      {meta.summary.map((p, i) => (
        <p key={i} className={i === 0 ? '' : 'muted'} style={{ textAlign: 'left' }}>
          {p}
        </p>
      ))}

      <div className="grid-3 mt-16">
        <div className="stat stat--accent">
          <div className="stat__label">Duración esperada</div>
          <div className="stat__value">{fmt(results.duration, 2)} días</div>
          <div className="stat__hint">
            ≈ {fmt(results.duration / 5, 2)} semanas hábiles
          </div>
        </div>
        <div className="stat stat--good">
          <div className="stat__label">Actividades críticas</div>
          <div className="stat__value">
            {results.criticalPath.length} de {data.activities.length}
          </div>
          <div className="stat__hint">Sin margen de retraso</div>
        </div>
        <div className="stat">
          <div className="stat__label">Incertidumbre (σ)</div>
          <div className="stat__value">{fmt(results.projectStdDev, 2)} días</div>
          <div className="stat__hint">Desviación estándar del proyecto</div>
        </div>
      </div>
    </Card>
  );
}
