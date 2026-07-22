import { useId } from 'react'
import { AlertIcon } from '../icons'

export default function TextAreaField({
  label,
  required,
  error,
  hint,
  className = '',
  ...props
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
      <textarea
        id={id}
        className={`field__textarea ${error ? 'field__textarea--invalid' : ''}`.trim()}
        aria-invalid={error ? true : undefined}
        required={required}
        {...props}
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
