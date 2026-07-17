import { useState } from 'react'
import {
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from '../icons'

const icons = {
  email: MailIcon,
  password: LockIcon,
  text: UserIcon,
  name: UserIcon,
  phone: PhoneIcon,
}

export default function FormField({
  label,
  name,
  type = 'text',
  value,
  onChange,
  placeholder,
  autoComplete,
  required,
  iconType,
  hint,
  error,
}) {
  const Icon = icons[iconType ?? type]
  const [show, setShow] = useState(false)
  const isPassword = type === 'password'
  const inputType = isPassword && show ? 'text' : type

  return (
    <div className="field">
      {label && (
        <label htmlFor={name} className="field__label">
          {label}
        </label>
      )}
      <div className="field__input-wrap">
        {Icon && <Icon className="field__icon" />}
        <input
          id={name}
          name={name}
          type={inputType}
          className={
            Icon ? 'field__input' : 'field__input field__input--plain'
          }
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required={required}
        />
        {isPassword && (
          <button
            type="button"
            className="field__toggle"
            onClick={() => setShow((s) => !s)}
            aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            tabIndex={-1}
          >
            {show ? <EyeOffIcon /> : <EyeIcon />}
          </button>
        )}
      </div>
      {hint && !error && <span className="field__hint">{hint}</span>}
      {error && <span className="field__error">{error}</span>}
    </div>
  )
}