export default function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  required,
  disabled,
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
      <select
        id={name}
        name={name}
        className="field__select"
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        {placeholder && (
          <option value="" disabled hidden>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}