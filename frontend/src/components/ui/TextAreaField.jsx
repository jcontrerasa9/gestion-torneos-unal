export default function TextAreaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  required,
  rows = 3,
  hint,
  error,
}) {
  return (
    <div className="field">
      {label && (
        <label htmlFor={name} className="field__label">
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        className="field__input field__textarea"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        rows={rows}
      />
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}