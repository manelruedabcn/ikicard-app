'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { SaveError } from '@/components/SaveError'
import { generarMascarasPdf } from '@/lib/masks-pdf'
import {
  getMasks,
  getMasksIntro,
  getMasksClosing,
  MASKS_THRESHOLDS,
  getMaskReflection,
  maskCombinationReading,
  type MaskCode,
  type Mask,
} from '@/lib/masks-content'
import { contentLang } from '@/lib/content-locale'

interface Initial {
  scores: Record<string, number>
  dominant: string | null
  top3: string[]
  fear: string | null
  reflection: Record<string, string>
}

interface Props {
  // null = modo taller sin cuenta: el test funciona igual, pero no se guarda
  // en la base de datos (solo se lo lleva en PDF).
  userId: string | null
  locale: string
  volver: string | null
  initial: Initial
}

type Phase = 'intro' | 'test' | 'result'

// Calcula dominante + 3 principales (orden estable al del libro) + miedo.
function computeResult(scores: Record<string, number>, masks: Mask[]) {
  const ranked = masks.map(m => ({ code: m.code, score: scores[m.code] ?? 0 })).sort(
    (a, b) => b.score - a.score
  )
  const dominant = ranked[0]?.code ?? null
  const top3 = ranked.slice(0, 3).map(r => r.code)
  const fear = dominant ? masks.find(m => m.code === dominant)!.fear : null
  return { dominant, top3, fear }
}

export default function MascarasClient({ userId, locale, volver, initial }: Props) {
  const supabase = createClient()
  const tn = useTranslations('nav')
  const masks = getMasks(locale)

  // Si ya tenía un resultado guardado, arranca mostrándolo.
  const [phase, setPhase] = useState<Phase>(initial.dominant ? 'result' : 'intro')
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>(initial.scores)
  const [result, setResult] = useState({
    dominant: initial.dominant,
    top3: initial.top3,
    fear: initial.fear,
  })

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
      if (!userId) return
      timers.current[id] = setTimeout(async () => {
        const { error } = await supabase
          .from('mask_results')
          .upsert(
            { user_id: userId, reflection: next, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
        if (error) {
          pendingReflection.current = next
          setSaveFailed(true)
        } else {
          pendingReflection.current = null
        }
      }, 700)
    },
    [supabase, userId]
  )

  // Guarda una puntuación y avanza. Al puntuar la última, calcula y persiste.
  function score(code: MaskCode, n: number) {
    const next = { ...scores, [code]: n }
    setScores(next)
    if (step < masks.length - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0 })
    } else {
      finish(next)
    }
  }

  // Persiste el resultado y avisa si falla, para que el aviso ofrezca
  // reintentar en vez de dar por guardado algo que no llegó.
  async function persist(
    finalScores: Record<string, number>,
    r: { dominant: string | null; top3: string[]; fear: string | null }
  ) {
    if (!userId) return true
    const { error } = await supabase
      .from('mask_results')
      .upsert(
        {
          user_id: userId,
          scores: finalScores,
          dominant: r.dominant,
          top3: r.top3,
          fear: r.fear,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    setSaveFailed(Boolean(error))
    return !error
  }

  async function finish(finalScores: Record<string, number>) {
    const r = computeResult(finalScores, masks)
    setResult(r)
    setPhase('result')
    window.scrollTo({ top: 0 })
    trackEvent('mask_result', { tool: 'mascaras', dominant: r.dominant ?? '' })
    await persist(finalScores, r)
  }

  async function retrySave() {
    setRetrying(true)
    // Reintenta el guardado que falló: el resultado y/o la reflexión pendiente.
    const okResult = await persist(scores, result)
    let okReflection = true
    if (pendingReflection.current) {
      const { error } = await supabase
        .from('mask_results')
        .upsert(
          { user_id: userId, reflection: pendingReflection.current, updated_at: new Date().toISOString() },
          { onConflict: 'user_id' }
        )
      okReflection = !error
      if (!error) pendingReflection.current = null
    }
    setSaveFailed(!(okResult && okReflection))
    setRetrying(false)
  }

  return (
    <Shell locale={locale} tn={tn} anonimo={!userId}>
      <div className="w-full max-w-md">
        {phase === 'intro' && <Intro onStart={() => setPhase('test')} locale={locale} />}
        {phase === 'test' && (
          <Test
            mask={masks[step]}
            step={step}
            total={masks.length}
            current={scores[masks[step].code]}
            onScore={score}
            locale={locale}
            onBack={() => {
              setStep(s => Math.max(0, s - 1))
              window.scrollTo({ top: 0 })
            }}
          />
        )}
        {phase === 'result' && result.dominant && (
          <Result
            dominant={result.dominant}
            scores={scores}
            reflection={initial.reflection}
            onSaveReflection={saveReflection}
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
  const intro = getMasksIntro(locale)
  return (
    <div className="text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-4">{en ? 'The mirror' : 'El espejo'}</p>
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
  mask,
  step,
  total,
  current,
  onScore,
  onBack,
  locale,
}: {
  mask: Mask
  step: number
  total: number
  current?: number
  onScore: (code: MaskCode, n: number) => void
  onBack: () => void
  locale: string
}) {
  const en = contentLang(locale) === 'en'
  return (
    <div>
      <p className="text-center text-xs tracking-widest uppercase text-[#272727]/40 mb-3">
        {step + 1} / {total}
      </p>
      <div className="mb-8 h-1 w-full overflow-hidden rounded-full bg-[#272727]/10">
        <div
          className="h-full bg-[#c2866b] transition-all"
          style={{ width: `${((step + 1) / total) * 100}%` }}
        />
      </div>

      <p className="min-h-[7rem] font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727] text-center mb-10">
        {mask.statement}
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onScore(mask.code, n)}
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
        <span>{en ? 'Not at all' : 'Nada'}</span>
        <span>{en ? 'Completely' : 'Totalmente'}</span>
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

// ---------- Resultado + ejercicio "Mi máscara dominante" ----------

function Result({
  dominant,
  scores,
  reflection,
  onSaveReflection,
  volver,
  locale,
}: {
  dominant: string
  scores: Record<string, number>
  reflection: Record<string, string>
  onSaveReflection: (id: string, v: string, all: Record<string, string>) => void
  volver: string | null
  locale: string
}) {
  // Suelta, el ejercicio se despliega solo si la persona lo pide.
  const [showExercise, setShowExercise] = useState(false)
  // Cierre tipo PASO: compartir + guardar el informe en PDF (captura a imagen
  // y menú nativo en móvil; descarga en escritorio).
  const [generandoPdf, setGenerandoPdf] = useState(false)
  const informeRef = useRef<HTMLDivElement>(null)
  const en = contentLang(locale) === 'en'
  const masks = getMasks(locale)
  const closing = getMasksClosing(locale)
  const reflectionFields = getMaskReflection(locale)
  const mask = masks.find(m => m.code === dominant)!

  async function compartir() {
    if (!informeRef.current || generandoPdf) return
    setGenerandoPdf(true)
    trackEvent('share', { tool: 'mascaras', content: 'personal_pdf' })
    try {
      await generarMascarasPdf(informeRef.current, en ? 'My Masks Report - IKIGAIER.pdf' : 'Mi informe de Mascaras - IKIGAIER.pdf', 'share', locale)
    } catch {
      await generarMascarasPdf(informeRef.current, en ? 'My Masks Report - IKIGAIER.pdf' : 'Mi informe de Mascaras - IKIGAIER.pdf', 'download', locale)
    } finally {
      setGenerandoPdf(false)
    }
  }

  async function guardarPdf() {
    if (!informeRef.current || generandoPdf) return
    setGenerandoPdf(true)
    trackEvent('pdf_download', { tool: 'mascaras' })
    try {
      await generarMascarasPdf(informeRef.current, en ? 'My Masks Report - IKIGAIER.pdf' : 'Mi informe de Mascaras - IKIGAIER.pdf', 'download', locale)
    } catch {
      // Último recurso si la generación falla (navegador muy antiguo).
      window.print()
    } finally {
      setGenerandoPdf(false)
    }
  }

  // Las 7 máscaras ordenadas por tu puntuación (mayor → menor). La dominante
  // se resalta; el resto se lee con los umbrales del libro (4-5 gobierna,
  // 3 asoma, 1-2 no te define ahora). Panorama completo, como PASO.
  const ranked = [...masks].sort((a, b) => (scores[b.code] ?? 0) - (scores[a.code] ?? 0))
  // Las que hoy aplican: puntúan 3 o más (gobiernan o asoman), ya ordenadas.
  const active = ranked.filter(m => (scores[m.code] ?? 0) >= MASKS_THRESHOLDS.secondary)
  const combination = maskCombinationReading(active.map(m => m.code), locale)
  // Las que hoy no pesan (1-2): se nombran juntas, sin detalle.
  const quiet = ranked.filter(m => (scores[m.code] ?? 0) < MASKS_THRESHOLDS.secondary)

  return (
    <div>
      {/* Reglas de impresión: al guardar como PDF se deja solo el informe,
          limpio, con los colores respetados (color-adjust). */}
      <style>{`
        .mask-print-only { display: none; }
        @media print {
          @page { margin: 12mm; }
          body { background: #fff !important; }
          .mask-print-root, .mask-print-root * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .mask-print-only { display: block; }
          .mask-avoid-break { break-inside: avoid; }
        }
      `}</style>

      {/* Informe: lo que se captura en el PDF. Mismo lenguaje editorial que el
          informe PASO (portada oscura, secciones numeradas, tarjetas). Lo
          interactivo queda fuera o marcado como no exportable. */}
      <div ref={informeRef} className="mask-print-root">
        {/* Portada */}
        <header
          data-pdf-block
          data-pdf-break="before"
          className="relative overflow-hidden rounded-[2rem] bg-[#F8F4ED] text-center shadow-[0_28px_90px_rgba(39,36,32,0.14)] mask-avoid-break"
        >
          <div className="relative isolate overflow-hidden bg-[#242320] px-6 pb-16 pt-12 sm:px-10 sm:pb-20 sm:pt-14">
            <div className="absolute -left-16 -top-20 -z-10 h-52 w-52 rounded-full bg-[#84937A] sm:-left-20 sm:-top-24 sm:h-64 sm:w-64" />
            <div className="absolute -bottom-28 -right-20 -z-10 h-48 w-48 rounded-full bg-[#C7896D]/90 sm:h-56 sm:w-56" />
            <div className="absolute left-8 top-8 sm:left-11 sm:top-10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/brand/ikigaier-isotipo-crema.png"
                alt="IKIGAIER"
                className="block h-12 w-12 object-contain opacity-90 sm:h-14 sm:w-14"
              />
            </div>
            <p className="mb-7 mt-12 text-[11px] uppercase tracking-[0.38em] text-[#D2A857] sm:mt-14">
              {en ? 'The mask that governs you most' : 'La máscara que más te gobierna'}
            </p>
            <h1 className="mx-auto max-w-lg font-[family-name:var(--font-cormorant)] text-5xl leading-[1.05] text-[#F8F4ED] sm:text-6xl">
              {mask.name}
            </h1>
          </div>

          <div className="relative overflow-hidden px-6 py-11 sm:px-10 sm:py-14">
            <div className="absolute -bottom-28 -right-24 h-48 w-48 rounded-full bg-[#C7896D] sm:-bottom-36 sm:-right-28 sm:h-60 sm:w-60" />
            <p className="mx-auto mb-9 max-w-md font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727] sm:text-3xl">
              {en
                ? 'Not a label. A mirror of what protects you today.'
                : 'No es una etiqueta. Es un espejo de lo que hoy te protege.'}
            </p>
            <div className="relative mx-auto max-w-md">
              <p className="font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727]">
                {en ? `Underneath lies the ${mask.fear}.` : `Debajo late el ${mask.fear}.`}
              </p>
              <p className="mt-2 mb-7 text-sm leading-relaxed text-[#272727]/60">
                {en
                  ? 'When you name the fear, the mask loses its grip.'
                  : 'Cuando le pones nombre al miedo, la máscara pierde fuerza.'}
              </p>
              <div className="border-t border-[#C7896D]/35 pt-7">
                <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#C7896D]">
                  {en ? 'How it shows' : 'Cómo se manifiesta'}
                </p>
                <p className="text-[15px] leading-relaxed text-[#272727]/72">{mask.description}</p>
              </div>
              <div className="mx-auto my-7 h-px w-24 bg-[#C7896D]/70" />
              <p className="text-xs leading-relaxed text-[#272727]/45">
                {en ? 'There are 7 masks. This is the one leading today.' : 'Existen 7 máscaras. Esta es la que hoy manda.'}
              </p>
            </div>
          </div>
        </header>

        {/* 01 · Las siete, puntuadas */}
        <MaskSection
          number="01"
          title={en ? 'Your mask compass' : 'Tu brújula de máscaras'}
          intro={
            en
              ? 'All seven live in you. The chart shows how strongly each one is acting right now, on the book’s scale: 4–5 governs, 3 surfaces, 1–2 doesn’t define you now.'
              : 'Las siete conviven en ti. El gráfico muestra con cuánta fuerza actúa cada una ahora mismo, con la escala del libro: 4–5 gobierna, 3 asoma, 1–2 no te define ahora.'
          }
        >
          <div data-pdf-block className="rounded-2xl bg-[#272727]/[0.035] px-5 py-6 sm:px-7">
            <MaskBars ranked={ranked} scores={scores} dominant={dominant} en={en} />
          </div>
          <div data-pdf-block className="mt-8 rounded-xl border border-[#c2866b]/20 bg-[#c2866b]/[0.055] px-5 py-5">
            <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#c2866b]">
              {en ? 'In your case' : 'En tu caso'}
            </p>
            <div className="mt-3 space-y-3">
              {active.map(m => {
                const gobierna = (scores[m.code] ?? 0) >= MASKS_THRESHOLDS.dominant
                return (
                  <p key={m.code} className="text-sm leading-relaxed text-[#272727]/78">
                    {m.name} {gobierna ? (en ? 'governs you' : 'te gobierna') : (en ? 'surfaces' : 'asoma')}
                    {': '}
                    {m.weave}.
                  </p>
                )
              })}
              {quiet.length > 0 && (
                <p className="text-sm leading-relaxed text-[#272727]/55">
                  {en ? 'Not defining you now: ' : 'No te definen ahora: '}
                  {quiet.map(m => m.name).join(', ')}.
                </p>
              )}
            </div>
          </div>
        </MaskSection>

        {/* 02 · Las que hoy llevas puestas y cómo se combinan */}
        {active.length > 1 && (
          <MaskSection
            number="02"
            title={en ? 'The ones you wear today' : 'Las que hoy llevas puestas'}
            intro={
              en
                ? 'You may recognise yourself in more than one. That’s normal: they aren’t sealed compartments. Behind each one, a fear.'
                : 'Posiblemente te reconozcas en más de una. Es normal: no son compartimentos estancos. Detrás de cada una, un miedo.'
            }
          >
            <div data-pdf-block className="grid gap-px overflow-hidden rounded-2xl border border-[#272727]/10 bg-[#272727]/10 sm:grid-cols-2">
              {active.map(m => (
                <div key={m.code} className="bg-[#FDFBF7] px-5 py-5 sm:px-6">
                  <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">{m.name}</p>
                  <p className="mt-2 text-sm leading-relaxed text-[#272727]/75">{m.description}</p>
                  <p className="mt-3 border-l-2 border-[#c2866b]/45 pl-3 text-xs leading-relaxed text-[#272727]/60">
                    {en ? 'The fear behind: ' : 'El miedo detrás: '}
                    {m.fear}
                  </p>
                </div>
              ))}
            </div>
            {combination.length > 0 && (
              <div data-pdf-block className="mt-8 border-t border-[#272727]/10 pt-8 pb-4">
                <p className="mb-4 text-[10px] font-medium uppercase tracking-[0.28em] text-[#c2866b]">
                  {en ? 'How they combine in you' : 'Cómo se combinan en ti'}
                </p>
                <div className="space-y-3">
                  {combination.slice(0, -1).map((linea, i) => (
                    <p
                      key={i}
                      className={`text-sm leading-relaxed text-[#272727]/78 ${i > 0 ? 'border-l-2 border-[#C7896D]/45 pl-4' : ''}`}
                    >
                      {linea}
                    </p>
                  ))}
                </div>
                <p className="mt-6 font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#c2866b]">
                  {combination[combination.length - 1]}
                </p>
              </div>
            )}
          </MaskSection>
        )}

        {/* 03 · La dominante, de cerca */}
        <MaskSection
          number={active.length > 1 ? '03' : '02'}
          title={en ? 'Your mask, up close' : 'Tu máscara, de cerca'}
          intro={
            en
              ? 'What it protects, how it acts and what it asks of you. It isn’t a villain: it got you this far.'
              : 'Qué protege, cómo actúa y qué te pide. No es una villana: te ha traído hasta aquí.'
          }
        >
          <div data-pdf-block className="grid gap-px overflow-hidden rounded-2xl border border-[#272727]/10 bg-[#272727]/10 sm:grid-cols-2 mask-avoid-break">
            <MaskField label={en ? 'What it protects' : 'Qué protege'} text={en ? `From the ${mask.fear}.` : `Del ${mask.fear}.`} />
            <MaskField label={en ? 'How it acts' : 'Cómo actúa'} text={mask.weave.charAt(0).toUpperCase() + mask.weave.slice(1) + '.'} />
            <MaskField label={en ? 'Where it comes from' : 'De dónde viene'} text={closing.noJudgement} />
            <MaskField label={en ? 'What it asks of you' : 'Qué te pide'} text={closing.reframe} />
          </div>
        </MaskSection>

        {/* Libro de donde sale la brújula */}
        <div data-pdf-block className="mt-10 rounded-2xl border border-[#c2866b]/25 bg-[#c2866b]/[0.06] px-6 py-6 text-center mask-avoid-break">
          <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">
            {en ? 'The notebook this compass comes from' : 'El cuaderno de donde sale esta brújula'}
          </p>
          <a
            href="https://amzn.eu/d/01keLRwF"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => trackEvent('mascaras_libro_click', { libro: 'Camina sin separarte de ti' })}
            className="group inline-block"
          >
            <span className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] underline decoration-[#c2866b]/40 underline-offset-4 group-hover:decoration-[#c2866b]">
              Camina sin separarte de ti
            </span>
            <span className="block text-xs tracking-widest uppercase text-[#c2866b] mt-2">
              {en ? 'See on Amazon →' : 'Ver en Amazon →'}
            </span>
          </a>
        </div>

        {/* Compartir / guardar en PDF. En móvil abre el menú nativo para
            guardarlo en Archivos o enviarlo. No se exporta al propio PDF. */}
        <div className="mt-4 mb-4 text-center print:hidden mask-no-export">
          <button
            onClick={compartir}
            className="w-full py-3 bg-[#c2866b] text-[#FDFBF7] text-xs tracking-widest uppercase hover:bg-[#272727] transition-colors"
          >
            {generandoPdf ? (en ? 'Generating…' : 'Generando…') : (en ? 'Share my report' : 'Compartir mi informe')}
          </button>
          <button
            onClick={guardarPdf}
            disabled={generandoPdf}
            className="w-full py-3 mt-3 border border-[#272727] text-[#272727] text-xs tracking-widest uppercase hover:bg-[#272727] hover:text-[#FDFBF7] transition-colors disabled:opacity-40"
          >
            {generandoPdf ? (en ? 'Generating…' : 'Generando…') : (en ? 'Download my report as PDF' : 'Descargar mi informe en PDF')}
          </button>
          <p className="text-xs text-[#272727]/40 mt-2">{en ? 'Your result, to take with you or return to.' : 'Tu resultado, para llevártelo o volver a él.'}</p>
        </div>

        {/* Pie de marca: solo aparece en el PDF. El QR lleva a ikigaier.com. */}
        <div data-pdf-block className="mask-print-only mt-10 pt-6 border-t border-[#272727]/15">
          <div className="flex items-center justify-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/paso-qr.png" alt="ikigaier.com" width={88} height={88} className="w-[88px] h-[88px] shrink-0" />
            <div className="flex min-w-0 flex-col items-start gap-2 text-left">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/ikigaier-marca-completa.png" alt="IKIGAIER" className="h-auto w-44 max-w-full" />
              <p className="text-xs leading-snug text-[#272727]/60">
                {en ? 'This compass is done in IKIGAIER workshops · www.ikigaier.com' : 'Esta brújula se hace en los talleres IKIGAIER · www.ikigaier.com'}
              </p>
            </div>
          </div>
        </div>

        {/* Nota de encuadre */}
        <p data-pdf-block className="mt-10 pb-4 text-center text-xs leading-relaxed text-[#272727]/40 px-2">
          {en
            ? 'This is not a scientific test or a diagnosis. It’s a mirror: what your answers draw today. Masks shift with time and personal work — come back to it in a few months.'
            : 'No es un test científico ni un diagnóstico. Es un espejo: lo que dibujan hoy tus respuestas. Las máscaras se mueven con el tiempo y el trabajo personal; vuelve a ella dentro de unos meses.'}
        </p>
      </div>

      {/* Ejercicio "Mi máscara dominante" (4 partes, de Camina).
          En el itinerario IKIBOARD (viene con ?volver) es parte del flujo:
          la parte 4 es la semilla del vision board. Suelta, se ofrece como
          invitación opcional para no cortar el momento espejo. */}
      {volver || showExercise ? (
        <div className="border-t border-[#272727]/10 pt-10">
          <p className="text-center text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-2">{en ? 'Exercise' : 'Ejercicio'}</p>
          <h3 className="text-center font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] mb-3">
            {en ? 'My dominant mask' : 'Mi máscara dominante'}
          </h3>
          {volver && (
            <p className="text-center text-sm text-[#272727]/55 mb-8">
              {en
                ? 'What you write here is the basis for what you’ll build next.'
                : 'Lo que escribas aquí es la base de lo que construirás a continuación.'}
            </p>
          )}
          <div className={`flex flex-col gap-8 ${volver ? '' : 'mt-5'}`}>
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
      ) : (
        <div className="border-t border-[#272727]/10 pt-10 text-center">
          <p className="text-sm leading-relaxed text-[#272727]/60 mb-5">
            {en
              ? 'Want to take a step? Write about your mask and one small gesture you could start today.'
              : '¿Quieres dar un paso? Escribe sobre tu máscara y qué gesto pequeño podrías empezar hoy.'}
          </p>
          <button
            onClick={() => setShowExercise(true)}
            className="text-xs tracking-widest uppercase text-[#c2866b] underline-offset-4 hover:underline"
          >
            {en ? 'Do the exercise' : 'Hacer el ejercicio'}
          </button>
        </div>
      )}

      {/* Acciones: solo el retorno al itinerario IKIBOARD (si vino de ahí). */}
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

// ---------- Piezas del informe (mismo lenguaje editorial que PASO) ----------

function MaskSection({
  number,
  title,
  intro,
  children,
}: {
  number: string
  title: string
  intro: string
  children: React.ReactNode
}) {
  return (
    <section className="mt-12">
      <div data-pdf-block data-pdf-break="before" data-pdf-keep-next="true" className="mb-6 pb-4">
        <div className="mb-3 flex items-center gap-3" aria-hidden="true">
          <span className="text-[10px] font-medium tracking-[0.28em] text-[#c2866b]">{number}</span>
          <span className="h-px w-10 bg-[#c2866b]/40" />
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl leading-none text-[#272727]">{title}</h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#272727]/60">{intro}</p>
      </div>
      {children}
    </section>
  )
}

function MaskField({ label, text }: { label: string; text: string }) {
  return (
    <div className="bg-[#FDFBF7] px-5 py-5 sm:px-6 sm:py-6">
      <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1">{label}</p>
      <p className="text-sm leading-relaxed text-[#272727]/80">{text}</p>
    </div>
  )
}

// Barras horizontales 1-5, de mayor a menor. Terracota = gobierna (4-5),
// salvia = asoma (3), gris = no te define ahora (1-2). Las guías marcan los
// umbrales del libro. Con divs (no SVG) para que los nombres largos respiren
// en móvil y html2canvas los capture igual.
function MaskBars({
  ranked,
  scores,
  dominant,
  en,
}: {
  ranked: Mask[]
  scores: Record<string, number>
  dominant: string
  en: boolean
}) {
  const pct = (v: number) => `${(v / 5) * 100}%`
  return (
    <div>
      {/* Cada fila: nombre y puntuación arriba, barra debajo (los nombres
          largos no se cortan ni en móvil ni en el PDF). */}
      <ul className="flex flex-col gap-4">
        {ranked.map(m => {
          const v = scores[m.code] ?? 0
          const color =
            v >= MASKS_THRESHOLDS.dominant ? '#c2866b' : v >= MASKS_THRESHOLDS.secondary ? '#9cab92' : 'rgba(39,39,39,0.16)'
          const isDom = m.code === dominant
          return (
            <li key={m.code}>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span
                  className={`font-[family-name:var(--font-cormorant)] text-lg leading-snug ${
                    isDom ? 'text-[#272727]' : 'text-[#272727]/65'
                  }`}
                >
                  {m.name}
                </span>
                <span className="text-sm font-semibold text-[#272727]">{v}</span>
              </div>
              <div className="relative h-3 rounded-full bg-[#272727]/[0.06]">
                <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: pct(v), background: color }} />
                {/* Guías de umbral del libro: 3 asoma, 4 gobierna */}
                {[MASKS_THRESHOLDS.secondary, MASKS_THRESHOLDS.dominant].map(t => (
                  <div
                    key={t}
                    className="absolute -inset-y-1 border-l border-dashed border-[#272727]/30"
                    style={{ left: pct(t) }}
                  />
                ))}
              </div>
            </li>
          )
        })}
      </ul>
      <div className="mt-5 flex flex-wrap justify-center gap-x-5 gap-y-2 text-xs text-[#272727]/55">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[#c2866b]" />{en ? 'Governs (4–5)' : 'Gobierna (4–5)'}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[#9cab92]" />{en ? 'Surfaces (3)' : 'Asoma (3)'}</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm bg-[#272727]/15" />{en ? 'Not now (1–2)' : 'No ahora (1–2)'}</span>
      </div>
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
  anonimo,
  children,
}: {
  locale: string
  tn: (k: string) => string
  anonimo: boolean
  children: React.ReactNode
}) {
  const supabase = createClient()
  async function logout() {
    await supabase.auth.signOut()
    window.location.href = `/${locale}/login`
  }
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      {anonimo ? (
        <div className="w-full max-w-md mb-8 text-center text-xs tracking-[0.3em] uppercase text-[#272727]/40">
          IKIGAIER
        </div>
      ) : (
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <Link
          href={`/${locale}/dashboard`}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          ← {tn('platform')}
        </Link>
        <button
          onClick={logout}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          {tn('logout')}
        </button>
      </div>
      )}
      {children}
    </div>
  )
}
