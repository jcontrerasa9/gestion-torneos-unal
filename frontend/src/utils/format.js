const dateFmt = new Intl.DateTimeFormat('es-ES', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
})

export function formatDate(value) {
  if (!value) return '—'
  const [y, m, d] = value.slice(0, 10).split('-').map(Number)
  if (!y || !m || !d) return '—'
  const local = new Date(y, m - 1, d)
  if (Number.isNaN(local.getTime())) return '—'
  return dateFmt.format(local)
}

export function formatDateRange(start, end) {
  const s = formatDate(start)
  const e = formatDate(end)
  if (s === '—' && e === '—') return '—'
  if (s === e) return s
  return `${s} — ${e}`
}

export function formatTime(value) {
  if (!value) return '—'
  const time = value.slice(11, 16)
  if (!time) return '—'
  const [h, m] = time.split(':').map(Number)
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export const tournamentLabels = {
  modality: {
    futbol5: 'Fútbol 5',
    futbol11: 'Fútbol 11',
  },
  status: {
    pendiente: 'Pendiente',
    en_curso: 'En curso',
    finalizado: 'Finalizado',
    cancelado: 'Cancelado',
  },
}

export const matchLabels = {
  programado: 'Programado',
  en_juego: 'En juego',
  finalizado: 'Finalizado',
  aplazado: 'Aplazado',
}