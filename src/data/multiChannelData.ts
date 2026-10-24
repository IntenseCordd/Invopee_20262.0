/**
 * multiChannelData.ts — datos iniciales del caso de CANALES MÚLTIPLES (M/M/5).
 *
 * Caso: sistema de ejecución de pipelines de CI con 5 runners, aproximado con
 * datos públicos de CircleCI (The 2025 State of Software Delivery) y la escala
 * de Innowise. λ por proyecto y el tiempo de servicio provienen del reporte; el
 * número de proyectos (n ≈ 89) es un supuesto (proyectos entregados ÷ años).
 */
import type { MultiChannelData } from '../types/multiChannelTypes';

export const defaultMultiChannelData: MultiChannelData = {
  meta: {
    company: 'Pipelines CI/CD · CircleCI',
    title:
      'Sistema de ejecución de pipelines de CI con canales múltiples (M/M/5)',
    context:
      'Una empresa de desarrollo dispara ejecuciones automáticas de su pipeline de CI cada vez que se sube código. Por confidencialidad se usa como aproximación CircleCI (datos públicos) y la escala de la propia Innowise. Todos los proyectos comparten una sola fila y cada ejecución la atiende el primer runner que quede libre: se modela como M/M/5.',
    source:
      'CircleCI — The 2025 State of Software Delivery (14,146,319 workflows)',
    sourceUrl:
      'https://circleci.com/landing-pages/assets/2025-state-of-software-delivery-report.pdf',
    consulted: 'Publicado en 2025; consultado el 1 de octubre de 2026',
  },
  labels: {
    customer: 'Ejecución de pipeline (run)',
    server: 'Runner (5 en paralelo)',
    rateUnit: 'runs/día',
    timeUnit: 'días',
  },
  // 2.86 ejecuciones por proyecto por día.
  lambdaPerProject: 2.86,
  // n ≈ 89 proyectos (1,600 entregados ÷ 18 años = 88.9).
  projects: 89,
  // 11 min 2 s = 11 + 2/60 minutos.
  serviceTimeMinutes: 11 + 2 / 60,
  // Límite de runners propios del plan Free de CircleCI.
  servers: 5,
  // Mejora hipotética para el escenario comparativo M/M/1: cada run dura la mitad.
  improvementFactor: 0.5,
  // Niveles k de la tabla de probabilidades (0..6, como en el informe).
  pnLevels: 6,
};
