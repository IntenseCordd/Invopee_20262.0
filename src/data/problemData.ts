/**
 * problemData.ts
 * -----------------------------------------------------------------------------
 * MODELO CENTRAL DE DATOS (única fuente de entrada).
 *
 * Todos los componentes leen desde aquí (a través del contexto de estado) y
 * NINGÚN componente vuelve a codificar estos números. Cambiar un dato aquí (o
 * mediante el Editor de Datos) recalcula toda la aplicación.
 *
 * Los valores iniciales corresponden al caso Innowise Group del documento.
 *
 * NOTA SOBRE UNA DIFERENCIA DEL DOCUMENTO (declarada, no corregida):
 *  - El pago A1/S2 se deriva como 1.000.000 × 0.664 × 60 = 39.84 M USD, que el
 *    documento redondea a 40 M para el análisis de decisión. Se conserva el
 *    dato indicado en el enunciado: value = 40 (fuente de verdad del análisis),
 *    y se guardan tariff=60 y occupancy=0.664 solo para EXPLICAR la derivación.
 */

import type { ProblemData } from '../types/problemTypes';

export const defaultProblemData: ProblemData = {
  meta: {
    company: 'Innowise Group',
    title: 'Asignación de 500 ingenieros: IA vs. Staff Augmentation',
    question:
      '¿Cómo debería asignar Innowise sus 500 ingenieros ante la incertidumbre sobre el comportamiento futuro de la demanda de IA?',
    context:
      'Innowise Group debe decidir cómo distribuir el esfuerzo de un ala de 500 ingenieros para el próximo año fiscal, ante la incertidumbre de la demanda europea de software.',
  },

  engineers: 500,
  hoursPerEngineer: 2000,

  alternatives: [
    {
      id: 'A1',
      name: 'Enfoque en IA y Big Data',
      shortName: 'IA',
      description:
        'Reasignar plantilla a proyectos avanzados de IA y analítica, con alta inversión inicial en capacitación.',
    },
    {
      id: 'A2',
      name: 'Staff Augmentation',
      shortName: 'SA',
      description:
        'Mantener el modelo de equipos dedicados (.NET, Java, QA): menor margen por hora, pero muy estable.',
    },
  ],

  states: [
    {
      id: 'S1',
      name: 'Boom de IA',
      shortName: 'Boom',
      description:
        'Crecimiento acelerado: los clientes europeos escalan la IA y pagan tarifas premium.',
      probability: 0.4,
    },
    {
      id: 'S2',
      name: 'Estancamiento',
      shortName: 'Estanc.',
      description:
        'Los clientes congelan presupuestos de innovación y contratan solo desarrollo tradicional.',
      probability: 0.6,
    },
  ],

  // payoffs[alternativa][estado] — millones de USD
  payoffs: [
    // A1: Enfoque IA
    [
      { value: 95, tariff: 95, occupancy: 1.0 }, // A1/S1
      { value: 40, tariff: 60, occupancy: 0.664 }, // A1/S2 (deriva 39.84 ≈ 40)
    ],
    // A2: Staff Augmentation
    [
      { value: 75, tariff: 75, occupancy: 1.0 }, // A2/S1
      { value: 70, tariff: 70, occupancy: 1.0 }, // A2/S2
    ],
  ],

  marketStudy: {
    sensitivity: 0.8, // P(I1|S1)
    specificity: 0.9, // P(I2|S2)
    signalLabels: ['Dictamen favorable (I1)', 'Dictamen desfavorable (I2)'],
  },

  gameTheory: {
    player1Name: 'Innowise',
    player2Name: 'Itransition',
    tariffRatio: 0.4966, // 37 / 74.5
    strategies: [
      { id: 'IA', name: 'IA y Big Data' },
      { id: 'SA', name: 'Staff Augmentation' },
    ],
    // Tarifas del jugador 1 (Innowise) en USD/h por estrategia y estado.
    tariffs: {
      IA: { S1: 95, S2: 60 },
      SA: { S1: 75, S2: 70 },
    },
    // El mercado prefiere IA en un boom (S1) y SA en un estancamiento (S2).
    marketPreference: { S1: 'IA', S2: 'SA' },
    occupancy: {
      matchedShared: 0.71, // ambas ofrecen lo que el mercado quiere
      matchedSolo: 0.75, // solo esta empresa coincide
      unmatched: 0.664, // esta empresa no coincide
    },
  },

  settings: {
    payoffDecimals: 2,
    currency: 'USD',
    unit: 'M',
  },
};

/** Filas base para el análisis de sensibilidad del estudio (sens/espec). */
export const defaultSensitivityScenarios: Array<{
  sensitivity: number;
  specificity: number;
}> = [
  { sensitivity: 0.7, specificity: 0.8 },
  { sensitivity: 0.75, specificity: 0.85 },
  { sensitivity: 0.8, specificity: 0.9 },
  { sensitivity: 0.9, specificity: 0.95 },
];

/** Puntos de P(S1) usados en la tabla/gráfica de robustez. */
export const defaultRobustnessPoints: number[] = [0.33, 0.4, 0.55, 0.6];
