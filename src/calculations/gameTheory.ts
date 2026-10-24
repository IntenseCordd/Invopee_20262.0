/**
 * gameTheory.ts
 * -----------------------------------------------------------------------------
 * Juego de suma cero entre el jugador 1 (Innowise) y el jugador 2 (competidor).
 * El pago es la VENTAJA de ingresos esperada del jugador 1 sobre el jugador 2.
 */

import type {
  ProblemData,
  GameTheoryResult,
  GameCellDetail,
} from '../types/problemTypes';
import { calculateTotalHours } from './payoffCalculations';

/**
 * firmOccupancy
 * Determina la ocupación de una empresa según su estrategia, la del rival y la
 * preferencia del mercado en ese estado (supuestos del modelo).
 *   - Ofrece lo que el mercado quiere y el rival también  -> matchedShared (0.71)
 *   - Ofrece lo que el mercado quiere y el rival NO        -> matchedSolo   (0.75)
 *   - NO ofrece lo que el mercado quiere                   -> unmatched     (0.664)
 */
export function firmOccupancy(
  data: ProblemData,
  firmStrategy: string,
  rivalStrategy: string,
  stateId: string
): number {
  const { occupancy, marketPreference } = data.gameTheory;
  const preferred = marketPreference[stateId];
  if (firmStrategy === preferred) {
    return rivalStrategy === preferred
      ? occupancy.matchedShared
      : occupancy.matchedSolo;
  }
  return occupancy.unmatched;
}

/**
 * competitorTariffs
 * Tarifas del competidor = tarifa del jugador 1 × razón de tarifas.
 * Fórmula:  Tarifa_comp(strategy, state) = Tarifa_p1(strategy, state) × ratio
 */
export function competitorTariffs(
  data: ProblemData
): Record<string, Record<string, number>> {
  const { tariffs, tariffRatio } = data.gameTheory;
  const out: Record<string, Record<string, number>> = {};
  for (const strat of data.gameTheory.strategies) {
    out[strat.id] = {};
    for (const state of data.states) {
      out[strat.id][state.id] = tariffs[strat.id][state.id] * tariffRatio;
    }
  }
  return out;
}

/**
 * calculateGameTheory
 * Entrada: modelo del problema.
 * Fórmula por celda (estrategia fila = jugador 1, columna = jugador 2):
 *   Ingreso(firm, state) = Horas × Ocupación(firm) × Tarifa(firm, state) / 1e6
 *   Ventaja(state)       = Ingreso(p1) − Ingreso(p2)
 *   Ventaja esperada     = Σ_state P(state) × Ventaja(state)
 * Punto de silla: existe si  maximin (filas) = minimax (columnas).
 * Salida: detalle por celda, matriz de ventajas esperadas y punto de silla.
 */
export function calculateGameTheory(data: ProblemData): GameTheoryResult {
  const totalHours = calculateTotalHours(data);
  const compTariffs = competitorTariffs(data);
  const strategies = data.gameTheory.strategies;
  const { tariffs } = data.gameTheory;

  const cells: GameCellDetail[][] = strategies.map((rowStrat) =>
    strategies.map((colStrat) => {
      const byState = data.states.map((state) => {
        const p1Occ = firmOccupancy(data, rowStrat.id, colStrat.id, state.id);
        const p2Occ = firmOccupancy(data, colStrat.id, rowStrat.id, state.id);
        const p1Revenue =
          (totalHours * p1Occ * tariffs[rowStrat.id][state.id]) / 1_000_000;
        const p2Revenue =
          (totalHours * p2Occ * compTariffs[colStrat.id][state.id]) /
          1_000_000;
        return {
          stateId: state.id,
          p1Occupancy: p1Occ,
          p2Occupancy: p2Occ,
          p1Revenue,
          p2Revenue,
          advantage: p1Revenue - p2Revenue,
        };
      });

      const expectedAdvantage = byState.reduce(
        (acc, s, j) => acc + data.states[j].probability * s.advantage,
        0
      );

      return {
        rowStrategy: rowStrat.id,
        colStrategy: colStrat.id,
        byState,
        expectedAdvantage,
      };
    })
  );

  const matrix = cells.map((row) => row.map((c) => c.expectedAdvantage));

  // Punto de silla (juego de suma cero, jugador 1 maximiza)
  const rowMins = matrix.map((row) => Math.min(...row));
  const colMaxs = strategies.map((_c, j) =>
    Math.max(...matrix.map((row) => row[j]))
  );

  const maximinValue = Math.max(...rowMins);
  const rowIndex = rowMins.indexOf(maximinValue);
  const minimaxValue = Math.min(...colMaxs);
  const colIndex = colMaxs.indexOf(minimaxValue);

  const saddleExists = Math.abs(maximinValue - minimaxValue) < 1e-6;

  return {
    competitorTariffs: compTariffs,
    cells,
    matrix,
    rowMins,
    colMaxs,
    maximin: { value: maximinValue, rowIndex },
    minimax: { value: minimaxValue, colIndex },
    saddle: saddleExists ? { exists: true, rowIndex, colIndex } : null,
  };
}
