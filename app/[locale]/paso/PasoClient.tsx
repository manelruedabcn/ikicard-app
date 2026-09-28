'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { generarPasoPdf } from '@/lib/paso-pdf'
import {
  PASO_GRUPOS,
  DIMS,
  TOTAL_GRUPOS,
  calcularInformePaso,
  getPatron,
  type Dim,
  type Answer,
  type InformePaso,
} from '@/lib/paso-content'
import {
  generarTitulares,
} from '@/lib/paso-titulares'
import {
  NUM_ZONAS,
  ZONA_EQUILIBRIO,
  PASO_PENDING_KEY,
  calcularSegmentos,
  resolverCodigoPorSegmentos,
} from '@/lib/paso-segments'
import { generarNarrativa } from '@/lib/paso-narrativa'
import { PASO_GRUPOS_EN } from '@/lib/paso-questions-en'

type Stage = 'intro' | 'test' | 'result'
const PASO_PROGRESS_KEY = 'paso_test_progress_v2'

// Enlaces de compra por libro recomendado. Clave = título exacto en los patrones.
// Los libros sin entrada (p. ej. el perfil Equilibrio) no muestran enlace.
const LIBRO_LINKS: Record<string, string> = {
  'El Ikigai que no te contaron': 'https://amzn.eu/d/087ECE8M',
  'No todo lo que te frena es tuyo': 'https://amzn.eu/d/0gyFdxbV',
  'Disciplina para indisciplinados': 'https://amzn.eu/d/03GIlPhr',
  'Camina sin separarte de ti': 'https://amzn.eu/d/01keLRwF',
}

// Ejemplo interactivo de la intro: cosas fáciles y cotidianas para que la
// persona practique el gesto "MÁS / MENOS" antes del test real. Solo palabras,
// sin iconos ni color, para no romper la estética. Los ejes P/A/S/O NO
// intervienen aquí: es solo una práctica del gesto, no puntúa nada.
const EJEMPLO_ES = ['Café', 'Té', 'Refresco', 'Agua']
const EJEMPLO_EN = ['Coffee', 'Tea', 'Soda', 'Water']

interface Props {
  locale: string
  userId: string | null
  volver?: string | null
}

export default function PasoClient({ locale, userId, volver = null }: Props) {
  const t = useTranslations('paso')
  const tn = useTranslations('nav')
  const grupos = locale === 'en' ? PASO_GRUPOS_EN : PASO_GRUPOS

  const [stage, setStage] = useState<Stage>('intro')
  const [step, setStep] = useState(0) // grupo actual (0-27)
  const [answers, setAnswers] = useState<Record<number, { mas?: Dim; menos?: Dim }>>({})
  const [informe, setInforme] = useState<InformePaso | null>(null)
  const [saved, setSaved] = useState(false)
  const [generandoPdf, setGenerandoPdf] = useState(false)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const informeRef = useRef<HTMLDivElement>(null)
  const progressReady = useRef(false)

  // Ejemplo interactivo de la intro (práctica del gesto MÁS/MENOS, no puntúa).
  const ejemplo = locale === 'en' ? EJEMPLO_EN : EJEMPLO_ES
  const [ej, setEj] = useState<{ mas?: number; menos?: number }>({})

  // Un test de 28 decisiones no debería perderse por recargar la página.
  // Se guarda solo en este navegador y se elimina al terminar.
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(`${PASO_PROGRESS_KEY}:${locale}`)
      if (raw) {
        const data = JSON.parse(raw) as { step?: number; answers?: Record<number, { mas?: Dim; menos?: Dim }> }
        if (data.answers && Object.keys(data.answers).length > 0) {
          setAnswers(data.answers)
          setStep(Math.max(0, Math.min(TOTAL_GRUPOS - 1, data.step ?? 0)))
          setStage('test')
        }
      }
    } catch {}
    progressReady.current = true
  }, [locale])

  useEffect(() => {
    if (!progressReady.current || stage !== 'test') return
    try {
      sessionStorage.setItem(`${PASO_PROGRESS_KEY}:${locale}`, JSON.stringify({ step, answers }))
    } catch {}
  }, [answers, locale, stage, step])

  function pickEj(kind: 'mas' | 'menos', idx: number) {
    setEj(prev => {
      const cur = { ...prev }
      const other = kind === 'mas' ? 'menos' : 'mas'
      if (cur[other] === idx) cur[other] = undefined
      cur[kind] = cur[kind] === idx ? undefined : idx
      return cur
    })
  }

  async function compartir(nombrePatron: string, codigoPatron: string) {
    trackEvent('share', { tool: 'paso' })
    const url = `${window.location.origin}/${locale}/paso/forma/${encodeURIComponent(codigoPatron)}`
    const data = {
      title: t('share_title'),
      text: `${t('share_text', { patron: nombrePatron })} ${url}`,
      url,
    }
    try {
      if (navigator.share) {
        await navigator.share(data)
      } else {
        await navigator.clipboard.writeText(data.text)
        alert(t('share_copied'))
      }
    } catch {
      // La persona cerró el diálogo de compartir: no hacemos nada.
    }
  }

  async function guardarPdf() {
    if (!informeRef.current || generandoPdf) return
    setGenerandoPdf(true)
    setPdfUrl(prev => {
      if (prev) URL.revokeObjectURL(prev)
      return null
    })
    trackEvent('pdf_download', { tool: 'paso' })
    try {
      const url = await generarPasoPdf(informeRef.current, 'PASO.pdf')
      setPdfUrl(url)
    } catch {
      alert(locale === 'en'
        ? 'The PDF could not be created. Please try again.'
        : 'No se ha podido crear el PDF. Inténtalo de nuevo.')
    } finally {
      setGenerandoPdf(false)
    }
  }

  function pick(grupo: number, kind: 'mas' | 'menos', dim: Dim) {
    setAnswers(prev => {
      const cur = { ...(prev[grupo] || {}) }
      // Si se elige la misma palabra que ya estaba en el otro rol, se libera
      const other = kind === 'mas' ? 'menos' : 'mas'
      if (cur[other] === dim) cur[other] = undefined
      cur[kind] = cur[kind] === dim ? undefined : dim
      const next = { ...prev, [grupo]: cur }
      // Persistimos dentro del propio gesto para cubrir incluso una recarga
      // inmediata, antes de que se ejecute el efecto de React.
      try {
        sessionStorage.setItem(`${PASO_PROGRESS_KEY}:${locale}`, JSON.stringify({ step, answers: next }))
      } catch {}
      return next
    })
  }

  async function finish() {
    const list: Answer[] = grupos.map(g => ({
      grupo: g.grupo,
      mas: answers[g.grupo]!.mas!,
      menos: answers[g.grupo]!.menos!,
    }))
    const inf = calcularInformePaso(list)
    setInforme(inf)
    setStage('result')
    window.scrollTo({ top: 0 })
    try {
      sessionStorage.removeItem(`${PASO_PROGRESS_KEY}:${locale}`)
    } catch {}

    // El código se asigna por SEGMENTOS (norming), no por la dominancia cruda.
    const codigo = resolverCodigoPorSegmentos(calcularSegmentos(inf.scores))
    trackEvent('test_completed', { tool: 'paso', pattern: codigo })

    // Registrar el intento para métricas del lead magnet (con cuenta o sin ella).
    // El servidor decide logueado/anónimo por la sesión. Fire-and-forget.
    fetch('/api/paso/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codigo, locale }),
    }).catch(() => {})
    const payload = {
      codigo_patron: codigo,
      mascara_p: inf.mascara.P, mascara_a: inf.mascara.A, mascara_s: inf.mascara.S, mascara_o: inf.mascara.O,
      natural_p: inf.natural.P, natural_a: inf.natural.A, natural_s: inf.natural.S, natural_o: inf.natural.O,
      score_p: inf.scores.P, score_a: inf.scores.A, score_s: inf.scores.S, score_o: inf.scores.O,
      punto_ciego: inf.puntoCiego,
    }

    if (userId) {
      // Con sesión: se guarda ya.
      const supabase = createClient()
      const { error } = await supabase.from('paso_results').insert({ user_id: userId, ...payload })
      if (!error) setSaved(true)
    } else {
      // Sin sesión: guardamos el resultado en el navegador para insertarlo en
      // cuanto la persona se registre y entre (lo recoge el dashboard).
      try {
        localStorage.setItem(PASO_PENDING_KEY, JSON.stringify(payload))
      } catch {}
    }
  }

  // ---------- INTRO ----------
  if (stage === 'intro') {
    const ejemploCompleto = ej.mas !== undefined && ej.menos !== undefined
    const ejemploPaso = ej.mas === undefined
      ? t('example_step_more')
      : ej.menos === undefined
        ? t('example_step_less')
        : t('example_done')

    return (
      <Shell locale={locale} tn={tn} userId={userId}>
        <div className="w-full max-w-md text-center mt-4 sm:mt-8">
          <img
            src="/brand/ikigaier-isotipo.png"
            alt=""
            aria-hidden="true"
            className="mx-auto mb-4 h-12 w-12"
          />
          <p className="text-sm font-medium tracking-[0.45em] uppercase text-[#c2866b] mb-4">P · A · S · O</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl leading-[1.05] text-[#272727] mb-4">
            {t('intro_title')}
          </h1>
          <p className="text-base leading-relaxed text-[#272727]/70 max-w-sm mx-auto">
            {t('intro_desc')}
          </p>

          <div className="grid grid-cols-2 gap-2 mt-7 mb-7 text-left">
            {DIMS.map(dim => (
              <div key={dim} className="rounded-xl bg-[#272727]/[0.035] px-4 py-3">
                <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#272727]">
                  <EjeLabel label={t('dim_' + dim)} />
                </p>
                <p className="text-xs leading-relaxed text-[#272727]/55 mt-0.5">
                  {t('intro_dim_' + dim)}
                </p>
              </div>
            ))}
          </div>

          {/* Ejemplo interactivo: practica el gesto MÁS/MENOS con algo fácil */}
          <div className="rounded-2xl border border-[#c2866b]/25 bg-white/55 p-5 mb-5 shadow-[0_18px_50px_rgba(39,39,39,0.05)]">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#c2866b] text-[11px] text-white">1</span>
              <p className="text-xs tracking-widest uppercase text-[#c2866b]">{t('example_eyebrow')}</p>
            </div>
            <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727] mb-1">
              {t('example_title')}
            </p>
            <p className="text-sm leading-relaxed text-[#272727]/60 mb-4">{t('example_intro')}</p>
            <div className="flex items-center justify-end gap-2 mb-2 pr-1">
              <span className="w-14 text-center text-[10px] tracking-widest uppercase text-[#c2866b]">
                {t('mas')}
              </span>
              <span className="w-14 text-center text-[10px] tracking-widest uppercase text-[#272727]/40">
                {t('menos')}
              </span>
            </div>
            <div className="flex flex-col gap-2">
              {ejemplo.map((it, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-xl border border-[#272727]/10 bg-[#FDFBF7] px-4 py-2.5"
                >
                  <span className="flex-1 text-left text-[15px] text-[#272727]">{it}</span>
                  <ChoiceBtn active={ej.mas === i} variant="mas" label={`${t('mas')}: ${it}`} shortLabel={t('mas')} onClick={() => pickEj('mas', i)} />
                  <ChoiceBtn active={ej.menos === i} variant="menos" label={`${t('menos')}: ${it}`} shortLabel={t('menos')} onClick={() => pickEj('menos', i)} />
                </div>
              ))}
            </div>
            <p aria-live="polite" className={`text-sm mt-4 ${ejemploCompleto ? 'text-[#7a8b6f]' : 'text-[#c2866b]'}`}>
              {ejemploPaso}
            </p>
          </div>

          <p className="text-xs text-[#272727]/45 mb-4">{t('intro_time')}</p>
          <button
            onClick={() => setStage('test')}
            disabled={!ejemploCompleto}
            className="w-full rounded-xl py-4 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:cursor-not-allowed disabled:opacity-25"
          >
            {t('intro_start')}
          </button>
          <p className="text-xs leading-relaxed text-[#272727]/40 mt-3 px-4">{t('intro_reassurance')}</p>
        </div>
      </Shell>
    )
  }

  // ---------- TEST ----------
  if (stage === 'test') {
    const g = grupos[step]
    const cur = answers[g.grupo] || {}
    const complete = !!cur.mas && !!cur.menos
    const isLast = step === TOTAL_GRUPOS - 1
    const instruction = !cur.mas && !cur.menos
      ? t('test_step_more')
      : !cur.mas
        ? t('test_step_more_missing')
        : !cur.menos
          ? t('test_step_less')
          : t('test_step_done')

    return (
      <Shell locale={locale} tn={tn} userId={userId}>
        <div className="w-full max-w-md">
          {/* Progreso */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-[#272727]/40 mb-2 tracking-wide">
              <span>{t('progress', { n: step + 1, total: TOTAL_GRUPOS })}</span>
            </div>
            <div className="h-1 w-full rounded-full bg-[#272727]/10">
              <div
                className="h-1 rounded-full bg-[#c2866b] transition-all"
                style={{ width: `${((step + 1) / TOTAL_GRUPOS) * 100}%` }}
              />
            </div>
          </div>

          <div className="mb-6 rounded-xl bg-[#272727]/[0.035] px-4 py-3 text-center" aria-live="polite">
            <p className={`text-sm ${complete ? 'text-[#7a8b6f]' : 'text-[#272727]/70'}`}>{instruction}</p>
          </div>

          {/* Cabecera de columnas */}
          <div className="flex items-center justify-end gap-2 mb-2 pr-1">
            <span className="w-14 text-center text-[10px] tracking-widest uppercase text-[#c2866b]">
              {t('mas')}
            </span>
            <span className="w-14 text-center text-[10px] tracking-widest uppercase text-[#272727]/40">
              {t('menos')}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {DIMS.map(dim => (
              <div
                key={dim}
                className={`flex items-center gap-2 rounded-xl border px-4 py-3 transition-all ${
                  cur.mas === dim
                    ? 'border-[#c2866b]/60 bg-[#c2866b]/[0.07] shadow-[0_6px_24px_rgba(194,134,107,0.08)]'
                    : cur.menos === dim
                      ? 'border-[#272727]/25 bg-[#272727]/[0.035]'
                      : 'border-[#272727]/10 bg-white/30'
                }`}
              >
                <span className="flex-1 font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">
                  {g[dim]}
                </span>
                <ChoiceBtn active={cur.mas === dim} variant="mas" label={`${t('mas')}: ${g[dim]}`} shortLabel={t('mas')} onClick={() => pick(g.grupo, 'mas', dim)} />
                <ChoiceBtn active={cur.menos === dim} variant="menos" label={`${t('menos')}: ${g[dim]}`} shortLabel={t('menos')} onClick={() => pick(g.grupo, 'menos', dim)} />
              </div>
            ))}
          </div>

          {/* Navegación */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={() => {
                setStep(s => Math.max(0, s - 1))
                window.scrollTo({ top: 0 })
              }}
              disabled={step === 0}
              className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors disabled:opacity-0"
            >
              ← {t('back')}
            </button>
            {isLast ? (
              <button
                onClick={finish}
                disabled={!complete}
                className="rounded-xl px-6 py-3 bg-[#c2866b] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#272727] transition-colors disabled:opacity-30"
              >
                {t('see_result')}
              </button>
            ) : (
              <button
                onClick={() => {
                  setStep(s => Math.min(TOTAL_GRUPOS - 1, s + 1))
                  window.scrollTo({ top: 0 })
                }}
                disabled={!complete}
                className="rounded-xl px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-30"
              >
                {t('next')} →
              </button>
            )}
          </div>
        </div>
      </Shell>
    )
  }

  // ---------- RESULT ----------
  const inf = informe!
  // Asignación por SEGMENTOS (norming DISC adaptado): la clasificación visual
  // de P·A·S·O y, a partir de ella, el Caminante.
  const segmentos = calcularSegmentos(inf.scores)
  const codigo = resolverCodigoPorSegmentos(segmentos)
  const patron = getPatron(codigo)
  // Eje dominante POR SEGMENTOS (zona más alta, empate → orden P-A-S-O): la misma
  // fuente que da el nombre del Caminante, para que el titular no lo contradiga.
  const dominante = DIMS.reduce((a, b) => (segmentos[a] >= segmentos[b] ? a : b))

  return (
    <Shell locale={locale} tn={tn} userId={userId}>
      {/* Reglas de impresión: al guardar como PDF se deja solo el informe,
          limpio, con los colores del gráfico y las barras (color-adjust). */}
      <style>{`
        .paso-print-only { display: none; }
        @media print {
          @page { margin: 12mm; }
          body { background: #fff !important; }
          .paso-print-root, .paso-print-root * {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          .paso-print-only { display: block; }
          /* La lectura del patrón empieza en página nueva y no se parte. */
          .paso-break-before { break-before: page; }
          .paso-avoid-break { break-inside: avoid; }
        }
      `}</style>
      <div ref={informeRef} className="w-full max-w-xl paso-print-root">
        {/* Portada inspirada en el informe editorial original: identidad fuerte
            arriba y lectura personal, más íntima, sobre papel claro. */}
        <header data-pdf-block data-pdf-break="before" className="relative overflow-hidden rounded-[2rem] bg-[#F8F4ED] text-center shadow-[0_28px_90px_rgba(39,36,32,0.14)] paso-avoid-break">
          <div className="relative isolate overflow-hidden bg-[#242320] px-6 pb-16 pt-12 sm:px-10 sm:pb-20 sm:pt-14">
            <div className="absolute -left-16 -top-20 -z-10 h-52 w-52 rounded-full bg-[#84937A] sm:-left-20 sm:-top-24 sm:h-64 sm:w-64" />
            <div className="absolute -bottom-28 -right-20 -z-10 h-48 w-48 rounded-full bg-[#C7896D]/90 sm:h-56 sm:w-56" />
            <div className="absolute left-8 top-8 sm:left-11 sm:top-10">
              <img
                src="/brand/ikigaier-isotipo-crema.png"
                alt="IKIGAIER"
                className="block h-12 w-12 object-contain opacity-90 sm:h-14 sm:w-14"
              />
            </div>
            <p className="mb-7 mt-12 text-[11px] uppercase tracking-[0.38em] text-[#D2A857] sm:mt-14">
              {t('your_pattern')}
            </p>
            <h1 className="mx-auto max-w-lg font-[family-name:var(--font-cormorant)] text-4xl leading-[1.05] text-[#F8F4ED] sm:text-6xl">
              {patron?.nombre}
            </h1>
          </div>

          <div className="relative overflow-hidden px-6 py-11 sm:px-10 sm:py-14">
            <div className="absolute -bottom-28 -right-24 h-48 w-48 rounded-full bg-[#C7896D] sm:-bottom-36 sm:-right-28 sm:h-60 sm:w-60" />
            <p className="mx-auto mb-9 max-w-md font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727] sm:text-3xl">
              {locale === 'en'
                ? 'Not a label. A mirror of how you walk today.'
                : 'No es una etiqueta. Es un espejo de cómo caminas hoy.'}
            </p>
            <div className="relative mx-auto max-w-md">
              <TitularesBlock inf={inf} dominante={dominante} locale={locale} />
              {patron?.retrato && (
                <div className="border-t border-[#C7896D]/35 pt-7">
                  <p className="mb-3 text-[10px] uppercase tracking-[0.3em] text-[#C7896D]">
                    {t('retrato_eyebrow')}
                  </p>
                  <p className="text-[15px] leading-relaxed text-[#272727]/72">{patron.retrato}</p>
                </div>
              )}
              <div className="mx-auto my-7 h-px w-24 bg-[#C7896D]/70" />
              <p className="text-xs leading-relaxed text-[#272727]/45">{t('pattern_framing')}</p>
            </div>
          </div>
        </header>

        {/* El tipo es la síntesis; la clasificación visual aporta el matiz. */}
        <ReportSection number="01" title={t('result_classification_title')} intro={t('result_classification_intro')}>
          <FirmaBlock segmentos={segmentos} t={t} embedded />
        </ReportSection>

        {/* El corazón del informe: diferencia entre lo mostrado y lo espontáneo. */}
        <ReportSection number="02" title={t('result_distance_title')} intro={t('result_distance_intro')}>
          <div data-pdf-block className="rounded-2xl bg-[#FDFBF7] px-3 py-5 sm:px-6">
            <HorizonGraph inf={inf} labels={DIMS.map(d => t('dim_' + d))} t={t} />
          </div>
          <div data-pdf-block className="pdf-distance-explainer mt-6 grid gap-px overflow-hidden rounded-2xl border border-[#272727]/10 bg-[#272727]/10 sm:grid-cols-2">
            <div className="bg-[#FDFBF7] px-5 py-5 sm:px-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#c2866b]">
                {t('distance_mask_title')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#272727]/72">
                {t('distance_mask_text')}
              </p>
            </div>
            <div className="bg-[#FDFBF7] px-5 py-5 sm:px-6">
              <p className="text-[10px] font-medium uppercase tracking-[0.24em] text-[#c2866b]">
                {t('distance_reading_title')}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#272727]/72">
                {t('distance_reading_text')}
              </p>
            </div>
          </div>
          <div data-pdf-block className="pdf-distance-summary mt-8 border-t border-[#272727]/10 pt-8 pb-4">
            <NarrativaBlock inf={inf} locale={locale} />
          </div>
        </ReportSection>

        {/* Desarrollo útil del Caminante, en formato de informe y sin cebos. */}
        {patron && (
          <ReportSection number="03" title={t('result_profile_title')} intro={t('result_profile_intro')} pageBreak>
            <div data-pdf-block className="grid gap-px overflow-hidden rounded-2xl border border-[#272727]/10 bg-[#272727]/10 sm:grid-cols-2 paso-avoid-break">
              <Field label={t('motivacion')} text={patron.motivacion} card />
              <Field label={t('bajo_presion')} text={patron.bajo_presion} card />
              <Field label={t('teme')} text={patron.teme} card />
              <Field label={t('eficaz')} text={patron.seria_mas_eficaz_si} card />
            </div>
          </ReportSection>
        )}

        {/* Libro recomendado. Si hay enlace de compra, el título es clicable
            (abre Amazon en pestaña nueva) y se muestra un CTA. El enlace <a>
            sigue siendo clicable si el resultado se guarda como PDF. */}
        {patron && (
          <div data-pdf-block className="mt-10 rounded-2xl border border-[#c2866b]/25 bg-[#c2866b]/[0.06] px-6 py-6 text-center paso-avoid-break">
            <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">{t('book')}</p>
            {LIBRO_LINKS[patron.libro_recomendado] ? (
              <a
                href={LIBRO_LINKS[patron.libro_recomendado]}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => trackEvent('paso_libro_click', { libro: patron.libro_recomendado })}
                className="group inline-block"
              >
                <span className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] underline decoration-[#c2866b]/40 underline-offset-4 group-hover:decoration-[#c2866b]">
                  {patron.libro_recomendado}
                </span>
                <span className="block text-xs tracking-widest uppercase text-[#c2866b] mt-2">
                  {t('book_cta')}
                </span>
              </a>
            ) : (
              <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">
                {patron.libro_recomendado}
              </p>
            )}
          </div>
        )}

        {/* Descargar PDF: crea el informe y guarda el archivo directamente.
            Compartir sigue siendo una acción independiente. */}
        <div className="mt-4 text-center print:hidden paso-no-export">
          <button
            onClick={() => compartir(patron?.nombre ?? '', codigo)}
            className="w-full py-3 bg-[#c2866b] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#272727] transition-colors"
          >
            {t('share_button')}
          </button>
          {pdfUrl ? (
            <a
              href={pdfUrl}
              download="PASO.pdf"
              className="mt-3 block w-full border border-[#272727] bg-[#272727] px-4 py-3 text-xs uppercase tracking-widest text-[#FDFBF7] transition-colors hover:bg-[#c2866b] hover:border-[#c2866b]"
            >
              {locale === 'en' ? 'Save PDF →' : 'Guardar PDF →'}
            </a>
          ) : (
            <button
              onClick={guardarPdf}
              disabled={generandoPdf}
              className="w-full py-3 mt-3 border border-[#272727] text-[#272727] text-xs tracking-widest hover:bg-[#272727] hover:text-[#FDFBF7] transition-colors disabled:opacity-40"
            >
              {generandoPdf ? t('pdf_generating') : t('pdf_button')}
            </button>
          )}
          {!pdfUrl && <p className="text-xs text-[#272727]/40 mt-2">{t('pdf_hint')}</p>}
        </div>

        {/* Pie de marca: solo aparece en el PDF/impresión, para que quien lo
            reciba compartido sepa dónde hacer su propio test. El QR lleva a
            www.ikigaier.com para maximizar la conversión de quien lo escanea. */}
        <div data-pdf-block className="paso-print-only mt-10 pt-6 border-t border-[#272727]/15">
          <div className="flex items-center justify-center gap-5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/paso-qr.png"
              alt="ikigaier.com"
              width={88}
              height={88}
              className="w-[88px] h-[88px] shrink-0"
            />
            <div className="flex min-w-0 flex-col items-start gap-2 text-left">
              <img
                src="/brand/ikigaier-marca-completa.png"
                alt="IKIGAIER"
                className="h-auto w-44 max-w-full"
              />
              <p className="text-xs leading-snug text-[#272727]/60">
                {t('pdf_footer')}
              </p>
            </div>
          </div>
        </div>

        {/* Guardado / CTA cuenta */}
        <div className="mt-8 text-center print:hidden paso-no-export">
          {userId ? (
            saved && <p className="text-xs text-[#272727]/50">{t('saved')}</p>
          ) : (
            <div className="space-y-5">
              {/* Captura de email (lead magnet): promesa abierta de recibir las
                  herramientas de IKIGAIER. Single opt-in con checkbox explícito. */}
              <LeadCapture codigo={codigo} locale={locale} informe={inf} />
              <div className="rounded-xl bg-[#272727]/[0.03] px-5 py-5">
                <p className="text-sm text-[#272727]/70 mb-4">{t('cta_account')}</p>
                <Link
                  href={`/${locale}/login`}
                  className="inline-block px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors"
                >
                  {t('cta_button')}
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Nota de encuadre: PASO es un espejo, no un diagnóstico */}
        <p data-pdf-block className="mt-10 pb-4 text-center text-xs leading-relaxed text-[#272727]/40 px-2">
          {t('nota_espejo')}
        </p>

        {volver && userId && (
          <div className="mt-8 text-center print:hidden paso-no-export">
            <Link
              href={`/${locale}${volver}`}
              className="inline-block rounded-full bg-[#c2866b] px-8 py-3 text-xs tracking-widest uppercase text-[#FDFBF7] hover:opacity-90"
            >
              Volver y seguir
            </Link>
          </div>
        )}
      </div>
    </Shell>
  )
}

// ---------- Subcomponentes ----------

function ChoiceBtn({
  active,
  variant,
  label,
  shortLabel,
  onClick,
}: {
  active: boolean
  variant: 'mas' | 'menos'
  label: string
  shortLabel: string
  onClick: () => void
}) {
  const on =
    variant === 'mas'
      ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
      : 'border-[#272727] bg-[#272727] text-[#FDFBF7]'
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`h-9 w-14 rounded-lg border text-[10px] font-medium uppercase tracking-wider transition-all ${
        active ? on : 'border-[#272727]/20 text-[#272727]/30 hover:border-[#c2866b]'
      }`}
    >
      {shortLabel}
    </button>
  )
}

// Captura de email al terminar el test (solo anónimos). El botón es
// TRANSACCIONAL: envía a la persona su resultado por correo (algo que pide).
// El checkbox es SEPARADO y opcional: consentimiento explícito para recibir
// información del universo IKIGAIER (marketing). Nadie entra en marketing sin
// marcarlo. Copy inline (es/en).
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function LeadCapture({ codigo, locale, informe }: { codigo: string; locale: string; informe: InformePaso }) {
  const es = locale !== 'en'
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'sending' | 'done' | 'error'>('idle')

  const copy = es
    ? {
        title: '¿Te envío tu resultado por correo?',
        body: 'Te llega un enlace a tu forma de caminar para volver a ella cuando quieras.',
        placeholder: 'tu@correo.com',
        consent: 'Quiero recibir más información del universo IKIGAIER (nuevas herramientas). Puedo darme de baja cuando quiera.',
        button: 'Enviarme mi resultado',
        sending: 'Enviando…',
        done: 'Hecho. Revisa tu correo: te envío tu forma.',
        error: 'No se pudo enviar. Inténtalo de nuevo.',
      }
    : {
        title: 'Shall I email you your result?',
        body: "You'll get a link to your way of walking, to come back to it whenever you like.",
        placeholder: 'you@email.com',
        consent: 'I want to receive more from the IKIGAIER universe (new tools). I can unsubscribe anytime.',
        button: 'Email me my result',
        sending: 'Sending…',
        done: 'Done. Check your inbox: your shape is on its way.',
        error: 'Could not send. Please try again.',
      }

  if (status === 'done') {
    return (
      <div className="rounded-xl bg-[#c2866b]/[0.08] px-5 py-6 text-center">
        <p className="text-sm text-[#272727]/70">{copy.done}</p>
      </div>
    )
  }

  // El botón solo necesita un email válido (es transaccional). El consent es
  // aparte: viaja en el body pero no condiciona el envío del resultado.
  const valid = EMAIL_RE.test(email.trim())
  const submit = async () => {
    if (!valid || status === 'sending') return
    setStatus('sending')
    try {
      const res = await fetch('/api/paso/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email.trim(),
          codigo,
          locale,
          consent,
          resultado: {
            mascara: informe.mascara,
            natural: informe.natural,
            scores: informe.scores,
            puntoCiego: informe.puntoCiego,
          },
        }),
      })
      setStatus(res.ok ? 'done' : 'error')
    } catch {
      setStatus('error')
    }
  }

  return (
    <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/[0.05] px-5 py-6 text-left">
      <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727] text-center mb-2">{copy.title}</p>
      <p className="text-sm leading-relaxed text-[#272727]/70 text-center mb-4">{copy.body}</p>
      <input
        type="email"
        inputMode="email"
        autoComplete="email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder={copy.placeholder}
        className="w-full rounded-lg border border-[#272727]/20 bg-white px-4 py-3 text-sm text-[#272727] focus:border-[#c2866b] focus:outline-none"
      />
      <label className="flex items-start gap-2 mt-3 cursor-pointer">
        <input
          type="checkbox"
          checked={consent}
          onChange={e => setConsent(e.target.checked)}
          className="mt-1 accent-[#c2866b]"
        />
        <span className="text-xs leading-relaxed text-[#272727]/60">{copy.consent}</span>
      </label>
      <button
        onClick={submit}
        disabled={!valid || status === 'sending'}
        className="w-full mt-4 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-40"
      >
        {status === 'sending' ? copy.sending : copy.button}
      </button>
      {status === 'error' && <p className="text-xs text-red-600/70 mt-2 text-center">{copy.error}</p>}
    </div>
  )
}

function ReportSection({
  number,
  title,
  intro,
  pageBreak = false,
  children,
}: {
  number: string
  title: string
  intro: string
  pageBreak?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={`mt-12 ${pageBreak ? 'paso-break-before' : ''}`}>
      <div
        data-pdf-block
        data-pdf-break="before"
        data-pdf-keep-next="true"
        className="mb-6 pb-4"
      >
        <div className="mb-3 flex items-center gap-3" aria-hidden="true">
          <span className="text-[10px] font-medium tracking-[0.28em] text-[#c2866b]">{number}</span>
          <span className="h-px w-10 bg-[#c2866b]/40" />
        </div>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl leading-none text-[#272727]">
          {title}
        </h2>
        <p className="mt-2 max-w-lg text-sm leading-relaxed text-[#272727]/60">{intro}</p>
      </div>
      {children}
    </section>
  )
}

function Field({ label, text, card = false }: { label: string; text: string; card?: boolean }) {
  return (
    <div className={card ? 'bg-[#FDFBF7] px-5 py-5 sm:px-6 sm:py-6' : ''}>
      <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1">{label}</p>
      <p className="text-sm leading-relaxed text-[#272727]/80">{text}</p>
    </div>
  )
}

// Titulares-gancho: parte superior del informe. El primero es el titular grande
// (la brecha jugosa o el "caminas cerca de ti"); los siguientes, subtítulos.
// Generados dinámicamente desde los datos de la persona (lib/paso-titulares.ts).
function TitularesBlock({ inf, dominante, locale }: { inf: InformePaso; dominante: Dim; locale: string }) {
  const titulares = generarTitulares(inf, dominante, locale)
  if (titulares.length === 0) return null
  const [principal, ...resto] = titulares
  return (
    <div className="text-center mb-6">
      <p className="font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727]">
        {principal}
      </p>
      {resto.length > 0 && (
        <div className="mt-3 flex flex-col gap-1">
          {resto.map((linea, i) => (
            <p key={i} className="text-sm text-[#272727]/60">
              {linea}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// La lectura máscara vs real en palabras, para cualquier persona. Es el corazón
// del test: "no eres así, te muestras así… pero por dentro…". Generada desde la
// brecha por eje (lib/paso-narrativa.ts), cubre todos los casos.
function NarrativaBlock({ inf, locale }: { inf: InformePaso; locale: string }) {
  const n = generarNarrativa(inf, locale)
  return (
    <div className="mb-10">
      <p className="text-sm leading-relaxed text-[#272727]/75 mb-5">{n.intro}</p>
      {n.lineas.map((linea, i) => (
        <p
          key={i}
          className="text-[15px] leading-relaxed text-[#272727]/90 mb-4 pl-4 border-l-2 border-[#c2866b]/40"
        >
          {linea}
        </p>
      ))}
      {n.sintesis && (
        <p className="text-sm leading-relaxed text-[#272727] mt-5">{n.sintesis}</p>
      )}
      {n.invitacion && (
        <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#c2866b] mt-4">
          {n.invitacion}
        </p>
      )}
    </div>
  )
}

// Clasificación PASO: conserva las siete zonas del cálculo, pero las presenta
// como una posición visual entre menos presente, equilibrio y más presente.
// Los números pertenecen al motor, no a la lectura de la persona.
function FirmaBlock({
  segmentos,
  t,
  embedded = false,
}: {
  segmentos: Record<Dim, number>
  t: (k: string, v?: Record<string, string | number>) => string
  embedded?: boolean
}) {
  return (
    <div className={`${embedded ? '' : 'mt-8'} rounded-2xl bg-[#272727]/[0.035] px-5 py-6 sm:px-7`}>
      {!embedded && (
        <>
          <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-1">
            {t('firma_title')}
          </p>
          <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('firma_desc')}</p>
        </>
      )}
      <div data-pdf-block className="pb-4">
        <p className="mb-4 text-sm leading-relaxed text-[#272727]/65">
          {t('classification_acronym_intro')}
        </p>
        <div className="mb-7 grid gap-2 sm:grid-cols-2">
          {DIMS.map(d => (
            <div key={d} className="flex items-baseline gap-2 rounded-lg bg-white/55 px-3 py-2.5">
              <EjeLabel
                label={t('dim_' + d)}
                className="shrink-0 text-[#272727] font-[family-name:var(--font-cormorant)] text-lg"
              />
              <span className="text-xs leading-snug text-[#272727]/50">— {t('intro_dim_' + d)}</span>
            </div>
          ))}
        </div>
        <FirmaBarChart segmentos={segmentos} t={t} />
      </div>
      <div data-pdf-block className="pdf-classification-details">
        <div className="mt-8 rounded-xl border border-[#c2866b]/20 bg-[#c2866b]/[0.055] px-5 py-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#c2866b]">
            {t('classification_your_reading')}
          </p>
          <div className="mt-3 space-y-3">
            {DIMS.map(d => {
              const position = segmentos[d]
              const level = position > ZONA_EQUILIBRIO ? 'high' : position < ZONA_EQUILIBRIO ? 'low' : 'balance'
              return (
                <p key={d} className="text-sm leading-relaxed text-[#272727]/78">
                  {t(`dim_${d}_${level}`)}
                </p>
              )
            })}
          </div>
        </div>
        <div className="mt-8 border-t border-[#272727]/10 pt-7">
          <div className="pdf-definition-block">
          <div>
            <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">
              {t('classification_reading_title')}
            </h3>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[#272727]/65">
              {t('classification_reading_note')}
            </p>
          </div>
          <div className="pdf-definition-grid mt-6 grid gap-px overflow-hidden rounded-xl border border-[#272727]/10 bg-[#272727]/10 sm:grid-cols-2">
            {DIMS.map(d => (
              <div key={d} className="bg-[#FDFBF7] px-5 py-5">
                <EjeLabel
                  label={t('dim_' + d)}
                  className="text-[#272727] font-[family-name:var(--font-cormorant)] text-xl"
                />
                <p className="mt-2 text-sm leading-relaxed text-[#272727]/75">
                  {t('dim_' + d + '_desc')}
                </p>
                <p className="mt-3 border-l-2 border-[#c2866b]/45 pl-3 text-xs leading-relaxed text-[#272727]/55">
                  {t('dim_' + d + '_example')}
                </p>
              </div>
            ))}
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function FirmaBarChart({
  segmentos,
  t,
}: {
  segmentos: Record<Dim, number>
  t: (k: string, v?: Record<string, string | number>) => string
}) {
  const W = 620
  const H = 350
  const left = 82
  const right = 18
  const top = 30
  const bottom = 82
  const chartH = H - top - bottom
  const baseY = top + chartH
  const centres = [145, 275, 405, 535]
  const barW = 72
  const names = DIMS.map(d => t('dim_' + d))
  // Los siete niveles tienen altura propia: la zona 1 conserva una barra
  // corta y la zona 7 alcanza el límite superior, como en el gráfico original.
  const y = (value: number) => baseY - (value / 7) * chartH

  return (
    <div className="overflow-hidden rounded-xl bg-[#f5f3ef] px-1 pb-2 pt-1 sm:px-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        role="img"
        aria-label={DIMS.map(d => `${t('dim_' + d)}: ${segmentos[d]}`).join('. ')}
      >
        {Array.from({ length: 7 }, (_, i) => i + 1).map(value => (
          <g key={value}>
            <line
              x1={left}
              x2={W - right}
              y1={y(value)}
              y2={y(value)}
              stroke="#272727"
              strokeOpacity={value === ZONA_EQUILIBRIO ? 0.26 : 0.09}
              strokeDasharray={value === ZONA_EQUILIBRIO ? '6 6' : undefined}
            />
            <text x={left - 22} y={y(value) + 5} textAnchor="middle" fill="#272727" fillOpacity="0.38" fontSize="15">
              {value}
            </text>
          </g>
        ))}

        <text x="12" y={top + 5} fill="#272727" fillOpacity="0.42" fontSize="15">Alta</text>
        <text x="12" y={baseY + 1} fill="#272727" fillOpacity="0.42" fontSize="15">Baja</text>
        <text x={W - right - 2} y={y(ZONA_EQUILIBRIO) - 10} textAnchor="end" fill="#272727" fillOpacity="0.42" fontSize="15">
          {t('firma_balance')}
        </text>

        {DIMS.map((d, i) => {
          const value = segmentos[d]
          const barTop = y(value)
          return (
            <g key={d}>
              <rect
                x={centres[i] - barW / 2}
                y={barTop}
                width={barW}
                height={baseY - barTop}
                rx="9"
                fill={i === 0 ? '#c2866b' : '#9cab92'}
              />
              <text x={centres[i]} y={barTop - 12} textAnchor="middle" fill="#272727" fontSize="18" fontWeight="600">
                {value}
              </text>
              <text x={centres[i]} y={baseY + 39} textAnchor="middle" fill="#272727" fontSize="24" fontWeight="600">
                {d}
              </text>
              <text x={centres[i]} y={baseY + 67} textAnchor="middle" fill="#272727" fillOpacity="0.56" fontSize="14">
                {names[i]}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// Etiqueta de eje con la inicial (P·A·S·O) resaltada en negrita y algo mayor,
// para que las cuatro leídas en vertical dibujen la palabra PASO.
function EjeLabel({ label, className = '' }: { label: string; className?: string }) {
  const inicial = label.charAt(0)
  const resto = label.slice(1)
  return (
    <span className={className}>
      <span className="font-bold text-[1.25em]">{inicial}</span>
      {resto}
    </span>
  )
}

// Banding para el gráfico máscara/natural. Ambos valores son DESVIACIONES del
// neutro (0 = equilibrio), así que se mapean a las 7 zonas centradas en la zona
// de equilibrio: una desviación de ±BASE llega a los extremos. Es solo para el
// visual de la separación; la firma precisa usa el norming de lib/paso-segments.
const BASE_DESV = TOTAL_GRUPOS / DIMS.length
function zonaCruda(desv: number): number {
  const z = Math.round(ZONA_EQUILIBRIO + ((NUM_ZONAS - 1) / 2) * (desv / BASE_DESV))
  return Math.max(1, Math.min(NUM_ZONAS, z))
}

// Gráfico de curvas por zonas: dos curvas (máscara terracota / natural verde)
// trazadas sobre las 7 zonas y los cuatro ejes P-A-S-O. La forma de la curva
// ES el patrón PASO (igual que el "perfil clásico" del DISC es una curva).
function HorizonGraph({
  inf,
  labels,
  t,
}: {
  inf: InformePaso
  labels: string[]
  t: (k: string, v?: Record<string, string | number>) => string
}) {
  const W = 320
  const H = 210
  const padX = 30
  const padTop = 14
  const padBottom = 28
  const plotTop = padTop
  const plotBottom = H - padBottom
  const step = (W - padX * 2) / (DIMS.length - 1)
  const x = (i: number) => padX + i * step
  // zona 1 (abajo) .. zona 7 (arriba)
  const y = (z: number) => plotBottom - ((z - 1) / (NUM_ZONAS - 1)) * (plotBottom - plotTop)

  const natZ = DIMS.map(d => zonaCruda(inf.natural[d]))
  const masZ = DIMS.map(d => zonaCruda(inf.mascara[d]))
  const natPts = DIMS.map((d, i) => `${x(i)},${y(natZ[i])}`)
  const masPts = DIMS.map((d, i) => `${x(i)},${y(masZ[i])}`)
  const natArea = `${padX},${plotBottom} ${natPts.join(' ')} ${W - padX},${plotBottom}`
  const masArea = `${padX},${plotBottom} ${masPts.join(' ')} ${W - padX},${plotBottom}`
  const zonas = Array.from({ length: NUM_ZONAS }, (_, k) => k + 1)

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        {/* Bandas de zona (alternas) */}
        {zonas.map(z => {
          const yTop = y(z) - (plotBottom - plotTop) / (NUM_ZONAS - 1) / 2
          const band = (plotBottom - plotTop) / (NUM_ZONAS - 1)
          return (
            <rect
              key={z}
              x={padX}
              y={yTop}
              width={W - padX * 2}
              height={band}
              fill={z % 2 === 0 ? '#272727' : 'transparent'}
              fillOpacity={0.02}
            />
          )
        })}
        {/* Línea de equilibrio (zona 4) */}
        <line
          x1={padX}
          y1={y(ZONA_EQUILIBRIO)}
          x2={W - padX}
          y2={y(ZONA_EQUILIBRIO)}
          stroke="#272727"
          strokeOpacity={0.25}
          strokeWidth={1}
          strokeDasharray="3 3"
        />
        <text x={padX} y={y(ZONA_EQUILIBRIO) - 4} fontSize={8} className="fill-[#272727]" opacity={0.35}>
          {t('linea_equilibrio')}
        </text>
        {/* Máscara: curva que muestras (terracota) */}
        <polygon points={masArea} fill="#c2866b" fillOpacity={0.22} />
        {/* Natural: curva que llevas dentro (verde) */}
        <polygon points={natArea} fill="#7a8b6f" fillOpacity={0.3} />
        {/* Contornos */}
        <polyline points={masPts.join(' ')} fill="none" stroke="#c2866b" strokeWidth={2} />
        <polyline points={natPts.join(' ')} fill="none" stroke="#7a8b6f" strokeWidth={2} />
        {DIMS.map((d, i) => (
          <g key={d}>
            <circle cx={x(i)} cy={y(masZ[i])} r={3} fill="#c2866b" />
            <circle cx={x(i)} cy={y(natZ[i])} r={3} fill="#7a8b6f" />
            <text
              x={x(i)}
              y={H - 8}
              textAnchor="middle"
              className="fill-[#272727]"
              fontSize={11}
            >
              {labels[i]}
            </text>
          </g>
        ))}
      </svg>
      <div className="flex justify-center gap-6 mt-1">
        <span className="flex items-center gap-2 text-xs text-[#272727]/60">
          <span className="inline-block h-2 w-4 rounded-full" style={{ background: '#c2866b' }} />
          {t('legend_mascara')}
        </span>
        <span className="flex items-center gap-2 text-xs text-[#272727]/60">
          <span className="inline-block h-2 w-4 rounded-full" style={{ background: '#7a8b6f' }} />
          {t('legend_natural')}
        </span>
      </div>
      <p className="text-center text-xs text-[#272727]/40 mt-2 leading-relaxed">
        {t('curva_hint')}
      </p>
    </div>
  )
}

function Shell({
  locale,
  tn,
  userId,
  children,
}: {
  locale: string
  tn: (k: string) => string
  userId: string | null
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      <div className="w-full max-w-md flex items-center justify-between mb-8 print:hidden">
        <Link
          href={`/${locale}/${userId ? 'dashboard' : 'login'}`}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          ← {tn('title')}
        </Link>
      </div>
      {children}
    </div>
  )
}
