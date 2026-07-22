import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useFetch } from '../../hooks/useFetch'
import { useMutation } from '../../hooks/useMutation'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import SelectField from '../ui/SelectField'
import { AlertIcon } from '../icons'

export default function EnrollmentFormModal({ open, fixedTournamentId, onClose, onSaved }) {
  const [form, setForm] = useState({ tournament_id: '', team_id: '' })
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

  useEffect(() => {
    if (open) {
      setForm({
        tournament_id: fixedTournamentId ? String(fixedTournamentId) : '',
        team_id: '',
      })
      setErrors({})
      setGlobalError(null)
    }
  }, [open, fixedTournamentId])

  const { run, busy } = useMutation(
    (payload) => api.post('/tournament-teams', payload),
    {
      invalidate: ['app:enrollments'],
      successMessage: 'Inscripción solicitada',
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
    try {
      await run({ tournament_id: form.tournament_id, team_id: form.team_id })
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

  return (
    <Modal
      open={open}
      title="Nueva inscripción"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="enrollment-form" busy={busy}>
            Inscribir equipo
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

      <form id="enrollment-form" className="form-grid" onSubmit={handleSubmit} noValidate>
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
          className="field--full"
          label="Equipo"
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
