import { ChevronLeftIcon, ChevronRightIcon } from '../icons'

export default function Pagination({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null

  const isFirst = page <= 1
  const isLast = page >= lastPage

  return (
    <nav className="pagination" aria-label="Paginación">
      <button
        type="button"
        className="pagination__btn"
        onClick={() => onChange(page - 1)}
        disabled={isFirst}
        aria-label="Página anterior"
      >
        <ChevronLeftIcon />
      </button>
      <span className="pagination__info">
        Página <strong>{page}</strong> de {lastPage}
      </span>
      <button
        type="button"
       className="pagination__btn"
        onClick={() => onChange(page + 1)}
        disabled={isLast}
        aria-label="Página siguiente"
      >
        <ChevronRightIcon />
      </button>
    </nav>
  )
}