import Modal from './Modal'
import Button from './Button'
import { AlertIcon } from '../icons'

/**
 * Diálogo de confirmación para acciones irreversibles (US-2).
 * Soporta estado async (busy + error inline).
 */
export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirmar',
  danger = true,
  busy = false,
  error,
  onConfirm,
  onClose,
  children,
}) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={busy ? undefined : onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            busy={busy}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="confirm">
        <span className={`confirm__icon ${danger ? 'is-danger' : ''}`} aria-hidden="true">
          <AlertIcon />
        </span>
        {message && <p className="confirm__message">{message}</p>}
        {children}
        {error && (
          <div className="form-error-banner" role="alert">
            <AlertIcon />
            {error}
          </div>
        )}
      </div>
    </Modal>
  )
}
