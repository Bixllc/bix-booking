const fields = [
  { label: 'Business name', value: 'Big Cadi VIP' },
  { label: 'Support email', value: 'concierge@bigcadivip.com' },
  { label: 'Phone', value: '+1 (305) 555-0148' },
  { label: 'Time zone', value: 'America/New_York' },
]

const toggles = [
  { label: 'Require deposit on booking', description: 'Clients pay 20% upfront to confirm a slot.', enabled: true },
  { label: 'Allow same-day bookings', description: 'Clients can book with less than 24h notice.', enabled: false },
  { label: 'SMS reminders', description: 'Send a text 2 hours before each appointment.', enabled: true },
]

export function Settings() {
  return (
    <div className="flex flex-col gap-5 max-w-3xl">
      <div>
        <h1 className="text-xl font-bold text-ink">Settings</h1>
        <p className="text-body text-muted mt-0.5">Workspace details and booking policies.</p>
      </div>

      <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
        <h2 className="text-base2 font-bold text-ink mb-4">General</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map((f) => (
            <label key={f.label} className="flex flex-col gap-1.5">
              <span className="text-[12px] font-medium text-muted">{f.label}</span>
              <input
                defaultValue={f.value}
                className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-surface border border-border p-4 sm:p-5 animate-scrIn">
        <h2 className="text-base2 font-bold text-ink mb-4">Booking policies</h2>
        <div className="flex flex-col divide-y divide-border">
          {toggles.map((t) => (
            <div key={t.label} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
              <div>
                <div className="text-body font-semibold text-ink">{t.label}</div>
                <div className="text-[12px] text-muted mt-0.5">{t.description}</div>
              </div>
              <label className="relative inline-flex items-center shrink-0 cursor-pointer">
                <input type="checkbox" defaultChecked={t.enabled} className="peer sr-only" />
                <div className="w-9 h-5 rounded-full bg-border peer-checked:bg-ink transition-colors" />
                <div className="absolute left-0.5 top-0.5 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-4" />
              </label>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-card bg-surface border border-rose-100 p-4 sm:p-5 animate-scrIn">
        <h2 className="text-base2 font-bold text-rose-600 mb-1">Danger zone</h2>
        <p className="text-[12px] text-muted mb-4">Deleting your workspace removes all bookings, clients, and history.</p>
        <button type="button" className="rounded-btn border border-rose-200 text-rose-600 px-4 py-2 text-label font-semibold hover:bg-rose-50 transition">
          Delete workspace
        </button>
      </div>
    </div>
  )
}
