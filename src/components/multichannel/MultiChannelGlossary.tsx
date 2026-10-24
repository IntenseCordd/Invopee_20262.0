/**
 * MultiChannelGlossary.tsx — glosario de términos de CircleCI con analogía del
 * restaurante, para entender el sistema antes de aplicar el modelo M/M/5.
 */
import { Card } from '../common/Card';

interface Term {
  term: string;
  what: string;
  analogy: string;
}

const TERMS: Term[] = [
  {
    term: 'Pipeline',
    what: 'Unidad de trabajo de más alto nivel: abarca la configuración del proyecto e incluye los workflows. Se dispara al subir un cambio.',
    analogy: 'El pedido completo de un cliente, desde que lo hace hasta que sale servido.',
  },
  {
    term: 'Workflow',
    what: 'Parte del pipeline que coordina los jobs: define cuáles se ejecutan y en qué orden.',
    analogy: 'El plan de la cocina que dice qué estaciones intervienen y en qué orden.',
  },
  {
    term: 'Job',
    what: 'Colección de steps. Unidad configurable más pequeña: define el entorno y los pasos (compilar, probar…).',
    analogy: 'Una estación de la cocina, con su propio equipo e instrucciones.',
  },
  {
    term: 'Step (paso)',
    what: 'Comando ejecutable dentro de un job. Todo job incluye al menos el checkout del código.',
    analogy: 'Cada instrucción de la receta (cortar, sazonar, hornear).',
  },
  {
    term: 'Task (tarea)',
    what: 'Una sola ejecución de un job. Con paralelismo, cada ejecución cuenta como una tarea.',
    analogy: 'Si una estación se duplica para ir más rápido, cada copia es una tarea.',
  },
  {
    term: 'Runner',
    what: 'Máquina que ejecuta los jobs. En este modelo, cada runner es un servidor (canal).',
    analogy: 'Un cocinero con su estación: atiende un trabajo a la vez.',
  },
  {
    term: 'Concurrencia',
    what: 'Número de tareas en ejecución al mismo tiempo. En el plan Free, el límite de runners propios es 5.',
    analogy: 'Cuántos cocineros trabajan a la vez. Con 5, el sexto pedido espera.',
  },
  {
    term: 'Cola',
    what: 'Trabajos que esperan a que un runner quede libre.',
    analogy: 'La fila de comandas pendientes.',
  },
  {
    term: 'Run (ejecución)',
    what: 'Cada ejecución de un pipeline (workflow). Es el “cliente” del sistema de colas.',
    analogy: 'Cada pedido que llega a la cocina.',
  },
];

export function MultiChannelGlossary() {
  return (
    <Card
      title="Glosario: ¿qué es cada cosa?"
      subtitle="Términos de CircleCI con una analogía de restaurante"
      badge="Parte 0"
    >
      <p className="muted" style={{ marginTop: 0 }}>
        Imagina un restaurante. Cada vez que un cliente hace un pedido (alguien
        sube código), la cocina prepara varios platos en distintas estaciones.
        Los cocineros son limitados; si todos están ocupados, los pedidos
        esperan en una fila. La jerarquía en CircleCI es:{' '}
        <strong>pipeline → workflows → jobs → steps</strong>.
      </p>

      <table className="data-table">
        <thead>
          <tr>
            <th>Término</th>
            <th>Qué es</th>
            <th>Analogía del restaurante</th>
          </tr>
        </thead>
        <tbody>
          {TERMS.map((t) => (
            <tr key={t.term}>
              <td>
                <strong>{t.term}</strong>
              </td>
              <td style={{ textAlign: 'left' }}>{t.what}</td>
              <td style={{ textAlign: 'left' }}>{t.analogy}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted mt-16" style={{ marginBottom: 0 }}>
        <strong>Simplificación del modelo:</strong> cada run se trata como un
        solo cliente que ocupa un canal durante 11 min 2 s en promedio (el dato
        que entrega el reporte), aunque un workflow pueda tener varios jobs.
      </p>
    </Card>
  );
}
