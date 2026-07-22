import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useMutation } from '../../hooks/useMutation'
import Modal from '../ui/Modal'
import Button from '../ui/Button'
import Field from '../ui/Field'
import SelectField from '../ui/SelectField'
import TextAreaField from '../ui/TextAreaField'
import { AlertIcon } from '../icons'
import { tournamentLabels } from '../../utils/format'

const MODALITY_OPTIONS = [
  { value: 'futbol5', label: tournamentLabels.modality.futbol5 },
  { value: 'futbol11', label: tournamentLabels.modality.futbol11 },
]

const STATUS_OPTIONS = [
  { value: 'pendiente', label: tournamentLabels.status.pendiente },
  { value: 'en_curso', label: tournamentLabels.status.en_curso },
  { value: 'finalizado', label: tournamentLabels.status.finalizado },
  { value: 'cancelado', label: tournamentLabels.status.cancelado },
]

const EMPTY = {
  name: '',
  modality: '',
  status: '',
  start_date: '',
  end_date: '',
  description: '',
}

function buildInitial(tournament) {
  if (!tournament) return { ...EMPTY }
  return {
    name: tournament.name ?? '',
    modality: tournament.modality ?? '',
    status: tournament.status ?? '',
    start_date: tournament.start_date?.slice(0, 10) ?? '',
    end_date: tournament.end_date?.slice(0, 10) ?? '',
    description: tournament.description ?? '',
  }
}

export default function TournamentFormModal({ open, tournament, onClose, onSaved }) {
  const editing = Boolean(tournament)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(buildInitial(tournament))
      setErrors({})
      setGlobalError(null)
    }
  }, [open, tournament])

  const { run, busy } = useMutation(
    (payload) =>
      editing
        ? api.put(`/tournaments/${tournament.id}`, payload)
        : api.post('/tournaments', payload),
    {
      invalidate: ['app:tournaments'],
      successMessage: editing ? 'Cambios guardados' : 'Torneo creado',
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
    const payload = { ...form }
    if (!payload.description) delete payload.description
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

  return (
    <Modal
      open={open}
      title={editing ? 'Editar torneo' : 'Nuevo torneo'}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={busy}>
            Cancelar
          </Button>
          <Button type="submit" form="tournament-form" busy={busy}>
            {editing ? 'Guardar cambios' : 'Crear torneo'}
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

      <form id="tournament-form" className="form-grid" onSubmit={handleSubmit} noValidate>
        <Field
          className="field--full"
          label="Nombre"
          value={form.name}
          onChange={update('name')}
          placeholder="Torneo Interfacultades 2026"
          required
          error={errors.name?.[0]}
        />

        <SelectField
          label="Modalidad"
          value={form.modality}
          onChange={update('modality')}
          options={MODALITY_OPTIONS}
          placeholder="Selecciona una modalidad"
          required
          error={errors.modality?.[0]}
        />
        <SelectField
          label="Estado"
          value={form.status}
          onChange={update('status')}
          options={STATUS_OPTIONS}
          placeholder="Selecciona un estado"
          required
          error={errors.status?.[0]}
        />

        <Field
          label="Fecha de inicio"
          type="date"
          value={form.start_date}
          onChange={update('start_date')}
          required
          error={errors.start_date?.[0]}
        />
        <Field
          label="Fecha de fin"
          type="date"
          value={form.end_date}
          onChange={update('end_date')}
          required
          error={errors.end_date?.[0]}
        />

        <TextAreaField
          className="field--full"
          label="Descripción"
          value={form.description}
          onChange={update('description')}
          placeholder="Detalles del reglamento, formato, número de grupos…"
          rows={3}
          hint="Opcional"
          error={errors.description?.[0]}
        />
      </form>
    </Modal>
  )
}
