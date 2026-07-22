import { useEffect, useRef, useState } from 'react'
import {
  getAllFeedUrl,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
  getTournamentFeedUrl,
} from '../../api/calendar'
import { CalendarIcon, CopyIcon, ExternalLinkIcon } from '../icons'
import Button from '../ui/Button'

/**
 * Menú para suscribirse al feed iCalendar (RFC 5545) del torneo o global.
 */
export default function CalendarSubscription({ tournamentId, tournamentName }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    if (!open) return
    function onPointerDown(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    function onKeyDown(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const feedUrl = tournamentId
    ? getTournamentFeedUrl(tournamentId)
    : getAllFeedUrl()
  const name = tournamentName
    ? `Torneos UNAL · ${tournamentName}`
    : 'Torneos UNAL'

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(feedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2200)
    } catch {
      window.prompt('Copia el enlace del calendario:', feedUrl)
    }
  }

  return (
    <div className="menu" ref={ref}>
      <Button
        variant="ghost"
        size="sm"
        icon={CalendarIcon}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        Suscribirse
      </Button>
      {open && (
        <div className="menu__panel" role="menu" aria-label="Suscribirse al calendario">
          <button type="button" className="menu__item" onClick={copyLink} role="menuitem">
            <CopyIcon />
            Copiar enlace iCalendar
          </button>
          <button
            type="button"
            className="menu__item"
            role="menuitem"
            onClick={() => window.open(getGoogleCalendarUrl(feedUrl, name), '_blank', 'noopener')}
          >
            <ExternalLinkIcon />
            Google Calendar
          </button>
          <button
            type="button"
            className="menu__item"
            role="menuitem"
            onClick={() => window.open(getOutlookCalendarUrl(feedUrl, name), '_blank', 'noopener')}
          >
            <ExternalLinkIcon />
            Outlook
          </button>
          {copied && (
            <span className="menu__feedback" role="status">
              Enlace copiado al portapapeles
            </span>
          )}
        </div>
      )}
    </div>
  )
}
