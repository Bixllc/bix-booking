import { useEffect, useState } from 'react'
import {
  useCancellationPolicy,
  usePaymentPolicy,
  useUpdateCancellationPolicy,
  useUpdatePaymentPolicy,
  useUpdateWorkspace,
  useWorkspace,
} from '../hooks/useWorkspaceSettings'
import type { PaymentPolicy } from '../lib/api/types'

function SavedChip({ show }: { show: boolean }) {
  if (!show) return null
  return <span className="text-[12px] text-emerald-600 font-medium">Saved</span>
}

export function Settings() {
  const { data: workspaceData } = useWorkspace()
  const updateWorkspace = useUpdateWorkspace()
  const { data: paymentData } = usePaymentPolicy()
  const updatePaymentPolicy = useUpdatePaymentPolicy()
  const { data: cancellationData } = useCancellationPolicy()
  const updateCancellationPolicy = useUpdateCancellationPolicy()

  const [name, setName] = useState('')
  const [supportEmail, setSupportEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [timezone, setTimezone] = useState('')
  const [savedGeneral, setSavedGeneral] = useState(false)

  useEffect(() => {
    if (!workspaceData) return
    setName(workspaceData.workspace.name)
    setSupportEmail(workspaceData.workspace.supportEmail ?? '')
    setPhone(workspaceData.workspace.phone ?? '')
    setTimezone(workspaceData.workspace.timezone)
  }, [workspaceData])

  const [mode, setMode] = useState<PaymentPolicy['mode']>('none')
  const [depositPercent, setDepositPercent] = useState('30')
  const [savedPayment, setSavedPayment] = useState(false)

  useEffect(() => {
    if (!paymentData?.paymentPolicy) return
    setMode(paymentData.paymentPolicy.mode)
    if (paymentData.paymentPolicy.depositPercent) setDepositPercent(String(paymentData.paymentPolicy.depositPercent))
  }, [paymentData])

  const [freeCancelHours, setFreeCancelHours] = useState('24')
  const [lateFeePercent, setLateFeePercent] = useState('50')
  const [noShowFeePercent, setNoShowFeePercent] = useState('100')
  const [savedCancellation, setSavedCancellation] = useState(false)

  useEffect(() => {
    if (!cancellationData?.cancellationPolicy) return
    setFreeCancelHours(String(cancellationData.cancellationPolicy.freeCancelHours))
    setLateFeePercent(String(cancellationData.cancellationPolicy.lateFeePercent))
    setNoShowFeePercent(String(cancellationData.cancellationPolicy.noShowFeePercent))
  }, [cancellationData])

  async function saveGeneral() {
    await updateWorkspace.mutateAsync({ name, supportEmail: supportEmail || undefined, phone: phone || undefined, timezone })
    setSavedGeneral(true)
    setTimeout(() => setSavedGeneral(false), 2000)
  }

  async function savePayment() {
    await updatePaymentPolicy.mutateAsync({
      mode,
      depositPercent: mode === 'deposit' ? Number(depositPercent) : null,
      depositCents: null,
      chargeTiming: 'at_booking',
      currency: workspaceData?.workspace.currency ?? 'USD',
    })
    setSavedPayment(true)
    setTimeout(() => setSavedPayment(false), 2000)
  }

  async function saveCancellation() {
    await updateCancellationPolicy.mutateAsync({
      freeCancelHours: Number(freeCancelHours),
      lateFeePercent: Number(lateFeePercent),
      noShowFeePercent: Number(noShowFeePercent),
    })
    setSavedCancellation(true)
    setTimeout(() => setSavedCancellation(false), 2000)
  }

  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-ink">Settings</h1>
        <p className="text-body text-muted mt-0.5">Workspace details and booking policies.</p>
      </div>

      <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base2 font-bold text-ink">General</h2>
          <SavedChip show={savedGeneral} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Business name</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Support email</span>
            <input
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Phone</span>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Time zone</span>
            <input
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={saveGeneral}
          disabled={updateWorkspace.isPending}
          className="mt-4 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
        >
          {updateWorkspace.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base2 font-bold text-ink">Payment policy</h2>
          <SavedChip show={savedPayment} />
        </div>
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Charge mode</span>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as PaymentPolicy['mode'])}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            >
              <option value="none">No online payment</option>
              <option value="deposit">Deposit at booking</option>
              <option value="full">Full payment at booking</option>
            </select>
          </label>
          {mode === 'deposit' && (
            <label className="flex flex-col gap-1.5 max-w-[200px]">
              <span className="text-[12px] font-medium text-muted">Deposit percent</span>
              <input
                type="number"
                min={1}
                max={100}
                value={depositPercent}
                onChange={(e) => setDepositPercent(e.target.value)}
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
          )}
        </div>
        <button
          type="button"
          onClick={savePayment}
          disabled={updatePaymentPolicy.isPending}
          className="mt-4 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
        >
          {updatePaymentPolicy.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>

      <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base2 font-bold text-ink">Cancellation policy</h2>
          <SavedChip show={savedCancellation} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Free-cancel window (hrs)</span>
            <input
              type="number"
              min={0}
              value={freeCancelHours}
              onChange={(e) => setFreeCancelHours(e.target.value)}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Late cancel fee (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={lateFeePercent}
              onChange={(e) => setLateFeePercent(e.target.value)}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>
          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">No-show fee (%)</span>
            <input
              type="number"
              min={0}
              max={100}
              value={noShowFeePercent}
              onChange={(e) => setNoShowFeePercent(e.target.value)}
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>
        </div>
        <button
          type="button"
          onClick={saveCancellation}
          disabled={updateCancellationPolicy.isPending}
          className="mt-4 rounded-btn bg-ink-grad px-4 py-2.5 text-label font-semibold text-white hover:brightness-110 transition disabled:opacity-60"
        >
          {updateCancellationPolicy.isPending ? 'Saving…' : 'Save changes'}
        </button>
      </div>
    </div>
  )
}
