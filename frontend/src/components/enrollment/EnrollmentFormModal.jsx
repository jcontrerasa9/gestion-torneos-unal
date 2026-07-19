import { useEffect, useState } from 'react'
import * as enrollmentApi from '../../api/tournament-teams'
import { api } from '../../api/client'
import Modal from '../ui/Modal'
import SelectField from '../ui/SelectField'
import SubmitButton from '../ui/SubmitButton'
import { AlertIcon } from '../icons'

const EMPTY = { tournament_id: '', team_id: '' }

function buildInitial(item) {
  if (!item) return { ...EMPTY }
  return {
    tournament_id: item.tournament_id ?? '',
    team_id: item.team_id ?? '',
  }
}

export default function EnrollmentFormModal({ open, item, onClose, onSaved }) {
  const editing = Boolean(item)

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  const [tournaments, setTournaments] = useState([])
  const [teams, setTeams] = useState([])

  useEffect(() => {
    if (!open) return
    setForm(buildInitial(item))
    setErrors({})
    setGlobalError(null)

    api.get('/tournaments?page=1').then((r) => setTournaments(r.data.data)).catch(() => {})
    api.get('/teams?page=1').then((r) => setTeams(r.data.data)).catch(() => {})
  }, [open, item])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitting(true)
    setErrors({})
    setGlobalError(null)
    try {
      if (editing) {
        await enrollmentApi.update(item.id, form)
      } else {
        await enrollmentApi.create(form)
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

  const tournamentOpts = tournaments.map((t) => ({ value: t.id, label: t.name }))
  const teamOpts = teams.map((t) => ({ value: t.id, label: t.name }))

  return (
    <Modal
      open={open}
      title={editing ? 'Editar inscripción' : 'Nueva inscripción'}
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
          <SubmitButton loading={submitting} form="enrollment-form">
            {editing ? 'Guardar' : 'Inscribir equipo'}
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

      <form id="enrollment-form" className="auth__form" onSubmit={handleSubmit} noValidate>
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

        <SelectField
          label="Equipo"
          name="team_id"
          value={form.team_id}
          onChange={update('team_id')}
          options={teamOpts}
          placeholder="Selecciona un equipo"
          required
          error={errors.team_id?.[0]}
        />
      </form>
    </Modal>
  )
}