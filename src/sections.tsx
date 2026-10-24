/**
 * sections.tsx — REGISTRO CENTRAL de secciones.
 * Define, en un solo lugar, todas las secciones de análisis y su ubicación en
 * el menú (por página) y en el modo presentación. Agregar una sección nueva es
 * tan simple como añadir una entrada aquí (extensibilidad sin tocar el resto).
 */
import type { ComponentType } from 'react';
import { ProblemOverview } from './components/ProblemOverview';
import { DataEditor } from './components/DataEditor';
import { PayoffMatrix } from './components/PayoffMatrix';
import { ProbabilityView } from './components/ProbabilityView';
import { ExpectedValue } from './components/ExpectedValue';
import { DecisionTree } from './components/DecisionTree';
import { IndifferenceAnalysis } from './components/IndifferenceAnalysis';
import { RobustnessAnalysis } from './components/RobustnessAnalysis';
import { PerfectInformation } from './components/PerfectInformation';
import { DecisionMethods } from './components/DecisionMethods';
import { BayesAnalysis } from './components/BayesAnalysis';
import { SampleInformation } from './components/SampleInformation';
import { GameTheory } from './components/GameTheory';
import { ResultSummary } from './components/ResultSummary';
import { QueuingOverview } from './components/queuing/QueuingOverview';
import { QueuingMetrics } from './components/queuing/QueuingMetrics';
import { QueuingProbabilities } from './components/queuing/QueuingProbabilities';
import { QueuingImprovement } from './components/queuing/QueuingImprovement';

export type PageId = 'overview' | 'decision' | 'sample' | 'game' | 'queuing';

export interface SectionDef {
  id: string;
  navLabel: string;
  page: PageId;
  /** Descripción breve para el encabezado del PDF exportado. */
  description?: string;
  /** Se muestra como diapositiva en el modo presentación. */
  presentation: boolean;
  Component: ComponentType;
}

export const PAGES: { id: PageId; label: string }[] = [
  { id: 'overview', label: 'Planteamiento' },
  { id: 'decision', label: 'Análisis de decisión' },
  { id: 'sample', label: 'Información muestral' },
  { id: 'game', label: 'Teoría de juegos' },
  { id: 'queuing', label: 'Teoría de colas' },
];

export const SECTIONS: SectionDef[] = [
  { id: 'overview', navLabel: 'Problema y datos', page: 'overview', presentation: true, Component: ProblemOverview, description: 'Planteamiento del caso, alternativas, estados de la naturaleza y datos base del problema.' },
  { id: 'editor', navLabel: 'Modificar datos', page: 'overview', presentation: false, Component: DataEditor, description: 'Parámetros editables del modelo: número de ingenieros, horas y probabilidades.' },
  { id: 'payoff', navLabel: 'Matriz de pagos', page: 'overview', presentation: true, Component: PayoffMatrix, description: 'Ganancia de cada alternativa frente a cada estado de la naturaleza.' },
  { id: 'probability', navLabel: 'Probabilidades', page: 'decision', presentation: true, Component: ProbabilityView, description: 'Probabilidades a priori de los estados de la naturaleza usadas en el análisis.' },
  { id: 'expected', navLabel: 'Valor esperado', page: 'decision', presentation: true, Component: ExpectedValue, description: 'Valor monetario esperado (VE) de cada alternativa y selección de la óptima.' },
  { id: 'tree', navLabel: 'Árbol de decisión', page: 'decision', presentation: true, Component: DecisionTree, description: 'Representación en árbol de decisiones, nodos de azar y valores esperados.' },
  { id: 'indifference', navLabel: 'Punto de indiferencia', page: 'decision', presentation: false, Component: IndifferenceAnalysis, description: 'Probabilidad en la que dos alternativas igualan su valor esperado.' },
  { id: 'robustness', navLabel: 'Robustez', page: 'decision', presentation: false, Component: RobustnessAnalysis, description: 'Sensibilidad de la decisión óptima ante cambios en las probabilidades.' },
  { id: 'perfect', navLabel: 'Información perfecta', page: 'decision', presentation: true, Component: PerfectInformation, description: 'Valor esperado con información perfecta (VEIP) y su ganancia respecto al VE.' },
  { id: 'methods', navLabel: 'Maximin · Maximax · PEM', page: 'decision', presentation: false, Component: DecisionMethods, description: 'Criterios de decisión bajo incertidumbre: maximin, maximax y pesimismo-optimismo.' },
  { id: 'bayes', navLabel: 'Bayes', page: 'sample', presentation: false, Component: BayesAnalysis, description: 'Revisión de probabilidades a posteriori con el teorema de Bayes.' },
  { id: 'sample', navLabel: 'Valor de la información', page: 'sample', presentation: true, Component: SampleInformation, description: 'Valor esperado de la información muestral (VEIM) y eficiencia del estudio.' },
  { id: 'game', navLabel: 'Juego y punto de silla', page: 'game', presentation: true, Component: GameTheory, description: 'Análisis de teoría de juegos: estrategias, punto de silla y valor del juego.' },
  { id: 'result', navLabel: 'Resultado', page: 'overview', presentation: true, Component: ResultSummary, description: 'Conclusión y recomendación final derivada de todos los análisis.' },
  { id: 'queuing-system', navLabel: 'Sistema y parámetros', page: 'queuing', presentation: true, Component: QueuingOverview, description: 'Modelo M/M/1: elementos del sistema, datos de entrada y cálculo de λ y μ.' },
  { id: 'queuing-metrics', navLabel: 'Características operativas', page: 'queuing', presentation: true, Component: QueuingMetrics, description: 'Métricas M/M/1: P0, Lq, L, Wq, W y Pw con fórmula e interpretación.' },
  { id: 'queuing-prob', navLabel: 'Probabilidades Pn', page: 'queuing', presentation: true, Component: QueuingProbabilities, description: 'Distribución del número de clientes en el sistema: P(n=k) y P(n>k).' },
  { id: 'queuing-improve', navLabel: 'Mejora y comparación', page: 'queuing', presentation: true, Component: QueuingImprovement, description: 'Escenario de mejora (μ mayor) y comparación antes vs. después.' },
];

/** Orden explícito de las diapositivas del modo presentación. */
export const PRESENTATION_ORDER: string[] = [
  'overview',
  'payoff',
  'probability',
  'expected',
  'tree',
  'perfect',
  'sample',
  'game',
  'result',
  'queuing-system',
  'queuing-metrics',
  'queuing-prob',
  'queuing-improve',
];

export function presentationSections(): SectionDef[] {
  return PRESENTATION_ORDER.map(
    (id) => SECTIONS.find((s) => s.id === id)!
  ).filter(Boolean);
}
