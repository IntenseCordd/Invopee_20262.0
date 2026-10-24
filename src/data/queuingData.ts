/**
 * queuingData.ts — datos iniciales del caso de TEORÍA DE COLAS.
 *
 * Caso: sistema de ejecución de pipelines de CI, aproximado con datos públicos
 * de CircleCI (The 2025 State of Software Delivery). λ y el tiempo de servicio
 * provienen del reporte; el factor de mejora es un supuesto hipotético.
 */
import type { QueuingData } from '../types/queuingTypes';

export const defaultQueuingData: QueuingData = {
  meta: {
    company: 'Pipelines CI/CD · CircleCI',
    title: 'Sistema de ejecución de pipelines de CI (M/M/1)',
    context:
      'Una empresa de desarrollo dispara ejecuciones automáticas de su pipeline de CI cada vez que se sube código. Por confidencialidad se usa como aproximación un competidor con datos públicos y un sistema muy parecido: CircleCI.',
    source: 'CircleCI — The 2025 State of Software Delivery (14,146,319 workflows)',
    sourceUrl:
      'https://circleci.com/landing-pages/assets/2025-state-of-software-delivery-report.pdf',
    consulted: 'Publicado en 2025; consultado el 1 de octubre de 2026',
  },
  labels: {
    customer: 'Ejecución de pipeline (run)',
    server: 'Runner (1 solo)',
    rateUnit: 'runs/día',
    timeUnit: 'días',
  },
  // 2.86 ejecuciones por proyecto por día.
  lambda: 2.86,
  // 11 min 2 s = 11 + 2/60 minutos.
  serviceTimeMinutes: 11 + 2 / 60,
  // Mejora hipotética: cada run dura la mitad.
  improvementFactor: 0.5,
};
