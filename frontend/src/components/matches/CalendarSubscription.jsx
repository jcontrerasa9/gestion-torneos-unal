import { useState, useRef, useEffect } from 'react'
import { CalendarIcon } from '../icons'
import {
  getTournamentFeedUrl,
  getAllFeedUrl,
  getGoogleCalendarUrl,
  getOutlookCalendarUrl,
} from '../../api/calendar'

export default function CalendarSubscription({ tournamentId, tournamentName }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef(null)

  const feedUrl = tournamentId
    ? getTournamentFeedUrl(tournamentId)
    : getAllFeedUrl()

  const calName = tournamentId
    ? `Torneos UNAL - ${tournamentName ?? 'Torneo'}`
    : 'Torneos UNAL - Todos los partidos'

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open])

  async function copyFeedUrl() {
    try {
      await navigator.clipboard.writeText(feedUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
      window.prompt('Copia la URL:', feedUrl)
    }
  }

  const style = {
    position: 'relative',
    display: 'inline-block',
  }

  const dropdown = {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 6,
    minWidth: 260,
    background: 'var(--surface-2)',
    border: '1px solid var(--line-strong)',
    borderRadius: 10,
    padding: '6px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.45)',
    zIndex: 40,
  }

  const item = {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    width: '100%',
    padding: '8px 10px',
    borderRadius: 8,
    background: 'transparent',
    border: 'none',
    color: 'var(--text)',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background 0.15s',
  }

  return (
    <div ref={ref} style={style}>
      <button
        type="button"
        className="btn btn--ghost btn--sm"
        onClick={() => setOpen(!open)}
        aria-haspopup="true"
        aria-expanded={open}
      >
        <span className="btn__content">
          <CalendarIcon />
          Calendario
        </span>
      </button>

      {open && (
        <div style={dropdown} role="menu">
          <button
            type="button"
            style={item}
            role="menuitem"
            onClick={() => { copyFeedUrl(); setOpen(false) }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <CalendarIcon style={{ width: 16, height: 16, flexShrink: 0 }} />
            {copied ? '¡Copiado!' : 'Copiar enlace de suscripción'}
          </button>

          <button
            type="button"
            style={item}
            role="menuitem"
            onClick={() => window.open(getGoogleCalendarUrl(feedUrl, calName), '_blank')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 9h18M8 3v4M16 3v4" />
            </svg>
            Abrir en Google Calendar
          </button>

          <button
            type="button"
            style={item}
            role="menuitem"
            onClick={() => window.open(getOutlookCalendarUrl(feedUrl, calName), '_blank')}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--surface-3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <svg style={{ width: 16, height: 16, flexShrink: 0 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="M9 3v18M3 9h6M3 15h6M15 3v6M15 12v9" />
            </svg>
            Abrir en Outlook
          </button>
        </div>
      )}
    </div>
  )
}
