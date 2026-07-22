import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { XIcon } from '../icons'

export default function Modal({ open, title, onClose, footer, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    document.body.style.overflow = 'hidden'
    const focusable = dialogRef.current?.querySelector(
      'input, select, textarea, button:not([disabled])',
    )
    focusable?.focus()
    return () => {
      document.body.style.overflow = ''
      previous?.focus?.()
    }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKeyDown(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={dialogRef}
      >
        <div className="modal__head">
          <h2 className="modal__title">{title}</h2>
          <button
            type="button"
            className="icon-btn"
            onClick={onClose}
            aria-label="Cerrar"
          >
            <XIcon />
          </button>
        </div>
        <div className="modal__body">{children}</div>
        {footer && <div className="modal__foot">{footer}</div>}
      </div>
    </div>,
    document.body,
  )
}
