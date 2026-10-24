/**
 * QueuingProbabilities.tsx — tabla de probabilidades Pn del sistema actual.
 *   P(n = k) = (1 − ρ)·ρᵏ      P(n > k) = ρ^(k+1)
 */
import { useQueuing } from '../../state/QueuingContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { Formula, FLine } from '../common/Formula';
import { fmt } from '../../utils/format';

export function QueuingProbabilities() {
  const { results } = useQueuing();
  const { metrics, pn } = results.base;

  if (!metrics.stable) {
    return (
      <Card title="Probabilidades Pₙ" badge="Actual">
        <div className="note">
          No aplican: el sistema es inestable (λ ≥ μ).
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Probabilidades Pₙ"
      subtitle="Probabilidad de encontrar exactamente k o más de k clientes en el sistema"
      badge="Actual"
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>k</th>
            <th>P(n = k) = (1 − ρ)·ρᵏ</th>
            <th>P(n &gt; k) = ρ^(k+1)</th>
          </tr>
        </thead>
        <tbody>
          {pn.map((row) => (
            <tr key={row.k}>
              <td>
                <strong>{row.k}</strong>
              </td>
              <td>{fmt(row.pEq, 6)}</td>
              <td>{fmt(row.pGt, 6)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted mt-16" style={{ marginBottom: 0 }}>
        Las probabilidades caen muy rápido al aumentar k: el sistema casi
        siempre está vacío o con un solo cliente.
      </p>

      <div className="mt-16">
        <HintButtons
          hints={{
            how: (
              <Formula>
                <FLine>ρ = λ/μ = {fmt(metrics.rho, 6)}</FLine>
                <FLine>P(n = k) = (1 − ρ)·ρᵏ</FLine>
                <FLine>P(n &gt; k) = ρ^(k+1)</FLine>
              </Formula>
            ),
            meaning:
              'P(n = k) es la probabilidad de encontrar exactamente k clientes; P(n > k) acumula la probabilidad de encontrar más de k.',
          }}
        />
      </div>
    </Card>
  );
}
