const BASE_URL = import.meta.env.VITE_API_URL || '/api'

function buildFeedUrl(path) {
  return `${BASE_URL}${path}`
}

function toWebcal(url) {
  return url.replace(/^https?:\/\//, 'webcal://')
}

export function getTournamentFeedUrl(tournamentId) {
  return buildFeedUrl(`/tournaments/${tournamentId}/calendar.ics`)
}

export function getAllFeedUrl() {
  return buildFeedUrl('/calendar.ics')
}

export function getGoogleCalendarUrl(feedUrl, name) {
  const webcalUrl = toWebcal(feedUrl)
  return `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcalUrl)}&name=${encodeURIComponent(name)}`
}

export function getOutlookCalendarUrl(feedUrl, name) {
  const httpUrl = feedUrl.replace(/^webcal:\/\//, 'https://')
  return `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(httpUrl)}&name=${encodeURIComponent(name)}`
}
