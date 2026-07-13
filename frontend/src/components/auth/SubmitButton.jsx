export default function SubmitButton({ loading, children, disabled }) {
  return (
    <button type="submit" className="btn btn--primary" disabled={loading || disabled}>
      <span className="btn__content">
        {loading && <span className="btn__spinner" aria-hidden="true" />}
        {loading ? 'Un momento…' : children}
      </span>
    </button>
  )
}