import { useEffect, useState } from 'react'
import * as matchesApi from '../../api/matches'
import * as refereesApi from '../../api/referees'
import { useAuth } from '../../context/useAuth'
import { api } from '../../api/client'
import Modal from '../ui/Modal'
import FormField from '../ui/FormField'
import SelectField from '../ui/SelectField'
import SubmitButton from '../ui/SubmitButton'
import { AlertIcon } from '../icons'

const STATUS_OPTIONS = [
  { value: 'programado', label: 'Programado' },
  { value: 'en_juego', label: 'En juego' },
  { value: 'finalizado', label: 'Finalizado' },
  { value: 'aplazado', label: 'Aplazado' },
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

function buildInitial(match) {
  if (!match) return { ...EMPTY }
  return {
    tournament_id: match.tournament_id ?? '',
    home_team_id: match.home_team_id ?? '',
    away_team_id: match.away_team_id ?? '',
    referee_id: match.referee_id ?? '',
    match_date: match.match_date?.slice(0, 10) ?? '',
    match_time: match.match_time?.slice(11, 16) ?? '',
    status: match.status ?? '',
    home_score: match.home_score ?? '',
    away_score: match.away_score ?? '',
    observations: match.observations ?? '',
  }
}

export default function MatchFormModal({
  open,
  match,
  onClose,
  onSaved,
}) {
  const { user } = useAuth()
  const editing = Boolean(match)
  const canManage = user?.role?.name === 'admin'

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams] = useState([])
  const [referees, setReferees] = useState([])

  useEffect(() => {
    if (!open) return
    setForm(buildInitial(match))
    setErrors({})
    setGlobalError(null)

    api.get('/tournaments?page=1').then((r) => setTournaments(r.data.data)).catch(() => {})
    api.get('/teams?page=1').then((r) => setTeams(r.data.data)).catch(() => {})
    if (canManage) {
      refereesApi.list().then((r) => setReferees(r.data)).catch(() => {})
    }
  }, [open, match, canManage])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setGlobalError(null)
    try {
      const payload = { ...form }
      if (!payload.referee_id) delete payload.referee_id
      if (!payload.home_score) payload.home_score = null
      if (!payload.away_score) payload.away_score = null
      if (!payload.observations) delete payload.observations

      if (editing) {
        await matchesApi.update(match.id, payload)
      } else {
        delete payload.home_score
        delete payload.away_score
        delete payload.observations
        await matchesApi.create(payload)
      }
      onSaved?.()
      onClose?.()
    } catch (err) {
      if (err.status === 422 && err.data?.errors) {
        setErrors(err.data.errors)
      } else {
        setGlobalError(err.message)
      }
    } finally {
      setSubmitting(false)
    }
  }

  const title = editing ? 'Editar partido' : 'Nuevo partido'
  const submitLabel = editing ? 'Guardar cambios' : 'Crear partido'

  const tournamentOpts = tournaments.map((t) => ({ value: t.id, label: t.name }))
  const teamOpts = teams.map((t) => ({ value: t.id, label: t.name }))
  const refereeOpts = referees.map((u) => ({
    value: u.id,
    label: `${u.first_name} ${u.last_name}`,
  }))

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
            disabled={submitting}
          >
            Cancelar
          </button>
          <SubmitButton
            loading={submitting}
            disabled={!canManage}
            form="match-form"
          >
            {submitLabel}
          </SubmitButton>
        </>
      }
    >
      {globalError && (
        <div className="auth__error modal__error" role="alert">
          <AlertIcon />
          {globalError}
        </div>
      )}

      <form id="match-form" className="auth__form" onSubmit={handleSubmit} noValidate>
        <SelectField
          label="Torneo"
          name="tournament_id"
          value={form.tournament_id}
          onChange={update('tournament_id')}
          options={tournamentOpts}
          placeholder="Selecciona un torneo"
          required
          error={errors.tournament_id?.[0]}
        />

        <div className="auth__row">
          <SelectField
            label="Equipo local"
            name="home_team_id"
            value={form.home_team_id}
            onChange={update('home_team_id')}
            options={teamOpts}
            placeholder="Local"
            required
            error={errors.home_team_id?.[0]}
          />
          <SelectField
            label="Equipo visitante"
            name="away_team_id"
            value={form.away_team_id}
            onChange={update('away_team_id')}
            options={teamOpts}
            placeholder="Visitante"
            required
            error={errors.away_team_id?.[0]}
          />
        </div>

        <div className="auth__row">
          <FormField
            label="Fecha"
            name="match_date"
            type="date"
            value={form.match_date}
            onChange={update('match_date')}
            required
            error={errors.match_date?.[0]}
          />
          <FormField
            label="Hora"
            name="match_time"
            type="time"
            value={form.match_time}
            onChange={update('match_time')}
            required
            error={errors.match_time?.[0]}
          />
        </div>

        <SelectField
          label="Estado"
          name="status"
          value={form.status}
          onChange={update('status')}
          options={STATUS_OPTIONS}
          placeholder="Selecciona un estado"
          required
          error={errors.status?.[0]}
        />

        {canManage && (
          <SelectField
            label="Árbitro"
            name="referee_id"
            value={form.referee_id}
            onChange={update('referee_id')}
            options={refereeOpts}
            placeholder="Sin árbitro asignado"
            hint="Asigna un árbitro al partido (opcional)"
            error={errors.referee_id?.[0]}
          />
        )}

        {editing && (
          <>
            <div className="auth__row">
              <FormField
                label="Goles local"
                name="home_score"
                type="number"
                value={form.home_score}
                onChange={update('home_score')}
                placeholder="0"
                error={errors.home_score?.[0]}
              />
              <FormField
                label="Goles visitante"
                name="away_score"
                type="number"
                value={form.away_score}
                onChange={update('away_score')}
                placeholder="0"
                error={errors.away_score?.[0]}
              />
            </div>

            <FormField
              label="Observaciones"
              name="observations"
              type="text"
              value={form.observations}
              onChange={update('observations')}
              placeholder="Incidencias del partido…"
              error={errors.observations?.[0]}
            />
          </>
        )}
      </form>
    </Modal>
  )
}