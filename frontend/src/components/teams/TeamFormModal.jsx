import { useEffect, useState } from 'react'
import * as teamsApi from '../../api/teams'
import * as captainsApi from '../../api/captains'
import { useAuth } from '../../context/useAuth'
import Modal from '../ui/Modal'
import FormField from '../ui/FormField'
import SelectField from '../ui/SelectField'
import SubmitButton from '../ui/SubmitButton'
import { AlertIcon } from '../icons'

const EMPTY = { name: '', logo: '', captain_id: '' }

function buildInitial(team, isAdmin) {
  if (!team) return { ...EMPTY }
  return {
    name: team.name ?? '',
    logo: team.logo ?? '',
    captain_id: isAdmin ? team.captain_id ?? '' : '',
  }
}

export default function TeamFormModal({ open, team, onClose, onSaved }) {
  const { user } = useAuth()
  const editing = Boolean(team)
  const isAdmin = user?.role?.name === 'admin'

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)
  const [captains, setCaptains] = useState([])

  useEffect(() => {
    if (!open) return
    setForm(buildInitial(team, isAdmin))
    setErrors({})
    setGlobalError(null)
    if (isAdmin) {
      captainsApi.list().then((r) => setCaptains(r.data)).catch(() => {})
    }
  }, [open, team, isAdmin])

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
      if (!payload.logo) delete payload.logo
      if (!isAdmin) delete payload.captain_id
      else if (!payload.captain_id) delete payload.captain_id

      if (editing) {
        await teamsApi.update(team.id, payload)
      } else {
        await teamsApi.create(payload)
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

  const title = editing ? 'Editar equipo' : 'Nuevo equipo'
  const submitLabel = editing ? 'Guardar cambios' : 'Crear equipo'

  const captainOpts = captains.map((u) => ({
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
          <SubmitButton loading={submitting} form="team-form">
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

      <form id="team-form" className="auth__form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Nombre del equipo"
          name="name"
          value={form.name}
          onChange={update('name')}
          placeholder="Atlético Nacional"
          required
          error={errors.name?.[0]}
        />

        <FormField
          label="Logo (URL)"
          name="logo"
          value={form.logo}
          onChange={update('logo')}
          placeholder="https://..."
          hint="Enlace opcional al escudo del equipo"
          error={errors.logo?.[0]}
        />

        {isAdmin && (
          <SelectField
            label="Capitán"
            name="captain_id"
            value={form.captain_id}
            onChange={update('captain_id')}
            options={captainOpts}
            placeholder="Selecciona un capitán"
            hint="Asigna el responsable del equipo"
            error={errors.captain_id?.[0]}
          />
        )}
      </form>
    </Modal>
  )
}