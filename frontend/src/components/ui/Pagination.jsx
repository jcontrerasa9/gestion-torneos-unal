import { ChevronLeftIcon, ChevronRightIcon } from '../icons'

export default function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null
  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon />
      </button>
      <span className="pagination__info">
        {page} / {lastPage}
      </span>
      <button
        type="button"
        className="icon-btn"
        onClick={() => onChange(page + 1)}
        disabled={page >= lastPage}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  )
}
