/**
 * PertResults.tsx — resultados del cálculo CPM (sección 6).
 * Tabla con inicio/fin temprano y lejano, holgura y marca de ruta crítica, más
 * la duración del proyecto, la ruta crítica y la desviación estándar.
 */
import { usePert } from '../../state/PertContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { Formula, FLine, FResult } from '../common/Formula';
import { fmt } from '../../utils/format';

export function PertResults() {
  const { data, results } = usePert();
  const { rows, duration, criticalPath, projectStdDev, durationToLaunch } =
    results;

  const nameById = (id: string) =>
    data.activities.find((a) => a.id === id)?.id ?? id;

  return (
    <Card
      title="Resultados del cálculo (CPM)"
      subtitle='"Temprano": lo más pronto posible; "lejano": lo más tarde sin retrasar el proyecto'
      badge="Sección 6"
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>Código</th>
            <th>Inicio temprano</th>
            <th>Fin temprano</th>
            <th>Inicio lejano</th>
            <th>Fin lejano</th>
            <th>Holgura</th>
            <th>¿Ruta crítica?</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.id}
              className={r.critical ? 'pert-row--critical' : undefined}
            >
              <td>
                <strong>{r.id}</strong>
              </td>
              <td>{fmt(r.es, 2)}</td>
              <td>{fmt(r.ef, 2)}</td>
              <td>{fmt(r.ls, 2)}</td>
              <td>{fmt(r.lf, 2)}</td>
              <td>{fmt(r.slack, 2)}</td>
              <td>
                {r.critical ? (
                  <span className="pill pill--info">Sí</span>
                ) : (
                  <span className="muted">No</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="grid-3 mt-16">
        <div className="stat stat--accent">
          <div className="stat__label">Duración esperada</div>
          <div className="stat__value">{fmt(duration, 2)} días</div>
          <div className="stat__hint">
            ≈ {fmt(duration / 5, 2)} semanas · hasta lanzamiento{' '}
            {fmt(durationToLaunch, 2)} días
          </div>
        </div>
        <div className="stat stat--good">
          <div className="stat__label">Ruta crítica</div>
          <div className="stat__value" style={{ fontSize: 16 }}>
            {criticalPath.map(nameById).join(' → ')}
          </div>
          <div className="stat__hint">
            {criticalPath.length} de {data.activities.length} actividades, sin
            margen
          </div>
        </div>
        <div className="stat">
          <div className="stat__label">Desviación estándar (σ)</div>
          <div className="stat__value">{fmt(projectStdDev, 2)} días</div>
          <div className="stat__hint">
            √(suma de varianzas de la ruta crítica)
          </div>
        </div>
      </div>

      <div className="mt-16">
        <HintButtons
          hints={{
            how: (
              <Formula>
                <FLine>Pase adelante: ES = máx(EF de predecesores); EF = ES + Tₑ</FLine>
                <FLine>Duración = máx(EF) = <FResult>{fmt(duration, 2)} días</FResult></FLine>
                <FLine>Pase atrás: LF = mín(LS de sucesores); LS = LF − Tₑ</FLine>
                <FLine>Holgura = LS − ES; crítica si holgura = 0</FLine>
                <FLine>
                  σ = √(Σ varianzas críticas) ={' '}
                  <FResult>{fmt(projectStdDev, 2)} días</FResult>
                </FLine>
              </Formula>
            ),
            meaning:
              'Las actividades con holgura 0 forman la ruta crítica: si cualquiera se atrasa, el proyecto entero se atrasa. Las de holgura positiva pueden retrasarse ese margen sin afectar la fecha final.',
          }}
        />
      </div>
    </Card>
  );
}
