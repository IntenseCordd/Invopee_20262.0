/**
 * ProblemContext.tsx
 * -----------------------------------------------------------------------------
 * Estado global de la aplicación: mantiene el MODELO de datos y expone los
 * RESULTADOS derivados (recalculados automáticamente por el motor). Es la única
 * conexión entre DATOS y COMPONENTES: cualquier cambio de dato -> recálculo.
 */

import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  ProblemData,
  ProblemResults,
  ValidationIssue,
} from '../types/problemTypes';
import { defaultProblemData } from '../data/problemData';
import { runEngine } from '../calculations/engine';
import { validateProblemData } from '../calculations/validation';

type PayoffField = 'value' | 'tariff' | 'occupancy';

interface ProblemContextValue {
  data: ProblemData;
  results: ProblemResults;
  issues: ValidationIssue[];
  /** Actualiza un campo escalar de primer nivel (engineers, hoursPerEngineer). */
  setScalar: (field: 'engineers' | 'hoursPerEngineer', value: number) => void;
  /** Fija P(S1) = p y ajusta P(S2) = 1 - p (caso de dos estados). */
  setPrimaryProbability: (p: number) => void;
  /** Actualiza un campo de una celda de la matriz de pagos. */
  setPayoff: (
    altIndex: number,
    stateIndex: number,
    field: PayoffField,
    value: number
  ) => void;
  /** Actualiza sensibilidad o especificidad del estudio. */
  setMarketStudy: (field: 'sensitivity' | 'specificity', value: number) => void;
  /** Restablece el modelo a los datos iniciales del caso. */
  reset: () => void;
  /** Reemplaza el modelo completo (para futuras integraciones/imports). */
  replaceData: (next: ProblemData) => void;
}

const ProblemContext = createContext<ProblemContextValue | null>(null);

export function ProblemProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<ProblemData>(() =>
    structuredClone(defaultProblemData)
  );

  const results = useMemo(() => runEngine(data), [data]);
  const issues = useMemo(() => validateProblemData(data), [data]);

  const setScalar = useCallback(
    (field: 'engineers' | 'hoursPerEngineer', value: number) => {
      setData((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  const setPrimaryProbability = useCallback((p: number) => {
    setData((prev) => {
      const states = prev.states.map((s, i) => {
        if (i === 0) return { ...s, probability: p };
        if (i === 1) return { ...s, probability: 1 - p };
        return s;
      });
      return { ...prev, states };
    });
  }, []);

  const setPayoff = useCallback(
    (
      altIndex: number,
      stateIndex: number,
      field: PayoffField,
      value: number
    ) => {
      setData((prev) => {
        const payoffs = prev.payoffs.map((row, i) =>
          row.map((cell, j) =>
            i === altIndex && j === stateIndex
              ? { ...cell, [field]: value }
              : cell
          )
        );
        return { ...prev, payoffs };
      });
    },
    []
  );

  const setMarketStudy = useCallback(
    (field: 'sensitivity' | 'specificity', value: number) => {
      setData((prev) => ({
        ...prev,
        marketStudy: { ...prev.marketStudy, [field]: value },
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setData(structuredClone(defaultProblemData));
  }, []);

  const replaceData = useCallback((next: ProblemData) => setData(next), []);

  const value: ProblemContextValue = {
    data,
    results,
    issues,
    setScalar,
    setPrimaryProbability,
    setPayoff,
    setMarketStudy,
    reset,
    replaceData,
  };

  return (
    <ProblemContext.Provider value={value}>{children}</ProblemContext.Provider>
  );
}

/** Hook de acceso al contexto del problema. */
export function useProblem(): ProblemContextValue {
  const ctx = useContext(ProblemContext);
  if (!ctx) throw new Error('useProblem debe usarse dentro de <ProblemProvider>');
  return ctx;
}
