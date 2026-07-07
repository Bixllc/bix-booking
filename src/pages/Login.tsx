import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ApiError } from '../lib/apiClient'
import { useAuth } from '../context/AuthContext'
import { BixMark } from '../components/ui/BixMark'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [slug, setSlug] = useState('big-cadi-vip')
  const [email, setEmail] = useState('cadi@bigcadivip.com')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(slug, email, password)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-canvas px-4">
      <div className="w-full max-w-sm animate-scrIn">
        <div className="flex items-center justify-center gap-2.5 mb-8">
          <span className="text-indigo-500">
            <BixMark size={26} />
          </span>
          <span className="text-wordmark text-ink">Bix</span>
        </div>

        <form onSubmit={handleSubmit} className="rounded-card bg-surface border border-border p-7 flex flex-col gap-4">
          <div>
            <h1 className="text-lead text-ink">Sign in</h1>
            <p className="text-body text-muted mt-0.5">Welcome back — enter your workspace details.</p>
          </div>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Workspace URL</span>
            <div className="flex items-center rounded-field border border-border bg-canvas px-3.5 focus-within:border-gold transition">
              <input
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="big-cadi-vip"
                required
                className="flex-1 min-w-0 bg-transparent py-2.5 text-body text-ink placeholder:text-faint outline-none"
              />
            </div>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-muted">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="rounded-field border border-border bg-canvas px-3.5 py-2.5 text-body text-ink outline-none focus:border-gold transition"
            />
          </label>

          {error && (
            <p className="text-[12.5px] text-rose-600 bg-rose-50 border border-rose-100 rounded-field px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="mt-1 w-full rounded-btn bg-ink-grad py-3 text-base2 font-bold text-white hover:brightness-110 transition disabled:opacity-60"
          >
            {submitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  )
}
