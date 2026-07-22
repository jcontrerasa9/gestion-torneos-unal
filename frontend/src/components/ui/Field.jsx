import { useId } from 'react'
import { AlertIcon } from '../icons'

/**
 * Campo de formulario con label, error por campo (422) e hint.
 */
export default function Field({
  label,
  required,
  error,
  hint,
  className = '',
  ...inputProps
}) {
  const id = useId()
  return (
    <div className={`field ${className}`.trim()}>
      {label && (
        <label className="field__label" htmlFor={id}>
          {label}
          {required && <span className="field__label-required" aria-hidden="true">*</span>}
        </label>
      )}
      <input
        id={id}
        className={`field__input ${error ? 'field__input--invalid' : ''}`.trim()}
        aria-invalid={error ? true : undefined}
        required={required}
        {...inputProps}
      />
      {error ? (
        <span className="field__error" role="alert">
          <AlertIcon width={13} height={13} />
          {error}
        </span>
      ) : (
        hint && <span className="field__hint">{hint}</span>
      )}
    </div>
  )
}
