/**
 * PertContext.tsx — estado global del módulo de GESTIÓN DE PROYECTOS (PERT/CPM).
 * Mantiene los DATOS del proyecto y expone los RESULTADOS recalculados por el
 * motor CPM. Las tres estimaciones de cada actividad son editables.
 */
import {
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import type { PertData, PertResults } from '../types/pertTypes';
import { defaultPertData } from '../data/pertData';
import { runPert } from '../calculations/pert';

type TimeField = 'optimistic' | 'mostLikely' | 'pessimistic';

interface PertContextValue {
  data: PertData;
  results: PertResults;
  /** Actualiza una de las tres estimaciones de una actividad. */
  setEstimate: (activityId: string, field: TimeField, value: number) => void;
  reset: () => void;
}

const PertContext = createContext<PertContextValue | null>(null);

export function PertProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<PertData>(() =>
    structuredClone(defaultPertData)
  );

  const results = useMemo(() => runPert(data), [data]);

  const setEstimate = useCallback(
    (activityId: string, field: TimeField, value: number) => {
      setData((prev) => ({
        ...prev,
        activities: prev.activities.map((a) =>
          a.id === activityId ? { ...a, [field]: value } : a
        ),
      }));
    },
    []
  );

  const reset = useCallback(() => {
    setData(structuredClone(defaultPertData));
  }, []);

  const value: PertContextValue = { data, results, setEstimate, reset };

  return <PertContext.Provider value={value}>{children}</PertContext.Provider>;
}

export function usePert(): PertContextValue {
  const ctx = useContext(PertContext);
  if (!ctx) throw new Error('usePert debe usarse dentro de <PertProvider>');
  return ctx;
}
