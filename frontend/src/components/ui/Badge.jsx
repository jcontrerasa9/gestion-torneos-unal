export default function Badge({ variant, withDot = false, children }) {
  const cls = ['badge', variant ? `badge--${variant}` : '']
    .filter(Boolean)
    .join(' ')
  return (
    <span className={cls}>
      {withDot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}
