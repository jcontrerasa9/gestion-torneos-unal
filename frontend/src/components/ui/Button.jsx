/**
 * Botón del sistema de diseño.
 * variant: primary | ghost | danger | subtle
 */
export default function Button({
  variant = 'primary',
  size,
  busy = false,
  icon: Icon,
  children,
  className = '',
  ...props
}) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size === 'sm' ? 'btn--sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button className={cls} disabled={busy || props.disabled} {...props}>
      {busy ? (
        <span className="btn__spinner" aria-hidden="true" />
      ) : (
        Icon && <Icon aria-hidden="true" />
      )}
      {children}
    </button>
  )
}
