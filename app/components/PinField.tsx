"use client";
import { useId, useState } from "react";
import { EyeIcon, EyeOffIcon } from "./icons";

/**
 * A masked 4-digit PIN entry. Kept as a single input (rather than four boxes)
 * so paste, backspace and password managers all behave normally.
 */
export default function PinField({
  label,
  value,
  onChange,
  autoFocus,
  hint,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
  hint?: string;
}) {
  const id = useId();
  const [revealed, setRevealed] = useState(false);

  return (
    <div>
      <label htmlFor={id} className="field-label">
        {label} {hint && <span className="field-hint">({hint})</span>}
      </label>
      <div style={{ position: "relative" }}>
        <input
          id={id}
          type={revealed ? "text" : "password"}
          inputMode="numeric"
          autoComplete="off"
          maxLength={4}
          required
          autoFocus={autoFocus}
          value={value}
          /* Strip anything that isn't a digit so the field can only ever hold a PIN. */
          onChange={e => onChange(e.target.value.replace(/\D/g, "").slice(0, 4))}
          className="input-field pin-input"
          placeholder="••••"
          aria-describedby={`${id}-progress`}
        />
        <button
          type="button"
          onClick={() => setRevealed(r => !r)}
          className="pin-reveal"
          aria-label={revealed ? "Hide PIN" : "Show PIN"}
          aria-pressed={revealed}
        >
          {revealed ? <EyeOffIcon size={18} /> : <EyeIcon size={18} />}
        </button>
      </div>

      {/* Fill progress doubles as the screen-reader status for this field. */}
      <div id={`${id}-progress`} className="pin-progress" role="status" aria-label={`${value.length} of 4 digits entered`}>
        {[0, 1, 2, 3].map(i => (
          <span key={i} className={`pin-pip${value.length > i ? " pin-pip-on" : ""}`} aria-hidden="true" />
        ))}
      </div>
    </div>
  );
}
