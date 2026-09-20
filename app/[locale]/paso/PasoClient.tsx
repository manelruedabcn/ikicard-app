'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { trackEvent } from '@/lib/analytics'
import { generarPasoPdf } from '@/lib/paso-pdf'
import {
  DIMS,
  TOTAL_GRUPOS,
  calcularInformePaso,
  getPasoGroups,
  getPasoPatterns,
  getLocalizedPatron,
  type Dim,
  type Answer,
  type InformePaso,
} from '@/lib/paso-content'
import { getRareza } from '@/lib/paso-rareza'
import {
  generarTitulares,
  generarTeaserGancho,
  teaserTemido,
  teaserRareza,
} from '@/lib/paso-titulares'
import {
  NUM_ZONAS,
  ZONA_EQUILIBRIO,
  PASO_PENDING_KEY,
  calcularSegmentos,
  resolverCodigoPorSegmentos,
} from '@/lib/paso-segments'
import { generarNarrativa } from '@/lib/paso-narrativa'

type Stage = 'intro' | 'test' | 'result'

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
  const pasoGroups = getPasoGroups(locale)

  const [stage, setStage] = useState<Stage>('intro')
  const [step, setStep] = useState(0) // grupo actual (0-27)
  const [answers, setAnswers] = useState<Record<number, { mas?: Dim; menos?: Dim }>>({})
  const [informe, setInforme] = useState<InformePaso | null>(null)
  const [saved, setSaved] = useState(false)
  const [generandoPdf, setGenerandoPdf] = useState(false)
  const informeRef = useRef<HTMLDivElement>(null)

  // Ejemplo interactivo de la intro (práctica del gesto MÁS/MENOS, no puntúa).
  const ejemplo = locale === 'en' ? EJEMPLO_EN : EJEMPLO_ES
  const [ej, setEj] = useState<{ mas?: number; menos?: number }>({})

  function pickEj(kind: 'mas' | 'menos', idx: number) {
    setEj(prev => {
      const cur = { ...prev }
      const other = kind === 'mas' ? 'menos' : 'mas'
      if (cur[other] === idx) cur[other] = undefined
      cur[kind] = cur[kind] === idx ? undefined : idx
      return cur
    })
  }

  async function compartir() {
    if (!informeRef.current || generandoPdf) return
    setGenerandoPdf(true)
    trackEvent('share', { tool: 'paso', content: 'personal_pdf' })
    try {
      await generarPasoPdf(informeRef.current, locale === 'en' ? 'My PASO Report - IKIGAIER.pdf' : 'Mi informe PASO - IKIGAIER.pdf', 'share', locale, pdfMeta())
    } catch {
      // Último recurso: descarga el PDF; nunca sustituimos el informe por un enlace genérico.
      await generarPasoPdf(informeRef.current, locale === 'en' ? 'My PASO Report - IKIGAIER.pdf' : 'Mi informe PASO - IKIGAIER.pdf', 'download', locale, pdfMeta())
    } finally {
      setGenerandoPdf(false)
    }
  }

  async function guardarPdf() {
    if (!informeRef.current || generandoPdf) return
    setGenerandoPdf(true)
    trackEvent('pdf_download', { tool: 'paso' })
    try {
      await generarPasoPdf(informeRef.current, locale === 'en' ? 'My PASO Report - IKIGAIER.pdf' : 'Mi informe PASO - IKIGAIER.pdf', 'download', locale, pdfMeta())
    } catch {
      // Último recurso si la generación falla (navegador muy antiguo):
      // el diálogo de impresión del sistema.
      window.print()
    } finally {
      setGenerandoPdf(false)
    }
  }

  function pdfMeta() {
    if (!informe) return {}
    const zonas = calcularSegmentos(informe.scores)
    const codigo = resolverCodigoPorSegmentos(zonas)
    return {
      pattern: getLocalizedPatron(codigo, locale)?.nombre,
      rarity: t('rareza_' + getRareza(codigo)),
    }
  }

  function pick(grupo: number, kind: 'mas' | 'menos', dim: Dim) {
    setAnswers(prev => {
      const cur = { ...(prev[grupo] || {}) }
      // Si se elige la misma palabra que ya estaba en el otro rol, se libera
      const other = kind === 'mas' ? 'menos' : 'mas'
      if (cur[other] === dim) cur[other] = undefined
      cur[kind] = cur[kind] === dim ? undefined : dim
      return { ...prev, [grupo]: cur }
    })
  }

  async function finish() {
    const list: Answer[] = pasoGroups.map(g => ({
      grupo: g.grupo,
      mas: answers[g.grupo]!.mas!,
      menos: answers[g.grupo]!.menos!,
    }))
    const inf = calcularInformePaso(list)
    setInforme(inf)
    setStage('result')
    window.scrollTo({ top: 0 })

    // El código se asigna por SEGMENTOS (norming), no por la dominancia cruda:
    // es la asignación precisa (1 de 2.401 firmas).
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
    return (
      <Shell locale={locale} tn={tn} userId={userId}>
        <div className="w-full max-w-md text-center mt-10">
          <p className="text-2xl font-medium tracking-[0.4em] uppercase text-[#c2866b] mb-4">P · A · S · O</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727] mb-6">
            {t('intro_title')}
          </h1>
          <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('intro_desc')}</p>
          <p className="text-sm leading-relaxed text-[#272727]/70 mb-6">{t('intro_how')}</p>

          {/* Ejemplo interactivo: practica el gesto MÁS/MENOS con algo fácil */}
          <div className="rounded-2xl border border-[#272727]/10 bg-[#272727]/[0.02] p-5 mb-8">
            <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1">{t('example_eyebrow')}</p>
            <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('example_intro')}</p>
            <div className="flex items-center justify-end gap-2 mb-2 pr-1">
              <span className="w-14 text-center text-xs tracking-widest uppercase text-[#c2866b]">
                {t('mas')}
              </span>
              <span className="w-14 text-center text-xs tracking-widest uppercase text-[#272727]/40">
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
                  <ChoiceBtn active={ej.mas === i} variant="mas" onClick={() => pickEj('mas', i)} />
                  <ChoiceBtn active={ej.menos === i} variant="menos" onClick={() => pickEj('menos', i)} />
                </div>
              ))}
            </div>
            {ej.mas !== undefined && ej.menos !== undefined && (
              <p className="text-sm text-[#c2866b] mt-4">{t('example_done')}</p>
            )}
          </div>

          <button
            onClick={() => setStage('test')}
            className="w-full py-4 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors"
          >
            {t('intro_start')}
          </button>
          <p className="text-xs text-[#272727]/40 mt-4">{t('intro_time')}</p>
        </div>
      </Shell>
    )
  }

  // ---------- TEST ----------
  if (stage === 'test') {
    const g = pasoGroups[step]
    const cur = answers[g.grupo] || {}
    const complete = !!cur.mas && !!cur.menos
    const isLast = step === TOTAL_GRUPOS - 1

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

          <p className="text-center text-sm text-[#272727]/60 mb-6">{t('test_prompt')}</p>

          {/* Cabecera de columnas */}
          <div className="flex items-center justify-end gap-2 mb-2 pr-1">
            <span className="w-14 text-center text-xs tracking-widest uppercase text-[#c2866b]">
              {t('mas')}
            </span>
            <span className="w-14 text-center text-xs tracking-widest uppercase text-[#272727]/40">
              {t('menos')}
            </span>
          </div>

          <div className="flex flex-col gap-3">
            {DIMS.map(dim => (
              <div
                key={dim}
                className="flex items-center gap-2 rounded-xl border border-[#272727]/10 px-4 py-3"
              >
                <span className="flex-1 font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">
                  {g[dim]}
                </span>
                <ChoiceBtn active={cur.mas === dim} variant="mas" onClick={() => pick(g.grupo, 'mas', dim)} />
                <ChoiceBtn active={cur.menos === dim} variant="menos" onClick={() => pick(g.grupo, 'menos', dim)} />
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
                className="px-6 py-3 bg-[#c2866b] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#272727] transition-colors disabled:opacity-30"
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
                className="px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors disabled:opacity-30"
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
  // Asignación por SEGMENTOS (norming DISC adaptado): tu firma exacta
  // (1 de 2.401) y, de ahí, tu Caminante.
  const segmentos = calcularSegmentos(inf.scores)
  const codigo = resolverCodigoPorSegmentos(segmentos)
  const patron = getLocalizedPatron(codigo, locale)
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
          .paso-screen-only { display: none !important; }
          /* La lectura del patrón empieza en página nueva y no se parte. */
          .paso-break-before { break-before: page; }
          .paso-avoid-break { break-inside: avoid; }
        }
      `}</style>
      <div ref={informeRef} className="w-full max-w-md paso-print-root">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c2866b] mb-2">
            {t('your_pattern')}
          </p>
          <h1 className="paso-report-title font-[family-name:var(--font-cormorant)] text-4xl text-[#272727]">
            {patron?.nombre}
          </h1>
          <p className="text-xs leading-relaxed text-[#272727]/45 mt-2 px-4">{t('pattern_framing')}</p>
          <p className="text-sm text-[#272727]/55 mt-2">{t('rareza_' + getRareza(codigo))}</p>
          {/* FOMO M3: anzuelo de rareza que tira hasta el mapa de los 15 (al final) */}
          <p className="text-[13px] italic text-[#c2866b]/80 mt-3">
            {teaserRareza(getRareza(codigo), locale)}
          </p>
        </div>

        {/* GANCHO (parte superior): titular dinámico + retrato + gráfica.
            Da el golpe visual y empuja a leer el desarrollo de abajo. */}
        <TitularesBlock inf={inf} dominante={dominante} locale={locale} />

        {/* El retrato nace de la firma PASO global. No es la máscara: resume el
            arquetipo que dibuja la combinación de intensidades de los cuatro ejes. */}
        {patron?.retrato && (
          <>
          <div className="paso-screen-only mt-8 mb-8 px-1">
            <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2 text-center">
              {t('retrato_eyebrow')}
            </p>
            <p className="paso-report-portrait text-[15px] leading-relaxed text-[#272727]/80 text-center">
              {resumirTexto(patron.retrato, 2)}
            </p>
          </div>
          <div className="paso-print-only mt-8 mb-10 px-1">
            <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2 text-center">
              {t('retrato_eyebrow')}
            </p>
            <p className="paso-report-portrait text-[15px] leading-relaxed text-[#272727]/80 text-center">
              {patron.retrato}
            </p>
          </div>
          </>
        )}

        {/* La explicación pedagógica completa pertenece al informe descargable. */}
        <div className="paso-print-only"><QueEsPasoBlock t={t} /></div>

        {/* Primero, la firma global: es la que determina el tipo de Caminante. */}
        <FirmaBlock segmentos={segmentos} t={t} />

        {/* Después, la lectura amplia del arquetipo que esa firma origina. */}
        {patron && (
          <>
          <div className="paso-screen-only mt-8 grid grid-cols-1 gap-3">
            <ResumenClave
              label={locale === 'en' ? 'YOUR STRENGTH' : 'TU FORTALEZA'}
              text={resumirTexto(patron.motivacion, 1)}
              color="#7a8b6f"
            />
            <ResumenClave
              label={locale === 'en' ? 'YOUR RISK' : 'TU RIESGO'}
              text={resumirTexto(patron.bajo_presion, 1)}
              color="#c2866b"
            />
            <ResumenClave
              label={locale === 'en' ? 'YOUR LEARNING' : 'TU APRENDIZAJE'}
              text={resumirTexto(patron.seria_mas_eficaz_si, 1)}
              color="#c5a15b"
            />
          </div>
          <div className="paso-print-only">
          <div className="flex flex-col gap-6 mt-10 paso-avoid-break">
            {/* FOMO M2: teaser seco que anticipa «Lo que temes» sin resolverlo */}
            <p className="font-[family-name:var(--font-cormorant)] text-xl leading-snug text-[#272727] text-center px-4 mb-2">
              {teaserTemido(locale)}
            </p>
            <Field label={t('motivacion')} text={patron.motivacion} />
            <Field label={t('bajo_presion')} text={patron.bajo_presion} />
            <Field label={t('teme')} text={patron.teme} />
            <Field label={t('eficaz')} text={patron.seria_mas_eficaz_si} />
          </div>
          </div>
          </>
        )}

        {/* A continuación se abre una segunda lectura, distinta de la firma:
            cómo se compara la máscara aprendida con la naturaleza interior. */}
        <div className="paso-break-before">
          <HorizonGraph inf={inf} labels={DIMS.map(d => t('dim_' + d))} t={t} />
          <div className="paso-screen-only"><ResumenMascara inf={inf} locale={locale} /></div>
          <div className="paso-print-only">
            <NarrativaBlock inf={inf} locale={locale} />
            <BrechasBlock inf={inf} t={t} />
          </div>
        </div>

        {/* Mapa de las 15 formas de caminar: sitúa tu tipo entre todos.
            Refuerza que no es una etiqueta, sino una de muchas formas. */}
        <div className="paso-print-only"><MapaCaminantes codigoActual={codigo} t={t} locale={locale} /></div>

        {/* Libro recomendado. Si hay enlace de compra, el título es clicable
            (abre Amazon en pestaña nueva) y se muestra un CTA. El enlace <a>
            sigue siendo clicable si el resultado se guarda como PDF. */}
        {patron && (
          <div className="paso-print-only mt-6 rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-5 text-center">
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

        {/* Dos caminos sin fricción: recibir el informe solicitado por email o
            descargarlo directamente, sin registro ni cesión obligatoria de datos. */}
        <div className="mt-8 text-center print:hidden paso-no-export">
          <LeadCapture codigo={codigo} locale={locale} informe={inf} />
          <button
            onClick={guardarPdf}
            disabled={generandoPdf}
            className="w-full py-3 mt-3 border border-[#272727] text-[#272727] text-xs tracking-widest hover:bg-[#272727] hover:text-[#FDFBF7] transition-colors disabled:opacity-40"
          >
            {generandoPdf ? t('pdf_generating') : (locale === 'en' ? 'DOWNLOAD THE PDF NOW' : 'DESCARGAR EL PDF AHORA')}
          </button>
          <button
            onClick={compartir}
            disabled={generandoPdf}
            className="mt-3 text-xs text-[#272727]/50 underline underline-offset-4 hover:text-[#c2866b] disabled:opacity-40"
          >
            {generandoPdf ? t('pdf_generating') : t('share_button')}
          </button>
          <p className="text-xs text-[#272727]/40 mt-3">
            {locale === 'en' ? 'Downloading does not require an email or an account.' : 'La descarga no requiere email ni crear una cuenta.'}
          </p>
        </div>

        {/* Pie de marca: solo aparece en el PDF/impresión, para que quien lo
            reciba compartido sepa dónde hacer su propio test. El QR lleva a
            www.ikigaier.com para maximizar la conversión de quien lo escanea. */}
        <div className="paso-print-only mt-10 pt-6 border-t border-[#272727]/15">
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
              <p className="text-xs tracking-[0.4em] uppercase text-[#c2866b] mb-1">P · A · S · O</p>
              <p className="font-[family-name:var(--font-cormorant)] text-lg leading-snug text-[#272727]">
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
        <p className="mt-10 text-center text-xs leading-relaxed text-[#272727]/40 px-2">
          {t('nota_espejo')}
        </p>

        {volver && userId && (
          <div className="mt-8 text-center print:hidden paso-no-export">
            <Link
              href={`/${locale}${volver}`}
              className="inline-block rounded-full bg-[#c2866b] px-8 py-3 text-xs tracking-widest uppercase text-[#FDFBF7] hover:opacity-90"
            >
              {locale === 'en' ? 'Back and continue' : 'Volver y seguir'}
            </Link>
          </div>
        )}
      </div>
    </Shell>
  )
}

// ---------- Subcomponentes ----------

function resumirTexto(texto: string, frases = 1) {
  const partes = texto.match(/[^.!?]+[.!?]+|[^.!?]+$/g) ?? [texto]
  return partes.slice(0, frases).join(' ').trim()
}

function ResumenClave({ label, text, color }: { label: string; text: string; color: string }) {
  return (
    <div className="rounded-xl border border-[#272727]/10 bg-[#272727]/[0.025] px-4 py-4">
      <p className="text-xs tracking-widest uppercase mb-1.5" style={{ color }}>{label}</p>
      <p className="text-sm leading-relaxed text-[#272727]/75">{text}</p>
    </div>
  )
}

function ResumenMascara({ inf, locale }: { inf: InformePaso; locale: string }) {
  const n = generarNarrativa(inf, locale)
  return (
    <div className="mt-6 rounded-xl border border-[#c2866b]/25 bg-[#c2866b]/[0.045] px-5 py-5">
      <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">
        {locale === 'en' ? 'THE MAIN CLUE' : 'LA CLAVE PRINCIPAL'}
      </p>
      <p className="text-sm leading-relaxed text-[#272727]/80">
        {n.sintesis || n.intro}
      </p>
      {n.invitacion && (
        <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#c2866b] mt-3">
          {n.invitacion}
        </p>
      )}
    </div>
  )
}

function ChoiceBtn({
  active,
  variant,
  onClick,
}: {
  active: boolean
  variant: 'mas' | 'menos'
  onClick: () => void
}) {
  const on =
    variant === 'mas'
      ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
      : 'border-[#272727] bg-[#272727] text-[#FDFBF7]'
  return (
    <button
      onClick={onClick}
      className={`h-9 w-14 rounded-lg border text-lg transition-colors ${
        active ? on : 'border-[#272727]/20 text-[#272727]/30 hover:border-[#c2866b]'
      }`}
    >
      {variant === 'mas' ? '+' : '−'}
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
        title: 'Llévate tu lectura completa',
        body: 'Tu nombre PASO explica cómo caminas. El informe completo revela desde dónde lo haces: qué parte te nace, qué parte has aprendido a mostrar y dónde puede estar apareciendo el esfuerzo.',
        placeholder: 'tu@correo.com',
        consent: 'Quiero recibir más información del universo IKIGAIER (nuevas herramientas). Puedo darme de baja cuando quiera.',
        button: 'ENVIARME EL INFORME POR EMAIL',
        sending: 'Enviando…',
        done: 'Hecho. Revisa tu correo: te he enviado tu informe personal completo.',
        error: 'No se pudo enviar. Inténtalo de nuevo.',
      }
    : {
        title: 'Take your complete reading with you',
        body: 'Your PASO name explains how you walk. The complete report reveals where that walk comes from: what is natural, what you have learned to show and where effort may be appearing.',
        placeholder: 'you@email.com',
        consent: 'I want to receive more from the IKIGAIER universe (new tools). I can unsubscribe anytime.',
        button: 'EMAIL ME THE COMPLETE REPORT',
        sending: 'Sending…',
        done: 'Done. Check your inbox: your complete personal report is on its way.',
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

function Field({ label, text }: { label: string; text: string }) {
  return (
    <div>
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
  const teaser = generarTeaserGancho(inf, locale)
  return (
    <div className="text-center mb-8">
      <p className="paso-report-lead font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727] px-2">
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
      {/* FOMO M1: bucle máscara↔real que remite a la lectura de abajo */}
      <p className="text-sm text-[#c2866b] mt-4 px-4">{teaser}</p>
    </div>
  )
}

// Mapa de las 15 formas de caminar. Lista los 15 tipos agrupados por rareza
// (frecuente → menos habitual → poco frecuente) y resalta el del usuario. No es
// un ranking de valor: refuerza que su tipo es una de muchas formas posibles.
function MapaCaminantes({
  codigoActual,
  t,
  locale,
}: {
  codigoActual: string
  t: (k: string, v?: Record<string, string | number>) => string
  locale: string
}) {
  const orden = { frecuente: 0, habitual: 1, poco: 2 } as const
  const lista = [...getPasoPatterns(locale)].sort(
    (a, b) => orden[getRareza(a.codigo)] - orden[getRareza(b.codigo)]
  )
  return (
    <div className="mt-10 rounded-xl bg-[#272727]/[0.03] px-5 py-5 paso-avoid-break">
      <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-2">{t('mapa_title')}</p>
      <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('mapa_intro')}</p>
      <ul className="flex flex-col gap-1.5">
        {lista.map(p => {
          const activo = p.codigo === codigoActual
          return (
            <li
              key={p.codigo}
              className={`flex items-baseline justify-between text-sm ${
                activo ? 'text-[#272727] font-medium' : 'text-[#272727]/55'
              }`}
            >
              <span>
                {activo && <span className="text-[#c2866b] mr-1.5">●</span>}
                {p.nombre}
              </span>
              <span className="text-xs text-[#272727]/35 ml-3 shrink-0">
                {t('rareza_short_' + getRareza(p.codigo))}
              </span>
            </li>
          )
        })}
      </ul>
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

// "Dónde te separas de ti": el detalle numérico de la distancia máscara/natural,
// eje por eje, ordenada de mayor a menor brecha. Complementa a NarrativaBlock.
function BrechasBlock({
  inf,
  t,
}: {
  inf: InformePaso
  t: (k: string, v?: Record<string, string | number>) => string
}) {
  return (
    <div className="mt-8 mb-6 rounded-xl border border-[#272727]/10 bg-[#272727]/[0.025] px-5 py-5 paso-avoid-break">
      <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-4">
        {t('separas_title')}
      </p>
      <p className="text-sm leading-relaxed text-[#272727]/70 mb-5">
        {t('separas_intro')}
      </p>
      <div className="flex flex-col gap-3">
        {inf.brechas.map((b, index) => {
          const abs = Math.abs(b.valor)
          const grado = t(abs >= 7 ? 'brecha_grado_alto' : abs >= 3 ? 'brecha_grado_medio' : 'brecha_grado_bajo')
          const rasgo = t('brecha_rasgo_' + b.dimension)
          const explicacion = b.direccion === 'exige_de_mas'
            ? t('brecha_mascara', { rasgo, grado })
            : b.direccion === 'esconde'
              ? t('brecha_naturaleza', { rasgo, grado })
              : t('brecha_alineada', { rasgo })
          const color =
            b.direccion === 'exige_de_mas'
              ? '#c2866b'
              : b.direccion === 'esconde'
                ? '#7a8b6f'
                : '#27272733'
          return (
            <div key={b.dimension} className="flex flex-col gap-0.5">
              <div className="flex items-baseline justify-between gap-3">
                <div className="flex items-baseline gap-2 min-w-0">
                  <span className="text-xs tabular-nums text-[#272727]/35 w-3 shrink-0">
                    {index + 1}
                  </span>
                  <span
                    className="inline-block h-2 w-2 rounded-full shrink-0 translate-y-[-1px]"
                    style={{ background: color }}
                  />
                  <EjeLabel
                    label={t('dim_' + b.dimension)}
                    className="text-[#272727] font-[family-name:var(--font-cormorant)] text-lg"
                  />
                </div>
                {abs > 0 && (
                  <span className="text-xs text-[#272727]/40 shrink-0 tabular-nums">
                    {t('separas_puntos', { n: abs })}
                  </span>
                )}
              </div>
              <span className="text-xs leading-relaxed text-[#272727]/55 pl-7">
                {explicacion}
              </span>
            </div>
          )
        })}
      </div>
      <p className="text-xs leading-relaxed text-[#272727]/45 mt-5 pt-4 border-t border-[#272727]/10">
        {t('separas_repeat')}
      </p>
    </div>
  )
}

// "Tu firma": la asignación precisa. Cada eje en su zona (1..7), con la zona
// de equilibrio marcada. Es una de las 2.401 combinaciones posibles.
function FirmaBlock({
  segmentos,
  t,
}: {
  segmentos: Record<Dim, number>
  t: (k: string, v?: Record<string, string | number>) => string
}) {
  const W = 430
  const H = 270
  const plotTop = 28
  const plotBottom = 205
  const barWidth = 48
  const positions = [110, 195, 280, 365]
  const y = (z: number) => plotBottom - (z / NUM_ZONAS) * (plotBottom - plotTop)
  const dominante = DIMS.reduce((a, b) => (segmentos[a] >= segmentos[b] ? a : b))
  return (
    <div className="mt-8 rounded-xl bg-[#272727]/[0.03] px-5 py-5 paso-avoid-break">
      <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-1">
        {t('firma_title')}
      </p>
      <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('firma_desc')}</p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t('firma_title')}>
        {Array.from({ length: NUM_ZONAS }, (_, i) => i + 1).map(z => (
          <g key={z}>
            <line x1="70" y1={y(z)} x2="405" y2={y(z)}
              stroke="#272727" strokeOpacity={z === ZONA_EQUILIBRIO ? 0.28 : 0.1}
              strokeWidth={z === ZONA_EQUILIBRIO ? 1.2 : 0.7}
              strokeDasharray={z === ZONA_EQUILIBRIO ? '4 3' : undefined} />
            <text x="57" y={y(z) + 4} textAnchor="end" fontSize="12" className="fill-[#272727]" opacity="0.45">{z}</text>
          </g>
        ))}
        <text x="8" y={plotTop + 4} fontSize="12" className="fill-[#272727]" opacity="0.4">{t('firma_alta')}</text>
        <text x="8" y={plotBottom} fontSize="12" className="fill-[#272727]" opacity="0.4">{t('firma_baja')}</text>
        <text x="402" y={y(ZONA_EQUILIBRIO) - 7} textAnchor="end" fontSize="12" className="fill-[#272727]" opacity="0.45">{t('linea_equilibrio')}</text>
        {DIMS.map((d, i) => {
          const value = segmentos[d]
          const top = y(value)
          const active = d === dominante
          return (
            <g key={d}>
              <rect x={positions[i] - barWidth / 2} y={top} width={barWidth} height={plotBottom - top}
                rx="5" fill={active ? '#c2866b' : '#7a8b6f'} fillOpacity={active ? 0.95 : 0.72} />
              <text x={positions[i]} y={top - 8} textAnchor="middle" fontSize="12" fontWeight="600" className="fill-[#272727]">{value}</text>
              <text x={positions[i]} y="229" textAnchor="middle" fontSize="18" fontWeight="600" className="fill-[#272727]">{d}</text>
              <text x={positions[i]} y="250" textAnchor="middle" fontSize="12" className="fill-[#272727]" opacity="0.6">{t('dim_' + d)}</text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

// "Qué mide PASO": el marco fijo que aparece en todos los informes. Explica las
// cuatro formas de caminar (P·A·S·O) para que quien no conozca el modelo entienda
// qué está mirando, sin jerga y sin jerarquía entre ejes.
function QueEsPasoBlock({
  t,
}: {
  t: (k: string, v?: Record<string, string | number>) => string
}) {
  return (
    <div className="mt-8 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
      <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-2">
        {t('que_es_title')}
      </p>
      <p className="text-sm leading-relaxed text-[#272727]/70 mb-5">{t('que_es_intro')}</p>
      <div className="grid grid-cols-1 min-[390px]:grid-cols-2 auto-rows-fr gap-3">
        {DIMS.map(d => (
          <div key={d} className="flex h-full flex-col rounded-lg bg-[#FDFBF7]/80 border border-[#272727]/[0.07] px-4 py-4 min-h-[218px] break-words">
            <EjeLabel
              label={t('dim_' + d)}
              className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727]"
            />
            <span className="text-[13px] leading-relaxed text-[#272727]/65 mt-1 mb-3">
              {t('que_es_' + d)}
            </span>
            <div className="mt-auto flex flex-col gap-2.5">
              <div>
                <strong className="block text-xs tracking-wide uppercase text-[#7a8b6f] font-medium mb-0.5">{t('que_es_equilibrio')}</strong>
                <span className="block text-xs leading-relaxed text-[#272727]/65">{t('que_es_' + d + '_equilibrio')}</span>
              </div>
              <div>
                <strong className="block text-xs tracking-wide uppercase text-[#c2866b] font-medium mb-0.5">{t('que_es_domina')}</strong>
                <span className="block text-xs leading-relaxed text-[#272727]/65">{t('que_es_' + d + '_domina')}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
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
        <text x={padX} y={y(ZONA_EQUILIBRIO) - 5} fontSize={12} className="fill-[#272727]" opacity={0.35}>
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
              fontSize={12}
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
          ← {userId ? tn('platform') : tn('title')}
        </Link>
      </div>
      {children}
    </div>
  )
}
