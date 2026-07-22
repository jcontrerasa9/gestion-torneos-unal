import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { listAll, itemsOf } from '../../api/helpers'
import { useMutation } from '../../hooks/useMutation'
import { useRole } from '../../hooks/useRole'
import Modal from '../ui/Modal'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import Button from '../ui/Button'
import { AlertIcon } from '../icons'

export default function TeamFormModal({ open, team, onClose, onSaved }) {
  const editing = Boolean(team)
  const { isAdmin } = useRole()
  const [form, setForm] = useState({ name: '', logo: '', captain_id: '' })
  const [captains, setCaptains] = useState([])
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  const { run: save, busy } = useMutation(
    (payload) =>
      editing
        ? api.put(`/teams/${team.id}`, payload)
        : api.post('/teams', payload),
    { invalidate: ['app:teams', 'app:roster'], successMessage: editing ? 'Equipo actualizado' : 'Equipo creado' },
  )

  useEffect(() => {
    if (!open) return
    setForm({
      name: team?.name ?? '',
      logo: team?.logo ?? '',
      captain_id: team?.captain?.id ?? '',
    })
    setErrors({})
    setGlobalError(null)
    if (isAdmin) {
      listAll('/captains')
        .then((r) => setCaptains(itemsOf(r)))
        .catch((err) => {
          setCaptains([])
          setGlobalError(`No pudimos cargar los capitanes: ${err.message}`)
        })
    }
  }, [open, team, isAdmin])

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setErrors({})
    setGlobalError(null)
    try {
      const payload = { name: form.name }
      if (form.logo) payload.logo = form.logo
      if (isAdmin && form.captain_id) payload.captain_id = Number(form.captain_id)
      await save(payload)
      onSaved?.()
      onClose?.()
    } catch (err) {
      if (err.status === 422 && err.data?.errors) setErrors(err.data.errors)
      else setGlobalError(err.message)
    }
  }

  const captainOpts = captains.map((c) => ({
    value: c.id,
    label: `${c.first_name} ${c.last_name}`,
  }))

  return (
    <Modal
      open={open}
      title={editing ? 'Editar equipo' : 'Nuevo equipo'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="team-form" busy={busy}>
            {editing ? 'Guardar cambios' : 'Crear equipo'}
          </Button>
        </>
      }
    >
      {globalError && (
        <div className="form-error-banner" role="alert">
          <AlertIcon />
          {globalError}
        </div>
      )}
      <form id="team-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Field
          label="Nombre del equipo"
          value={form.name}
          onChange={update('name')}
          error={errors.name?.[0]}
          required
          className="field--full"
        />
        <Field
          label="Logo (URL)"
          type="url"
          value={form.logo}
          onChange={update('logo')}
          placeholder="https://..."
          error={errors.logo?.[0]}
          hint="Opcional"
          className="field--full"
        />
        {isAdmin && (
          <SelectField
            label="Capitán"
            value={form.captain_id}
            onChange={update('captain_id')}
            options={captainOpts}
            placeholder="Sin capitán asignado"
            error={errors.captain_id?.[0]}
            className="field--full"
          />
        )}
      </form>
    </Modal>
  )
}
