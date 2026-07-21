import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import {
  BellRing,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock3,
  CreditCard,
  Link2,
  ListChecks,
  Mail,
  Menu,
  Play,
  Share2,
  SlidersHorizontal,
  Users,
  X,
} from 'lucide-react'
import { BixMark } from '../components/ui/BixMark'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Product', href: '#product' },
  { label: 'Pricing', href: '#contact' },
]

const marqueeItems = [
  'Big Cadi VIP',
  'Smoove Skin Studio',
  'Aurora Chauffeurs',
  'Glow Aesthetics Bar',
  'Blue Harbor Yacht Co.',
  'Pulse Wellness Studio',
  'Metro Black Car',
  'Halo Med Spa',
]

const features = [
  {
    icon: Clock3,
    title: 'Smart availability',
    body: 'Bix only shows slots you can actually fulfil — work hours, buffers and travel time factored in automatically.',
    tint: 'violet' as const,
  },
  {
    icon: CreditCard,
    title: 'Deposits & payments',
    body: 'Take a deposit or full payment up front. Cards are charged on your rules, refunds handled cleanly.',
    tint: 'white' as const,
  },
  {
    icon: ListChecks,
    title: 'Custom booking flow',
    body: 'Drag to arrange the exact steps clients walk through. Toggle fields on, off or required.',
    tint: 'white' as const,
  },
  {
    icon: BellRing,
    title: 'Automatic reminders',
    body: 'Email and SMS confirmations and reminders go out on their own — fewer no-shows, zero follow-up.',
    tint: 'amber' as const,
  },
  {
    icon: Users,
    title: 'Team scheduling',
    body: 'Invite staff, set their hours, and assign them to the services they cover.',
    tint: 'white' as const,
  },
  {
    icon: Link2,
    title: 'Your branded page',
    body: 'A polished booking page under your name — share the link in your bio, emails and WhatsApp.',
    tint: 'white' as const,
  },
]

const showcase = [
  {
    tag: 'CALENDAR',
    title: 'Every booking, day by day.',
    body: "Your whole week at a glance — who's booked, with which staff member, and what it's worth. Switch between day, week and month in a click.",
    bullets: ['Colour-coded by staff and status', 'Drag to reschedule, tap to confirm', 'Live totals as bookings roll in'],
    image: '/screenshots/calendar.jpg',
    reverse: false,
  },
  {
    tag: 'DASHBOARD',
    title: 'Wake up to a full pipeline.',
    body: "Today's revenue, appointments and pending confirmations up top — approve requests and prep your day before your first coffee.",
    bullets: ['One-tap confirm or decline', 'Revenue and no-show trends', 'Recent activity as it happens'],
    image: '/screenshots/dashboard.jpg',
    reverse: true,
  },
]

const steps = [
  {
    n: '01',
    icon: ClipboardList,
    title: 'Add your services',
    body: 'List what clients can book — duration, price, description — in a couple of clicks.',
  },
  {
    n: '02',
    icon: SlidersHorizontal,
    title: 'Set your rules',
    body: 'Availability, deposits, cancellation policy and your team — configured once with guided setup.',
  },
  {
    n: '03',
    icon: Share2,
    title: 'Share & get booked',
    body: 'Publish your page and drop the link anywhere. Bookings land straight in your calendar.',
  },
]

const includes = [
  'Unlimited booking page views',
  'Deposits & card payments',
  'Email + SMS reminders',
  'Custom booking flow',
  'Team scheduling',
]

const footerColumns = [
  {
    title: 'PRODUCT',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'Booking flow', href: '#how' },
      { label: 'Calendar', href: '#product' },
      { label: 'Payments', href: '#contact' },
    ],
  },
  {
    title: 'COMPANY',
    links: [
      { label: 'About', href: '#features' },
      { label: 'Customers', href: '#brands' },
      { label: 'Careers', href: '#contact' },
      { label: 'Contact', href: '#contact' },
    ],
  },
  {
    title: 'RESOURCES',
    links: [
      { label: 'Help center', href: '#how' },
      { label: 'Guides', href: '#how' },
      { label: 'Changelog', href: '#features' },
      { label: 'Status', href: '#contact' },
    ],
  },
]

function BrowserFrame({ url, children, className = '' }: { url?: string; children: ReactNode; className?: string }) {
  return (
    <div
      className={`overflow-hidden rounded-land-card border border-land-line bg-white shadow-[0_30px_60px_-30px_rgba(90,68,199,.35)] ${className}`}
    >
      <div className="h-10 flex items-center gap-2 px-4 border-b border-land-line bg-land-canvas shrink-0">
        <span className="size-2.5 rounded-full bg-[#f0958c]" />
        <span className="size-2.5 rounded-full bg-[#f3cf8f]" />
        <span className="size-2.5 rounded-full bg-[#9fdba0]" />
        {url && (
          <span className="ml-3 max-w-[260px] truncate rounded-land-pill border border-land-line bg-white px-3 py-1 text-center font-mono text-[11px] text-land-muted-3">
            {url}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="font-mono text-[12px] font-semibold uppercase tracking-[.12em] text-violet">{children}</p>
  )
}

const featureTint: Record<'violet' | 'white' | 'amber', { card: string; tile: string; icon: string }> = {
  violet: { card: 'bg-violet-tint', tile: 'bg-violet', icon: 'text-white' },
  white: { card: 'bg-white', tile: 'bg-violet-tint', icon: 'text-violet' },
  amber: { card: 'bg-amber-card', tile: 'bg-amber', icon: 'text-white' },
}

export function Landing() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-land-canvas font-sans text-land-ink">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b border-land-line bg-land-canvas/82 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-shell items-center justify-between px-6 md:px-[34px]">
          <a href="#top" className="flex items-center gap-2.5 text-violet">
            <BixMark size={30} />
            <span className="text-[17px] font-extrabold tracking-tight text-land-ink">Bix Booking</span>
          </a>

          <nav className="hidden items-center gap-8 md:flex">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="font-mono text-[12px] font-medium uppercase tracking-[.1em] text-land-muted-2 transition hover:text-violet"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="text-[13.5px] font-semibold text-land-muted-2 transition hover:text-land-ink">
              Sign in
            </Link>
            <Link
              to="/login"
              className="flex h-[44px] items-center rounded-land-chip bg-violet px-5 text-[13.5px] font-bold text-white shadow-[0_16px_34px_-14px_rgba(90,68,199,.7)] transition hover:bg-violet-deep"
            >
              Get started
            </Link>
          </div>

          <button
            type="button"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            onClick={() => setMenuOpen((v) => !v)}
            className="flex size-11 items-center justify-center rounded-land-chip text-land-ink md:hidden"
          >
            {menuOpen ? <X size={22} strokeWidth={1.7} /> : <Menu size={22} strokeWidth={1.7} />}
          </button>
        </div>

        {menuOpen && (
          <div className="border-t border-land-line bg-land-canvas px-6 pb-6 pt-4 md:hidden">
            <nav className="flex flex-col gap-1">
              {navLinks.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="flex min-h-[44px] items-center font-mono text-[13px] font-medium uppercase tracking-[.1em] text-land-muted-2"
                >
                  {l.label}
                </a>
              ))}
            </nav>
            <div className="mt-3 flex flex-col gap-2.5 border-t border-land-line pt-4">
              <Link
                to="/login"
                className="flex min-h-[44px] items-center justify-center rounded-land-chip border border-land-line text-[14px] font-semibold text-land-ink"
              >
                Sign in
              </Link>
              <Link
                to="/login"
                className="flex min-h-[44px] items-center justify-center rounded-land-chip bg-violet text-[14px] font-bold text-white"
              >
                Get started
              </Link>
            </div>
          </div>
        )}
      </header>

      <main id="top">
        {/* Hero */}
        <section className="relative overflow-hidden px-6 pb-16 pt-16 md:px-[34px] md:pb-24 md:pt-24">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-40 -top-40 hidden size-[560px] rounded-full bg-violet/20 blur-[120px] md:block"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -left-52 top-40 hidden size-[480px] rounded-full bg-amber/15 blur-[120px] md:block"
          />

          <div className="relative mx-auto flex max-w-hero flex-col items-center text-center">
            <span
              className="motion-reduce:animate-none inline-flex animate-rise items-center gap-2 rounded-land-pill border border-land-line bg-white px-4 py-1.5 text-[12.5px] font-semibold text-land-muted"
            >
              <span className="size-1.5 rounded-full bg-violet motion-reduce:animate-none animate-pulse" />
              Booking software for service brands
            </span>

            <h1
              className="motion-reduce:animate-none mt-6 animate-rise text-4xl font-extrabold leading-[1.05] tracking-tight text-land-ink md:text-7xl"
              style={{ animationDelay: '90ms' }}
            >
              Bookings that run while you{' '}
              <span className="italic text-violet">don't.</span>
            </h1>

            <p
              className="motion-reduce:animate-none mt-6 max-w-[560px] animate-rise text-[17px] leading-relaxed text-land-muted md:text-[19px]"
              style={{ animationDelay: '160ms' }}
            >
              Scheduling, deposits, reminders and your own branded booking page — running automatically, day and
              night.
            </p>

            <div
              className="motion-reduce:animate-none mt-8 flex w-full max-w-sm animate-rise flex-col gap-3 sm:max-w-none sm:w-auto sm:flex-row"
              style={{ animationDelay: '230ms' }}
            >
              <Link
                to="/login"
                className="flex h-[52px] w-full items-center justify-center rounded-land-chip bg-violet px-7 text-[14.5px] font-bold text-white shadow-[0_16px_34px_-14px_rgba(90,68,199,.7)] transition hover:bg-violet-deep sm:w-auto"
              >
                Start free
              </Link>
              <a
                href="#how"
                className="flex h-[52px] w-full items-center justify-center gap-2 rounded-land-chip border border-land-line bg-white px-7 text-[14.5px] font-bold text-land-ink transition hover:border-[#a996f2] sm:w-auto"
              >
                <Play size={15} strokeWidth={1.7} />
                See how it works
              </a>
            </div>

            <div
              className="motion-reduce:animate-none relative mt-14 w-full max-w-[1000px] animate-rise"
              style={{ animationDelay: '300ms' }}
            >
              <BrowserFrame url="bix.app/big-cadi-vip">
                <img src="/screenshots/dashboard.jpg" alt="Bix dashboard showing today's bookings and revenue" className="h-auto w-full" />
              </BrowserFrame>

              <div
                className="motion-reduce:animate-none absolute -bottom-5 left-4 hidden animate-slideUp items-center gap-2.5 rounded-land-card border border-land-line bg-white px-4 py-3 shadow-[0_20px_40px_-18px_rgba(36,31,51,.25)] md:flex"
                style={{ animationDelay: '520ms' }}
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-ok/15 text-ok">
                  <Check size={16} strokeWidth={2.4} />
                </span>
                <div className="text-left">
                  <p className="text-[13px] font-semibold text-land-ink">New booking</p>
                  <p className="text-[12px] text-land-muted-3">Yacht tour · just now</p>
                </div>
              </div>

              <div
                className="motion-reduce:animate-none absolute -top-5 right-6 hidden animate-slideUp flex-col rounded-land-card bg-amber px-4 py-2.5 shadow-[0_20px_40px_-18px_rgba(187,139,44,.5)] md:flex"
                style={{ animationDelay: '600ms' }}
              >
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[.12em] text-white/80">
                  Today
                </span>
                <span className="text-[19px] font-extrabold text-white">$2,455</span>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee */}
        <section id="brands" className="overflow-hidden border-y border-land-line py-6">
          <div className="motion-reduce:[animation-play-state:paused] flex w-max animate-marq gap-10 whitespace-nowrap">
            {[0, 1].map((dup) => (
              <div key={dup} className="flex items-center gap-10">
                {marqueeItems.map((name, i) => (
                  <span key={`${dup}-${name}`} className="flex items-center gap-10">
                    <span className={`text-[15px] font-semibold ${i < 2 ? 'text-land-ink' : 'text-land-faint'}`}>
                      {name}
                    </span>
                    <span className="size-1 rounded-full bg-land-faint" />
                  </span>
                ))}
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="px-6 py-14 md:px-[34px] md:py-[88px]">
          <div className="mx-auto max-w-shell">
            <div className="mx-auto max-w-copy text-center">
              <Eyebrow>01 / THE PLATFORM</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-land-ink md:text-[34px]">
                Your whole booking operation, in one place.
              </h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-land-muted md:text-[16.5px]">
                Everything a service business needs to take bookings, get paid and keep clients coming back — no
                separate tools to wire together.
              </p>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {features.map((f) => {
                const tint = featureTint[f.tint]
                const Icon = f.icon
                return (
                  <div
                    key={f.title}
                    className={`rounded-land-card border border-land-line-2 p-6 transition hover:-translate-y-1 hover:shadow-[0_24px_48px_-24px_rgba(90,68,199,.35)] ${tint.card}`}
                  >
                    <div className={`flex size-12 items-center justify-center rounded-land-chip ${tint.tile}`}>
                      <Icon size={20} strokeWidth={1.7} className={tint.icon} />
                    </div>
                    <h3 className="mt-5 text-[19px] font-bold text-land-ink">{f.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-land-muted">{f.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Product showcase */}
        <section id="product" className="px-6 py-14 md:px-[34px] md:py-[88px]">
          <div className="mx-auto flex max-w-shell flex-col gap-16 md:gap-24">
            {showcase.map((row) => (
              <div
                key={row.tag}
                className={`flex flex-col gap-10 md:items-center md:gap-14 ${row.reverse ? 'md:flex-row-reverse' : 'md:flex-row'}`}
              >
                <div className="flex-1">
                  <Eyebrow>{row.tag}</Eyebrow>
                  <h3 className="mt-3 text-[26px] font-extrabold tracking-tight text-land-ink md:text-[34px]">
                    {row.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-land-muted md:text-[16px]">{row.body}</p>
                  <ul className="mt-6 flex flex-col gap-3">
                    {row.bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2.5 text-[14.5px] text-land-ink">
                        <CheckCircle2 size={18} strokeWidth={1.7} className="mt-0.5 shrink-0 text-violet" />
                        {b}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-[1.2]">
                  <BrowserFrame>
                    <img src={row.image} alt={row.title} className="h-auto w-full" />
                  </BrowserFrame>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section id="how" className="px-6 py-14 md:px-[34px] md:py-[88px]">
          <div className="mx-auto max-w-shell">
            <div className="mx-auto max-w-copy text-center">
              <Eyebrow>02 / GETTING LIVE</Eyebrow>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-land-ink md:text-[34px]">
                Set up once. Book forever.
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((s) => {
                const Icon = s.icon
                return (
                  <div key={s.n} className="rounded-land-card border border-land-line-2 bg-white p-6">
                    <div className="flex items-center justify-between">
                      <span className="flex size-[38px] items-center justify-center rounded-land-chip bg-violet font-mono text-[13px] font-bold text-white">
                        {s.n}
                      </span>
                      <Icon size={20} strokeWidth={1.7} className="text-land-faint" />
                    </div>
                    <h3 className="mt-5 text-[20px] font-bold text-land-ink">{s.title}</h3>
                    <p className="mt-2 text-[14.5px] leading-relaxed text-land-muted">{s.body}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Contact for pricing */}
        <section id="contact" className="px-6 py-14 md:px-[34px] md:py-[88px]">
          <div
            className="relative mx-auto max-w-shell overflow-hidden rounded-land-panel border border-[#eae2f8] p-8 md:p-14"
            style={{ backgroundImage: 'linear-gradient(135deg,#efeafd,#f6f0fb 55%,#faf3ea)' }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-32 -top-32 size-[420px] rounded-full bg-violet/15 blur-[110px]"
            />
            <div className="relative grid grid-cols-1 gap-10 md:grid-cols-2 md:gap-14">
              <div>
                <Eyebrow>03 / PRICING</Eyebrow>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-land-ink md:text-[34px]">
                  Pricing that fits how you work.
                </h2>
                <p className="mt-4 max-w-[440px] text-[15px] leading-relaxed text-land-muted md:text-[16px]">
                  Every service business runs differently. Tell us about your team, your services and your volume —
                  we'll put together a plan that makes sense.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <a
                    href="mailto:hello@bix.app"
                    className="flex h-[52px] items-center justify-center gap-2 rounded-land-chip bg-violet px-6 text-[14.5px] font-bold text-white shadow-[0_16px_34px_-14px_rgba(90,68,199,.7)] transition hover:bg-violet-deep"
                  >
                    <Mail size={16} strokeWidth={1.7} />
                    Contact for pricing
                  </a>
                  <a
                    href="mailto:hello@bix.app?subject=Demo%20request"
                    className="flex h-[52px] items-center justify-center text-[14.5px] font-semibold text-violet-deep underline-offset-4 hover:underline"
                  >
                    Book a demo
                  </a>
                </div>
              </div>

              <div className="rounded-land-card border border-land-line bg-white p-6 md:p-7">
                <p className="font-mono text-[11.5px] font-semibold uppercase tracking-[.12em] text-land-muted-3">
                  Every plan includes
                </p>
                <ul className="mt-4 flex flex-col gap-3.5">
                  {includes.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-[14.5px] text-land-ink">
                      <CheckCircle2 size={18} strokeWidth={1.7} className="shrink-0 text-violet" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-land-line px-6 py-14 md:px-[34px]">
        <div className="mx-auto max-w-shell">
          <div className="flex flex-col gap-12 md:flex-row md:justify-between">
            <div className="max-w-[280px]">
              <div className="flex items-center gap-2.5 text-violet">
                <BixMark size={26} />
                <span className="text-[16px] font-extrabold text-land-ink">Bix Booking</span>
              </div>
              <p className="mt-3 text-[13.5px] leading-relaxed text-land-muted-3">
                Booking software for service businesses that never want to miss an appointment.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8 md:flex md:gap-16">
              {footerColumns.map((col) => (
                <div key={col.title}>
                  <p className="font-mono text-[11px] font-semibold uppercase tracking-[.12em] text-land-muted-3">
                    {col.title}
                  </p>
                  <ul className="mt-4 flex flex-col gap-2.5">
                    {col.links.map((l) => (
                      <li key={l.label}>
                        <a href={l.href} className="text-[13.5px] text-land-muted transition hover:text-violet">
                          {l.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col gap-2 border-t border-land-line pt-6 text-[12.5px] text-land-muted-3 md:flex-row md:items-center md:justify-between">
            <span>© 2026 Bix, Inc. All rights reserved.</span>
            <span>Made for people who'd rather be working than scheduling.</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
