/** MultiChannelPage — canales múltiples (M/M/5): glosario, sistema, métricas,
 * Pn y comparación de escenarios. */
import { PageRenderer } from './PageRenderer';
import { useMultiChannel } from '../state/MultiChannelContext';

export function MultiChannelPage() {
  const { data } = useMultiChannel();
  return (
    <PageRenderer
      page="multichannel"
      exportMeta={{ company: data.meta.company, documentTitle: data.meta.title }}
    />
  );
}
