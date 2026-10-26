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
import { MultiChannelGlossary } from './components/multichannel/MultiChannelGlossary';
import { MultiChannelOverview } from './components/multichannel/MultiChannelOverview';
import { MultiChannelMetrics } from './components/multichannel/MultiChannelMetrics';
import { MultiChannelProbabilities } from './components/multichannel/MultiChannelProbabilities';
import { MultiChannelComparison } from './components/multichannel/MultiChannelComparison';
import { MultiChannelReferences } from './components/multichannel/MultiChannelReferences';
import { PertSummary } from './components/pert/PertSummary';
import { PertProcess } from './components/pert/PertProcess';
import { PertProject } from './components/pert/PertProject';
import { PertActivities } from './components/pert/PertActivities';
import { PertDurations } from './components/pert/PertDurations';
import { PertResults } from './components/pert/PertResults';
import { PertNetwork } from './components/pert/PertNetwork';
import { PertGantt } from './components/pert/PertGantt';
import { PertMonitoring } from './components/pert/PertMonitoring';
import { PertTraceability } from './components/pert/PertTraceability';
import { PertGlossary } from './components/pert/PertGlossary';
import { PertReferences } from './components/pert/PertReferences';

export type PageId =
  | 'overview'
  | 'decision'
  | 'sample'
  | 'game'
  | 'queuing'
  | 'multichannel'
  | 'pert';

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
  { id: 'multichannel', label: 'Canales múltiples (M/M/5)' },
  { id: 'pert', label: 'Gestión de proyectos (PERT/CPM)' },
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
  { id: 'mc-glossary', navLabel: 'Glosario CircleCI', page: 'multichannel', presentation: false, Component: MultiChannelGlossary, description: 'Términos de CircleCI (pipeline, workflow, job, runner, concurrencia) con analogía del restaurante.' },
  { id: 'mc-system', navLabel: 'Sistema y parámetros', page: 'multichannel', presentation: true, Component: MultiChannelOverview, description: 'Modelo M/M/5: elementos del sistema, datos de entrada y cálculo de λ total, μ, carga (a) y utilización (ρ).' },
  { id: 'mc-metrics', navLabel: 'Características (Erlang C)', page: 'multichannel', presentation: true, Component: MultiChannelMetrics, description: 'Características operativas M/M/5 con Erlang C: P0, Pw, Lq, L, Wq y W con fórmula e interpretación.' },
  { id: 'mc-prob', navLabel: 'Probabilidades Pn', page: 'multichannel', presentation: true, Component: MultiChannelProbabilities, description: 'Distribución del número de runs en el sistema: P(n=k), P(n≤k) y P(n>k).' },
  { id: 'mc-comparison', navLabel: 'Comparación de escenarios', page: 'multichannel', presentation: true, Component: MultiChannelComparison, description: 'Comparación de tres escenarios: M/M/1 sin mejora, M/M/1 con mejora y M/M/5.' },
  { id: 'mc-references', navLabel: 'Referencias', page: 'multichannel', presentation: false, Component: MultiChannelReferences, description: 'Fuentes del caso M/M/5; cada enlace abre la fuente original.' },
  { id: 'pert-summary', navLabel: 'Resumen', page: 'pert', presentation: true, Component: PertSummary, description: 'Resumen del trabajo: proyecto PanDía, duración esperada, ruta crítica e incertidumbre.' },
  { id: 'pert-process', navLabel: 'Proceso de 11 etapas', page: 'pert', presentation: false, Component: PertProcess, description: 'El proceso real de Innowise paso a paso, unido en 11 etapas.' },
  { id: 'pert-project', navLabel: 'Proyecto PanDía', page: 'pert', presentation: false, Component: PertProject, description: 'Datos del proyecto de ejemplo PanDía: alcance, presupuesto, equipo y objetivos.' },
  { id: 'pert-activities', navLabel: 'Actividades y orden (EDT)', page: 'pert', presentation: true, Component: PertActivities, description: 'Las 14 actividades (A–N), su etapa y sus precedencias.' },
  { id: 'pert-durations', navLabel: 'Duraciones (3 tiempos)', page: 'pert', presentation: true, Component: PertDurations, description: 'Estimaciones optimista, más probable y pesimista, y el tiempo esperado Tₑ.' },
  { id: 'pert-results', navLabel: 'Resultados CPM', page: 'pert', presentation: true, Component: PertResults, description: 'Resultados CPM: inicio/fin temprano y lejano, holgura, ruta crítica, duración y σ.' },
  { id: 'pert-network', navLabel: 'Grafo PERT', page: 'pert', presentation: true, Component: PertNetwork, description: 'Red del proyecto: cada actividad es un nodo con sus tiempos; la ruta crítica va resaltada.' },
  { id: 'pert-gantt', navLabel: 'Diagrama de Gantt', page: 'pert', presentation: true, Component: PertGantt, description: 'El proyecto como calendario: barras por actividad, ruta crítica, margen y fechas de lanzamiento y fin.' },
  { id: 'pert-monitoring', navLabel: 'Seguimiento', page: 'pert', presentation: false, Component: PertMonitoring, description: 'Cómo se vigilaría el proyecto comparando lo planeado con lo real.' },
  { id: 'pert-traceability', navLabel: 'Real vs inventado', page: 'pert', presentation: false, Component: PertTraceability, description: 'Trazabilidad: qué datos son reales, cuáles hipotéticos y qué limitaciones hay.' },
  { id: 'pert-glossary', navLabel: 'Glosario', page: 'pert', presentation: false, Component: PertGlossary, description: 'Términos clave de gestión de proyectos (PERT, CPM, holgura, ruta crítica…).' },
  { id: 'pert-references', navLabel: 'Referencias', page: 'pert', presentation: false, Component: PertReferences, description: 'Fuentes consultadas para el caso.' },
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
  'mc-system',
  'mc-metrics',
  'mc-prob',
  'mc-comparison',
  'pert-summary',
  'pert-activities',
  'pert-durations',
  'pert-results',
  'pert-network',
  'pert-gantt',
];

export function presentationSections(): SectionDef[] {
  return PRESENTATION_ORDER.map(
    (id) => SECTIONS.find((s) => s.id === id)!
  ).filter(Boolean);
}
