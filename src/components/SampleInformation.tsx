/**
 * SampleInformation.tsx — valor de la información muestral, eficiencia y
 * análisis de sensibilidad sens/espec.
 */
import { useProblem } from '../state/ProblemContext';
import { Card } from './common/Card';
import { HintButtons } from './common/HintButtons';
import { Formula, FLine, FResult } from './common/Formula';
import { BarChart } from './charts/BarChart';
import { fmt, fmtM, fmtPct } from '../utils/format';

export function SampleInformation() {
  const { data, results } = useProblem();
  const si = results.sampleInformation;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
      <Card
        title="Valor de la información muestral"
        subtitle="¿Cuánto mejora la decisión al usar el estudio de mercado?"
        badge="VFOD / IVEIM"
      >
        {/* Decisión óptima por dictamen */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {si.perSignal.map((s, k) => (
            <span key={k} className="pill pill--info">
              {k === 0 ? 'I1 favorable' : 'I2 desfavorable'} → elegir{' '}
              {s.bestAltId} (VE {fmt(s.bestValue, 1)}M)
            </span>
          ))}
        </div>

        <div className="grid-3">
          <div className="stat">
            <div className="stat__label">VE sin información</div>
            <div className="stat__value">{fmtM(si.baselineBest, 1)}</div>
          </div>
          <div className="stat">
            <div className="stat__label">VFOD · con información muestral</div>
            <div className="stat__value">{fmtM(si.vfod, 1)}</div>
          </div>
          <div className="stat stat--good">
            <div className="stat__label">IVEIM · incremento</div>
            <div className="stat__value">{fmtM(si.iveim, 1)}</div>
          </div>
        </div>

        <div className="mt-16">
          <BarChart
            height={220}
            bars={[
              { label: 'Info. perfecta', value: si.veip, color: 'var(--s1)', sublabel: 'VEIP' },
              { label: 'Info. muestral', value: si.iveim, color: 'var(--a2)', sublabel: 'IVEIM' },
            ]}
            valueFormat={(v) => `${fmt(v, 1)}M`}
          />
        </div>

        <div className="stat stat--accent mt-16">
          <div className="stat__label">Eficiencia del estudio = IVEIM / VEIP</div>
          <div className="stat__value">{fmtPct(si.efficiency, 1)}</div>
          <div className="stat__hint">
            El estudio captura {fmtPct(si.efficiency, 1)} del valor máximo teórico
            de la información perfecta.
          </div>
        </div>

        <div className="mt-16">
          <HintButtons
            hints={{
              why: 'Un estudio real es imperfecto. Este análisis mide cuánto valor aporta realmente y lo compara con el techo teórico (información perfecta).',
              how: (
                <Formula>
                  <FLine>VFOD = Σ_k P(Ik) × max_i VE(Ai|Ik)</FLine>
                  <FLine>
                    ={' '}
                    {si.perSignal
                      .map((s) => `${fmt(s.marginal, 2)}×${fmt(s.bestValue, 2)}`)
                      .join(' + ')}{' '}
                    = <FResult>{fmt(si.vfod, 2)} M</FResult>
                  </FLine>
                  <FLine>
                    IVEIM = {fmt(si.vfod, 1)} − {fmt(si.baselineBest, 1)} ={' '}
                    <FResult>{fmt(si.iveim, 2)} M</FResult>
                  </FLine>
                  <FLine>
                    Eficiencia = {fmt(si.iveim, 1)} / {fmt(si.veip, 1)} ={' '}
                    <FResult>{fmtPct(si.efficiency, 1)}</FResult>
                  </FLine>
                </Formula>
              ),
              meaning: `El estudio vale ${fmtM(
                si.iveim,
                1
              )} (menos que los ${fmtM(
                si.veip,
                0
              )} de la información perfecta). Como aporta una parte relevante del valor, vale la pena considerarlo.`,
            }}
          />
        </div>
      </Card>

      {/* Sensibilidad */}
      <Card
        title="Análisis de sensibilidad del estudio"
        subtitle="Cómo cambian VFOD, IVEIM y eficiencia con distintas precisiones."
        badge="Sensibilidad"
      >
        <table className="data-table">
          <thead>
            <tr>
              <th>Sensibilidad / Especificidad</th>
              <th>VE con muestra</th>
              <th>IVEIM</th>
              <th>Eficiencia</th>
            </tr>
          </thead>
          <tbody>
            {results.sensitivity.map((row, k) => {
              const isCurrent =
                Math.abs(row.sensitivity - data.marketStudy.sensitivity) <
                  1e-6 &&
                Math.abs(row.specificity - data.marketStudy.specificity) < 1e-6;
              return (
                <tr
                  key={k}
                  style={
                    isCurrent ? { background: 'var(--primary-soft)' } : undefined
                  }
                >
                  <td>
                    {fmtPct(row.sensitivity, 0)} / {fmtPct(row.specificity, 0)}
                    {isCurrent && ' · actual'}
                  </td>
                  <td>{fmt(row.vfod, 1)}</td>
                  <td>{fmt(row.iveim, 1)}</td>
                  <td>{fmtPct(row.efficiency, 1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="muted mt-8" style={{ fontSize: 12.5 }}>
          A mayor precisión del estudio, mayor eficiencia. Por debajo de cierta
          precisión el estudio no cambia la decisión y su valor sería cero.
        </p>
      </Card>
    </div>
  );
}
