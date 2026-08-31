'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { SaveError } from '@/components/SaveError'
import { generarPainsPdf } from '@/lib/pains-pdf'
import {
  getPainBlocks,
  getPainsIntro,
  getPainsClosing,
  getPainReflection,
  getPainBandLabel,
  getPainResultCopy,
  type PainCode,
  type PainCase,
  type PainBlock,
} from '@/lib/pains-content'
import { contentLang } from '@/lib/content-locale'

interface Initial {
  answers: Record<string, number[]>
  scores: Record<string, number>
  caseKind: string | null
  dominant: string | null
  second: string | null
  reflection: Record<string, string>
  updatedAt: string | null
}

// Fecha de la ficha: la del último guardado real (updated_at), o la de hoy
// si todavía no se ha guardado nada (primera vez completando el test).
function fichaDate(updatedAt: string | null, locale: string): string {
  const d = updatedAt ? new Date(updatedAt) : new Date()
  return new Intl.DateTimeFormat(contentLang(locale) === 'en' ? 'en-US' : 'es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(d)
}

interface Props {
  userId: string
  locale: string
  volver: string | null
  initial: Initial
}

type Phase = 'intro' | 'test' | 'result'

const CODES: PainCode[] = ['profesional', 'relacional', 'vital']

type Question = { code: PainCode; index: number; text: string }

// Aplana los 3 bloques x 5 frases en una lista de 15 preguntas, en orden.
function flatten(blocks: PainBlock[]): Question[] {
  const out: Question[] = []
  blocks.forEach(b => {
    b.items.forEach((text, i) => out.push({ code: b.code, index: i, text }))
  })
  return out
}

// Suma cada bloque y decide qué rama de lectura aplica, en este orden:
// todo bajo → todo alto → empate → dominante clara. Ver
// Test_Herida_Dominante_Version_Final.md para la lógica completa.
function computeResult(scores: Record<string, number>): {
  caseKind: PainCase
  dominant: PainCode | null
  second: PainCode | null
} {
  const s = CODES.map(c => scores[c] ?? 0)
  const allLow = s.every(v => v <= 11)
  const allHigh = s.every(v => v >= 19)
  const order = [0, 1, 2].sort((a, b) => s[b] - s[a])
  const top = order[0]
  const secondIdx = order[1]
  const tie = s[top] - s[secondIdx] <= 3

  if (allLow) return { caseKind: 'low', dominant: null, second: null }
  if (allHigh) return { caseKind: 'high', dominant: CODES[top], second: null }
  if (tie) return { caseKind: 'tie', dominant: CODES[top], second: CODES[secondIdx] }
  return { caseKind: 'single', dominant: CODES[top], second: null }
}

export default function PainsClient({ userId, locale, volver, initial }: Props) {
  const supabase = createClient()
  const tn = useTranslations('nav')
  const blocks = getPainBlocks(locale)
  const questions = flatten(blocks)

  const initialAnswersFlat = (): (number | undefined)[] =>
    questions.map(q => initial.answers[q.code]?.[q.index])

  const hasInitialResult = Boolean(initial.caseKind)
  const [phase, setPhase] = useState<Phase>(hasInitialResult ? 'result' : 'intro')
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<(number | undefined)[]>(initialAnswersFlat)
  const [result, setResult] = useState<{
    caseKind: PainCase | null
    dominant: PainCode | null
    second: PainCode | null
  }>({
    caseKind: (initial.caseKind as PainCase | null) ?? null,
    dominant: (initial.dominant as PainCode | null) ?? null,
    second: (initial.second as PainCode | null) ?? null,
  })
  // Fecha de la ficha: la del último guardado. Se refresca en cuanto se
  // completa el test o se guarda la reflexión, para no esperar a recargar.
  const [updatedAt, setUpdatedAt] = useState<string | null>(initial.updatedAt)

  const [saveFailed, setSaveFailed] = useState(false)
  const [retrying, setRetrying] = useState(false)
  // Última reflexión pendiente: si su guardado falla, la guardamos aquí para
  // poder reintentarla desde el aviso sin que el usuario reescriba nada.
  const pendingReflection = useRef<Record<string, string> | null>(null)

  // Autosave del ejercicio de reflexión (un temporizador por campo).
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const saveReflection = useCallback(
    (id: string, value: string, all: Record<string, string>) => {
      const next = { ...all, [id]: value }
      clearTimeout(timers.current[id])
      timers.current[id] = setTimeout(async () => {
        const stamp = new Date().toISOString()
        const { error } = await supabase
          .from('pain_results')
          .upsert(
            { user_id: userId, reflection: next, updated_at: stamp },
            { onConflict: 'user_id' }
          )
        if (error) {
          pendingReflection.current = next
          setSaveFailed(true)
        } else {
          pendingReflection.current = null
          setUpdatedAt(stamp)
        }
      }, 700)
    },
    [supabase, userId]
  )

  function scoresFromAnswers(finalAnswers: (number | undefined)[]) {
    const scores: Record<string, number> = { profesional: 0, relacional: 0, vital: 0 }
    questions.forEach((q, i) => {
      scores[q.code] += finalAnswers[i] ?? 0
    })
    return scores
  }

  // Guarda una puntuación y avanza. Al puntuar la última, calcula y persiste.
  function score(n: number) {
    const next = [...answers]
    next[step] = n
    setAnswers(next)
    if (step < questions.length - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0 })
    } else {
      finish(next)
    }
  }

  // Persiste el resultado y avisa si falla, para que el aviso ofrezca
  // reintentar en vez de dar por guardado algo que no llegó.
  async function persist(
    finalAnswers: (number | undefined)[],
    scores: Record<string, number>,
    r: { caseKind: PainCase; dominant: PainCode | null; second: PainCode | null }
  ) {
    const byBlock: Record<string, number[]> = { profesional: [], relacional: [], vital: [] }
    questions.forEach((q, i) => {
      byBlock[q.code][q.index] = finalAnswers[i] ?? 0
    })
    const stamp = new Date().toISOString()
    const { error } = await supabase
      .from('pain_results')
      .upsert(
        {
          user_id: userId,
          answers: byBlock,
          scores,
          case_kind: r.caseKind,
          dominant: r.dominant,
          second: r.second,
          updated_at: stamp,
        },
        { onConflict: 'user_id' }
      )
    setSaveFailed(Boolean(error))
    if (!error) setUpdatedAt(stamp)
    return !error
  }

  async function finish(finalAnswers: (number | undefined)[]) {
    const scores = scoresFromAnswers(finalAnswers)
    const r = computeResult(scores)
    setResult(r)
    setPhase('result')
    window.scrollTo({ top: 0 })
    trackEvent('pain_result', { tool: 'pains', case: r.caseKind, dominant: r.dominant ?? '' })
    await persist(finalAnswers, scores, r)
  }

  async function retrySave() {
    setRetrying(true)
    const scores = scoresFromAnswers(answers)
    const okResult = await persist(answers, scores, {
      caseKind: result.caseKind ?? 'single',
      dominant: result.dominant,
      second: result.second,
    })
    let okReflection = true
    if (pendingReflection.current) {
      const stamp = new Date().toISOString()
      const { error } = await supabase
        .from('pain_results')
        .upsert(
          { user_id: userId, reflection: pendingReflection.current, updated_at: stamp },
          { onConflict: 'user_id' }
        )
      okReflection = !error
      if (!error) {
        pendingReflection.current = null
        setUpdatedAt(stamp)
      }
    }
    setSaveFailed(!(okResult && okReflection))
    setRetrying(false)
  }

  const currentScores = scoresFromAnswers(answers)

  return (
    <Shell locale={locale} tn={tn}>
      <div className="w-full max-w-md">
        {phase === 'intro' && <Intro onStart={() => setPhase('test')} locale={locale} />}
        {phase === 'test' && (
          <Test
            question={questions[step]}
            blockIndex={CODES.indexOf(questions[step].code)}
            blocks={blocks}
            step={step}
            total={questions.length}
            current={answers[step]}
            onScore={score}
            locale={locale}
            onBack={() => {
              setStep(s => Math.max(0, s - 1))
              window.scrollTo({ top: 0 })
            }}
          />
        )}
        {phase === 'result' && result.caseKind && (
          <Result
            caseKind={result.caseKind}
            dominant={result.dominant}
            second={result.second}
            scores={currentScores}
            blocks={blocks}
            reflection={initial.reflection}
            onSaveReflection={saveReflection}
            updatedAt={updatedAt}
            volver={volver}
            locale={locale}
          />
        )}
      </div>
      <SaveError show={saveFailed} retrying={retrying} onRetry={retrySave} />
    </Shell>
  )
}

// ---------- Intro ----------

function Intro({ onStart, locale }: { onStart: () => void; locale: string }) {
  const en = contentLang(locale) === 'en'
  const intro = getPainsIntro(locale)
  return (
    <div className="text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-4">
        {en ? 'Before the session' : 'Diagnóstico previo'}
      </p>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight text-[#272727] mb-6">
        {intro.title}
      </h1>
      <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#c2866b] leading-relaxed mb-8">
        {intro.hook}
      </p>
      <p className="text-sm leading-relaxed text-[#272727]/70 mb-10">{intro.instructions}</p>
      <button
        onClick={onStart}
        className="rounded-full bg-[#c2866b] px-8 py-3 text-sm tracking-widest uppercase text-[#FDFBF7] transition-opacity hover:opacity-90"
      >
        {en ? 'Start' : 'Empezar'}
      </button>
    </div>
  )
}

// ---------- Test (una frase por pantalla, 1-5) ----------

function Test({
  question,
  blockIndex,
  blocks,
  step,
  total,
  current,
  onScore,
  onBack,
  locale,
}: {
  question: Question
  blockIndex: number
  blocks: PainBlock[]
  step: number
  total: number
  current?: number
  onScore: (n: number) => void
  onBack: () => void
  locale: string
}) {
  const en = contentLang(locale) === 'en'
  const blockLabel = blocks[blockIndex].label
  return (
    <div>
      <p className="text-center text-xs tracking-widest uppercase text-[#272727]/40 mb-1">
        {step + 1} / {total}
      </p>
      <p className="text-center text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">
        {blockLabel}
      </p>
      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-[#272727]/10">
        <div
          className="h-full bg-[#c2866b] transition-all"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      <p className="min-h-[7rem] font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727] text-center mb-10">
        {question.text}
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onScore(n)}
            className={`h-12 w-12 rounded-full border text-sm transition-colors ${
              current === n
                ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
                : 'border-[#272727]/20 text-[#272727]/50 hover:border-[#c2866b]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <div className="flex justify-between text-[10px] tracking-widest uppercase text-[#272727]/40 px-1 mb-12">
        <span>{en ? 'Almost never' : 'Casi nunca'}</span>
        <span>{en ? 'Almost always' : 'Casi siempre'}</span>
      </div>

      <div className="text-center">
        <button
          onClick={onBack}
          disabled={step === 0}
          className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors disabled:opacity-0"
        >
          {en ? '← Previous' : '← Anterior'}
        </button>
      </div>
    </div>
  )
}

// ---------- Resultado + ejercicio de cierre ----------

function Result({
  caseKind,
  dominant,
  second,
  scores,
  blocks,
  reflection,
  onSaveReflection,
  updatedAt,
  volver,
  locale,
}: {
  caseKind: PainCase
  dominant: PainCode | null
  second: PainCode | null
  scores: Record<string, number>
  blocks: PainBlock[]
  reflection: Record<string, string>
  onSaveReflection: (id: string, v: string, all: Record<string, string>) => void
  updatedAt: string | null
  volver: string | null
  locale: string
}) {
  const [generandoPdf, setGenerandoPdf] = useState(false)
  const informeRef = useRef<HTMLDivElement>(null)
  const en = contentLang(locale) === 'en'
  const copy = getPainResultCopy(locale, caseKind, dominant, second)
  const closing = getPainsClosing(locale)
  const reflectionFields = getPainReflection(locale)

  // Los tres bloques ordenados por puntuación (mayor → menor), para las
  // barras del resultado.
  const ranked = [...blocks].sort((a, b) => (scores[b.code] ?? 0) - (scores[a.code] ?? 0))

  async function compartir() {
    trackEvent('share', { tool: 'pains' })
    const url = 'https://www.ikigaier.com'
    const shareText =
      caseKind === 'low' || caseKind === 'high' || !dominant
        ? en
          ? `I found out which of my three wounds weighs most right now. See yours at ${url}`
          : `Descubrí qué herida pesa más ahora mismo. Mira la tuya en ${url}`
        : en
          ? `I found out my dominant wound right now is the ${dominant}. See yours at ${url}`
          : `Descubrí que mi herida dominante ahora es la ${dominant}. Mira la tuya en ${url}`
    const data = {
      title: en ? 'Which wound is speaking now?' : '¿Qué herida está hablando ahora?',
      text: shareText,
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else {
        await navigator.clipboard.writeText(data.text)
        alert(en ? 'Link copied' : 'Enlace copiado')
      }
    } catch {
      // La persona cerró el diálogo de compartir: no hacemos nada.
    }
  }

  async function guardarPdf() {
    if (!informeRef.current || generandoPdf) return
    setGenerandoPdf(true)
    trackEvent('pdf_download', { tool: 'pains' })
    try {
      await generarPainsPdf(informeRef.current)
    } catch {
      window.print()
    } finally {
      setGenerandoPdf(false)
    }
  }

  return (
    <div>
      <style>{`
        .pain-print-only { display: none; }
        @media print {
          @page { margin: 12mm; }
          body { background: #fff !important; }
          .pain-print-root, .pain-print-root * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .pain-print-only { display: block; }
          .pain-avoid-break { break-inside: avoid; }
        }
      `}</style>

      <div ref={informeRef} className="pain-print-root">
        {/* Resultado */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">
            {en ? 'Your result' : 'Tu resultado'}
          </p>
          <h2 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727] mb-5">
            {copy.headline}
          </h2>
          <p className="text-sm leading-relaxed text-[#272727]/75">{copy.body}</p>
        </div>

        {/* Las tres heridas, ordenadas, con su banda */}
        <div className="mb-10 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
          <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-4">
            {en ? 'The three wounds' : 'Las tres heridas'}
          </p>
          <div className="flex flex-col gap-5">
            {ranked.map(b => {
              const value = scores[b.code] ?? 0
              const pct = Math.round((value / 25) * 100)
              const active = b.code === dominant || (caseKind === 'tie' && b.code === second)
              return (
                <div key={b.code}>
                  <div className="flex items-baseline justify-between mb-1.5">
                    <span
                      className={`text-sm ${active ? 'text-[#272727] font-medium' : 'text-[#272727]/60'}`}
                    >
                      {active && <span className="text-[#c2866b] mr-1.5">●</span>}
                      {b.label}
                    </span>
                    <span className="text-xs text-[#272727]/35 shrink-0">{value} / 25</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-[#272727]/10 mb-1.5">
                    <div
                      className="h-full rounded-full bg-[#c2866b] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="text-xs leading-snug text-[#272727]/45">
                    {getPainBandLabel(locale, value)}
                  </p>
                </div>
              )
            })}
          </div>
        </div>

        <p className="text-xs leading-relaxed text-[#272727]/45 mb-10 px-1">{closing.caveat}</p>

        {/* Puente a /mascaras */}
        <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-5 mb-10 pain-no-export">
          <p className="text-sm leading-relaxed text-[#272727]/75 text-center mb-4">
            {closing.crossover}
          </p>
          <div className="text-center">
            <Link
              href={`/${locale}/mascaras`}
              className="text-xs tracking-widest uppercase text-[#c2866b] underline-offset-4 hover:underline"
            >
              {closing.crossoverLink} →
            </Link>
          </div>
        </div>

        {/* Compartir / guardar en PDF */}
        <div className="mb-4 text-center print:hidden pain-no-export">
          <button
            onClick={compartir}
            className="w-full py-3 bg-[#c2866b] text-[#FDFBF7] text-xs tracking-widest uppercase hover:bg-[#272727] transition-colors"
          >
            {en ? 'Share' : 'Compartir'}
          </button>
          <button
            onClick={guardarPdf}
            disabled={generandoPdf}
            className="w-full py-3 mt-3 border border-[#272727] text-[#272727] text-xs tracking-widest uppercase hover:bg-[#272727] hover:text-[#FDFBF7] transition-colors disabled:opacity-40"
          >
            {generandoPdf ? (en ? 'Generating…' : 'Generando…') : (en ? 'Save as PDF' : 'Guardar en PDF')}
          </button>
          <p className="text-xs text-[#272727]/40 mt-2">
            {en ? 'Your result, to take with you or return to.' : 'Tu resultado, para llevártelo o volver a él.'}
          </p>
        </div>

        {/* Pie de marca: solo en el PDF */}
        <div className="pain-print-only mt-10 pt-6 border-t border-[#272727]/15 pain-avoid-break">
          <div className="flex items-center justify-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/paso-qr.png"
              alt="ikigaier.com"
              width={88}
              height={88}
              className="w-[88px] h-[88px] shrink-0"
            />
            <div className="text-left">
              <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-1">
                {en ? 'Before the session' : 'Diagnóstico previo'}
              </p>
              <p className="font-[family-name:var(--font-cormorant)] text-lg leading-snug text-[#272727]">
                {en
                  ? 'Find out which wound is speaking now at ikigaier.com'
                  : 'Descubre qué herida está hablando ahora en ikigaier.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ejercicio de cierre (3 partes): la ficha, fechada con el último
          guardado real. Siempre visible tras el resultado. */}
      <div className="mt-14 rounded-xl border border-[#272727]/15 px-6 py-7">
        <div className="flex items-baseline justify-between gap-3 mb-6 pb-4 border-b border-[#272727]/10">
          <p className="text-xs tracking-[0.16em] uppercase text-[#c2866b] font-medium">
            {en ? 'Your IKIGAIER card' : 'Tu ficha IKIGAIER'}
          </p>
          <p className="text-xs text-[#272727]/40 whitespace-nowrap tabular-nums">
            {fichaDate(updatedAt, locale)}
          </p>
        </div>
        <div className="flex flex-col gap-8">
          {reflectionFields.map(r => (
            <ReflectionField
              key={r.id}
              id={r.id}
              prompt={r.prompt}
              hint={r.hint}
              value={reflection[r.id] ?? ''}
              all={reflection}
              onSave={onSaveReflection}
              locale={locale}
            />
          ))}
        </div>
      </div>

      {volver && (
        <div className="mt-14 mb-6 flex flex-col items-center">
          <Link
            href={`/${locale}${volver}`}
            className="rounded-full bg-[#c2866b] px-8 py-3 text-sm tracking-widest uppercase text-[#FDFBF7] transition-opacity hover:opacity-90"
          >
            {en ? 'Back and continue' : 'Volver y seguir'}
          </Link>
        </div>
      )}
    </div>
  )
}

function ReflectionField({
  id,
  prompt,
  hint,
  value,
  all,
  onSave,
  locale,
}: {
  id: string
  prompt: string
  hint: string
  value: string
  all: Record<string, string>
  onSave: (id: string, v: string, all: Record<string, string>) => void
  locale: string
}) {
  const [local, setLocal] = useState(value)
  const en = contentLang(locale) === 'en'

  return (
    <div>
      <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727] leading-snug">
        {prompt}
      </p>
      <p className="text-sm text-[#272727]/50 mt-1 mb-3">{hint}</p>
      <textarea
        value={local}
        rows={4}
        onChange={e => {
          setLocal(e.target.value)
          all[id] = e.target.value
          onSave(id, e.target.value, all)
        }}
        placeholder={en ? 'Write here…' : 'Escribe aquí…'}
        className="w-full resize-y rounded-lg border border-[#272727]/20 bg-white/50 p-3 text-sm leading-relaxed text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors"
      />
    </div>
  )
}

// ---------- Shell ----------

function Shell({
  locale,
  tn,
  children,
}: {
  locale: string
  tn: (k: string) => string
  children: React.ReactNode
}) {
  const supabase = createClient()
  async function logout() {
    await supabase.auth.signOut()
    window.location.href = `/${locale}/login`
  }
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <Link
          href={`/${locale}/dashboard`}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          ← {tn('title')}
        </Link>
        <button
          onClick={logout}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          {tn('logout')}
        </button>
      </div>
      {children}
    </div>
  )
}
