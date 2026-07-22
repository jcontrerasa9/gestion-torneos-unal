import { useEffect, useState } from 'react'
import { useAuth } from '../../context/useAuth'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useMutation } from '../../hooks/useMutation'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import Button from '../ui/Button'
import { AlertIcon } from '../icons'

const POSITION_OPTIONS = [
  { value: 'Portero', label: 'Portero' },
  { value: 'Defensa', label: 'Defensa' },
  { value: 'Mediocampista', label: 'Mediocampista' },
  { value: 'Delantero', label: 'Delantero' },
]

export default function PlayerRequestFormModal({ open, onClose, onSaved }) {
  const { user } = useAuth()
  const [form, setForm] = useState({ tournament_team_id: '', jersey_number: '', position: '' })
  const [enrollments, setEnrollments] = useState([])
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  const { run: save, busy } = useMutation(
    (payload) => api.post('/player-requests', payload),
    { invalidate: ['app:requests'], successMessage: 'Solicitud enviada' },
  )

  useEffect(() => {
    if (!open) return
    setForm({ tournament_team_id: '', jersey_number: '', position: '' })
    setErrors({})
    setGlobalError(null)
    listAll('/tournament-teams')
      .then((r) => setEnrollments(itemsOf(r).filter((e) => e.status === 'aprobada')))
      .catch((err) => {
        setEnrollments([])
        setGlobalError(`No pudimos cargar las inscripciones: ${err.message}`)
      })
  }, [open])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)
    try {
      const payload = { tournament_team_id: Number(form.tournament_team_id), player_id: user.id }
      if (form.jersey_number) payload.jersey_number = Number(form.jersey_number)
      if (form.position) payload.position = form.position
      await save(payload)
      onSaved?.()
      onClose?.()
    } catch (err) {
      if (err.status === 422 && err.data?.errors) setErrors(err.data.errors)
      else setGlobalError(err.message)
    }
  }

  const teamOpts = enrollments.map((e) => ({
    value: e.id,
    label: `${e.team?.name} — ${e.tournament?.name}`,
  }))

  return (
    <Modal
      open={open}
      title="Nueva solicitud"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>Cancelar</Button>
          <Button type="submit" form="pr-form" busy={busy}>Enviar solicitud</Button>
        </>
      }
    >
      {globalError && (
        <div className="form-error-banner" role="alert">
          <AlertIcon />
          {globalError}
        </div>
      )}
      <form id="pr-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <SelectField
          label="Equipo y torneo"
          value={form.tournament_team_id}
          onChange={update('tournament_team_id')}
          options={teamOpts}
          placeholder="Selecciona un equipo inscrito"
          required
          error={errors.tournament_team_id?.[0]}
          className="field--full"
        />
        <Field
          label="Dorsal"
          type="number"
          min={0}
          value={form.jersey_number}
          onChange={update('jersey_number')}
          placeholder="Opcional"
          error={errors.jersey_number?.[0]}
        />
        <SelectField
          label="Posición"
          value={form.position}
          onChange={update('position')}
          options={POSITION_OPTIONS}
          placeholder="Selecciona (opcional)"
          error={errors.position?.[0]}
        />
      </form>
    </Modal>
  )
}
