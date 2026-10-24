/**
 * NumberField.tsx — campo numérico controlado con etiqueta, unidad y validación.
 */
interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  invalid?: boolean;
  error?: string;
}

export function NumberField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  invalid,
  error,
}: NumberFieldProps) {
  return (
    <div className="field">
      <label>
        {label} {unit && <span className="field__unit">({unit})</span>}
      </label>
      <input
        type="number"
        value={Number.isFinite(value) ? value : ''}
        min={min}
        max={max}
        step={step ?? 'any'}
        className={invalid ? 'invalid' : undefined}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? NaN : Number(v));
        }}
      />
      {error && <span className="field__error">{error}</span>}
    </div>
  );
}
