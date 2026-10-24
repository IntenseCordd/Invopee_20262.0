/**
 * SplitBar.tsx — barra horizontal segmentada (p. ej. P(S1) vs P(S2)).
 */
export interface Segment {
  label: string;
  value: number; // fracción 0..1
  color: string;
}

export function SplitBar({ segments }: { segments: Segment[] }) {
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  return (
    <div>
      <div
        style={{
          display: 'flex',
          height: 34,
          borderRadius: 8,
          overflow: 'hidden',
          border: '1px solid var(--border)',
        }}
      >
        {segments.map((s, i) => {
          const pct = (s.value / total) * 100;
          return (
            <div
              key={i}
              style={{
                width: `${pct}%`,
                background: s.color,
                color: '#fff',
                fontSize: 12,
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: pct > 0 ? 2 : 0,
              }}
            >
              {pct >= 12 ? `${(s.value * 100).toFixed(0)}%` : ''}
            </div>
          );
        })}
      </div>
      <div className="legend" style={{ marginTop: 8 }}>
        {segments.map((s, i) => (
          <span key={i}>
            <i style={{ background: s.color, height: 10, width: 10, borderRadius: 3 }} />
            {s.label} · {(s.value * 100).toFixed(0)}%
          </span>
        ))}
      </div>
    </div>
  );
}
