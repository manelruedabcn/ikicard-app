'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { SaveError } from '@/components/SaveError'
import { getMasks } from '@/lib/masks-content'
import {
  IKIBOARD_STEPS,
  IKI_ESTADOS,
  getIkiboardCopy,
  getIkiSteps,
  getIkiAmbitos,
  type IkiStep,
  type IkiAmbitoId,
  type IkiEstado,
} from '@/lib/ikiboard-content'
import { IKIBOARD_ICONS, iconById, type IkiIcon } from '@/lib/ikiboard-icons'
import { contentLang } from '@/lib/content-locale'
import { generarBorrador } from '@/lib/ikiboard-borrador'
import { generarIconoSugerido, type IconoSugerido } from '@/lib/ikiboard-icono-asistente'
import { DIMS, getPatron, type Dim, type InformePaso } from '@/lib/paso-content'
import { generarNarrativa } from '@/lib/paso-narrativa'

interface PasoResult {
  codigo_patron: string
  mascara_p: number
  mascara_a: number
  mascara_s: number
  mascara_o: number
  natural_p: number
  natural_a: number
  natural_s: number
  natural_o: number
  score_p: number
  score_a: number
  score_s: number
  score_o: number
  punto_ciego: string | null
  created_at: string
}

export interface BoardItem {
  id: string
  ambito: IkiAmbitoId
  tipo: 'icono' | 'foto'
  ref: string
  frase: string
  doy: string
  estado: IkiEstado
  is_priority: boolean
  state_changed_at: string | null
  sort_order: number
}

interface Initial {
  content: Record<string, string>
  lastReviewedAt: string | null
  maskDominant: string | null
  maskPaso: string | null
  estrellaDominant: string | null
  estrellaScores: Record<string, number> | null
  caminoDominant: string | null
  pasoResult: PasoResult | null
  items: BoardItem[]
}

interface Props {
  userId: string
  locale: string
  initial: Initial
}

type Phase = 'intro' | 'coordinates' | 'flow' | 'done' | 'board' | 'map'

// ¿Está resuelto este paso? Sirve para reanudar donde se dejó (incluido
// el regreso desde la herramienta de máscaras) y para saber si el
// recorrido está completo.
function stepDone(step: IkiStep, content: Record<string, string>, maskDominant: string | null) {
  if (step.kind === 'frenos') return Boolean(maskDominant)
  if (step.kind === 'paso') return Boolean(content.paso_que?.trim())
  if (step.optional) return true
  return Boolean(content[step.id]?.trim())
}

// Primer paso sin resolver (o el total, si están todos).
function firstIncomplete(content: Record<string, string>, maskDominant: string | null) {
  const i = IKIBOARD_STEPS.findIndex(s => !stepDone(s, content, maskDominant))
  return i === -1 ? IKIBOARD_STEPS.length : i
}

export default function IkiboardClient({ userId, locale, initial }: Props) {
  const supabase = createClient()
  const tn = useTranslations('nav')
  const copy = getIkiboardCopy(locale)

  const [content, setContent] = useState<Record<string, string>>(initial.content)
  const contentRef = useRef<Record<string, string>>(initial.content)
  const resume = firstIncomplete(initial.content, initial.maskDominant)
  // Solo el avance PROPIO de IKIBOARD salta la entrada. Haber hecho la
  // máscara antes no debe robarle a la persona el "párate" del paso 1.
  const hasLegacyProgress = Object.entries(initial.content).some(
    ([key, value]) => !['journey_started', 'coordinates_confirmed'].includes(key) && Boolean(value?.trim())
  )
  const journeyStarted = initial.content.journey_started === '1' || hasLegacyProgress
  const coordinatesConfirmed = initial.content.coordinates_confirmed === '1'

  // Si ya hay avance, retoma donde se quedó (evita repetir la entrada tras
  // volver de máscaras). Si está todo, muestra el cierre.
  const [phase, setPhase] = useState<Phase>(
    !journeyStarted
      ? 'intro'
      : !coordinatesConfirmed
        ? 'coordinates'
        : resume >= IKIBOARD_STEPS.length ? 'done' : 'flow'
  )
  const [index, setIndex] = useState(resume >= IKIBOARD_STEPS.length ? IKIBOARD_STEPS.length - 1 : resume)

  const [saveFailed, setSaveFailed] = useState(false)
  const [retrying, setRetrying] = useState(false)

  // Autosave por campo (un temporizador por id), como en las demás herramientas.
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})
  const save = useCallback(
    (patch: Record<string, string>) => {
      const key = Object.keys(patch)[0] ?? '_'
      clearTimeout(timers.current[key])
      const next = { ...contentRef.current, ...patch }
      contentRef.current = next
      timers.current[key] = setTimeout(async () => {
        const { error } = await supabase
          .from('ikiboard')
          .upsert(
            { user_id: userId, content: next, updated_at: new Date().toISOString() },
            { onConflict: 'user_id' }
          )
        setSaveFailed(Boolean(error))
      }, 700)
    },
    [supabase, userId]
  )

  // Reintenta el guardado del recorrido con lo último que hay en memoria.
  const retrySave = useCallback(async () => {
    setRetrying(true)
    const { error } = await supabase
      .from('ikiboard')
      .upsert(
        { user_id: userId, content: contentRef.current, updated_at: new Date().toISOString() },
        { onConflict: 'user_id' }
      )
    setSaveFailed(Boolean(error))
    setRetrying(false)
  }, [supabase, userId])

  function setField(id: string, value: string) {
    setContent(c => {
      const next = { ...c, [id]: value }
      contentRef.current = next
      return next
    })
    save({ [id]: value })
  }

  // --- Deseos del tablero (Fase 2), en ikiboard_items ---
  const [items, setItems] = useState<BoardItem[]>(initial.items)

  async function insertItem(
    ambito: IkiAmbitoId,
    tipo: 'icono' | 'foto',
    ref: string,
    frase: string,
    doy: string
  ) {
    const sort_order = items.filter(i => i.ambito === ambito).length
    const { data, error } = await supabase
      .from('ikiboard_items')
      .insert({ user_id: userId, ambito, tipo, ref, frase, doy, estado: 'lejos', is_priority: false, sort_order })
      .select('id, ambito, tipo, ref, frase, doy, estado, is_priority, state_changed_at, sort_order')
      .single()
    if (error) throw error
    if (data) setItems(list => [...list, data as BoardItem])
  }

  async function addItem(ambito: IkiAmbitoId, ref: string, frase: string, doy: string) {
    await insertItem(ambito, 'icono', ref, frase, doy)
  }

  async function addPhotoItem(ambito: IkiAmbitoId, file: File, frase: string, doy: string) {
    // Validación en el cliente (el bucket es privado y por-usuario, pero
    // evitamos subidas enormes o de tipos que no son imagen antes de pedir red).
    const TIPOS_OK = ['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
    const MAX_BYTES = 8 * 1024 * 1024 // 8 MB
    if (file.type && !TIPOS_OK.includes(file.type)) {
      throw new Error(copy.ui.photoFormatError)
    }
    if (file.size > MAX_BYTES) {
      throw new Error(copy.ui.photoSizeError)
    }
    const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg'
    const path = `${userId}/${crypto.randomUUID()}.${extension}`
    const { error: uploadError } = await supabase.storage.from('ikiboard').upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type || undefined,
    })
    if (uploadError) throw uploadError
    try {
      await insertItem(ambito, 'foto', path, frase, doy)
    } catch (error) {
      await supabase.storage.from('ikiboard').remove([path])
      throw error
    }
  }

  async function removeItem(id: string) {
    const removed = items.find(i => i.id === id)
    const previous = items
    setItems(list => list.filter(i => i.id !== id))
    const { error } = await supabase.from('ikiboard_items').delete().eq('id', id)
    if (error) { setItems(previous); return }
    if (removed?.tipo === 'foto') await supabase.storage.from('ikiboard').remove([removed.ref])
  }

  // Cambiar el icono de un ítem ya guardado, en el sitio: sin borrar ni
  // recrear, así conserva estado, prioridad y su historial. Solo iconos.
  async function updateItemRef(id: string, ref: string) {
    const item = items.find(i => i.id === id)
    if (!item || item.tipo !== 'icono' || item.ref === ref) return
    const previous = item.ref
    const changedAt = new Date().toISOString()
    setItems(list => list.map(i => (i.id === id ? { ...i, ref } : i)))
    const { error } = await supabase
      .from('ikiboard_items')
      .update({ ref, updated_at: changedAt })
      .eq('id', id)
    if (error) setItems(list => list.map(i => (i.id === id ? { ...i, ref: previous } : i)))
  }

  // Cercanía a habitar la foto: la marca la persona a mano.
  async function updateEstado(id: string, estado: IkiEstado) {
    const item = items.find(i => i.id === id)
    if (!item || item.estado === estado) return
    const previous = item.estado
    const changedAt = new Date().toISOString()
    setItems(list => list.map(i => (i.id === id ? { ...i, estado } : i)))
    const { error } = await supabase
      .from('ikiboard_items')
      .update({ estado, state_changed_at: changedAt, updated_at: changedAt })
      .eq('id', id)
    if (error) {
      setItems(list => list.map(i => (i.id === id ? { ...i, estado: previous } : i)))
      return
    }
    await supabase.from('ikiboard_item_reviews').insert({
      user_id: userId,
      item_id: id,
      previous_state: previous,
      new_state: estado,
    })
  }

  async function setPriority(id: string) {
    const nowPriority = items.find(i => i.id === id)?.is_priority ?? false
    const next = items.map(i => ({ ...i, is_priority: i.id === id ? !nowPriority : false }))
    setItems(next)
    const { error: clearError } = await supabase
      .from('ikiboard_items')
      .update({ is_priority: false })
      .eq('user_id', userId)
    if (clearError) { setItems(items); return }
    if (!nowPriority) {
      const { error } = await supabase.from('ikiboard_items').update({ is_priority: true }).eq('id', id)
      if (error) setItems(items)
    }
  }

  const step = getIkiSteps(locale)[index]

  function next() {
    if (index < IKIBOARD_STEPS.length - 1) {
      setIndex(i => i + 1)
      window.scrollTo({ top: 0 })
    } else {
      setPhase('done')
      window.scrollTo({ top: 0 })
    }
  }
  function back() {
    if (index === 0) {
      setPhase('intro')
    } else {
      setIndex(i => i - 1)
    }
    window.scrollTo({ top: 0 })
  }

  return (
    <Shell locale={locale} tn={tn}>
      <div className="w-full max-w-md">
        {phase === 'intro' && (
          <Intro
            locale={locale}
            onStart={() => {
              setField('journey_started', '1')
              setPhase('coordinates')
            }}
          />
        )}

        {phase === 'coordinates' && (
          <Coordinates
            locale={locale}
            pasoResult={initial.pasoResult}
            estrellaDominant={initial.estrellaDominant}
            caminoDominant={initial.caminoDominant}
            maskDominant={initial.maskDominant}
            onContinue={() => {
              setField('coordinates_confirmed', '1')
              setPhase(resume >= IKIBOARD_STEPS.length ? 'done' : 'flow')
              setIndex(resume >= IKIBOARD_STEPS.length ? IKIBOARD_STEPS.length - 1 : resume)
              window.scrollTo({ top: 0 })
            }}
          />
        )}

        {phase === 'flow' && (
          <div>
            <Progress index={index} total={IKIBOARD_STEPS.length} />
            <StepView
              step={step}
              content={content}
              locale={locale}
              maskDominant={initial.maskDominant}
              maskPaso={initial.maskPaso}
              onField={setField}
            />
            <Nav
              locale={locale}
              step={step}
              content={content}
              maskDominant={initial.maskDominant}
              onBack={back}
              onNext={next}
            />
          </div>
        )}

        {phase === 'done' && (
          <Done
            proposito={content.proposito}
            locale={locale}
            estrellaDominant={initial.estrellaDominant}
            caminoDominant={initial.caminoDominant}
            maskDominant={initial.maskDominant}
            maskPaso={initial.maskPaso}
            pasoResult={initial.pasoResult}
            hasVocacionSeed={items.some(i => i.ambito === 'vocacion')}
            onSeedVocacion={(frase: string) => { void addItem('vocacion', 'diana', frase, '') }}
            onReview={() => { setPhase('flow'); setIndex(0) }}
            onBuild={() => { setPhase('board'); window.scrollTo({ top: 0 }) }}
          />
        )}
      </div>

      {phase === 'board' && (
        <Board
          locale={locale}
          proposito={content.proposito}
          items={items}
          maskDominant={initial.maskDominant}
          estrellaScores={initial.estrellaScores}
          pasoQue={content.paso_que}
          pasoCuando={content.paso_cuando}
          onAdd={addItem}
          onAddPhoto={addPhotoItem}
          onRemove={removeItem}
          onEstado={updateEstado}
          onPriority={setPriority}
          onChangeIcon={updateItemRef}
          onMap={() => { setPhase('map'); window.scrollTo({ top: 0 }) }}
          onReview={() => { setPhase('done'); window.scrollTo({ top: 0 }) }}
        />
      )}

      {phase === 'map' && (
        <MapOutput
          locale={locale}
          content={content}
          items={items}
          pasoResult={initial.pasoResult}
          estrellaDominant={initial.estrellaDominant}
          caminoDominant={initial.caminoDominant}
          maskDominant={initial.maskDominant}
          maskPaso={initial.maskPaso}
          onBack={() => { setPhase('board'); window.scrollTo({ top: 0 }) }}
        />
      )}
      <SaveError show={saveFailed} retrying={retrying} onRetry={retrySave} />
    </Shell>
  )
}

// ---------- Intro ----------

function Intro({ locale, onStart }: { locale: string; onStart: () => void }) {
  const intro = getIkiboardCopy(locale).intro
  return (
    <div className="text-center">
      <p className="text-3xl sm:text-4xl font-semibold tracking-[0.2em] uppercase text-[#c2866b] mb-5">
        {intro.kicker}
      </p>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight text-[#272727] mb-6">
        {intro.title}
      </h1>
      <p className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#c2866b] leading-relaxed mb-8">
        {intro.hook}
      </p>
      <p className="text-sm leading-relaxed text-[#272727]/70 mb-10">{intro.body}</p>
      <button
        onClick={onStart}
        className="rounded-full bg-[#c2866b] px-8 py-3 text-sm tracking-widest uppercase text-[#FDFBF7] transition-opacity hover:opacity-90"
      >
        {intro.cta}
      </button>
    </div>
  )
}

// ---------- Coordenadas disponibles ----------

function Coordinates({
  locale,
  pasoResult,
  estrellaDominant,
  caminoDominant,
  maskDominant,
  onContinue,
}: {
  locale: string
  pasoResult: PasoResult | null
  estrellaDominant: string | null
  caminoDominant: string | null
  maskDominant: string | null
  onContinue: () => void
}) {
  const c = getIkiboardCopy(locale)
  const co = c.coordinates
  const rows = [
    { label: co.paso, tool: c.ui.toolPaso, ready: Boolean(pasoResult), route: '/paso' },
    { label: co.estrella, tool: c.ui.toolEstrella, ready: Boolean(estrellaDominant), route: '/estrellas' },
    { label: co.camino, tool: c.ui.toolCamino, ready: Boolean(caminoDominant), route: '/camino' },
    { label: co.mascara, tool: c.ui.toolMascara, ready: Boolean(maskDominant), route: '/mascaras' },
  ]

  return (
    <div>
      <div className="text-center mb-8">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">{co.kicker}</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight text-[#272727] mb-4">
          {co.title}
        </h1>
        <p className="text-sm leading-relaxed text-[#272727]/65">{co.body}</p>
      </div>

      <div className="flex flex-col gap-3 mb-9">
        {rows.map(row => (
          <div key={row.tool} className="flex items-center justify-between gap-4 rounded-xl border border-[#272727]/12 bg-white/45 px-4 py-4">
            <div>
              <p className="font-[family-name:var(--font-cormorant)] text-lg text-[#272727]">{row.label}</p>
              <p className="text-[10px] tracking-widest uppercase text-[#272727]/35 mt-0.5">{row.tool}</p>
            </div>
            {row.ready ? (
              <span className="text-xs text-[#c2866b]">✓ {co.ready}</span>
            ) : (
              <Link
                href={`/${locale}${row.route}?volver=/ikiboard`}
                className="shrink-0 rounded-full border border-[#c2866b] px-4 py-2 text-[10px] tracking-widest uppercase text-[#c2866b] hover:bg-[#c2866b] hover:text-[#FDFBF7]"
              >
                {co.missing}
              </Link>
            )}
          </div>
        ))}
      </div>

      <button onClick={onContinue} className="w-full rounded-full bg-[#c2866b] px-7 py-3 text-sm tracking-widest uppercase text-[#FDFBF7] hover:opacity-90">
        {co.continue}
      </button>
    </div>
  )
}

function pasoReading(row: PasoResult, locale: string) {
  const key = (prefix: 'mascara' | 'natural' | 'score', d: Dim) =>
    `${prefix}_${d.toLowerCase()}` as keyof PasoResult
  const mascara = Object.fromEntries(DIMS.map(d => [d, Number(row[key('mascara', d)])])) as Record<Dim, number>
  const natural = Object.fromEntries(DIMS.map(d => [d, Number(row[key('natural', d)])])) as Record<Dim, number>
  const scores = Object.fromEntries(DIMS.map(d => [d, Number(row[key('score', d)])])) as Record<Dim, number>
  const brechas = DIMS.map(d => {
    const valor = mascara[d] - natural[d]
    return {
      dimension: d,
      valor,
      direccion: (valor > 0 ? 'exige_de_mas' : valor < 0 ? 'esconde' : 'alineado') as
        'exige_de_mas' | 'esconde' | 'alineado',
    }
  }).sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
  const informe: InformePaso = {
    scores,
    mascara,
    natural,
    codigoPatron: row.codigo_patron,
    brechas,
    puntoCiego: (row.punto_ciego as Dim) || 'P',
    contradicciones: [],
  }
  const narrativa = generarNarrativa(informe, locale)
  return {
    name: getPatron(row.codigo_patron)?.nombre ?? getIkiboardCopy(locale).ui.pasoFallbackName,
    summary: narrativa.sintesis || narrativa.intro,
  }
}

// ---------- Progreso ----------

function Progress({ index, total }: { index: number; total: number }) {
  return (
    <div className="mb-8">
      <p className="text-center text-xs tracking-widest uppercase text-[#272727]/40 mb-3">
        {index + 1} / {total}
      </p>
      <div className="h-1 w-full overflow-hidden rounded-full bg-[#272727]/10">
        <div
          className="h-full bg-[#c2866b] transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>
    </div>
  )
}

// ---------- Pantalla de un paso, según su tipo ----------

function StepView({
  step,
  content,
  locale,
  maskDominant,
  maskPaso,
  onField,
}: {
  step: IkiStep
  content: Record<string, string>
  locale: string
  maskDominant: string | null
  maskPaso: string | null
  onField: (id: string, v: string) => void
}) {
  return (
    <div>
      <p className="text-center text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">
        {step.section}
      </p>
      <h2 className="text-center font-[family-name:var(--font-cormorant)] text-3xl leading-snug text-[#272727] mb-3">
        {step.title}
      </h2>
      {step.hint && (
        <p className="text-center text-sm leading-relaxed text-[#272727]/55 mb-8">{step.hint}</p>
      )}

      {(step.kind === 'prompt' || step.kind === 'proposito') && (
        <AutoTextarea
          value={content[step.id] ?? ''}
          placeholder={step.placeholder}
          rows={step.kind === 'proposito' ? 3 : 5}
          onChange={v => onField(step.id, v)}
        />
      )}

      {step.kind === 'frenos' && (
        <FrenosStep locale={locale} maskDominant={maskDominant} />
      )}

      {step.kind === 'paso' && (
        <PasoStep locale={locale} content={content} maskPaso={maskPaso} onField={onField} />
      )}
    </div>
  )
}

function AutoTextarea({
  value,
  placeholder,
  rows,
  onChange,
}: {
  value: string
  placeholder?: string
  rows: number
  onChange: (v: string) => void
}) {
  const [local, setLocal] = useState(value)
  return (
    <textarea
      value={local}
      rows={rows}
      placeholder={placeholder}
      onChange={e => {
        setLocal(e.target.value)
        onChange(e.target.value)
      }}
      className="w-full resize-y rounded-lg border border-[#272727]/20 bg-white/50 p-4 text-base leading-relaxed text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors"
    />
  )
}

// Paso 5: enlaza a la herramienta de máscaras (?volver=/ikiboard) y, si
// ya hay resultado, lo muestra.
function FrenosStep({ locale, maskDominant }: { locale: string; maskDominant: string | null }) {
  const c = getIkiboardCopy(locale)
  const mask = maskDominant ? getMasks(locale).find(m => m.code === maskDominant) : null
  return (
    <div className="text-center">
      {mask ? (
        <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-6 mb-6">
          <p className="text-sm text-[#272727]/60 mb-2">{c.frenos.yaTienes}</p>
          <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] mb-1">
            {mask.name}
          </p>
          <p className="text-xs tracking-wide text-[#c2866b]">{c.ui.frenoMiedoLabel} {mask.fear}</p>
        </div>
      ) : (
        <p className="text-sm leading-relaxed text-[#272727]/70 mb-8">{c.frenos.body}</p>
      )}
      <Link
        href={`/${locale}/mascaras?volver=/ikiboard`}
        className={`inline-block rounded-full px-8 py-3 text-sm tracking-widest uppercase transition-colors ${
          mask
            ? 'border border-[#272727] text-[#272727] hover:bg-[#272727] hover:text-[#FDFBF7]'
            : 'bg-[#c2866b] text-[#FDFBF7] hover:opacity-90'
        }`}
      >
        {mask ? c.frenos.ctaHecho : c.frenos.cta}
      </Link>
    </div>
  )
}

// Paso 6: dos campos (qué + cuándo). El "qué" hereda la semilla de la máscara.
function PasoStep({
  locale,
  content,
  maskPaso,
  onField,
}: {
  locale: string
  content: Record<string, string>
  maskPaso: string | null
  onField: (id: string, v: string) => void
}) {
  const paso = getIkiboardCopy(locale).paso
  // Semilla: si aún no hay "qué" y la máscara dejó un gesto, se propone.
  const [que, setQue] = useState(content.paso_que ?? maskPaso ?? '')
  const [cuando, setCuando] = useState(content.paso_cuando ?? '')
  const sembrado = !content.paso_que && Boolean(maskPaso)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <label className="block text-xs tracking-widest uppercase text-[#272727]/50 mb-2">
          {paso.queLabel}
        </label>
        <textarea
          value={que}
          rows={3}
          placeholder={paso.quePlaceholder}
          onChange={e => {
            setQue(e.target.value)
            onField('paso_que', e.target.value)
          }}
          className="w-full resize-y rounded-lg border border-[#272727]/20 bg-white/50 p-4 text-base leading-relaxed text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors"
        />
        {sembrado && <p className="text-xs text-[#c2866b] mt-2">{paso.semilla}</p>}
      </div>
      <div>
        <label className="block text-xs tracking-widest uppercase text-[#272727]/50 mb-2">
          {paso.cuandoLabel}
        </label>
        <input
          value={cuando}
          placeholder={paso.cuandoPlaceholder}
          onChange={e => {
            setCuando(e.target.value)
            onField('paso_cuando', e.target.value)
          }}
          className="w-full rounded-lg border border-[#272727]/20 bg-white/50 p-4 text-base text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors"
        />
      </div>
    </div>
  )
}

// ---------- Navegación (atrás / siguiente) ----------

function Nav({
  locale,
  step,
  content,
  maskDominant,
  onBack,
  onNext,
}: {
  locale: string
  step: IkiStep
  content: Record<string, string>
  maskDominant: string | null
  onBack: () => void
  onNext: () => void
}) {
  const ui = getIkiboardCopy(locale).ui
  // Se puede avanzar si el paso está resuelto o es opcional.
  const canAdvance = stepDone(step, content, maskDominant) || step.optional
  const isLast = step.id === IKIBOARD_STEPS[IKIBOARD_STEPS.length - 1].id

  return (
    <div className="mt-10 flex items-center justify-between">
      <button
        onClick={onBack}
        className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors"
      >
        {ui.navBack}
      </button>
      <button
        onClick={onNext}
        disabled={!canAdvance}
        className="rounded-full bg-[#c2866b] px-7 py-2.5 text-sm tracking-widest uppercase text-[#FDFBF7] transition-opacity hover:opacity-90 disabled:opacity-30"
      >
        {isLast ? ui.navFinish : step.optional && !stepDone(step, content, maskDominant) ? ui.navSkip : ui.navNext}
      </button>
    </div>
  )
}

// ---------- Cierre del recorrido "definir" ----------

function Done({
  proposito,
  locale,
  estrellaDominant,
  caminoDominant,
  maskDominant,
  maskPaso,
  pasoResult,
  hasVocacionSeed,
  onSeedVocacion,
  onReview,
  onBuild,
}: {
  proposito?: string
  locale: string
  estrellaDominant: string | null
  caminoDominant: string | null
  maskDominant: string | null
  maskPaso: string | null
  pasoResult: PasoResult | null
  hasVocacionSeed: boolean
  onSeedVocacion: (frase: string) => void
  onReview: () => void
  onBuild: () => void
}) {
  const c = getIkiboardCopy(locale)
  return (
    <div className="text-center">
      <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-4">
        {c.definido.kicker}
      </p>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl leading-tight text-[#272727] mb-6">
        {c.definido.title}
      </h1>
      {proposito?.trim() && (
        <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-6 mb-8">
          <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">{c.ui.donePropositoLabel}</p>
          <p className="font-[family-name:var(--font-cormorant)] text-2xl italic text-[#272727] leading-snug">
            {proposito}
          </p>
        </div>
      )}

      <BorradorPanel
        locale={locale}
        estrellaDominant={estrellaDominant}
        caminoDominant={caminoDominant}
        maskDominant={maskDominant}
        maskPaso={maskPaso}
        pasoResult={pasoResult}
        hasVocacionSeed={hasVocacionSeed}
        onSeedVocacion={onSeedVocacion}
      />

      <p className="text-sm leading-relaxed text-[#272727]/70 mb-8">{c.definido.body}</p>
      <button
        onClick={onBuild}
        className="rounded-full bg-[#c2866b] px-8 py-3 text-sm tracking-widest uppercase text-[#FDFBF7] transition-opacity hover:opacity-90"
      >
        {c.definido.cta}
      </button>
      <div className="mt-6">
        <button
          onClick={onReview}
          className="text-xs tracking-widest uppercase text-[#c2866b] underline-offset-4 hover:underline"
        >
          {c.ui.doneReview}
        </button>
      </div>
    </div>
  )
}

// El borrador: cruza en código los tres instrumentos (Estrellas ×
// CAMINO × Máscaras) y lo teje en un retrato + "para seguir tu camino".
// Si falta alguno de los dos tests, invita a hacerlo (enlaza de vuelta).
function BorradorPanel({
  locale,
  estrellaDominant,
  caminoDominant,
  maskDominant,
  maskPaso,
  pasoResult,
  hasVocacionSeed,
  onSeedVocacion,
}: {
  locale: string
  estrellaDominant: string | null
  caminoDominant: string | null
  maskDominant: string | null
  maskPaso: string | null
  pasoResult: PasoResult | null
  hasVocacionSeed: boolean
  onSeedVocacion: (frase: string) => void
}) {
  const c = getIkiboardCopy(locale)
  const bc = c.borrador
  const b = generarBorrador({
    estrella: estrellaDominant,
    camino: caminoDominant,
    maskDominant,
    maskPaso,
  }, locale)

  const faltaEstrella = !estrellaDominant
  const faltaCamino = !caminoDominant
  const paso = pasoResult ? pasoReading(pasoResult, locale) : null

  return (
    <div className="mb-10 text-left">
      {b.hayCruce && (
        <>
          <div className="text-center mb-6">
            <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-2">
              {bc.kicker}
            </p>
            <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] leading-tight">
              {bc.title}
            </h2>
            <p className="text-sm text-[#272727]/55 mt-2">{bc.sub}</p>
          </div>

          {paso && (
            <div className="rounded-xl border border-[#272727]/12 bg-white/50 px-5 py-4 mb-3">
              <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1.5">{c.ui.borradorPasoLabel}</p>
              <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">{paso.name}</p>
              <p className="text-sm leading-relaxed text-[#272727]/65 mt-2">{paso.summary}</p>
            </div>
          )}

          {b.identidad && (
            <div className="rounded-xl border border-[#272727]/12 bg-white/50 px-5 py-4 mb-3">
              <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1.5">
                {bc.identidadLabel}
              </p>
              <p className="font-[family-name:var(--font-cormorant)] text-lg italic leading-snug text-[#272727]">
                {b.identidad}
              </p>
            </div>
          )}

          {b.vocacion && (
            <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-4 mb-3">
              <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1.5">
                {bc.vocacionLabel}
              </p>
              <p className="font-[family-name:var(--font-cormorant)] text-xl leading-snug text-[#272727]">
                {b.vocacion.orientacion}
              </p>
              <p className="text-xs text-[#272727]/50 mt-1">
                {bc.vocacionEjemplo}: {b.vocacion.ejemplo}
              </p>
              <button
                onClick={() => onSeedVocacion(c.ui.seedTmpl(b.vocacion!.orientacion.toLowerCase()))}
                disabled={hasVocacionSeed}
                className="mt-4 rounded-full border border-[#c2866b] px-4 py-2 text-[10px] tracking-widest uppercase text-[#c2866b] hover:bg-[#c2866b] hover:text-[#FDFBF7] disabled:opacity-40"
              >
                {hasVocacionSeed ? c.ui.borradorSeedDone : c.ui.borradorSeedCta}
              </button>
            </div>
          )}

          {b.instrucciones.length > 0 && (
            <div className="rounded-xl bg-[#272727]/[0.03] px-5 py-5 mb-3">
              <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-4">
                {bc.instruccionesLabel}
              </p>
              <ol className="flex flex-col gap-4">
                {b.instrucciones.map((ins, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#c2866b]/15 text-xs text-[#c2866b]">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-0.5">
                        {ins.label}
                      </p>
                      <p className="text-sm leading-relaxed text-[#272727]/75">{ins.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </>
      )}

      {(faltaEstrella || faltaCamino) && (
        <div className="rounded-xl border border-dashed border-[#c2866b]/40 px-5 py-5 mb-3">
          <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-1.5">
            {bc.faltanTitle}
          </p>
          <p className="text-sm leading-relaxed text-[#272727]/60 mb-4">
            {bc.faltanSub}
          </p>
          <div className="flex flex-col gap-2">
            <Link
              href={`/${locale}/estrellas?volver=/ikiboard`}
              className={`rounded-full px-5 py-2.5 text-center text-xs tracking-widest uppercase transition-colors ${
                faltaEstrella
                  ? 'bg-[#c2866b] text-[#FDFBF7] hover:opacity-90'
                  : 'border border-[#272727]/20 text-[#272727]/50 hover:border-[#c2866b]'
              }`}
            >
              {faltaEstrella ? bc.estrellaCta : `✓ ${bc.estrellaHecho}`}
            </Link>
            <Link
              href={`/${locale}/camino?volver=/ikiboard`}
              className={`rounded-full px-5 py-2.5 text-center text-xs tracking-widest uppercase transition-colors ${
                faltaCamino
                  ? 'bg-[#c2866b] text-[#FDFBF7] hover:opacity-90'
                  : 'border border-[#272727]/20 text-[#272727]/50 hover:border-[#c2866b]'
              }`}
            >
              {faltaCamino ? bc.caminoCta : `✓ ${bc.caminoHecho}`}
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

// ---------- FASE 2: el tablero visual ----------

// Cercanía media de una zona (0 → 1): el "cuánto de cerca" del
// dashboard. null si la zona está vacía. Es presencia, no logro.
function cercaniaZona(items: BoardItem[]): number | null {
  if (items.length === 0) return null
  const total = items.reduce(
    (s, i) => s + (IKI_ESTADOS.find(e => e.id === i.estado)?.peso ?? 0),
    0
  )
  return total / items.length
}

// Dibuja un icono de la biblioteca propia (SVG de línea).
function Icon({ id, className }: { id: string; className?: string }) {
  const ic = iconById(id)
  if (!ic) return null
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      dangerouslySetInnerHTML={{ __html: ic.svg }}
    />
  )
}

function StoredPhoto({ path, className }: { path: string; className?: string }) {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let active = true
    const supabase = createClient()
    supabase.storage.from('ikiboard').createSignedUrl(path, 3600).then(({ data }) => {
      if (active) setUrl(data?.signedUrl ?? null)
    })
    return () => { active = false }
  }, [path])
  if (!url) return <div className={`animate-pulse bg-[#272727]/8 ${className ?? ''}`} />
  return <img src={url} alt="" className={`object-cover ${className ?? ''}`} />
}

function ItemImage({ item, className }: { item: BoardItem; className?: string }) {
  return item.tipo === 'foto'
    ? <StoredPhoto path={item.ref} className={className} />
    : <Icon id={item.ref} className={className} />
}

// Una tarjeta de deseo guardado: la fila (icono · frase · quitar), y —solo
// para iconos— un picker a ancho completo que se despliega bajo la fila para
// cambiar el icono en el sitio, sin borrar ni recrear (conserva estado,
// prioridad e historial). Debajo, la cercanía. Reversible siempre, sin
// confirmación. Una foto se cambia quitándola; su icono se muestra estático.
function BoardItemCard({
  item,
  ambito,
  locale,
  onRemove,
  onEstado,
  onPriority,
  onChangeIcon,
}: {
  item: BoardItem
  ambito: IkiAmbitoId
  locale: string
  onRemove: (id: string) => void
  onEstado: (id: string, estado: IkiEstado) => void
  onPriority: (id: string) => void
  onChangeIcon: (id: string, ref: string) => void
}) {
  const c = getIkiboardCopy(locale)
  const board = c.board
  const en = contentLang(locale) === 'en'
  const [swapping, setSwapping] = useState(false)
  const editable = item.tipo === 'icono'

  // Iconos afines al ámbito primero, luego el resto (mismo orden que el alta).
  const afines = IKIBOARD_ICONS[ambito] ?? []
  const otros: IkiIcon[] = Object.entries(IKIBOARD_ICONS)
    .filter(([k]) => k !== ambito)
    .flatMap(([, v]) => v)
  const iconos = [...afines, ...otros]

  return (
    <div className="rounded-xl border border-[#272727]/12 bg-white/50 p-4">
      <div className="flex items-start gap-3">
        {editable ? (
          <button
            type="button"
            onClick={() => setSwapping(s => !s)}
            aria-expanded={swapping}
            title={en ? 'Change icon' : 'Cambiar icono'}
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors ${
              swapping ? 'bg-[#c2866b] text-[#FDFBF7]' : 'bg-[#c2866b]/10 text-[#c2866b] hover:bg-[#c2866b]/20'
            }`}
          >
            <ItemImage item={item} className="h-6 w-6" />
          </button>
        ) : (
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c2866b]/10 text-[#c2866b]">
            <ItemImage item={item} className="h-11 w-11 rounded-full" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="font-[family-name:var(--font-cormorant)] text-lg italic text-[#272727] leading-snug">
            {item.frase || '—'}
          </p>
          {item.doy?.trim() && (
            <p className="text-xs text-[#c2866b] mt-1">{c.ui.boardDoyPrefix} {item.doy}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(item.id)}
          className="text-[10px] tracking-widest uppercase text-[#272727]/35 hover:text-[#c2866b] transition-colors"
        >
          {board.remove}
        </button>
      </div>

      {/* Cambiar el icono en el sitio: rejilla a ancho completo bajo la fila. */}
      {editable && swapping && (
        <div className="mt-3 grid grid-cols-6 gap-2 rounded-xl border border-[#c2866b]/25 bg-[#c2866b]/5 p-3">
          {iconos.map(ic => (
            <button
              key={ic.id}
              type="button"
              onClick={() => { onChangeIcon(item.id, ic.id); setSwapping(false) }}
              title={ic.label}
              className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
                item.ref === ic.id
                  ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
                  : 'border-[#272727]/12 bg-white/60 text-[#c2866b] hover:border-[#c2866b]'
              }`}
            >
              <Icon id={ic.id} className="h-5 w-5" />
            </button>
          ))}
        </div>
      )}

      {/* Cercanía: cuánto habitas ya esta foto. */}
      <div className="mt-3 pt-3 border-t border-[#272727]/8">
        <p className="text-[10px] tracking-widest uppercase text-[#272727]/40 mb-2">
          {board.cercaniaLabel}
        </p>
        <div className="flex gap-1.5">
          {IKI_ESTADOS.map(e => (
            <button
              key={e.id}
              onClick={() => onEstado(item.id, e.id)}
              className={`flex-1 rounded-full px-2 py-1.5 text-[11px] tracking-wide transition-colors ${
                item.estado === e.id
                  ? 'bg-[#c2866b] text-[#FDFBF7]'
                  : 'border border-[#272727]/15 text-[#272727]/50 hover:border-[#c2866b]'
              }`}
            >
              {board.estados[e.id]}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPriority(item.id)}
          className={`mt-3 w-full rounded-full px-3 py-2 text-[10px] tracking-widest uppercase transition-colors ${
            item.is_priority
              ? 'bg-[#272727] text-[#FDFBF7]'
              : 'border border-[#272727]/12 text-[#272727]/45 hover:border-[#c2866b] hover:text-[#c2866b]'
          }`}
        >
          {item.is_priority ? `✓ ${board.priority}` : board.makePriority}
        </button>
      </div>
    </div>
  )
}

// Vista álbum: el propósito preside arriba, las 3 zonas como páginas
// con su cercanía (dashboard, zoom out). Tocar una zona entra (zoom in).
function Board({
  locale,
  items,
  maskDominant,
  estrellaScores,
  pasoQue,
  pasoCuando,
  onAdd,
  onAddPhoto,
  onRemove,
  onEstado,
  onPriority,
  onChangeIcon,
  onMap,
  onReview,
}: {
  locale: string
  proposito?: string
  items: BoardItem[]
  maskDominant: string | null
  estrellaScores: Record<string, number> | null
  pasoQue?: string
  pasoCuando?: string
  onAdd: (a: IkiAmbitoId, ref: string, frase: string, doy: string) => Promise<void>
  onAddPhoto: (a: IkiAmbitoId, file: File, frase: string, doy: string) => Promise<void>
  onRemove: (id: string) => void
  onEstado: (id: string, estado: IkiEstado) => void
  onPriority: (id: string) => void
  onChangeIcon: (id: string, ref: string) => void
  onMap: () => void
  onReview: () => void
}) {
  const c = getIkiboardCopy(locale)
  const board = c.board
  const ambitos = getIkiAmbitos(locale)
  const [zona, setZona] = useState<IkiAmbitoId | null>(null)
  const ambito = zona ? ambitos.find(a => a.id === zona)! : null
  const mask = maskDominant ? getMasks(locale).find(m => m.code === maskDominant) : null

  if (ambito) {
    return (
      <BoardZone
        locale={locale}
        ambito={ambito}
        items={items.filter(i => i.ambito === ambito.id)}
        maskDominant={maskDominant}
        estrellaScores={estrellaScores}
        onAdd={onAdd}
        onAddPhoto={onAddPhoto}
        onRemove={onRemove}
        onEstado={onEstado}
        onPriority={onPriority}
        onChangeIcon={onChangeIcon}
        onExit={() => setZona(null)}
      />
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="text-center mb-6">
        <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-2">{board.kicker}</p>
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727] leading-tight">
          {board.title}
        </h2>
        <p className="text-sm text-[#272727]/50 mt-2">{board.sub}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        {ambitos.map(a => {
          const zonaItems = items.filter(i => i.ambito === a.id)
          const n = zonaItems.length
          const cerca = cercaniaZona(zonaItems)
          return (
            <button
              key={a.id}
              onClick={() => setZona(a.id)}
              className="group aspect-square rounded-2xl border border-[#272727]/12 bg-white/50 p-4 text-left transition-colors hover:border-[#c2866b] flex flex-col"
            >
              <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">{a.label}</p>
              <p className="text-[11px] leading-snug text-[#272727]/45 mt-1">{a.hint}</p>

              {/* Resumen de cercanía (dashboard de tu vida). */}
              <div className="mt-3">
                {cerca === null ? (
                  <p className="text-[11px] text-[#272727]/35">{board.zonaVacia}</p>
                ) : (
                  <>
                    <div className="flex items-baseline gap-1">
                      <span className="font-[family-name:var(--font-cormorant)] text-2xl text-[#c2866b] leading-none">
                        {Math.round(cerca * 100)}%
                      </span>
                      <span className="text-[10px] tracking-wide text-[#272727]/40">
                        {board.zonaResumen}
                      </span>
                    </div>
                    <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-[#272727]/10">
                      <div className="h-full bg-[#c2866b] transition-all" style={{ width: `${cerca * 100}%` }} />
                    </div>
                  </>
                )}
              </div>

              <div className="mt-auto flex flex-wrap gap-1.5 pt-3">
                {zonaItems.slice(0, 4).map(i => (
                  <span
                    key={i.id}
                    className="flex h-7 w-7 items-center justify-center rounded-full bg-[#c2866b]/10 text-[#c2866b]"
                  >
                    <ItemImage item={i} className="h-7 w-7 rounded-full" />
                  </span>
                ))}
                {n === 0 && (
                  <span className="text-[11px] tracking-widest uppercase text-[#c2866b]/70">
                    {c.ui.boardAddShort}
                  </span>
                )}
              </div>
            </button>
          )
        })}
      </div>

      {items.length > 0 && (
        <div className="mt-6 rounded-2xl border border-[#272727]/10 bg-white/40 px-5 py-4">
          <p className="text-[10px] tracking-[0.3em] uppercase text-[#272727]/35 mb-3">{board.evolution}</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <AlbumCount value={items.filter(i => i.estado === 'lejos').length} label={board.farCount} />
            <AlbumCount value={items.filter(i => i.estado === 'en_proceso').length} label={board.processCount} />
            <AlbumCount value={items.filter(i => i.estado === 'conseguido').length} label={board.achievedCount} />
          </div>
        </div>
      )}

      {/* Banda-motor: el freno (máscara) y el paso. Lo que mantiene
          honesto el tablero y lo diferencia de un collage de deseos. */}
      <div className="mt-8">
        <p className="text-center text-[10px] tracking-[0.3em] uppercase text-[#272727]/35 mb-3">
          {board.motor}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[#272727]/12 bg-white/40 p-4">
            <p className="text-[10px] tracking-widest uppercase text-[#c2866b]/70 mb-1">
              {board.frenoLabel}
            </p>
            <p className="font-[family-name:var(--font-cormorant)] text-lg leading-snug text-[#272727]">
              {mask ? mask.name : <span className="text-[#272727]/40">{board.frenoVacio}</span>}
            </p>
          </div>
          <div className="rounded-xl border border-[#272727]/12 bg-white/40 p-4">
            <p className="text-[10px] tracking-widest uppercase text-[#c2866b]/70 mb-1">
              {board.pasoLabel}
            </p>
            {pasoQue?.trim() ? (
              <>
                <p className="text-sm leading-snug text-[#272727]/85">{pasoQue}</p>
                {pasoCuando?.trim() && (
                  <p className="text-xs text-[#c2866b] mt-1">{pasoCuando}</p>
                )}
              </>
            ) : (
              <p className="text-sm text-[#272727]/40">{board.pasoVacio}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={onMap}
          className="mb-5 rounded-full bg-[#272727] px-7 py-3 text-xs tracking-widest uppercase text-[#FDFBF7] hover:bg-[#c2866b] transition-colors"
        >
          {c.ui.boardVerMapa}
        </button>
        <br />
        <button
          onClick={onReview}
          className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors"
        >
          ← {board.repasar}
        </button>
      </div>
    </div>
  )
}

function AlbumCount({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#c2866b]">{value}</p>
      <p className="text-[10px] leading-tight text-[#272727]/45">{label}</p>
    </div>
  )
}

// Zoom in: una zona a pantalla, sus deseos + añadir uno nuevo.
function BoardZone({
  locale,
  ambito,
  items,
  maskDominant,
  estrellaScores,
  onAdd,
  onAddPhoto,
  onRemove,
  onEstado,
  onPriority,
  onChangeIcon,
  onExit,
}: {
  locale: string
  ambito: { id: IkiAmbitoId; label: string; hint: string }
  items: BoardItem[]
  maskDominant: string | null
  estrellaScores: Record<string, number> | null
  onAdd: (a: IkiAmbitoId, ref: string, frase: string, doy: string) => Promise<void>
  onAddPhoto: (a: IkiAmbitoId, file: File, frase: string, doy: string) => Promise<void>
  onRemove: (id: string) => void
  onEstado: (id: string, estado: IkiEstado) => void
  onPriority: (id: string) => void
  onChangeIcon: (id: string, ref: string) => void
  onExit: () => void
}) {
  const c = getIkiboardCopy(locale)
  const board = c.board
  const [adding, setAdding] = useState(false)
  // Sugerencia determinista de icono para este ámbito (cero IA), a partir
  // de los tests ya respondidos. Puede venir vacía: entonces AddItem se
  // comporta como hoy (elección manual).
  const sugerencia = generarIconoSugerido(ambito.id, { maskDominant, estrellaScores }, locale)

  return (
    <div className="w-full max-w-md">
      <button
        onClick={onExit}
        className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors mb-6"
      >
        ← {board.back}
      </button>

      <div className="text-center mb-8">
        <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{ambito.label}</h2>
        <p className="text-sm text-[#272727]/50 mt-1">{ambito.hint}</p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {items.length === 0 && !adding && (
          <p className="text-center text-sm text-[#272727]/40 py-6">{board.empty}</p>
        )}
        {items.map(i => (
          <BoardItemCard
            key={i.id}
            item={i}
            ambito={ambito.id}
            locale={locale}
            onRemove={onRemove}
            onEstado={onEstado}
            onPriority={onPriority}
            onChangeIcon={onChangeIcon}
          />
        ))}
      </div>

      {adding ? (
        <AddItem
          locale={locale}
          ambito={ambito.id}
          sugerencia={sugerencia}
          onCancel={() => setAdding(false)}
          onSave={async (ref, frase, doy) => {
            await onAdd(ambito.id, ref, frase, doy)
            setAdding(false)
          }}
          onSavePhoto={async (file, frase, doy) => {
            await onAddPhoto(ambito.id, file, frase, doy)
            setAdding(false)
          }}
        />
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="w-full rounded-full border border-[#c2866b] py-3 text-sm tracking-widest uppercase text-[#c2866b] transition-colors hover:bg-[#c2866b] hover:text-[#FDFBF7]"
        >
          {board.add}
        </button>
      )}
    </div>
  )
}

// Formulario de un deseo: icono + frase en presente + qué doy.
function AddItem({
  locale,
  ambito,
  sugerencia,
  onCancel,
  onSave,
  onSavePhoto,
}: {
  locale: string
  ambito: IkiAmbitoId
  sugerencia?: IconoSugerido
  onCancel: () => void
  onSave: (ref: string, frase: string, doy: string) => Promise<void>
  onSavePhoto: (file: File, frase: string, doy: string) => Promise<void>
}) {
  const c = getIkiboardCopy(locale)
  const board = c.board
  const en = contentLang(locale) === 'en'
  // Ofrece primero los iconos afines al ámbito, luego el resto.
  const afines = IKIBOARD_ICONS[ambito] ?? []
  const otros: IkiIcon[] = Object.entries(IKIBOARD_ICONS)
    .filter(([k]) => k !== ambito)
    .flatMap(([, v]) => v)
  const iconos = [...afines, ...otros]

  // El asistente propone un icono ya puesto (si hay datos de tests). Es la
  // salida por defecto; el usuario puede desempatar o elegir otro a mano.
  const [ref, setRef] = useState(sugerencia?.icono ?? afines[0]?.id ?? iconos[0]?.id ?? '')
  const [imageMode, setImageMode] = useState<'icono' | 'foto'>('icono')
  const [photo, setPhoto] = useState<File | null>(null)
  const [frase, setFrase] = useState('')
  const [doy, setDoy] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function submit() {
    if (!frase.trim() || saving) return
    setSaving(true)
    setError('')
    try {
      if (imageMode === 'foto') {
        if (!photo) throw new Error('missing photo')
        await onSavePhoto(photo, frase.trim(), doy.trim())
      } else {
        await onSave(ref, frase.trim(), doy.trim())
      }
    } catch (e) {
      const msg = e instanceof Error && e.message && !e.message.startsWith('missing')
        ? e.message
        : c.ui.addSaveError
      setError(msg)
      setSaving(false)
    }
  }

  return (
    <div className="rounded-2xl border border-[#c2866b]/30 bg-[#c2866b]/5 p-5">
      <div className="mb-4 grid grid-cols-2 rounded-full bg-white/60 p-1">
        <button onClick={() => setImageMode('icono')} className={`rounded-full py-2 text-[10px] tracking-widest uppercase ${imageMode === 'icono' ? 'bg-[#c2866b] text-[#FDFBF7]' : 'text-[#272727]/45'}`}>{c.ui.addModeIcon}</button>
        <button onClick={() => setImageMode('foto')} className={`rounded-full py-2 text-[10px] tracking-widest uppercase ${imageMode === 'foto' ? 'bg-[#c2866b] text-[#FDFBF7]' : 'text-[#272727]/45'}`}>{c.ui.addModePhoto}</button>
      </div>

      {imageMode === 'icono' ? <>
      {sugerencia?.icono && (
        <div className="mb-5 rounded-xl border border-[#c2866b]/25 bg-white/50 p-4">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#c2866b]/10 text-[#c2866b]">
              <Icon id={ref} className="h-6 w-6" />
            </span>
            <p className="text-sm leading-snug text-[#272727]/70">
              {sugerencia.candidatos.find(cd => cd.icono === ref)?.rationale ?? sugerencia.rationale}
            </p>
          </div>
          {sugerencia.preguntaDesempate && (
            <div className="mt-3 pt-3 border-t border-[#272727]/8">
              <p className="text-[13px] italic text-[#272727]/60 mb-2 font-[family-name:var(--font-cormorant)]">
                {sugerencia.preguntaDesempate.texto}
              </p>
              <div className="flex gap-2">
                {sugerencia.preguntaDesempate.opciones.map(op => (
                  <button
                    key={op.icono}
                    type="button"
                    onClick={() => setRef(op.icono)}
                    className={`flex-1 rounded-full px-3 py-2 text-xs tracking-wide transition-colors ${
                      ref === op.icono
                        ? 'bg-[#c2866b] text-[#FDFBF7]'
                        : 'border border-[#272727]/15 text-[#272727]/55 hover:border-[#c2866b]'
                    }`}
                  >
                    {op.etiqueta}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-3">{sugerencia?.icono ? (en ? 'or choose another' : 'o elige otro') : board.iconLabel}</p>
      <div className="grid grid-cols-6 gap-2 mb-6">
        {iconos.map(ic => (
          <button
            key={ic.id}
            onClick={() => setRef(ic.id)}
            title={ic.label}
            className={`flex aspect-square items-center justify-center rounded-lg border transition-colors ${
              ref === ic.id
                ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
                : 'border-[#272727]/12 bg-white/60 text-[#c2866b] hover:border-[#c2866b]'
            }`}
          >
            <Icon id={ic.id} className="h-5 w-5" />
          </button>
        ))}
      </div>
      </> : (
        <div className="mb-6 rounded-xl border border-dashed border-[#c2866b]/40 bg-white/40 p-5 text-center">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={e => setPhoto(e.target.files?.[0] ?? null)}
            className="block w-full text-xs text-[#272727]/55 file:mr-3 file:rounded-full file:border-0 file:bg-[#272727] file:px-4 file:py-2 file:text-xs file:text-[#FDFBF7]"
          />
          {photo && <p className="mt-2 text-xs text-[#c2866b]">{photo.name}</p>}
        </div>
      )}

      <label className="block text-xs tracking-widest uppercase text-[#272727]/50 mb-1">
        {board.fraseLabel}
      </label>
      <input
        value={frase}
        placeholder={board.frasePlaceholder}
        onChange={e => setFrase(e.target.value)}
        className="w-full rounded-lg border border-[#272727]/20 bg-white/60 p-3 text-base text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors"
      />
      <p className="text-[11px] text-[#272727]/45 mt-1 mb-4">{board.fraseHint}</p>

      <label className="block text-xs tracking-widest uppercase text-[#272727]/50 mb-1">
        {board.doyLabel}
      </label>
      <input
        value={doy}
        placeholder={board.doyPlaceholder}
        onChange={e => setDoy(e.target.value)}
        className="w-full rounded-lg border border-[#272727]/20 bg-white/60 p-3 text-base text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors"
      />
      <p className="text-[11px] text-[#272727]/45 mt-1 mb-5">{board.doyHint}</p>

      <div className="flex items-center justify-between">
        <button
          onClick={onCancel}
          className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors"
        >
          {c.ui.addCancel}
        </button>
        <button
          onClick={submit}
          disabled={!frase.trim() || saving || (imageMode === 'foto' && !photo)}
          className="rounded-full bg-[#c2866b] px-6 py-2.5 text-sm tracking-widest uppercase text-[#FDFBF7] transition-opacity hover:opacity-90 disabled:opacity-30"
        >
          {saving ? c.ui.addSaving : board.save}
        </button>
      </div>
      {error && <p className="mt-3 text-xs leading-relaxed text-red-700/70">{error}</p>}
    </div>
  )
}

// ---------- Salida: el mapa integrado ----------

function MapOutput({
  locale,
  content,
  items,
  pasoResult,
  estrellaDominant,
  caminoDominant,
  maskDominant,
  maskPaso,
  onBack,
}: {
  locale: string
  content: Record<string, string>
  items: BoardItem[]
  pasoResult: PasoResult | null
  estrellaDominant: string | null
  caminoDominant: string | null
  maskDominant: string | null
  maskPaso: string | null
  onBack: () => void
}) {
  const c = getIkiboardCopy(locale)
  const ui = c.ui
  const board = c.board
  const ambitos = getIkiAmbitos(locale)
  const borrador = generarBorrador({ estrella: estrellaDominant, camino: caminoDominant, maskDominant, maskPaso }, locale)
  const paso = pasoResult ? pasoReading(pasoResult, locale) : null
  const mask = maskDominant ? getMasks(locale).find(m => m.code === maskDominant) : null
  const priority = items.find(i => i.is_priority)

  return (
    <div className="w-full max-w-3xl map-print-root">
      <style>{`
        @media print {
          @page { size: A4; margin: 16mm; }
          body { background: white !important; }
          .map-no-print { display: none !important; }
          .map-print-root { max-width: none !important; width: 100% !important; }
          .map-break { break-before: page; }
          .map-avoid { break-inside: avoid; }
        }
      `}</style>

      <div className="map-no-print mb-8 flex items-center justify-between">
        <button onClick={onBack} className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b]">{ui.mapBack}</button>
        <button onClick={() => window.print()} className="rounded-full bg-[#272727] px-6 py-2.5 text-xs tracking-widest uppercase text-[#FDFBF7] hover:bg-[#c2866b]">{ui.mapSavePdf}</button>
      </div>

      <header className="border-b border-[#c2866b]/30 pb-8 mb-8 text-center">
        <p className="text-xs tracking-[0.35em] uppercase text-[#c2866b] mb-3">{ui.mapKicker}</p>
        <h1 className="font-[family-name:var(--font-cormorant)] text-5xl text-[#272727]">{ui.mapTitle}</h1>
        <p className="mt-3 text-sm text-[#272727]/50">{ui.mapSub}</p>
      </header>

      {content.deseo_reconocido?.trim() && (
        <MapSection title={ui.mapSecAnsias}>
          <p className="font-[family-name:var(--font-cormorant)] text-2xl italic text-[#272727]">{content.deseo_reconocido}</p>
          {content.proposito?.trim() && <p className="mt-4 text-sm text-[#272727]/65"><span className="text-[#c2866b]">{ui.mapPropositoInline}</span> {content.proposito}</p>}
        </MapSection>
      )}

      <MapSection title={ui.mapSecPartes}>
        {paso && <MapLine label={ui.mapLblComoCaminas} body={`${paso.name}. ${paso.summary}`} />}
        {borrador.identidad && <MapLine label={ui.mapLblComoEstas} body={borrador.identidad} />}
        {borrador.vocacion && <MapLine label={ui.mapLblTerreno} body={`${borrador.vocacion.orientacion}. ${ui.mapReferentePrefix} ${borrador.vocacion.ejemplo}.`} />}
        {mask && <MapLine label={ui.mapLblDesviarte} body={`${mask.name}. ${ui.frenoMiedoLabel} ${mask.fear}.`} />}
      </MapSection>

      <div className="map-break">
        <MapSection title={ui.mapSecAlbum}>
          <div className="grid grid-cols-2 gap-4">
            {ambitos.map(ambito => (
              <div key={ambito.id} className="map-avoid rounded-xl border border-[#272727]/12 p-4">
                <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{ambito.label}</h3>
                <div className="mt-3 space-y-3">
                  {items.filter(i => i.ambito === ambito.id).map(item => (
                    <div key={item.id} className="flex gap-3 border-t border-[#272727]/8 pt-3 first:border-0 first:pt-0">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#c2866b]/10 text-[#c2866b]"><ItemImage item={item} className="h-9 w-9 rounded-full" /></span>
                      <div>
                        <p className="text-sm text-[#272727]">{item.frase}</p>
                        <p className="text-[10px] uppercase tracking-wide text-[#c2866b] mt-1">{board.estados[item.estado]}</p>
                      </div>
                    </div>
                  ))}
                  {items.every(i => i.ambito !== ambito.id) && <p className="text-xs text-[#272727]/35">{ui.mapAunPorDibujar}</p>}
                </div>
              </div>
            ))}
          </div>
        </MapSection>
      </div>

      <MapSection title={ui.mapSecRuta}>
        {priority ? (
          <>
            <MapLine label={ui.mapLblEscena} body={priority.frase} />
            {content.paso_que?.trim() && <MapLine label={ui.mapLblGesto} body={`${content.paso_que}${content.paso_cuando ? ` · ${content.paso_cuando}` : ''}`} />}
            {mask && <MapLine label={ui.mapLblFreno} body={ui.mapReconoceTmpl(mask.name)} />}
          </>
        ) : (
          <p className="text-sm text-[#272727]/50">{ui.mapRutaVacia}</p>
        )}
      </MapSection>

      <footer className="mt-12 border-t border-[#272727]/10 pt-5 text-center text-xs text-[#272727]/35">
        {ui.mapFooter}
      </footer>
    </div>
  )
}

function MapSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="map-avoid mb-9">
      <h2 className="text-xs tracking-[0.25em] uppercase text-[#c2866b] mb-4">{title}</h2>
      {children}
    </section>
  )
}

function MapLine({ label, body }: { label: string; body: string }) {
  return (
    <div className="mb-4 last:mb-0">
      <p className="text-[10px] tracking-widest uppercase text-[#272727]/40 mb-1">{label}</p>
      <p className="text-sm leading-relaxed text-[#272727]/75">{body}</p>
    </div>
  )
}

// ---------- Shell (mismo marco que las demás herramientas) ----------

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
