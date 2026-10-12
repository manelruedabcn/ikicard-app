'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'
import { INV_QUESTION_IDS, INV_TEXTO_MAX, type InvAnswers, type InvQuestionId } from '@/lib/inventario'
import {
  buildDevolucion,
  devolucionToText,
  getInvCopy,
  getInvOpen,
  getInvQuestions,
  type InvDevolucion,
  type InvQuote,
} from '@/lib/inventario-content'

type Stage = 'intro' | 'test' | 'result'
const PROGRESS_KEY = 'inventario_progress_v1'

interface Props {
  locale: string
  userId: string | null
  source: string | null
}

export default function InventarioClient({ locale, userId, source }: Props) {
  const copy = getInvCopy(locale)
  const questions = useMemo(() => getInvQuestions(locale), [locale])
  const open = getInvOpen(locale)
  const total = questions.length + 1

  const [stage, setStage] = useState<Stage>('intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<InvAnswers>>({})
  const [texto, setTexto] = useState('')
  const [devolucion, setDevolucion] = useState<InvDevolucion | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  // Recupera el progreso si la persona recarga a mitad del test.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${PROGRESS_KEY}:${locale}`)
      if (!raw) return
      const saved = JSON.parse(raw) as { step: number; answers: Partial<InvAnswers>; texto: string }
      if (saved && typeof saved.step === 'number') {
        setAnswers(saved.answers || {})
        setTexto(saved.texto || '')
        setStep(Math.min(saved.step, total - 1))
        setStage('test')
      }
    } catch {}
  }, [locale, total])

  function persist(nextStep: number, nextAnswers: Partial<InvAnswers>, nextTexto: string) {
    try {
      sessionStorage.setItem(`${PROGRESS_KEY}:${locale}`, JSON.stringify({ step: nextStep, answers: nextAnswers, texto: nextTexto }))
    } catch {}
  }

  function choose(id: InvQuestionId, value: string) {
    const next = { ...answers, [id]: value }
    setAnswers(next)
    // Pequeña pausa para que se vea la opción marcada antes de avanzar.
    setTimeout(() => {
      setStep(s => {
        const n = Math.min(s + 1, total - 1)
        persist(n, next, texto)
        return n
      })
      window.scrollTo({ top: 0 })
    }, 160)
  }

  function back() {
    if (step === 0) {
      setStage('intro')
      return
    }
    setStep(step - 1)
    persist(step - 1, answers, texto)
    window.scrollTo({ top: 0 })
  }

  function finish() {
    const complete = INV_QUESTION_IDS.every(id => answers[id])
    if (!complete) {
      // Si falta alguna (p. ej. progreso a medias), vuelve a la primera sin responder.
      const missing = INV_QUESTION_IDS.findIndex(id => !answers[id])
      setStep(missing)
      return
    }
    const a = answers as InvAnswers
    const clean = texto.trim().slice(0, INV_TEXTO_MAX)
    const d = buildDevolucion(a, clean, locale)
    setDevolucion(d)
    setStage('result')
    window.scrollTo({ top: 0 })
    try {
      sessionStorage.removeItem(`${PROGRESS_KEY}:${locale}`)
    } catch {}

    trackEvent('test_completed', { tool: 'inventario', route: d.lectura.route })
    // Pulso del funnel: solo respuestas cerradas (sin texto libre).
    fetch('/api/inventario/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers: a, locale, source }),
    })
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        if (j?.id) setAttemptId(j.id)
      })
      .catch(() => {})
  }

  function restart() {
    setAnswers({})
    setTexto('')
    setStep(0)
    setDevolucion(null)
    setAttemptId(null)
    setStage('intro')
    window.scrollTo({ top: 0 })
  }

  // ---------- INTRO ----------
  if (stage === 'intro') {
    return (
      <Shell userId={userId} locale={locale}>
        <div className="w-full max-w-xl mt-6 sm:mt-12">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-5">{copy.eyebrow}</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl sm:text-6xl leading-[1.02] text-[#272727] mb-5">
            {copy.title}
          </h1>
          <p className="font-[family-name:var(--font-cormorant)] italic text-2xl leading-snug text-[#272727]/80 mb-7 max-w-md">
            {copy.lead}
          </p>
          <div className="space-y-3 text-base leading-relaxed text-[#272727]/65 max-w-lg mb-9">
            {copy.body.map(p => <p key={p}>{p}</p>)}
          </div>
          <button
            onClick={() => { setStage('test'); setStep(0); window.scrollTo({ top: 0 }) }}
            className="px-8 py-3.5 bg-[#272727] text-[#FDFBF7] text-sm tracking-widest hover:bg-[#c2866b] transition-colors"
          >
            {copy.start}
          </button>
        </div>
      </Shell>
    )
  }

  // ---------- TEST ----------
  if (stage === 'test') {
    const isOpen = step >= questions.length
    const q = isOpen ? null : questions[step]
    return (
      <Shell userId={userId} locale={locale}>
        <div className="w-full max-w-xl mt-4">
          <div className="flex items-baseline justify-between mb-3">
            <p className="text-xs tracking-[0.2em] uppercase text-[#272727]/50">{q ? q.block : open.block}</p>
            <p className="text-xs text-[#272727]/45">{step + 1} {copy.of} {total}</p>
          </div>
          <div className="h-[2px] bg-[#272727]/10 mb-8" aria-hidden="true">
            <div className="h-full bg-[#c2866b] transition-all" style={{ width: `${Math.round((step / total) * 100)}%` }} />
          </div>

          <h2 id="inv-q" className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-[34px] leading-[1.15] text-[#272727] mb-2">
            {q ? q.text : open.text}
          </h2>
          <p className="text-xs italic text-[#272727]/45 mb-7">{q ? q.src : open.src}</p>

          {q ? (
            <div role="group" aria-labelledby="inv-q" className="grid gap-2">
              {q.opts.map(([value, label]) => {
                const active = answers[q.id] === value
                return (
                  <button
                    key={value}
                    onClick={() => choose(q.id, value)}
                    aria-pressed={active}
                    className={`text-left rounded-lg border px-4 py-3.5 text-[15px] leading-snug transition-colors ${
                      active
                        ? 'border-[#c2866b] bg-[#c2866b]/[0.07] text-[#272727]'
                        : 'border-[#272727]/15 text-[#272727]/85 hover:border-[#c2866b]'
                    }`}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          ) : (
            <div>
              <label htmlFor="inv-texto" className="block text-sm text-[#272727]/55 mb-2">{open.hint}</label>
              <textarea
                id="inv-texto"
                value={texto}
                maxLength={INV_TEXTO_MAX}
                onChange={e => { setTexto(e.target.value); persist(step, answers, e.target.value) }}
                rows={5}
                className="w-full rounded-lg border border-[#272727]/20 bg-white px-4 py-3 text-[15px] text-[#272727] focus:border-[#c2866b] focus:outline-none"
              />
            </div>
          )}

          <div className="flex items-center justify-between mt-8">
            <button onClick={back} className="text-sm text-[#272727]/50 underline underline-offset-4 hover:text-[#272727]">
              {copy.back}
            </button>
            {!q && (
              <button
                onClick={finish}
                className="px-7 py-3 bg-[#272727] text-[#FDFBF7] text-sm tracking-widest hover:bg-[#c2866b] transition-colors"
              >
                {copy.finish}
              </button>
            )}
          </div>
        </div>
      </Shell>
    )
  }

  // ---------- RESULTADO ----------
  if (!devolucion) return null
  const d = devolucion
  const fecha = new Date().toLocaleDateString(copy.dateLocale, { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <Shell userId={userId} locale={locale} wide>
      <article className="w-full max-w-3xl mt-4 space-y-10">
        <header>
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">{copy.resultEyebrow} · {fecha}</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl leading-[1.05] text-[#272727] mb-3">
            {copy.resultTitle}
          </h1>
          <p className="text-[15px] text-[#272727]/60">{copy.resultIntro}</p>
        </header>

        <div>
          <div className="grid sm:grid-cols-2 border-y border-[#272727]/12">
            <Column title={copy.activoTitle} sub={copy.activoSub} items={d.activo} />
            <Column title={copy.conscTitle} sub={copy.conscSub} items={d.consciente} right />
          </div>
          <p className="text-sm text-[#272727]/60 mt-3">
            <span className="text-[#272727] font-medium">{copy.between}</span> {d.between}
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{copy.supportsTitle}</h2>
          {d.supports.length ? d.supports.map(s => (
            <div key={s.text} className="space-y-3">
              <p className="text-[15px] leading-relaxed text-[#272727]/85">
                <span className="text-[11px] tracking-[0.18em] uppercase text-[#272727]/45 mr-2">{s.dim}</span>
                {s.text}
              </p>
              {s.quote && <Quote quote={s.quote} cite={s.cite!} book={copy.book} q={copy.q} />}
            </div>
          )) : <p className="text-[15px] leading-relaxed text-[#272727]/85">{d.noSupport}</p>}
        </section>

        <section className="space-y-4">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{copy.attentionTitle}</h2>
          {d.attention.kind === 'route' ? (
            <>
              <p className="text-[15px] leading-relaxed text-[#272727]/85">{d.attention.text}</p>
              <Quote quote={d.attention.quote} cite={d.attention.cite} book={copy.book} q={copy.q} />
            </>
          ) : (
            <>
              <p className="text-[15px] leading-relaxed text-[#272727]/85">{d.attention.main.lead}</p>
              <p className="text-sm text-[#272727]/55">{d.attention.main.intro}</p>
              <Quote quote={d.attention.main.quote} cite={d.attention.main.cite} book={copy.book} q={copy.q} />
              {d.attention.main.note && <p className="text-[15px] leading-relaxed text-[#272727]/85">{d.attention.main.note}</p>}
              {d.attention.also && <p className="text-sm text-[#272727]/55">{d.attention.also}</p>}
            </>
          )}
          {d.pair && <p className="text-sm text-[#272727]/55">{d.pair}</p>}
        </section>

        {d.texto && (
          <section className="space-y-2">
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{copy.writtenTitle}</h2>
            <p className="font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727]">{copy.q[0]}{d.texto}{copy.q[1]}</p>
            <p className="text-sm text-[#272727]/55">{copy.writtenNote}</p>
          </section>
        )}

        <section className="rounded-xl bg-[#272727]/[0.04] p-6 space-y-3">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#272727]/50">{copy.exerciseEyebrow} {d.exercise.cap}</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{d.exercise.title}</h2>
          {d.exercise.steps.map(s => <p key={s} className="text-[15px] leading-relaxed text-[#272727]/85">{s}</p>)}
        </section>

        <p className="text-sm leading-relaxed text-[#272727]/60 max-w-2xl">{d.close}</p>

        <LeadCapture
          locale={locale}
          answers={answers as InvAnswers}
          texto={d.texto}
          attemptId={attemptId}
          source={source}
        />

        <details className="border-t border-[#272727]/12 pt-4">
          <summary className="cursor-pointer text-sm text-[#272727]/55 hover:text-[#272727]">{copy.basis}</summary>
          <ul className="mt-3 space-y-2.5 text-sm">
            {d.basis.map(b => (
              <li key={b.q}><span className="block text-xs text-[#272727]/45">{b.q}</span>{b.a}</li>
            ))}
          </ul>
        </details>

        <div className="flex flex-wrap gap-3 pb-8">
          <CopyButton text={devolucionToText(d, locale, fecha)} label={copy.copyButton} doneLabel={copy.copied} />
          <button onClick={restart} className="px-5 py-2.5 border border-[#272727]/20 text-sm text-[#272727] hover:border-[#272727]">
            {copy.restart}
          </button>
        </div>
      </article>
    </Shell>
  )
}

function Column({ title, sub, items, right = false }: { title: string; sub: string; items: string[]; right?: boolean }) {
  return (
    <div className={`py-5 min-w-0 ${right ? 'border-t sm:border-t-0 sm:border-l border-[#272727]/12 sm:pl-6' : 'sm:pr-6'}`}>
      <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{title}</h3>
      <p className="text-xs text-[#272727]/50 mb-3">{sub}</p>
      <ul className="space-y-2 text-sm leading-relaxed text-[#272727]/80">
        {items.map(t => (
          <li key={t} className="relative pl-4">
            <span className="absolute left-0 top-[0.7em] h-px w-2 bg-[#c2866b]" aria-hidden="true" />
            {t}
          </li>
        ))}
      </ul>
    </div>
  )
}

function Quote({ quote, cite, book, q }: InvQuote & { book: string; q: [string, string] }) {
  return (
    <blockquote className="border-l-2 border-[#c2866b] pl-4">
      <p className="font-[family-name:var(--font-cormorant)] italic text-[22px] leading-snug text-[#272727]">{q[0]}{quote}{q[1]}</p>
      <cite className="block not-italic text-xs text-[#272727]/45 mt-1.5">{cite} · {book}</cite>
    </blockquote>
  )
}

function CopyButton({ text, label: idleLabel, doneLabel }: { text: string; label: string; doneLabel: string }) {
  const [state, setState] = useState<'idle' | 'done' | 'manual'>('idle')
  const label = state === 'done' ? doneLabel : idleLabel
  return (
    <div className="w-full sm:w-auto">
      <button
        onClick={() => {
          // Algunas vistas bloquean el portapapeles: entonces se muestra el texto para copiarlo a mano.
          if (!navigator.clipboard) {
            setState('manual')
            return
          }
          navigator.clipboard.writeText(text).then(() => setState('done'), () => setState('manual'))
        }}
        className="px-5 py-2.5 border border-[#272727]/20 text-sm text-[#272727] hover:border-[#272727]"
      >
        {label}
      </button>
      {state === 'manual' && (
        <textarea readOnly value={text} rows={8} className="mt-3 w-full rounded-lg border border-[#272727]/15 p-3 text-xs" onFocus={e => e.currentTarget.select()} />
      )}
    </div>
  )
}

// Captura de email. El botón es TRANSACCIONAL (la persona pide su devolución);
// el checkbox, SEPARADO y opcional, es el consentimiento de marketing.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LeadCapture({
  locale,
  answers,
  texto,
  attemptId,
  source,
}: {
  locale: string
  answers: InvAnswers
  texto: string
  attemptId: string | null
  source: string | null
}) {
  const copy = getInvCopy(locale).mail
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  if (status === 'done') {
    return (
      <div className="rounded-xl bg-[#c2866b]/[0.08] px-5 py-6">
        <p className="text-sm text-[#272727]/75">{copy.done}</p>
      </div>
    )
  }

  const valid = EMAIL_RE.test(email.trim())
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/inventario/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), consent, answers, texto, attemptId, locale, source }),
      })
      setStatus(res.ok ? 'done' : 'error')
      if (res.ok) trackEvent('generate_lead', { tool: 'inventario', consent })
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/[0.05] px-5 py-6 space-y-3">
      <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{copy.title}</p>
      <p className="text-sm leading-relaxed text-[#272727]/65">{copy.body}</p>
      <div className="flex flex-col sm:flex-row gap-2">
        <input
          id="inv-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          aria-label="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder={copy.placeholder}
          className="flex-1 min-w-0 rounded-lg border border-[#272727]/20 bg-white px-4 py-3 text-sm text-[#272727] focus:border-[#c2866b] focus:outline-none"
        />
        <button
          type="submit"
          disabled={!valid || status === 'sending'}
          className="px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
        >
          {status === 'sending' ? copy.sending : copy.button}
        </button>
      </div>
      <label htmlFor="inv-consent" className="flex items-start gap-2 cursor-pointer">
        <input
          id="inv-consent"
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-1 accent-[#c2866b]"
        />
        <span className="text-xs leading-relaxed text-[#272727]/60">{copy.consent}</span>
      </label>
      {status === 'error' && <p className="text-xs text-red-700/70">{copy.error}</p>}
    </form>
  )
}

function Shell({
  userId,
  locale,
  wide = false,
  children,
}: {
  userId: string | null
  locale: string
  wide?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      <div className={`w-full ${wide ? 'max-w-3xl' : 'max-w-xl'} flex items-center justify-between mb-8`}>
        <Link
          href={userId ? `/${locale}/dashboard` : `https://www.ikigaier.com/${locale === 'ca' || locale === 'en' ? locale : 'es'}/`}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-[0.3em]"
        >
          IKIGAIER
        </Link>
      </div>
      {children}
    </div>
  )
}
