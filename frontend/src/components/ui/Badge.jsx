export default function Badge({ variant = 'neutral', children, withDot = false }) {
  return (
    <span className={`badge badge--${variant}`}>
      {withDot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  )
}