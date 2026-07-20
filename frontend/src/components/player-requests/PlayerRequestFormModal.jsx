import { useEffect, useState } from 'react'
import * as prApi from '../../api/player-requests'
import { useAuth } from '../../context/useAuth'
import { api } from '../../api/client'
import Modal from '../ui/Modal'
import SelectField from '../ui/SelectField'
import FormField from '../ui/FormField'
import SubmitButton from '../ui/SubmitButton'
import { AlertIcon } from '../icons'

const POSITIONS = [
  { value: 'Portero', label: 'Portero' },
  { value: 'Defensa', label: 'Defensa' },
  { value: 'Mediocampista', label: 'Mediocampista' },
  { value: 'Delantero', label: 'Delantero' },
]

const EMPTY = { tournament_team_id: '', jersey_number: '', position: '' }

export default function PlayerRequestFormModal({ open, onClose, onSaved }) {
  const { user } = useAuth()

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [tournamentTeams, setTournamentTeams] = useState([])

  useEffect(() => {
    if (!open) return
    setForm({ ...EMPTY })
    setErrors({})
    setGlobalError(null)
    api.get('/tournament-teams?page=1').then((r) => {
      const approved = (r.data.data || []).filter((t) => t.status === 'aprobada')
      setTournamentTeams(approved)
    }).catch(() => {})
  }, [open])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setGlobalError(null)
    try {
      const payload = {
        ...form,
        player_id: user.id,
        jersey_number: form.jersey_number || null,
      }
      if (!payload.jersey_number) delete payload.jersey_number
      if (!payload.position) delete payload.position
      await prApi.create(payload)
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

  const teamOpts = tournamentTeams.map((t) => ({
    value: t.id,
    label: `${t.team?.name} — ${t.tournament?.name}`,
  }))

  return (
    <Modal
      open={open}
      title="Nueva solicitud"
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
          <SubmitButton loading={submitting} form="pr-form">
            Enviar solicitud
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

      <form id="pr-form" className="auth__form" onSubmit={handleSubmit} noValidate>
        <SelectField
          label="Equipo · Torneo"
          name="tournament_team_id"
          value={form.tournament_team_id}
          onChange={update('tournament_team_id')}
          options={teamOpts}
          placeholder="Selecciona un equipo inscrito"
          required
          error={errors.tournament_team_id?.[0]}
        />

        <div className="auth__row">
          <FormField
            label="Dorsal"
            name="jersey_number"
            type="number"
            value={form.jersey_number}
            onChange={update('jersey_number')}
            placeholder="10"
            hint="Número de camiseta (opcional)"
            error={errors.jersey_number?.[0]}
          />
          <SelectField
            label="Posición"
            name="position"
            value={form.position}
            onChange={update('position')}
            options={POSITIONS}
            placeholder="Elige posición"
            error={errors.position?.[0]}
          />
        </div>
      </form>
    </Modal>
  )
}