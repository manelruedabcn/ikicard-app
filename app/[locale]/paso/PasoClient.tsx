'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
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
  NUM_ZONAS,
  ZONA_EQUILIBRIO,
  PASO_PENDING_KEY,
  calcularSegmentos,
  firmaTexto,
  resolverCodigoPorSegmentos,
} from '@/lib/paso-segments'
import { generarNarrativa } from '@/lib/paso-narrativa'

type Stage = 'intro' | 'test' | 'result'

interface Props {
  locale: string
  userId: string | null
}

export default function PasoClient({ locale, userId }: Props) {
  const t = useTranslations('paso')
  const tn = useTranslations('nav')

  const [stage, setStage] = useState<Stage>('intro')
  const [step, setStep] = useState(0) // grupo actual (0-27)
  const [answers, setAnswers] = useState<Record<number, { mas?: Dim; menos?: Dim }>>({})
  const [informe, setInforme] = useState<InformePaso | null>(null)
  const [saved, setSaved] = useState(false)

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
    const list: Answer[] = PASO_GRUPOS.map(g => ({
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
          <p className="text-xs tracking-[0.4em] uppercase text-[#c2866b] mb-4">P · A · S · O</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727] mb-6">
            {t('intro_title')}
          </h1>
          <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('intro_desc')}</p>
          <p className="text-sm leading-relaxed text-[#272727]/70 mb-10">{t('intro_how')}</p>
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
    const g = PASO_GRUPOS[step]
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
  const firma = firmaTexto(segmentos)
  const codigo = resolverCodigoPorSegmentos(segmentos)
  const patron = getPatron(codigo)

  return (
    <Shell locale={locale} tn={tn} userId={userId}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c2866b] mb-2">
            {t('your_pattern')}
          </p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727]">
            {patron?.nombre}
          </h1>
          <p className="text-xs tracking-[0.3em] text-[#272727]/40 mt-2">{firma}</p>
        </div>

        {/* Retrato del Caminante: la apertura de la lectura */}
        {patron?.retrato && (
          <p className="text-[15px] leading-relaxed text-[#272727]/80 text-center mb-10 px-1">
            {patron.retrato}
          </p>
        )}

        {/* La lectura máscara vs real: el corazón del test (protagonista) */}
        <NarrativaBlock inf={inf} locale={locale} />

        {/* Qué mide PASO: marco fijo (las cuatro formas de caminar) */}
        <QueEsPasoBlock t={t} />

        {/* Gráfico horizonte */}
        <HorizonGraph inf={inf} labels={DIMS.map(d => t('dim_' + d))} t={t} />

        {/* Tu firma: la asignación precisa por zonas (1 de 2.401) */}
        <FirmaBlock segmentos={segmentos} t={t} />

        {/* Dónde te separas de ti (brechas máscara vs natural) */}
        <BrechasBlock inf={inf} t={t} />

        {/* Lectura del patrón */}
        {patron && (
          <div className="flex flex-col gap-6 mt-10">
            <Field label={t('motivacion')} text={patron.motivacion} />
            <Field label={t('bajo_presion')} text={patron.bajo_presion} />
            <Field label={t('teme')} text={patron.teme} />
            <Field label={t('eficaz')} text={patron.seria_mas_eficaz_si} />
          </div>
        )}

        {/* Libro recomendado */}
        {patron && (
          <div className="mt-6 rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-5 text-center">
            <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">{t('book')}</p>
            <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">
              {patron.libro_recomendado}
            </p>
          </div>
        )}

        {/* Guardado / CTA cuenta */}
        <div className="mt-8 text-center">
          {userId ? (
            saved && <p className="text-xs text-[#272727]/50">{t('saved')}</p>
          ) : (
            <div className="rounded-xl bg-[#272727]/[0.03] px-5 py-5">
              <p className="text-sm text-[#272727]/70 mb-4">{t('cta_account')}</p>
              <Link
                href={`/${locale}/login`}
                className="inline-block px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors"
              >
                {t('cta_button')}
              </Link>
            </div>
          )}
        </div>

        {/* Nota de encuadre: PASO es un espejo, no un diagnóstico */}
        <p className="mt-10 text-center text-xs leading-relaxed text-[#272727]/40 px-2">
          {t('nota_espejo')}
        </p>
      </div>
    </Shell>
  )
}

// ---------- Subcomponentes ----------

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

function Field({ label, text }: { label: string; text: string }) {
  return (
    <div>
      <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1">{label}</p>
      <p className="text-sm leading-relaxed text-[#272727]/80">{text}</p>
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
  const dirLabel: Record<'exige_de_mas' | 'esconde' | 'alineado', string> = {
    exige_de_mas: t('dir_exige'),
    esconde: t('dir_esconde'),
    alineado: t('dir_alineado'),
  }
  return (
    <div className="mt-8 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
      <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-4">
        {t('separas_title')}
      </p>
      <div className="flex flex-col gap-3">
        {inf.brechas.map(b => {
          const abs = Math.abs(b.valor)
          const color =
            b.direccion === 'exige_de_mas'
              ? '#c2866b'
              : b.direccion === 'esconde'
                ? '#7a8b6f'
                : '#27272733'
          return (
            <div key={b.dimension} className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2 min-w-0">
                <span
                  className="inline-block h-2 w-2 rounded-full shrink-0 translate-y-[-1px]"
                  style={{ background: color }}
                />
                <span className="text-sm text-[#272727] font-[family-name:var(--font-cormorant)] text-lg shrink-0">
                  {t('dim_' + b.dimension)}
                </span>
                <span className="text-xs text-[#272727]/50 truncate">
                  — {dirLabel[b.direccion]}
                </span>
              </div>
              {abs > 0 && (
                <span className="text-xs text-[#272727]/40 shrink-0 tabular-nums">
                  {t('separas_puntos', { n: abs })}
                </span>
              )}
            </div>
          )
        })}
      </div>
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
  const zonas = Array.from({ length: NUM_ZONAS }, (_, k) => k + 1)
  return (
    <div className="mt-8 rounded-xl bg-[#272727]/[0.03] px-5 py-5">
      <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-1">
        {t('firma_title')}
      </p>
      <p className="text-sm leading-relaxed text-[#272727]/70 mb-4">{t('firma_desc')}</p>
      <div className="flex flex-col gap-3">
        {DIMS.map(d => (
          <div key={d} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-sm text-[#272727] font-[family-name:var(--font-cormorant)] text-lg">
              {t('dim_' + d)}
            </span>
            <div className="flex-1 flex gap-1">
              {zonas.map(z => {
                const active = z === segmentos[d]
                const isEq = z === ZONA_EQUILIBRIO
                return (
                  <span
                    key={z}
                    className="flex-1 h-2.5 rounded-sm"
                    style={{
                      background: active
                        ? '#c2866b'
                        : isEq
                          ? '#27272720'
                          : '#27272710',
                    }}
                  />
                )
              })}
            </div>
            <span className="w-4 shrink-0 text-right text-xs text-[#272727]/50 tabular-nums">
              {segmentos[d]}
            </span>
          </div>
        ))}
      </div>
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
      <div className="flex flex-col gap-4">
        {DIMS.map(d => (
          <div key={d} className="flex flex-col gap-0.5">
            <span className="font-[family-name:var(--font-cormorant)] text-lg text-[#272727]">
              {t('dim_' + d)}
            </span>
            <span className="text-sm leading-relaxed text-[#272727]/70">
              {t('que_es_' + d)}
            </span>
          </div>
        ))}
      </div>
    </div>
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
      <div className="w-full max-w-md flex items-center justify-between mb-8">
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
