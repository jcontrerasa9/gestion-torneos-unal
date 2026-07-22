import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import { useRole } from '../../hooks/useRole'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import { AlertIcon } from '../icons'
import { matchLabels } from '../../utils/format'

const STATUS_OPTIONS = [
  { value: 'programado', label: matchLabels.programado },
  { value: 'en_juego', label: matchLabels.en_juego },
  { value: 'finalizado', label: matchLabels.finalizado },
  { value: 'aplazado', label: matchLabels.aplazado },
]

const EMPTY = {
  tournament_id: '',
  home_team_id: '',
  away_team_id: '',
  referee_id: '',
  match_date: '',
  match_time: '',
  status: '',
  home_score: '',
  away_score: '',
  observations: '',
}

function toTimeInput(value) {
  if (!value) return ''
  return value.includes('T') ? value.slice(11, 16) : value.slice(0, 5)
}

function buildInitial(match, fixedTournamentId) {
  if (!match) {
    return {
      ...EMPTY,
      tournament_id: fixedTournamentId ? String(fixedTournamentId) : '',
    }
  }
  return {
    tournament_id: String(match.tournament_id ?? fixedTournamentId ?? ''),
    home_team_id: String(match.home_team_id ?? ''),
    away_team_id: String(match.away_team_id ?? ''),
    referee_id: match.referee_id ? String(match.referee_id) : '',
    match_date: match.match_date?.slice(0, 10) ?? '',
    match_time: toTimeInput(match.match_time),
    status: match.status ?? '',
    home_score: match.home_score ?? '',
    away_score: match.away_score ?? '',
    observations: match.observations ?? '',
  }
}

export default function MatchFormModal({ open, match, fixedTournamentId, onClose, onSaved }) {
  const { isAdmin } = useRole()
  const editing = Boolean(match)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  const { data: tournamentsRes } = useFetch(
    open ? 'app:tournaments' : null,
    () => listAll('/tournaments'),
    { ttl: 60_000 },
  )
  const { data: teamsRes } = useFetch(
    open ? 'app:teams' : null,
    () => listAll('/teams'),
    { ttl: 60_000 },
  )
  const { data: refereesRes } = useFetch(
    open && isAdmin ? 'app:referees' : null,
    () => api.get('/referees'),
    { ttl: 120_000 },
  )

  useEffect(() => {
    if (open) {
      setForm(buildInitial(match, fixedTournamentId))
      setErrors({})
      setGlobalError(null)
    }
  }, [open, match, fixedTournamentId])

  const { run, busy } = useMutation(
    (payload) =>
      editing
        ? api.put(`/tournament-matches/${match.id}`, payload)
        : api.post('/tournament-matches', payload),
    {
      invalidate: ['app:matches'],
      successMessage: editing ? 'Cambios guardados' : 'Partido creado',
      onSuccess: () => {
        onSaved?.()
        onClose?.()
      },
    },
  )

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setErrors({})
    setGlobalError(null)

    if (form.home_team_id && form.home_team_id === form.away_team_id) {
      setGlobalError('El equipo local y el equipo visitante deben ser diferentes.')
      return
    }

    const payload = {
      tournament_id: form.tournament_id,
      home_team_id: form.home_team_id,
      away_team_id: form.away_team_id,
      match_date: form.match_date,
      match_time: form.match_time,
      status: form.status,
    }
    if (form.referee_id) payload.referee_id = form.referee_id
    if (editing) {
      payload.home_score = form.home_score === '' ? null : Number(form.home_score)
      payload.away_score = form.away_score === '' ? null : Number(form.away_score)
      if (form.observations) payload.observations = form.observations
    }

    try {
      await run(payload)
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors)
      } else {
        setGlobalError(err.message)
      }
    }
  }

  const tournamentOpts = itemsOf(tournamentsRes).map((t) => ({
    value: String(t.id),
    label: t.name,
  }))
  const teamOpts = itemsOf(teamsRes).map((t) => ({ value: String(t.id), label: t.name }))
  const refereeOpts = itemsOf(refereesRes).map((u) => ({
    value: String(u.id),
    label: `${u.first_name} ${u.last_name}`,
  }))

  return (
    <Modal
      open={open}
      title={editing ? 'Editar partido' : 'Nuevo partido'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="match-form" busy={busy}>
            {editing ? 'Guardar cambios' : 'Crear partido'}
          </Button>
        </>
      }
    >
      {globalError && (
        <div className="form-error-banner" role="alert" style={{ marginBottom: 14 }}>
          <AlertIcon />
          {globalError}
        </div>
      )}

      <form id="match-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <SelectField
          className="field--full"
          label="Torneo"
          value={form.tournament_id}
          onChange={update('tournament_id')}
          options={tournamentOpts}
          placeholder="Selecciona un torneo"
          required
          disabled={Boolean(fixedTournamentId)}
          error={errors.tournament_id?.[0]}
        />

        <SelectField
          label="Equipo local"
          value={form.home_team_id}
          onChange={update('home_team_id')}
          options={teamOpts}
          placeholder="Local"
          required
          error={errors.home_team_id?.[0]}
        />
        <SelectField
          label="Equipo visitante"
          value={form.away_team_id}
          onChange={update('away_team_id')}
          options={teamOpts}
          placeholder="Visitante"
          required
          error={errors.away_team_id?.[0]}
        />

        <Field
          label="Fecha"
          type="date"
          value={form.match_date}
          onChange={update('match_date')}
          required
          error={errors.match_date?.[0]}
        />
        <Field
          label="Hora"
          type="time"
          value={form.match_time}
          onChange={update('match_time')}
          required
          error={errors.match_time?.[0]}
        />

        <SelectField
          className={isAdmin ? '' : 'field--full'}
          label="Estado"
          value={form.status}
          onChange={update('status')}
          options={STATUS_OPTIONS}
          placeholder="Selecciona un estado"
          required
          error={errors.status?.[0]}
        />
        {isAdmin && (
          <SelectField
            label="Árbitro"
            value={form.referee_id}
            onChange={update('referee_id')}
            options={refereeOpts}
            placeholder="Sin árbitro asignado"
            hint="Opcional"
            error={errors.referee_id?.[0]}
          />
        )}

        {editing && (
          <>
            <Field
              label="Goles local"
              type="number"
              min="0"
              value={form.home_score}
              onChange={update('home_score')}
              placeholder="0"
              error={errors.home_score?.[0]}
            />
            <Field
              label="Goles visitante"
              type="number"
              min="0"
              value={form.away_score}
              onChange={update('away_score')}
              placeholder="0"
              error={errors.away_score?.[0]}
            />
            <Field
              className="field--full"
              label="Observaciones"
              type="text"
              value={form.observations}
              onChange={update('observations')}
              placeholder="Incidencias del partido…"
              hint="Opcional"
              error={errors.observations?.[0]}
            />
          </>
        )}
      </form>
    </Modal>
  )
}
