import { useEffect, useState, type FormEvent } from 'react'
import {
  AlignLeft,
  ChevronDown,
  ChevronUp,
  ListChecks,
  Pencil,
  Plus,
  ShieldCheck,
  TextCursorInput,
  Trash2,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useFlow, useUpdateFlow } from '../hooks/useFlow'
import { Modal } from '../components/ui/Modal'
import type { FlowStep, FlowStepType } from '../lib/api/types'

type FieldType = 'text' | 'textarea' | 'select' | 'checkbox'

interface CustomFieldDraft {
  key: string
  label: string
  fieldType: FieldType
  placeholder: string
  options: string[]
  required: boolean
  enabled: boolean
}

const FIELD_TYPE_META: Record<FieldType, { label: string; description: string; icon: LucideIcon }> = {
  text: { label: 'Short text', description: 'A single-line answer', icon: TextCursorInput },
  textarea: { label: 'Long text', description: 'A multi-line answer', icon: AlignLeft },
  select: { label: 'Dropdown', description: 'Client chooses one option from a list', icon: ListChecks },
  checkbox: { label: 'Waiver / agreement', description: 'A checkbox the client must tick to agree', icon: ShieldCheck },
}

function stepToDraft(step: FlowStep): CustomFieldDraft {
  const config = step.config as { label?: string; fieldType?: string; placeholder?: string; options?: string[] }
  const fieldType: FieldType = (['text', 'textarea', 'select', 'checkbox'] as const).includes(config.fieldType as FieldType)
    ? (config.fieldType as FieldType)
    : 'text'
  return {
    key: step.id,
    label: config.label ?? 'Untitled question',
    fieldType,
    placeholder: config.placeholder ?? '',
    options: config.options ?? [],
    required: step.required,
    enabled: step.enabled,
  }
}

function buildMergedSteps(otherSteps: FlowStep[], fields: CustomFieldDraft[]) {
  const sortedOthers = [...otherSteps].sort((a, b) => a.position - b.position)
  const customPayload = fields.map((f) => ({
    type: 'custom_field' as FlowStepType,
    required: f.required,
    enabled: f.enabled,
    config: {
      label: f.label,
      fieldType: f.fieldType,
      placeholder: f.placeholder,
      options: f.fieldType === 'select' ? f.options.filter((o) => o.trim() !== '') : [],
    },
  }))

  const paymentIndex = sortedOthers.findIndex((s) => s.type === 'payment')
  const merged: Array<{ type: FlowStepType; required: boolean; enabled: boolean; config: Record<string, unknown> }> = []

  sortedOthers.forEach((s, i) => {
    if (i === paymentIndex) merged.push(...customPayload)
    merged.push({ type: s.type, required: s.required, enabled: s.enabled, config: s.config })
  })
  if (paymentIndex === -1) merged.push(...customPayload)

  return merged.map((s, position) => ({ ...s, position }))
}

export function Forms() {
  const { data, isLoading } = useFlow()
  const updateFlow = useUpdateFlow()

  const [fields, setFields] = useState<CustomFieldDraft[]>([])
  const [initialized, setInitialized] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [draftLabel, setDraftLabel] = useState('')
  const [draftType, setDraftType] = useState<FieldType>('text')
  const [draftPlaceholder, setDraftPlaceholder] = useState('')
  const [draftOptions, setDraftOptions] = useState<string[]>([''])
  const [draftRequired, setDraftRequired] = useState(true)
  const [formError, setFormError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)

  useEffect(() => {
    if (!initialized && data !== undefined) {
      const steps = data.flow?.steps ?? []
      setFields(steps.filter((s) => s.type === 'custom_field').sort((a, b) => a.position - b.position).map(stepToDraft))
      setInitialized(true)
    }
  }, [data, initialized])

  function openNew() {
    setEditingKey(null)
    setDraftLabel('')
    setDraftType('text')
    setDraftPlaceholder('')
    setDraftOptions([''])
    setDraftRequired(true)
    setFormError(null)
    setModalOpen(true)
  }

  function openEdit(field: CustomFieldDraft) {
    setEditingKey(field.key)
    setDraftLabel(field.label)
    setDraftType(field.fieldType)
    setDraftPlaceholder(field.placeholder)
    setDraftOptions(field.options.length > 0 ? field.options : [''])
    setDraftRequired(field.required)
    setFormError(null)
    setModalOpen(true)
  }

  function handleDraftSubmit(e: FormEvent) {
    e.preventDefault()
    if (!draftLabel.trim()) {
      setFormError('Give this question a label.')
      return
    }
    if (draftType === 'select' && draftOptions.filter((o) => o.trim() !== '').length < 2) {
      setFormError('Add at least two options for a dropdown.')
      return
    }

    const draft: CustomFieldDraft = {
      key: editingKey ?? crypto.randomUUID(),
      label: draftLabel.trim(),
      fieldType: draftType,
      placeholder: draftPlaceholder.trim(),
      options: draftOptions.map((o) => o.trim()).filter(Boolean),
      required: draftRequired,
      enabled: true,
    }

    setFields((prev) => {
      if (editingKey) {
        return prev.map((f) => (f.key === editingKey ? { ...draft, enabled: f.enabled } : f))
      }
      return [...prev, draft]
    })
    setDirty(true)
    setModalOpen(false)
  }

  function removeField(key: string) {
    setFields((prev) => prev.filter((f) => f.key !== key))
    setDirty(true)
  }

  function toggleEnabled(key: string) {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, enabled: !f.enabled } : f)))
    setDirty(true)
  }

  function move(key: string, dir: -1 | 1) {
    setFields((prev) => {
      const idx = prev.findIndex((f) => f.key === key)
      const swapWith = idx + dir
      if (idx === -1 || swapWith < 0 || swapWith >= prev.length) return prev
      const next = [...prev]
      ;[next[idx], next[swapWith]] = [next[swapWith], next[idx]]
      return next
    })
    setDirty(true)
  }

  async function saveAll() {
    setSaveError(null)
    const others = (data?.flow?.steps ?? []).filter((s) => s.type !== 'custom_field')
    try {
      await updateFlow.mutateAsync(buildMergedSteps(others, fields))
      setDirty(false)
    } catch {
      setSaveError('Could not save your changes. Please try again.')
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-ink">Forms</h1>
          <p className="text-body text-muted mt-0.5">
            Custom questions and waivers clients answer during checkout — added to the "Custom field" step of your booking flow.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {dirty && (
            <button
              type="button"
              onClick={saveAll}
              disabled={updateFlow.isPending}
              className="rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
            >
              {updateFlow.isPending ? 'Saving…' : 'Save changes'}
            </button>
          )}
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 rounded-btn border border-border px-4 py-2.5 text-label font-medium text-ink hover:bg-canvas transition"
          >
            <Plus size={16} strokeWidth={2} />
            Add field
          </button>
        </div>
      </div>

      {saveError && <p className="text-[12.5px] text-rose-600">{saveError}</p>}

      {isLoading && <p className="text-body text-muted">Loading…</p>}

      {!isLoading && fields.length === 0 && (
        <div className="rounded-card bg-surface border border-border flex flex-col items-center justify-center py-16 text-center animate-scrIn">
          <ShieldCheck size={26} strokeWidth={1.5} className="text-faint mb-3" />
          <p className="text-body text-muted max-w-sm">
            No custom fields yet. Add intake questions or a waiver acknowledgment for clients to complete when booking.
          </p>
        </div>
      )}

      {!isLoading && fields.length > 0 && (
        <div className="rounded-card bg-surface border border-border p-2 animate-scrIn">
          {fields.map((field, i) => {
            const meta = FIELD_TYPE_META[field.fieldType]
            const Icon = meta.icon
            return (
              <div
                key={field.key}
                className={[
                  'flex items-center gap-3 px-3 py-3.5 rounded-btn hover:bg-canvas transition',
                  i !== fields.length - 1 ? 'border-b border-border' : '',
                ].join(' ')}
              >
                <div className="flex flex-col shrink-0">
                  <button
                    type="button"
                    onClick={() => move(field.key, -1)}
                    disabled={i === 0}
                    className="text-faint hover:text-ink transition disabled:opacity-30"
                    aria-label="Move up"
                  >
                    <ChevronUp size={14} strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    onClick={() => move(field.key, 1)}
                    disabled={i === fields.length - 1}
                    className="text-faint hover:text-ink transition disabled:opacity-30"
                    aria-label="Move down"
                  >
                    <ChevronDown size={14} strokeWidth={2} />
                  </button>
                </div>
                <div className="size-9 shrink-0 rounded-avatar bg-canvas border border-border flex items-center justify-center">
                  <Icon size={16} strokeWidth={1.7} className="text-gold" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-body font-semibold text-ink truncate">{field.label}</div>
                  <div className="text-[12px] text-muted truncate">
                    {meta.label}
                    {field.required ? ' · Required' : ' · Optional'}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => openEdit(field)}
                  className="shrink-0 size-8 rounded-btn border border-border text-muted flex items-center justify-center hover:bg-canvas transition"
                  aria-label="Edit"
                >
                  <Pencil size={14} strokeWidth={1.8} />
                </button>
                <button
                  type="button"
                  onClick={() => removeField(field.key)}
                  className="shrink-0 size-8 rounded-btn border border-border text-muted flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition"
                  aria-label="Delete"
                >
                  <Trash2 size={14} strokeWidth={1.8} />
                </button>
                <label className="relative inline-flex items-center shrink-0 cursor-pointer">
                  <input type="checkbox" checked={field.enabled} onChange={() => toggleEnabled(field.key)} className="peer sr-only" />
                  <div className="w-9 h-5 rounded-full bg-border peer-checked:bg-ink transition-colors" />
                  <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
                </label>
              </div>
            )
          })}
        </div>
      )}

      {modalOpen && (
        <Modal title={editingKey ? 'Edit field' : 'Add field'} onClose={() => setModalOpen(false)}>
          <form onSubmit={handleDraftSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Label</span>
              <input
                value={draftLabel}
                onChange={(e) => setDraftLabel(e.target.value)}
                placeholder="e.g. Special requests, Liability waiver"
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>

            <div className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">Field type</span>
              <div className="grid grid-cols-2 gap-2">
                {(Object.entries(FIELD_TYPE_META) as Array<[FieldType, (typeof FIELD_TYPE_META)[FieldType]]>).map(([value, meta]) => {
                  const Icon = meta.icon
                  const active = draftType === value
                  return (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setDraftType(value)}
                      className={[
                        'flex items-start gap-2 rounded-field border p-2.5 text-left transition',
                        active ? 'border-gold bg-gold-soft/20' : 'border-border hover:bg-canvas',
                      ].join(' ')}
                    >
                      <Icon size={15} strokeWidth={1.7} className="text-gold shrink-0 mt-0.5" />
                      <span className="text-[12px] font-medium text-ink leading-tight">{meta.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {draftType !== 'checkbox' && (
              <label className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Placeholder (optional)</span>
                <input
                  value={draftPlaceholder}
                  onChange={(e) => setDraftPlaceholder(e.target.value)}
                  className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
                />
              </label>
            )}

            {draftType === 'select' && (
              <div className="flex flex-col gap-1.5">
                <span className="text-[12px] font-medium text-muted">Options</span>
                {draftOptions.map((opt, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      value={opt}
                      onChange={(e) => setDraftOptions((prev) => prev.map((o, oi) => (oi === i ? e.target.value : o)))}
                      placeholder={`Option ${i + 1}`}
                      className="flex-1 rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
                    />
                    <button
                      type="button"
                      onClick={() => setDraftOptions((prev) => prev.filter((_, oi) => oi !== i))}
                      disabled={draftOptions.length <= 1}
                      className="shrink-0 size-8 rounded-btn border border-border text-muted flex items-center justify-center hover:bg-canvas transition disabled:opacity-30"
                      aria-label="Remove option"
                    >
                      <X size={14} strokeWidth={1.8} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => setDraftOptions((prev) => [...prev, ''])}
                  className="self-start flex items-center gap-1.5 text-[12.5px] font-medium text-gold hover:brightness-90 transition mt-0.5"
                >
                  <Plus size={14} strokeWidth={2} />
                  Add option
                </button>
              </div>
            )}

            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={draftRequired}
                onChange={(e) => setDraftRequired(e.target.checked)}
                className="size-4 accent-ink"
              />
              <span className="text-body text-ink">Required to complete booking</span>
            </label>

            {formError && <p className="text-[12.5px] text-rose-600">{formError}</p>}

            <button
              type="submit"
              className="mt-1 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition"
            >
              {editingKey ? 'Save field' : 'Add field'}
            </button>
          </form>
        </Modal>
      )}
    </div>
  )
}
