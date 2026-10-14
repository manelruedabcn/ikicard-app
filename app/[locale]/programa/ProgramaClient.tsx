'use client'

import { useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'
import { getProgramaTexts } from '@/lib/programa-content'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function ProgramaClient({ locale, source }: { locale: string; source: string | null }) {
  const t = getProgramaTexts(locale)
  const l = t.landing
  const web = `https://www.ikigaier.com/${locale === 'ca' || locale === 'en' ? locale : 'es'}/`

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <a href={web} className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-[0.3em]">
          IKIGAIER
        </a>

        <header className="mt-10 sm:mt-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-5">{l.eyebrow}</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl sm:text-6xl leading-[1.02] text-[#272727] mb-5">{l.title}</h1>
          <p className="font-[family-name:var(--font-cormorant)] italic text-2xl leading-snug text-[#272727]/80 max-w-md">{l.lead}</p>
        </header>

        <div className="mt-10">
          <Form locale={locale} source={source} id="form-top" />
        </div>

        <section className="mt-14 space-y-4">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{l.howTitle}</h2>
          <ol className="space-y-3 border-l border-[#c2866b]/40 pl-5">
            {[t.semanas.antes, ...t.semanas.lista].map(w => {
              const [head, ...rest] = w.split(' · ')
              return (
                <li key={w}>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#c2866b]">{head}</p>
                  <p className="text-[15px] leading-relaxed text-[#272727]/80">{rest.join(' · ')}</p>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{l.needTitle}</h2>
          <ul className="space-y-2 text-[15px] leading-relaxed text-[#272727]/75">
            {l.need.map(n => <li key={n}>{n}</li>)}
          </ul>
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{l.whoTitle}</h2>
          <p className="text-[15px] leading-relaxed text-[#272727]/75">{l.who}</p>
        </section>

        <div className="mt-12">
          <Form locale={locale} source={source} id="form-bottom" />
        </div>

        <p className="mt-8 pb-10 text-sm text-[#272727]/55">
          {l.testFirst}{' '}
          <Link href={`/${locale}/inventario${source ? `?src=${encodeURIComponent(source)}` : ''}`} className="underline underline-offset-4 hover:text-[#c2866b]">
            {l.testLink}
          </Link>
        </p>
      </div>
    </div>
  )
}

function Form({ locale, source, id }: { locale: string; source: string | null; id: string }) {
  const l = getProgramaTexts(locale).landing
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'pendiente' | 'ya' | 'confirmada' | 'error'>('idle')
  const t = getProgramaTexts(locale)

  if (status === 'pendiente' || status === 'ya' || status === 'confirmada') {
    return (
      <div className="rounded-xl bg-[#c2866b]/[0.08] px-5 py-6">
        <p className="text-sm leading-relaxed text-[#272727]/80">
          {status === 'pendiente' ? l.sent : status === 'ya' ? l.ya : t.optInDone}
        </p>
      </div>
    )
  }

  const valid = EMAIL_RE.test(email.trim())
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/programa/inscribir', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent, locale, source }),
      })
      const j = await res.json().catch(() => null)
      if (!res.ok || !j?.estado) return setStatus('error')
      setStatus(j.estado)
      trackEvent('generate_lead', { tool: 'programa', consent })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-[#c2866b]/40 bg-[#c2866b]/[0.06] px-5 py-6 sm:px-7 space-y-4">
      <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{l.formTitle}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id={`${id}-email`}
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={l.placeholder}
          className="flex-1 min-w-0 rounded-lg border border-[#272727]/20 bg-white px-4 py-3 text-sm text-[#272727] focus:border-[#c2866b] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!valid || status === 'sending'}
          className="px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
        >
          {status === 'sending' ? l.sending : l.button}
        </button>
      </div>
      <label htmlFor={`${id}-consent`} className="flex items-start gap-2 cursor-pointer">
        <input
          id={`${id}-consent`}
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-1 accent-[#c2866b]"
        />
        <span className="text-xs leading-relaxed text-[#272727]/55">{l.consent}</span>
      </label>
      {status === 'error' && <p className="text-xs text-red-700/70">{l.error}</p>}
    </form>
  )
}
