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
  userId: string
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
    <Shell locale={locale} tn={tn}>
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
    trackEvent('share', { tool: 'mascaras' })
    const url = 'https://www.ikigaier.com'
    const data = {
      title: en ? 'Which mask governs your life?' : '¿Qué máscara gobierna tu vida?',
      text: en
        ? `I found out my dominant mask is ${mask.name}. See yours at ${url}`
        : `Descubrí que mi máscara dominante es ${mask.name}. Mira la tuya en ${url}`,
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
    trackEvent('pdf_download', { tool: 'mascaras' })
    try {
      await generarMascarasPdf(informeRef.current)
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

      {/* Informe: lo que se captura en el PDF. Lo interactivo (botones,
          ejercicio) queda fuera o marcado como no exportable. */}
      <div ref={informeRef} className="mask-print-root">
      {/* Dominante */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">
          {en ? 'The mask that governs you most' : 'La máscara que más te gobierna'}
        </p>
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727] mb-5">
          {mask.name}
        </h2>
        <p className="text-sm leading-relaxed text-[#272727]/75">{mask.description}</p>
      </div>

      {/* El miedo debajo (el freno) */}
      <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-5 text-center mb-10">
        <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">{en ? 'The fear underneath' : 'El miedo que hay debajo'}</p>
        <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{mask.fear}</p>
        <p className="text-xs text-[#272727]/50 mt-3">
          {en ? 'When you name the fear, the mask loses its grip.' : 'Cuando le pones nombre al miedo, la máscara pierde fuerza.'}
        </p>
      </div>

      {/* Las máscaras que hoy aplican (puntúan 3+): cada una descrita con su
          miedo. Antes solo se describía la dominante. */}
      {active.length > 1 && (
        <div className="mb-10">
          <p className="text-center text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-1">
            {en ? 'The ones you wear today' : 'Las que hoy llevas puestas'}
          </p>
          <p className="text-center text-sm text-[#272727]/55 mb-6">
            {en
              ? 'You may recognise yourself in more than one. That’s normal: they aren’t sealed compartments.'
              : 'Posiblemente te reconozcas en más de una. Es normal: no son compartimentos estancos.'}
          </p>
          <div className="flex flex-col gap-5">
            {active.map(m => {
              const gobierna = (scores[m.code] ?? 0) >= MASKS_THRESHOLDS.dominant
              return (
                <div
                  key={m.code}
                  className="rounded-xl border border-[#272727]/12 bg-white/50 px-5 py-4"
                >
                  <div className="flex items-baseline justify-between mb-2">
                    <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">
                      {m.name}
                    </p>
                    <span className="text-xs text-[#272727]/35 ml-3 shrink-0">
                      {gobierna ? (en ? 'governs you' : 'te gobierna') : (en ? 'surfacing' : 'asoma')}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-[#272727]/75 mb-2">{m.description}</p>
                  <p className="text-xs tracking-wide text-[#c2866b]">{en ? 'The fear behind: ' : 'El miedo detrás: '}{m.fear}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Retrato combinado: cómo se turnan tus máscaras para proteger la misma
          herida. Enriquecimiento sobre "no son compartimentos estancos". */}
      {combination.length > 0 && (
        <div className="rounded-xl bg-[#c2866b]/[0.06] px-5 py-5 mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">{en ? 'How they combine in you' : 'Cómo se combinan en ti'}</p>
          <div className="flex flex-col gap-3">
            {combination.map((linea, i) => (
              <p key={i} className="text-sm leading-relaxed text-[#272727]/80">
                {linea}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Mapa de las 7 máscaras: sitúa la tuya entre todas. No es un ranking
          de valor; todas conviven en ti, esta es la que hoy manda. */}
      <div className="mb-10 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
        <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-2">{en ? 'The 7 masks' : 'Las 7 máscaras'}</p>
        <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">
          {en
            ? 'They all live in you. These are the ones that weigh most today and the ones barely surfacing now.'
            : 'Todas conviven en ti. Estas son las que hoy pesan más y las que ahora apenas asoman.'}
        </p>
        <ul className="flex flex-col gap-1.5">
          {ranked.map(m => {
            const score = scores[m.code] ?? 0
            const activo = m.code === dominant
            const nivel =
              score >= MASKS_THRESHOLDS.dominant
                ? (en ? 'governs you' : 'te gobierna')
                : score >= MASKS_THRESHOLDS.secondary
                  ? (en ? 'surfacing' : 'asoma')
                  : (en ? 'not defining you now' : 'no te define ahora')
            return (
              <li
                key={m.code}
                className={`flex items-baseline justify-between text-sm ${
                  activo ? 'text-[#272727] font-medium' : 'text-[#272727]/55'
                }`}
              >
                <span>
                  {activo && <span className="text-[#c2866b] mr-1.5">●</span>}
                  {m.name}
                </span>
                <span className="text-xs text-[#272727]/35 ml-3 shrink-0">{nivel}</span>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Cierre sin juicio */}
      <div className="py-2 text-center mb-10">
        <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{closing.noJudgement}</p>
        <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#c2866b] leading-relaxed">
          {closing.reframe}
        </p>
      </div>

      {/* Compartir / guardar en PDF. En móvil abre el menú nativo para
          guardarlo en Archivos o enviarlo. No se exporta al propio PDF. */}
      <div className="mb-4 text-center print:hidden mask-no-export">
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
        <p className="text-xs text-[#272727]/40 mt-2">{en ? 'Your result, to take with you or return to.' : 'Tu resultado, para llevártelo o volver a él.'}</p>
      </div>

      {/* Pie de marca: solo aparece en el PDF, para que quien lo reciba sepa
          dónde hacer su propio test. El QR lleva a ikigaier.com. */}
      <div className="mask-print-only mt-10 pt-6 border-t border-[#272727]/15 mask-avoid-break">
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
            <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-1">{en ? 'The mirror' : 'El espejo'}</p>
            <p className="font-[family-name:var(--font-cormorant)] text-lg leading-snug text-[#272727]">
              {en ? 'Discover which mask governs your life at ikigaier.com' : 'Descubre qué máscara gobierna tu vida en ikigaier.com'}
            </p>
          </div>
        </div>
      </div>
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
