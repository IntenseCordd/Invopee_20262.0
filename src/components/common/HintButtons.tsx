/**
 * HintButtons.tsx
 * -----------------------------------------------------------------------------
 * Botones de "pistas" para exponer/estudiar: ¿Por qué se utiliza?,
 * ¿Cómo se obtiene? y ¿Qué significa? Cada uno abre un panel explicativo.
 * Reutilizable en cualquier sección (matriz, VE, Bayes, juegos, etc.).
 */
import { useState, type ReactNode } from 'react';

export interface Hints {
  why?: ReactNode; // ¿Por qué se utiliza?
  how?: ReactNode; // ¿Cómo se obtiene?
  meaning?: ReactNode; // ¿Qué significa?
}

const LABELS: Record<keyof Hints, string> = {
  why: '¿Por qué se utiliza?',
  how: '¿Cómo se obtiene?',
  meaning: '¿Qué significa?',
};

const PANEL_LABEL: Record<keyof Hints, string> = {
  why: 'Por qué se utiliza',
  how: 'Cómo se obtiene',
  meaning: 'Qué significa',
};

export function HintButtons({ hints }: { hints: Hints }) {
  const [open, setOpen] = useState<keyof Hints | null>(null);
  const keys = (Object.keys(LABELS) as (keyof Hints)[]).filter(
    (k) => hints[k] != null
  );
  if (keys.length === 0) return null;

  return (
    <div>
      <div className="hints">
        {keys.map((k) => (
          <button
            key={k}
            className={`hint-btn${open === k ? ' open' : ''}`}
            onClick={() => setOpen(open === k ? null : k)}
          >
            {LABELS[k]}
          </button>
        ))}
      </div>
      {open && (
        <div className="hint-panel">
          <div className="hint-panel__label">{PANEL_LABEL[open]}</div>
          {hints[open]}
        </div>
      )}
    </div>
  );
}
