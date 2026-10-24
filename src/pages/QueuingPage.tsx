/** QueuingPage — teoría de colas (M/M/1): sistema, métricas, Pn y mejora. */
import { PageRenderer } from './PageRenderer';
import { useQueuing } from '../state/QueuingContext';

export function QueuingPage() {
  const { data } = useQueuing();
  return (
    <PageRenderer
      page="queuing"
      exportMeta={{ company: data.meta.company, documentTitle: data.meta.title }}
    />
  );
}
