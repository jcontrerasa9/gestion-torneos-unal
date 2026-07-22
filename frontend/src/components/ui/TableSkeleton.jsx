export function TableSkeleton({ rows = 6 }) {
  return (
    <div className="table-wrap" aria-hidden="true">
      <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--line)' }}>
        <span className="skeleton" style={{ width: 180 }} />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <span className="skeleton skeleton--md" />
          <span className="skeleton" style={{ flex: 1 }} />
          <span className="skeleton skeleton--sm" />
          <span className="skeleton skeleton--sm" />
        </div>
      ))}
    </div>
  )
}

export function CardsSkeleton({ count = 4 }) {
  return (
    <div className="match-cards" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card" style={{ padding: 20 }}>
          <span className="skeleton skeleton--md" style={{ marginBottom: 12 }} />
          <span className="skeleton skeleton--lg" style={{ marginBottom: 10 }} />
          <span className="skeleton skeleton--sm" />
        </div>
      ))}
    </div>
  )
}
