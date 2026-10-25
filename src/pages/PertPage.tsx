/** PertPage — gestión de proyectos (PERT/CPM): resumen, proceso, proyecto,
 * actividades, duraciones, resultados, seguimiento, trazabilidad, glosario y
 * referencias del caso PanDía. */
import { PageRenderer } from './PageRenderer';
import { usePert } from '../state/PertContext';

export function PertPage() {
  const { data } = usePert();
  return (
    <PageRenderer
      page="pert"
      exportMeta={{
        company: data.meta.company,
        documentTitle: data.meta.title,
      }}
    />
  );
}
