import { useId } from 'react'
import { AlertIcon } from '../icons'

export default function SelectField({
  label,
  required,
  error,
  hint,
  options = [],
  placeholder,
  className = '',
  ...selectProps
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
      <select
        id={id}
        className={`field__select ${error ? 'field__select--invalid' : ''}`.trim()}
        aria-invalid={error ? true : undefined}
        required={required}
        {...selectProps}
      >
        {placeholder !== undefined && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
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
