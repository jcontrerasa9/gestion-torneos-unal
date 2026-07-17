import { useEffect, useState } from 'react'
import * as tournamentsApi from '../../api/tournaments'
import { useAuth } from '../../context/useAuth'
import Modal from '../ui/Modal'
import FormField from '../ui/FormField'
import SelectField from '../ui/SelectField'
import TextAreaField from '../ui/TextAreaField'
import SubmitButton from '../ui/SubmitButton'
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
  description: '',
  start_date: '',
  end_date: '',
  status: '',
}

function buildInitial(tournament) {
  if (!tournament) return { ...EMPTY }
  return {
    name: tournament.name ?? '',
    modality: tournament.modality ?? '',
    description: tournament.description ?? '',
    start_date: tournament.start_date?.slice(0, 10) ?? '',
    end_date: tournament.end_date?.slice(0, 10) ?? '',
    status: tournament.status ?? '',
  }
}

export default function TournamentFormModal({
  open,
  tournament,
  onClose,
  onSaved,
}) {
  const { user } = useAuth()
  const editing = Boolean(tournament)
  const canManage = user?.role?.name === 'admin'

  const [form, setForm] = useState(EMPTY)
  const [submitting, setSubmitting] = useState(false)
  const [errors, setErrors] = useState({})
  const [globalError, setGlobalError] = useState(null)

  useEffect(() => {
    if (open) {
      setForm(buildInitial(tournament))
      setErrors({})
      setGlobalError(null)
    }
  }, [open, tournament])

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
      if (!payload.description) delete payload.description
      const data = editing
        ? await tournamentsApi.update(tournament.id, payload)
        : await tournamentsApi.create(payload)
      onSaved?.(data.data)
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

  const title = editing ? 'Editar torneo' : 'Nuevo torneo'
  const submitLabel = editing ? 'Guardar cambios' : 'Crear torneo'

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
          <SubmitButton loading={submitting} disabled={!canManage} form="tournament-form">
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

      <form id="tournament-form" className="auth__form" onSubmit={handleSubmit} noValidate>
        <FormField
          label="Nombre"
          name="name"
          iconType="text"
          value={form.name}
          onChange={update('name')}
          placeholder="Torneo Interfacultades 2026"
          required
          error={errors.name?.[0]}
        />

        <div className="auth__row">
          <SelectField
            label="Modalidad"
            name="modality"
            value={form.modality}
            onChange={update('modality')}
            options={MODALITY_OPTIONS}
            placeholder="Selecciona una modalidad"
            required
            error={errors.modality?.[0]}
          />
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
        </div>

        <div className="auth__row">
          <FormField
            label="Fecha de inicio"
            name="start_date"
            type="date"
            value={form.start_date}
            onChange={update('start_date')}
            required
            error={errors.start_date?.[0]}
          />
          <FormField
            label="Fecha de fin"
            name="end_date"
            type="date"
            value={form.end_date}
            onChange={update('end_date')}
            required
            error={errors.end_date?.[0]}
          />
        </div>

        <TextAreaField
          label="Descripción"
          name="description"
          value={form.description}
          onChange={update('description')}
          placeholder="Detalles del reglamento, formato, número de grupos…"
          rows={3}
          error={errors.description?.[0]}
        />
      </form>
    </Modal>
  )
}