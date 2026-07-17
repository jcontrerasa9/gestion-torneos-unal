import Modal from './Modal'
import { AlertIcon } from '../icons'

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Eliminar',
  busy = false,
  error,
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <button
            type="button"
            className="btn btn--ghost"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn btn--danger"
            onClick={onConfirm}
            disabled={busy}
          >
            <span className="btn__content">
              {busy && <span className="btn__spinner" aria-hidden="true" />}
              {busy ? 'Eliminando…' : confirmLabel}
            </span>
          </button>
        </>
      }
    >
      <div className="confirm">
        <span className="confirm__icon" aria-hidden="true">
          <AlertIcon />
        </span>
        {message && <p className="confirm__message">{message}</p>}
        {error && (
          <div className="auth__error confirm__error" role="alert">
            <AlertIcon />
            {error}
          </div>
        )}
      </div>
    </Modal>
  )
}