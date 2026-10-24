/**
 * MultiChannelProbabilities.tsx — tabla de probabilidades Pn del sistema M/M/s.
 *   P(n = k) = aᵏ/k! · P0            (k < s)
 *   P(n = k) = aᵏ/(s!·s^(k−s)) · P0  (k ≥ s)
 *   P(n ≤ k) acumulada     P(n > k) = 1 − P(n ≤ k)
 */
import { useMultiChannel } from '../../state/MultiChannelContext';
import { Card } from '../common/Card';
import { HintButtons } from '../common/HintButtons';
import { Formula, FLine } from '../common/Formula';
import { fmt } from '../../utils/format';

export function MultiChannelProbabilities() {
  const { data, results } = useMultiChannel();
  const { main, pn } = results;

  if (!main.stable || pn.length === 0) {
    return (
      <Card title="Probabilidades Pₙ" badge="M/M/5">
        <div className="note">No aplican: el sistema es inestable (λ ≥ s·μ).</div>
      </Card>
    );
  }

  return (
    <Card
      title="Probabilidades Pₙ"
      subtitle={`Distribución del número de runs en el sistema (s = ${data.servers})`}
      badge="M/M/5"
    >
      <table className="data-table">
        <thead>
          <tr>
            <th>k</th>
            <th>P(n = k)</th>
            <th>P(n ≤ k) acumulada</th>
            <th>P(n &gt; k)</th>
          </tr>
        </thead>
        <tbody>
          {pn.map((row) => (
            <tr key={row.k}>
              <td>
                <strong>{row.k}</strong>
              </td>
              <td>{fmt(row.pEq, 4)}</td>
              <td>{fmt(row.pLe, 4)}</td>
              <td>{fmt(row.pGt, 4)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <p className="muted mt-16" style={{ marginBottom: 0 }}>
        Lo más probable es que haya 1 o 2 runs en el sistema. Que haya{' '}
        {data.servers} o más runs —es decir, que se forme fila— tiene
        probabilidad {fmt(main.pw, 4)}, que coincide con Pw: confirma que Pw es
        la probabilidad de encontrar todos los canales ocupados.
      </p>

      <div className="mt-16">
        <HintButtons
          hints={{
            how: (
              <Formula>
                <FLine>a = {fmt(main.a, 4)}; s = {data.servers}; P₀ = {fmt(main.p0, 4)}</FLine>
                <FLine>P(n = k) = aᵏ/k! · P₀ (para k &lt; s)</FLine>
                <FLine>P(n = k) = aᵏ/(s!·s^(k−s)) · P₀ (para k ≥ s)</FLine>
                <FLine>P(n &gt; k) = 1 − P(n ≤ k)</FLine>
              </Formula>
            ),
            meaning:
              'P(n = k) es la probabilidad de encontrar exactamente k runs; la acumulada suma hasta k y P(n > k) es su complemento.',
          }}
        />
      </div>
    </Card>
  );
}
