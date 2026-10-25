import { useEffect, useId, useState, type InputHTMLAttributes } from 'react';
import { parseUserNumber } from '../utils/calculator';
interface NumericInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> { value?: number; onValue: (value: string) => void; money?: boolean; integer?: boolean }
export function NumericInput({ value, onValue, money = false, integer = false, id, 'aria-label': ariaLabel, ...props }: NumericInputProps) {
  const autoId = useId();
  const [focused, setFocused] = useState(false);
  const [draft, setDraft] = useState(value === undefined ? '' : String(value));
  useEffect(() => { if (!focused) setDraft(value === undefined || (!money && value === 0) ? '' : String(value)); }, [value, focused, money]);
  const number = parseUserNumber(draft);
  const invalid = draft !== '' && (!Number.isFinite(number) || number < 0 || number > (money ? 1_000_000 : 1_000_000) || (integer && !Number.isInteger(number)) || (money && !/^\d+(?:[.,]\d{0,2})?$/.test(draft)));
  const fieldId = id ?? autoId;
  return <span className="numeric-control"><input {...props} id={fieldId} aria-label={ariaLabel} type="text" inputMode={integer ? 'numeric' : 'decimal'} autoComplete="off" value={draft} aria-invalid={invalid || props['aria-invalid'] || undefined} aria-describedby={invalid ? `${fieldId}-error` : props['aria-describedby']} onFocus={() => setFocused(true)} onBlur={() => setFocused(false)} onChange={event => { setDraft(event.target.value); onValue(event.target.value); }}/>{invalid && <span id={`${fieldId}-error`} className="field-error">{integer ? 'Usa una cantidad entera.' : money ? 'Usa un precio válido con hasta 2 decimales.' : 'Ingresa un número válido.'}</span>}</span>;
}
