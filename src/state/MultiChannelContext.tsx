/**
 * MultiChannelContext.tsx — estado global del módulo de CANALES MÚLTIPLES.
 * Mantiene los DATOS del modelo M/M/s y expone los RESULTADOS recalculados.
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
  MultiChannelData,
  MultiChannelResults,
  TimeDisplayUnit,
} from '../types/multiChannelTypes';
import { defaultMultiChannelData } from '../data/multiChannelData';
import { runMultiChannel } from '../calculations/multiChannel';

interface MultiChannelContextValue {
  data: MultiChannelData;
  results: MultiChannelResults;
  setLambdaPerProject: (value: number) => void;
  setProjects: (value: number) => void;
  setServiceTimeMinutes: (value: number) => void;
  setServers: (value: number) => void;
  setImprovementFactor: (value: number) => void;
  setTimeUnit: (value: TimeDisplayUnit) => void;
  reset: () => void;
}

const MultiChannelContext = createContext<MultiChannelContextValue | null>(null);

export function MultiChannelProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<MultiChannelData>(() =>
    structuredClone(defaultMultiChannelData)
  );

  const results = useMemo(() => runMultiChannel(data), [data]);

  const setLambdaPerProject = useCallback((value: number) => {
    setData((prev) => ({ ...prev, lambdaPerProject: value }));
  }, []);

  const setProjects = useCallback((value: number) => {
    setData((prev) => ({ ...prev, projects: value }));
  }, []);

  const setServiceTimeMinutes = useCallback((value: number) => {
    setData((prev) => ({ ...prev, serviceTimeMinutes: value }));
  }, []);

  const setServers = useCallback((value: number) => {
    setData((prev) => ({ ...prev, servers: value }));
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
    setData(structuredClone(defaultMultiChannelData));
  }, []);

  const value: MultiChannelContextValue = {
    data,
    results,
    setLambdaPerProject,
    setProjects,
    setServiceTimeMinutes,
    setServers,
    setImprovementFactor,
    setTimeUnit,
    reset,
  };

  return (
    <MultiChannelContext.Provider value={value}>
      {children}
    </MultiChannelContext.Provider>
  );
}

export function useMultiChannel(): MultiChannelContextValue {
  const ctx = useContext(MultiChannelContext);
  if (!ctx)
    throw new Error(
      'useMultiChannel debe usarse dentro de <MultiChannelProvider>'
    );
  return ctx;
}
