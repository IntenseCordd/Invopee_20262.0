/**
 * QueuingContext.tsx — estado global del módulo de TEORÍA DE COLAS.
 * Mantiene los DATOS del modelo M/M/1 y expone los RESULTADOS recalculados.
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
  QueuingData,
  QueuingResults,
  TimeDisplayUnit,
} from '../types/queuingTypes';
import { defaultQueuingData } from '../data/queuingData';
import { runQueuing } from '../calculations/queuing';

interface QueuingContextValue {
  data: QueuingData;
  results: QueuingResults;
  setLambda: (value: number) => void;
  setServiceTimeMinutes: (value: number) => void;
  setImprovementFactor: (value: number) => void;
  setTimeUnit: (value: TimeDisplayUnit) => void;
  reset: () => void;
}

const QueuingContext = createContext<QueuingContextValue | null>(null);

export function QueuingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<QueuingData>(() =>
    structuredClone(defaultQueuingData)
  );

  const results = useMemo(() => runQueuing(data), [data]);

  const setLambda = useCallback((value: number) => {
    setData((prev) => ({ ...prev, lambda: value }));
  }, []);

  const setServiceTimeMinutes = useCallback((value: number) => {
    setData((prev) => ({ ...prev, serviceTimeMinutes: value }));
  }, []);

  const setImprovementFactor = useCallback((value: number) => {
    setData((prev) => ({ ...prev, improvementFactor: value }));
  }, []);

  const setTimeUnit = useCallback((value: TimeDisplayUnit) => {
    setData((prev) => ({
      ...prev,
      labels: { ...prev.labels, timeUnit: value },
    }));
  }, []);

  const reset = useCallback(() => {
    setData(structuredClone(defaultQueuingData));
  }, []);

  const value: QueuingContextValue = {
    data,
    results,
    setLambda,
    setServiceTimeMinutes,
    setImprovementFactor,
    setTimeUnit,
    reset,
  };

  return (
    <QueuingContext.Provider value={value}>{children}</QueuingContext.Provider>
  );
}

export function useQueuing(): QueuingContextValue {
  const ctx = useContext(QueuingContext);
  if (!ctx) throw new Error('useQueuing debe usarse dentro de <QueuingProvider>');
  return ctx;
}
