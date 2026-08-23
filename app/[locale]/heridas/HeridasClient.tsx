'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { SaveError } from '@/components/SaveError'
import { generarHeridasPdf } from '@/lib/heridas-pdf'
import {
  getStatements,
  getWounds,
  getHeridasIntro,
  getBandCopy,
  getResultCopy,
  getDisclaimer,
  getCrossInvite,
  crossConnection,
  getReflection,
  computeResult,
  bandFor,
  CROSS_HYPOTHESIS,
  type WoundCode,
  type WoundStatement,
} from '@/lib/heridas-content'
import { getMasks } from '@/lib/masks-content'
import { contentLang } from '@/lib/content-locale'

interface Initial {
  scores: Record<string, number>
  dominant: string | null
  reflection: Record<string, string>
}

interface Props {
  userId: string
  locale: string
  volver: string | null
  maskDominant: string | null
  initial: Initial
}

type Phase = 'intro' | 'test' | 'result'

export default function HeridasClient({ userId, locale, volver, maskDominant, initial }: Props) {
  const supabase = createClient()
  const tn = useTranslations('nav')
  const statements = getStatements(locale)

  // Si ya tenía un resultado guardado, arranca mostrándolo.
  const [phase, setPhase] = useState<Phase>(initial.dominant ? 'result' : 'intro')
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>(initial.scores)

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
          .from('herida_results')
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
  function score(id: string, n: number) {
    const next = { ...scores, [id]: n }
    setScores(next)
    if (step < statements.length - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0 })
    } else {
      finish(next)
    }
  }

  // Persiste el resultado (crudo + sumas + dominante) y avisa si falla, para
  // que el aviso ofrezca reintentar en vez de dar por guardado algo que no llegó.
  async function persist(finalScores: Record<string, number>) {
    const r = computeResult(finalScores)
    const { error } = await supabase
      .from('herida_results')
      .upsert(
        {
          user_id: userId,
          scores: finalScores,
          sums: r.sums,
          dominant: r.dominant,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    setSaveFailed(Boolean(error))
    return !error
  }

  async function finish(finalScores: Record<string, number>) {
    const r = computeResult(finalScores)
    setPhase('result')
    window.scrollTo({ top: 0 })
    trackEvent('herida_result', { tool: 'heridas', dominant: r.dominant, scenario: r.scenario })
    await persist(finalScores)
  }

  async function retrySave() {
    setRetrying(true)
    // Reintenta el guardado que falló: el resultado y/o la reflexión pendiente.
    const okResult = await persist(scores)
    let okReflection = true
    if (pendingReflection.current) {
      const { error } = await supabase
        .from('herida_results')
        .upsert(
          {
            user_id: userId,
            reflection: pendingReflection.current,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'user_id' }
        )
      okReflection = !error
      if (!error) pendingReflection.current = null
    }
    setSaveFailed(!(okResult && okReflection))
    setRetrying(false)
  }

  // ¿Ha contestado algo? Para decidir si hay resultado que mostrar.
  const hasScores = Object.keys(scores).length > 0

  return (
    <Shell locale={locale} tn={tn}>
      <div className="w-full max-w-md">
        {phase === 'intro' && <Intro onStart={() => setPhase('test')} locale={locale} />}
        {phase === 'test' && (
          <Test
            statement={statements[step]}
            step={step}
            total={statements.length}
            current={scores[statements[step].id]}
            onScore={score}
            locale={locale}
            onBack={() => {
              setStep(s => Math.max(0, s - 1))
              window.scrollTo({ top: 0 })
            }}
          />
        )}
        {phase === 'result' && hasScores && (
          <Result
            scores={scores}
            reflection={initial.reflection}
            onSaveReflection={saveReflection}
            volver={volver}
            maskDominant={maskDominant}
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
  const intro = getHeridasIntro(locale)
  return (
    <div className="text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-4">
        {en ? 'What weighs' : 'De qué te proteges'}
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
  statement,
  step,
  total,
  current,
  onScore,
  onBack,
  locale,
}: {
  statement: WoundStatement
  step: number
  total: number
  current?: number
  onScore: (id: string, n: number) => void
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
        {statement.text}
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onScore(statement.id, n)}
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
  scores,
  reflection,
  onSaveReflection,
  volver,
  maskDominant,
  locale,
}: {
  scores: Record<string, number>
  reflection: Record<string, string>
  onSaveReflection: (id: string, v: string, all: Record<string, string>) => void
  volver: string | null
  maskDominant: string | null
  locale: string
}) {
  // Suelta, el ejercicio se despliega solo si la persona lo pide.
  const [showExercise, setShowExercise] = useState(false)
  const [generandoPdf, setGenerandoPdf] = useState(false)
  const informeRef = useRef<HTMLDivElement>(null)
  const en = contentLang(locale) === 'en'

  const wounds = getWounds(locale)
  const meta = (code: WoundCode) => wounds.find(w => w.code === code)!
  const bandCopy = getBandCopy(locale)
  const resultCopy = getResultCopy(locale)
  const reflectionFields = getReflection(locale)

  // Cálculo determinista: suma por bloque → escenario → copy fijo.
  const { ordered, dominant, scenario, tied, sums } = computeResult(scores)

  // Copy principal según escenario.
  const mainCopy =
    scenario === 'allLow'
      ? resultCopy.allLow
      : scenario === 'allHigh'
        ? resultCopy.allHigh
        : scenario === 'tie'
          ? resultCopy.tie(meta(tied[0]).label, meta(tied[1]).label)
          : resultCopy[dominant]

  // Kicker + título estructural según escenario.
  const kicker =
    scenario === 'allLow'
      ? en
        ? 'A moment with no clear weight'
        : 'Un momento sin peso claro'
      : scenario === 'tie'
        ? en
          ? 'Two wounds at once'
          : 'Dos heridas a la vez'
        : scenario === 'allHigh'
          ? en
            ? 'All three at once'
            : 'Las tres a la vez'
          : en
            ? 'The wound that weighs most'
            : 'La herida que más pesa'
  const title =
    scenario === 'allLow'
      ? null
      : scenario === 'tie'
        ? `${meta(tied[0]).name} · ${meta(tied[1]).name}`
        : meta(dominant).name

  // Cruce con máscaras: si el usuario ya tiene máscara dominante y coincide con
  // la hipótesis del bloque dominante (nunca en "todo bajo"), se muestra la
  // conexión; si no la tiene, se le invita a hacer el test. Nunca cerrado.
  const masks = getMasks(locale)
  const maskMatch =
    scenario !== 'allLow' &&
    maskDominant &&
    (CROSS_HYPOTHESIS[dominant] as string[]).includes(maskDominant)
      ? masks.find(m => m.code === maskDominant) ?? null
      : null

  async function compartir() {
    trackEvent('share', { tool: 'heridas' })
    const url = 'https://www.ikigaier.com'
    const data = {
      title: en ? 'The wound that weighs most' : 'La herida que más pesa',
      text: en
        ? `I took the dominant-wound test. See yours at ${url}`
        : `Hice el test de la herida dominante. Mira el tuyo en ${url}`,
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
    trackEvent('pdf_download', { tool: 'heridas' })
    try {
      await generarHeridasPdf(informeRef.current)
    } catch {
      // Último recurso si la generación falla (navegador muy antiguo).
      window.print()
    } finally {
      setGenerandoPdf(false)
    }
  }

  // Qué bloques resaltar en el mapa: en empate, los dos que empatan; en
  // "todo bajo" ninguno (no se anuncia dominante); si no, el dominante.
  const highlighted: WoundCode[] =
    scenario === 'allLow' ? [] : scenario === 'tie' ? tied : [dominant]

  return (
    <div>
      {/* Reglas de impresión: al guardar como PDF se deja solo el informe,
          limpio, con los colores respetados (color-adjust). */}
      <style>{`
        .heridas-print-only { display: none; }
        @media print {
          @page { margin: 12mm; }
          body { background: #fff !important; }
          .heridas-print-root, .heridas-print-root * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .heridas-print-only { display: block; }
          .heridas-avoid-break { break-inside: avoid; }
        }
      `}</style>

      {/* Informe: lo que se captura en el PDF. Lo interactivo (botones,
          ejercicio) queda fuera o marcado como no exportable. */}
      <div ref={informeRef} className="heridas-print-root">
        {/* Resultado principal */}
        <div className="text-center mb-10">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">{kicker}</p>
          {title && (
            <h2 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727] mb-5">
              {title}
            </h2>
          )}
          <p className="text-sm leading-relaxed text-[#272727]/75 text-left">{mainCopy}</p>
        </div>

        {/* Mapa de las tres heridas: cada bloque con su banda. No es un ranking
            de valor; sitúa cuál pesa más hoy. */}
        <div className="mb-10 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
          <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-4">
            {en ? 'The three wounds' : 'Las tres heridas'}
          </p>
          <ul className="flex flex-col gap-4">
            {ordered.map(code => {
              const activo = highlighted.includes(code)
              return (
                <li key={code} className="heridas-avoid-break">
                  <div className="flex items-baseline justify-between mb-1">
                    <span
                      className={`text-sm ${
                        activo ? 'text-[#272727] font-medium' : 'text-[#272727]/55'
                      }`}
                    >
                      {activo && <span className="text-[#c2866b] mr-1.5">●</span>}
                      {meta(code).name}
                    </span>
                    <span className="text-xs text-[#272727]/35 ml-3 shrink-0">{sums[code]}</span>
                  </div>
                  <p className="text-xs leading-relaxed text-[#272727]/55">
                    {meta(code).name} {bandCopy[bandFor(sums[code])]}.
                  </p>
                </li>
              )
            })}
          </ul>
        </div>

        {/* Cruce con máscaras: la otra mitad del diagnóstico. */}
        <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-5 mb-10 heridas-avoid-break">
          {maskMatch ? (
            <p className="text-sm leading-relaxed text-[#272727]/80">
              {crossConnection(maskMatch.name, locale)}
            </p>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-[#272727]/80 mb-4">
                {getCrossInvite(locale)}
              </p>
              <Link
                href={`/${locale}/mascaras`}
                className="heridas-no-export inline-block text-xs tracking-widest uppercase text-[#c2866b] underline-offset-4 hover:underline"
              >
                {en ? 'Take the masks test →' : 'Hacer el test de las máscaras →'}
              </Link>
            </>
          )}
        </div>

        {/* Aviso de lectura: no diagnóstico clínico, no leer solo el número. */}
        <div className="py-2 mb-10">
          <p className="text-xs leading-relaxed text-[#272727]/50">{getDisclaimer(locale)}</p>
        </div>

        {/* Compartir / guardar en PDF. En móvil abre el menú nativo. No se
            exporta al propio PDF. */}
        <div className="mb-4 text-center print:hidden heridas-no-export">
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
            {generandoPdf
              ? en
                ? 'Generating…'
                : 'Generando…'
              : en
                ? 'Save as PDF'
                : 'Guardar en PDF'}
          </button>
          <p className="text-xs text-[#272727]/40 mt-2">
            {en
              ? 'Your result, to take with you or return to.'
              : 'Tu resultado, para llevártelo o volver a él.'}
          </p>
        </div>

        {/* Pie de marca: solo aparece en el PDF, para que quien lo reciba sepa
            dónde hacer su propio test. El QR lleva a ikigaier.com. */}
        <div className="heridas-print-only mt-10 pt-6 border-t border-[#272727]/15 heridas-avoid-break">
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
                {en ? 'What weighs' : 'De qué te proteges'}
              </p>
              <p className="font-[family-name:var(--font-cormorant)] text-lg leading-snug text-[#272727]">
                {en
                  ? 'Discover which wound weighs most at ikigaier.com'
                  : 'Descubre qué herida te pesa más en ikigaier.com'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ejercicio de cierre (3 partes). Suelto: se ofrece como invitación
          opcional para no cortar el momento. Si vino de otra herramienta
          (?volver), es parte del flujo y se muestra directo. */}
      {volver || showExercise ? (
        <div className="border-t border-[#272727]/10 pt-10">
          <p className="text-center text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-2">
            {en ? 'Exercise' : 'Ejercicio'}
          </p>
          <h3 className="text-center font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] mb-8">
            {en ? 'My dominant wound' : 'Mi herida dominante'}
          </h3>
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
      ) : (
        <div className="border-t border-[#272727]/10 pt-10 text-center">
          <p className="text-sm leading-relaxed text-[#272727]/60 mb-5">
            {en
              ? 'Want to take a step? Write about your wound and one small gesture you could start this week.'
              : '¿Quieres dar un paso? Escribe sobre tu herida y qué gesto pequeño podrías empezar esta semana.'}
          </p>
          <button
            onClick={() => setShowExercise(true)}
            className="text-xs tracking-widest uppercase text-[#c2866b] underline-offset-4 hover:underline"
          >
            {en ? 'Do the exercise' : 'Hacer el ejercicio'}
          </button>
        </div>
      )}

      {/* Acciones: solo el retorno al itinerario (si vino de ahí). */}
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
      {hint && <p className="text-sm text-[#272727]/50 mt-1 mb-3">{hint}</p>}
      <textarea
        value={local}
        rows={4}
        onChange={e => {
          setLocal(e.target.value)
          all[id] = e.target.value
          onSave(id, e.target.value, all)
        }}
        placeholder={en ? 'Write here…' : 'Escribe aquí…'}
        className={`w-full resize-y rounded-lg border border-[#272727]/20 bg-white/50 p-3 text-sm leading-relaxed text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors ${
          hint ? '' : 'mt-3'
        }`}
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
