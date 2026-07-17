import { useEffect, useRef } from 'react'
import { XIcon } from '../icons'

export default function Modal({ open, title, onClose, children, footer }) {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (open && !el.open) el.showModal()
    if (!open && el.open) el.close()
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  return (
    <dialog ref={ref} className="modal" aria-label={title}>
      <div className="modal__head">
        <h2 className="modal__title">{title}</h2>
        <button
          type="button"
          className="modal__close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <XIcon />
        </button>
      </div>
      <div className="modal__body">{children}</div>
      {footer && <div className="modal__foot">{footer}</div>}
    </dialog>
  )
}