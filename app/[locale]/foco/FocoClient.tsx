'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { FOCO_DIMS, FOCO_TOTAL, computeFoco, focoZone, type FocoAnswers } from '@/lib/foco'
import { getFocoCopy } from '@/lib/foco-content'

type Stage = 'intro' | 'test' | 'result'

interface Props {
  locale: string
  userId: string | null
  // Último resultado guardado (solo con sesión): se muestra al volver.
  previous: number[] | null
}

const empty = (): FocoAnswers => new Array(FOCO_TOTAL).fill(null)

export default function FocoClient({ locale, userId, previous }: Props) {
  const copy = getFocoCopy(locale)
  const supabase = useMemo(() => createClient(), [])

  const [stage, setStage] = useState<Stage>(previous ? 'result' : 'intro')
  const [answers, setAnswers] = useState<FocoAnswers>(previous ?? empty())
  const [cur, setCur] = useState(0)
  const [saved, setSaved] = useState(false)
  const [toast, setToast] = useState('')
  const lock = useRef(false)

  // Teclas 1-5 para responder (como el test original).
  useEffect(() => {
    if (stage !== 'test') return
    const onKey = (e: KeyboardEvent) => {
      const n = parseInt(e.key, 10)
      if (n >= 1 && n <= 5) pick(n)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  function start() {
    setAnswers(empty())
    setCur(0)
    setSaved(false)
    setToast('')
    setStage('test')
    window.scrollTo({ top: 0 })
    trackEvent('foco_start', { locale })
  }

  function pick(v: number) {
    if (lock.current) return
    lock.current = true
    const next = [...answers]
    next[cur] = v
    setAnswers(next)
    // Pequeña pausa para que se vea la opción marcada antes de avanzar.
    setTimeout(() => {
      lock.current = false
      if (cur < FOCO_TOTAL - 1) {
        setCur(cur + 1)
      } else {
        finish(next)
      }
    }, 260)
  }

  async function finish(final: FocoAnswers) {
    setStage('result')
    window.scrollTo({ top: 0 })
    const r = computeFoco(final)
    trackEvent('foco_complete', { locale, profile: r.profile, integ: r.integ })
    if (!userId) return
    const { error } = await supabase.from('foco_results').upsert(
      {
        user_id: userId,
        answers: final,
        scores: r.scores,
        profile: r.profile,
        integ: r.integ,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (!error) setSaved(true)
  }

  // ---------- INTRO ----------
  if (stage === 'intro') {
    return (
      <Shell userId={userId} locale={locale} footer={copy.footer}>
        <div className="w-full max-w-xl mt-4">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-4">{copy.eyebrow}</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl sm:text-6xl leading-[1.05] text-[#272727] mb-5">
            {copy.title[0]}
            <br />
            <em className="text-[#3F4A34]">{copy.title[1]}</em>
          </h1>
          <Onda />
          <p className="font-[family-name:var(--font-cormorant)] italic text-2xl leading-snug text-[#272727]/70 mb-5">{copy.lead}</p>
          <p className="text-base leading-relaxed text-[#272727]/65 mb-8">{copy.body}</p>

          <ol className="space-y-4 mb-10">
            {copy.intro.map((d, i) => (
              <li key={d.name} className="grid grid-cols-[2.4rem_1fr] items-baseline gap-2">
                <span className="font-[family-name:var(--font-cormorant)] text-2xl text-[#A8794B]">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="block text-[15px] font-medium text-[#272727]">{d.name}</span>
                  <span className="block text-sm text-[#272727]/55">{d.q}</span>
                </span>
              </li>
            ))}
          </ol>

          <button
            onClick={start}
            className="px-8 py-3.5 bg-[#272727] text-[#FDFBF7] text-sm tracking-widest hover:bg-[#c2866b] transition-colors"
          >
            {copy.start}
          </button>
          <p className="mt-4 text-sm text-[#272727]/50">{copy.meta}</p>
        </div>
      </Shell>
    )
  }

  // ---------- TEST ----------
  if (stage === 'test') {
    return (
      <Shell userId={userId} locale={locale} footer={copy.footer}>
        <div className="w-full max-w-xl mt-4">
          <p className="text-xs text-[#272727]/45 mb-3">{copy.question(cur + 1, FOCO_TOTAL)}</p>
          <div className="h-[2px] bg-[#272727]/10 mb-8" aria-hidden="true">
            <div className="h-full bg-[#c2866b] transition-all" style={{ width: `${Math.round((cur / FOCO_TOTAL) * 100)}%` }} />
          </div>

          <h2 id="foco-q" className="font-[family-name:var(--font-cormorant)] text-3xl sm:text-[34px] leading-[1.15] text-[#272727] mb-8">
            {copy.questions[cur]}
          </h2>

          <div role="radiogroup" aria-labelledby="foco-q" className="grid gap-2">
            {copy.scale.map((label, i) => {
              const active = answers[cur] === i + 1
              return (
                <button
                  key={label}
                  role="radio"
                  aria-checked={active}
                  onClick={() => pick(i + 1)}
                  className={`flex items-center gap-3 text-left rounded-lg border px-4 py-3.5 text-[15px] transition-colors ${
                    active
                      ? 'border-[#c2866b] bg-[#c2866b]/[0.07] text-[#272727]'
                      : 'border-[#272727]/15 text-[#272727]/85 hover:border-[#c2866b]'
                  }`}
                >
                  <span className={`h-3 w-3 shrink-0 rounded-full border ${active ? 'border-[#c2866b] bg-[#c2866b]' : 'border-[#272727]/30'}`} aria-hidden="true" />
                  {label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => cur > 0 && setCur(cur - 1)}
              disabled={cur === 0}
              className="text-sm text-[#272727]/50 underline underline-offset-4 hover:text-[#272727] disabled:opacity-30 disabled:no-underline"
            >
              {copy.back}
            </button>
            <span className="text-xs text-[#272727]/45">{copy.hint}</span>
          </div>
        </div>
      </Shell>
    )
  }

  // ---------- RESULTADO ----------
  const r = computeFoco(answers)
  const P = copy.profiles[r.profile]
  const I = copy.integ[r.integ]
  const summary = copy.summary(
    P.t,
    FOCO_DIMS.map(k => `${copy.dims[k].name}: ${copy.dims[k].zones[focoZone(r.scores[k])].z}`),
    I.z,
    P.ct
  )

  async function copyResult() {
    try {
      await navigator.clipboard.writeText(summary)
      setToast(copy.copied)
    } catch {
      setToast(copy.copyFail)
    }
  }

  return (
    <Shell userId={userId} locale={locale} footer={copy.footer} wide>
      <article className="w-full max-w-3xl mt-4 space-y-12">
        <header>
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">{copy.resultEyebrow}</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl sm:text-6xl leading-[1.05] text-[#272727]">{P.t}</h1>
          <Onda />
          <p className="font-[family-name:var(--font-cormorant)] italic text-2xl leading-snug text-[#272727]/70">{P.l}</p>
        </header>

        <section className="rounded-xl bg-[#272727]/[0.04] p-6 sm:p-8">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#A8794B] mb-2">{copy.culpaEyebrow}</p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{P.ct}</h2>
          <Onda />
          <div className="space-y-3 text-[15px] leading-relaxed text-[#272727]/80">
            {P.c.map(p => <p key={p}>{p}</p>)}
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{copy.mapTitle}</h2>
          <p className="text-sm text-[#272727]/55 mt-1 mb-8">{copy.mapSub}</p>
          <div className="space-y-10">
            {FOCO_DIMS.map(k => {
              const d = copy.dims[k]
              const zone = focoZone(r.scores[k])
              const z = d.zones[zone]
              const pos = Math.max(3, Math.min(97, r.scores[k]))
              return (
                <div key={k}>
                  <div className="flex items-baseline justify-between gap-4 mb-3">
                    <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{d.name}</h3>
                    <span className="text-xs tracking-[0.12em] uppercase text-[#c2866b] text-right">{z.z}</span>
                  </div>
                  <div className="relative h-5" role="img" aria-label={`${d.a} – ${d.b}: ${r.scores[k]} / 100`}>
                    <span className="absolute left-0 right-0 top-1/2 h-px bg-[#272727]/20" />
                    <span className="absolute left-1/2 top-1 bottom-1 w-px bg-[#272727]/20" />
                    <span
                      className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#c2866b] ring-4 ring-[#c2866b]/15"
                      style={{ left: `${pos}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-[#272727]/55 mt-1.5 mb-4">
                    <span>{d.a}</span>
                    <span>{d.b}</span>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-3">
                    <Card label={copy.easy} text={z.f} />
                    <Card label={copy.hard} text={z.x} />
                    <Card label={zone === 'M' ? copy.keepBalance : copy.tryThis} text={z.o} accent />
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{copy.integTitle}</h2>
          <p className="text-sm text-[#272727]/55 mt-1 mb-6">{copy.integSub}</p>
          <div className="rounded-xl border border-[#272727]/12 p-6">
            <div className="flex items-baseline justify-between gap-4 mb-3">
              <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{copy.integName}</h3>
              <span className="text-xs tracking-[0.12em] uppercase text-[#c2866b]">{I.z}</span>
            </div>
            <div className="h-1.5 rounded-full bg-[#272727]/10 overflow-hidden" aria-hidden="true">
              <div className="h-full bg-[#3F4A34]" style={{ width: `${Math.max(4, r.scores.gin)}%` }} />
            </div>
            <div className="flex justify-between text-xs text-[#272727]/55 mt-1.5 mb-4">
              <span>{copy.integPoles[0]}</span>
              <span>{copy.integPoles[1]}</span>
            </div>
            <p className="text-[15px] leading-relaxed text-[#272727]/85 mb-3">{I.t}</p>
            <ul className="space-y-2 text-[15px] leading-relaxed text-[#272727]/80">
              {I.s.map(s => (
                <li key={s} className="relative pl-4">
                  <span className="absolute left-0 top-[0.75em] h-px w-2 bg-[#c2866b]" aria-hidden="true" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="text-center py-4">
          <Onda center />
          <p className="font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727]">
            {copy.principio.map((l, i) => (
              <span key={l}>{i > 0 && <br />}{l}</span>
            ))}
          </p>
          <p className="text-xs tracking-[0.2em] uppercase text-[#272727]/45 mt-3">{copy.practica}</p>
        </section>

        <section className="grid sm:grid-cols-3 gap-3">
          {copy.next.map(n => {
            const cls = 'block rounded-xl border border-[#272727]/15 px-5 py-5 hover:border-[#c2866b] transition-colors'
            const inner = (
              <>
                <span className="block font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">{n.title}</span>
                <span className="block text-sm text-[#272727]/55 mt-1">{n.text}</span>
              </>
            )
            return n.href.startsWith('/')
              ? <Link key={n.href} href={n.href} className={cls}>{inner}</Link>
              : <a key={n.href} href={n.href} className={cls}>{inner}</a>
          })}
        </section>

        <div className="space-y-3 pb-8">
          <div className="flex flex-wrap gap-3">
            <button onClick={copyResult} className="px-5 py-2.5 bg-[#272727] text-[#FDFBF7] text-sm hover:bg-[#c2866b] transition-colors">
              {copy.copy}
            </button>
            <button onClick={start} className="px-5 py-2.5 border border-[#272727]/20 text-sm text-[#272727] hover:border-[#272727]">
              {copy.again}
            </button>
          </div>
          {(toast || saved) && (
            <p className="text-sm text-[#3F4A34]" role="status">{toast || copy.saved}</p>
          )}
        </div>
      </article>
    </Shell>
  )
}

function Card({ label, text, accent = false }: { label: string; text: string; accent?: boolean }) {
  return (
    <div className={`rounded-lg p-4 ${accent ? 'bg-[#3F4A34]/[0.06] border border-[#3F4A34]/20' : 'bg-white border border-[#272727]/10'}`}>
      <p className={`text-[11px] tracking-[0.16em] uppercase mb-1.5 ${accent ? 'text-[#3F4A34]' : 'text-[#272727]/45'}`}>{label}</p>
      <p className="text-sm leading-relaxed text-[#272727]/85">{text}</p>
    </div>
  )
}

// La ikionda: separador de marca (pincelada en grafito).
function Onda({ center = false }: { center?: boolean }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/brand/ikionda.png" alt="" aria-hidden="true" className={`block w-[120px] h-auto my-5 ${center ? 'mx-auto' : ''}`} />
}

function Shell({
  userId,
  locale,
  footer,
  wide = false,
  children,
}: {
  userId: string | null
  locale: string
  footer: string
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
        <span className="flex items-center gap-1 text-xs tracking-[0.12em]">
          {(['es', 'ca', 'en'] as const).map((l, i) => (
            <span key={l} className="flex items-center gap-1">
              {i > 0 && <span className="text-[#272727]/25">/</span>}
              {l === locale ? (
                <span className="font-medium text-[#c2866b]">{l.toUpperCase()}</span>
              ) : (
                <Link href={`/${l}/foco`} hrefLang={l} className="text-[#272727]/45 hover:text-[#c2866b]">{l.toUpperCase()}</Link>
              )}
            </span>
          ))}
        </span>
      </div>
      {children}
      <p className="mt-auto pt-12 text-xs text-[#272727]/45 text-center">{footer}</p>
    </div>
  )
}
