'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { SaveError } from '@/components/SaveError'
import {
  getCaminos,
  getCaminoStatements,
  getCaminoIntro,
  getCaminoClosing,
  computeDominant,
  type CaminoStatement,
} from '@/lib/camino-content'
import { contentLang } from '@/lib/content-locale'

interface Initial {
  scores: Record<string, number>
  dominant: string | null
}

interface Props {
  userId: string
  locale: string
  volver: string | null
  initial: Initial
}

type Phase = 'intro' | 'test' | 'result'

export default function CaminoClient({ userId, locale, volver, initial }: Props) {
  const supabase = createClient()
  const tn = useTranslations('nav')
  const statements = getCaminoStatements(locale)

  // Si ya tenía un resultado guardado, arranca mostrándolo.
  const [phase, setPhase] = useState<Phase>(initial.dominant ? 'result' : 'intro')
  const [step, setStep] = useState(0)
  const [scores, setScores] = useState<Record<string, number>>(initial.scores)
  const [dominant, setDominant] = useState<string | null>(initial.dominant)
  const [saveFailed, setSaveFailed] = useState(false)
  const [retrying, setRetrying] = useState(false)

  // Guarda una puntuación y avanza. Al puntuar la última, calcula y persiste.
  function score(n: number, value: number) {
    const next = { ...scores, [String(n)]: value }
    setScores(next)
    if (step < statements.length - 1) {
      setStep(s => s + 1)
      window.scrollTo({ top: 0 })
    } else {
      finish(next)
    }
  }

  // Persiste el resultado y avisa si falla, para que el aviso ofrezca
  // reintentar en vez de dar por guardado algo que no llegó.
  async function persist(finalScores: Record<string, number>, dom: string | null) {
    const { error } = await supabase
      .from('camino_results')
      .upsert(
        {
          user_id: userId,
          scores: finalScores,
          dominant: dom,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
    setSaveFailed(Boolean(error))
    return !error
  }

  async function finish(finalScores: Record<string, number>) {
    const { dominant: dom } = computeDominant(finalScores)
    setDominant(dom)
    setPhase('result')
    window.scrollTo({ top: 0 })
    trackEvent('camino_result', { tool: 'camino', dominant: dom ?? '' })
    await persist(finalScores, dom)
  }

  async function retrySave() {
    setRetrying(true)
    await persist(scores, dominant)
    setRetrying(false)
  }

  return (
    <Shell locale={locale} tn={tn}>
      <div className="w-full max-w-md">
        {phase === 'intro' && <Intro onStart={() => setPhase('test')} locale={locale} />}
        {phase === 'test' && (
          <Test
            statement={statements[step]}
            step={step}
            total={statements.length}
            current={scores[String(statements[step].n)]}
            locale={locale}
            onScore={score}
            onBack={() => {
              setStep(s => Math.max(0, s - 1))
              window.scrollTo({ top: 0 })
            }}
          />
        )}
        {phase === 'result' && dominant && (
          <Result dominant={dominant} scores={scores} volver={volver} locale={locale} />
        )}
      </div>
      <SaveError show={saveFailed} retrying={retrying} onRetry={retrySave} />
    </Shell>
  )
}

// ---------- Intro ----------

function Intro({ onStart, locale }: { onStart: () => void; locale: string }) {
  const en = contentLang(locale) === 'en'
  const intro = getCaminoIntro(locale)
  return (
    <div className="text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-4">{en ? 'Your capabilities' : 'Tus capacidades'}</p>
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
  statement: CaminoStatement
  step: number
  total: number
  current?: number
  onScore: (n: number, value: number) => void
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
            onClick={() => onScore(statement.n, n)}
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
        <span>{en ? 'Not at all' : 'Nada de acuerdo'}</span>
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

// ---------- Resultado ----------

function Result({
  dominant,
  scores,
  volver,
  locale,
}: {
  dominant: string
  scores: Record<string, number>
  volver: string | null
  locale: string
}) {
  const en = contentLang(locale) === 'en'
  const caminos = getCaminos(locale)
  const closing = getCaminoClosing(locale)
  const camino = caminos.find(c => c.code === dominant)!
  const { totals } = computeDominant(scores)
  const maxTotal = 25 // 5 frases × 5 puntos por bloque

  async function compartir() {
    trackEvent('share', { tool: 'camino' })
    const url = 'https://www.ikigaier.com'
    const data = {
      title: en ? 'CAMINO test' : 'Test CAMINO',
      text: en
        ? `I found out my dominant orientation is ${camino.name}. See yours at ${url}`
        : `Descubrí que mi orientación dominante es ${camino.name}. Mira la tuya en ${url}`,
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

  return (
    <div>
      {/* Dominante */}
      <div className="text-center mb-10">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">{en ? 'Your dominant orientation' : 'Tu orientación dominante'}</p>
        <h2 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727] mb-4">
          {camino.name}
        </h2>
        <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#c2866b] leading-relaxed">
          {camino.description}
        </p>
      </div>

      {/* Detalle de la orientación */}
      <div className="flex flex-col gap-5 mb-10">
        <Trait label={en ? 'Traits' : 'Características'} value={camino.caracteristicas} />
        <Trait label={en ? 'Strengths' : 'Fortalezas'} value={camino.fortalezas} />
        <Trait label={en ? 'Challenges' : 'Desafíos'} value={camino.desafios} />
        <Trait label={en ? 'Careers' : 'Profesiones'} value={camino.profesiones} />
      </div>

      {/* Referente */}
      <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-5 mb-10">
        <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">{en ? 'A role model' : 'Un referente'}</p>
        <p className="font-[family-name:var(--font-cormorant)] text-lg leading-snug text-[#272727]">
          {camino.referente}
        </p>
      </div>

      {/* Las 6 orientaciones ordenadas por tu puntuación. Sitúa la tuya
          entre todas: puedes ser una combinación, y aquí lo ves. */}
      <div className="mb-10 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
        <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-4">{en ? 'The six orientations' : 'Las seis orientaciones'}</p>
        <ul className="flex flex-col gap-3">
          {totals.map(t => {
            const c = caminos.find(x => x.code === t.code)!
            const activo = t.code === dominant
            return (
              <li key={t.code}>
                <div
                  className={`flex items-baseline justify-between text-sm mb-1 ${
                    activo ? 'text-[#272727] font-medium' : 'text-[#272727]/55'
                  }`}
                >
                  <span>
                    {activo && <span className="text-[#c2866b] mr-1.5">●</span>}
                    {c.name}
                  </span>
                  <span className="text-xs text-[#272727]/35 ml-3 shrink-0">{t.total} / {maxTotal}</span>
                </div>
                <div className="h-1 w-full overflow-hidden rounded-full bg-[#272727]/10">
                  <div
                    className={`h-full transition-all ${activo ? 'bg-[#c2866b]' : 'bg-[#272727]/25'}`}
                    style={{ width: `${(t.total / maxTotal) * 100}%` }}
                  />
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Cierre: puedes ser una combinación */}
      <div className="py-2 text-center mb-10">
        <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#c2866b] leading-relaxed">
          {closing.reframe}
        </p>
      </div>

      {/* Compartir */}
      <div className="mb-4 text-center">
        <button
          onClick={compartir}
          className="w-full py-3 bg-[#c2866b] text-[#FDFBF7] text-xs tracking-widest uppercase hover:bg-[#272727] transition-colors"
        >
          {en ? 'Share' : 'Compartir'}
        </button>
        <p className="text-xs text-[#272727]/40 mt-2">{en ? 'Your orientation, to take with you or return to.' : 'Tu orientación, para llevártela o volver a ella.'}</p>
      </div>

      {/* Retorno al itinerario IKIBOARD (si vino de ahí). */}
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

function Trait({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#272727]/12 bg-white/50 px-5 py-4">
      <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1.5">{label}</p>
      <p className="text-sm leading-relaxed text-[#272727]/75">{value}</p>
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
