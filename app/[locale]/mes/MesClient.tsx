'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import {
  PROGRAMA_LIBRETA,
  PROGRAMA_TEXTO_MAX,
  semanaDeJueves,
  type ProgramaCampo,
  type ProgramaCheckin,
  type ProgramaSemanal,
} from '@/lib/programa'
import { formatProgramaDate, getProgramaTexts, type ProgramaBlock, type ProgramaMail } from '@/lib/programa-content'

// El panel del programa: una pestaña por semana (lunes + jueves), el cierre
// y «Tu libreta». Cada correo se abre el día que sale. Escribir es opcional:
// lo que se escribe se guarda solo, con la sesión de la persona (RLS).

interface PanelItem { key: ProgramaSemanal; date: string; abierto: boolean; mail: ProgramaMail | null }
interface Panel {
  inscripcionId: string
  startDate: string
  tieneTest: boolean
  testUrl: string
  items: PanelItem[]
  today: string
  checkins: Partial<Record<number, ProgramaCheckin>>
  respuestas: Record<string, string>
}

type Tab = 1 | 2 | 3 | 4 | 'cierre' | 'libreta'

export default function MesClient({ locale, userId, panel }: { locale: string; userId: string; panel: Panel | null }) {
  const t = getProgramaTexts(locale)
  const p = t.panel

  if (!panel) {
    return (
      <Shell locale={locale}>
        <h1 className="font-[family-name:var(--font-cormorant)] text-4xl text-[#272727] mb-4">{p.title}</h1>
        <p className="text-[#272727]/70 mb-8">{p.noInscripcion}</p>
        <Link href={`/${locale}/programa/empezar`} className="inline-block px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors">
          {p.noInscripcionButton}
        </Link>
      </Shell>
    )
  }

  return <Programa locale={locale} userId={userId} panel={panel} />
}

function Programa({ locale, userId, panel }: { locale: string; userId: string; panel: Panel }) {
  const t = getProgramaTexts(locale)
  const p = t.panel
  const byKey = useMemo(() => Object.fromEntries(panel.items.map(i => [i.key, i])) as Record<ProgramaSemanal, PanelItem>, [panel.items])
  const [respuestas, setRespuestas] = useState<Record<string, string>>(panel.respuestas)

  // Semana en curso: la del último correo abierto.
  const abiertos = panel.items.filter(i => i.abierto)
  const ultimo = abiertos[abiertos.length - 1]?.key
  const semanaActual = ultimo === 'cierre' ? 5 : ultimo ? Number(/\d/.exec(ultimo)?.[0]) : 0
  const [tab, setTab] = useState<Tab>(semanaActual >= 1 && semanaActual <= 4 ? (semanaActual as Tab) : semanaActual === 5 ? 'cierre' : 1)

  const estado = semanaActual === 0
    ? p.startsOn(formatProgramaDate(locale, panel.startDate))
    : semanaActual === 5 ? p.finished : p.weekOf(semanaActual)

  const tabs: { id: Tab; label: string; abierto: boolean }[] = [
    ...([1, 2, 3, 4] as const).map(n => ({ id: n as Tab, label: p.tabs[`semana${n}` as ProgramaSemanal], abierto: byKey[`semana${n}` as ProgramaSemanal].abierto })),
    { id: 'cierre', label: p.tabs.cierre, abierto: byKey.cierre.abierto },
    { id: 'libreta', label: p.libretaTab, abierto: true },
  ]

  return (
    <Shell locale={locale}>
      <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-3">{p.title}</p>
      <h1 className="font-[family-name:var(--font-cormorant)] text-4xl sm:text-5xl text-[#272727] mb-8">{estado}</h1>

      {!panel.tieneTest && (
        <section className="rounded-xl border border-[#c2866b]/40 bg-[#c2866b]/[0.06] px-5 py-6 mb-8 space-y-4">
          <p className="text-[15px] leading-relaxed text-[#272727]/80">{p.testFirst}</p>
          <Link href={panel.testUrl} className="inline-block px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors">
            {p.testButton}
          </Link>
        </section>
      )}

      <nav className="flex flex-wrap gap-2 mb-10" aria-label={p.title}>
        {tabs.map(x => (
          <button
            key={String(x.id)}
            onClick={() => setTab(x.id)}
            aria-pressed={tab === x.id}
            className={`px-4 py-2 rounded-full border text-sm transition-colors ${
              tab === x.id
                ? 'border-[#c2866b] text-[#94563b] bg-[#c2866b]/[0.07]'
                : x.abierto ? 'border-[#272727]/20 text-[#272727]/80 hover:border-[#c2866b]' : 'border-[#272727]/10 text-[#272727]/35'
            }`}
          >
            {x.label}
          </button>
        ))}
      </nav>

      {tab === 'libreta' ? (
        <Libreta locale={locale} inscripcionId={panel.inscripcionId} respuestas={respuestas} onBorrado={() => setRespuestas({})} />
      ) : tab === 'cierre' ? (
        <Dia locale={locale} item={byKey.cierre} label="" userId={userId} inscripcionId={panel.inscripcionId} respuestas={respuestas} setRespuestas={setRespuestas} />
      ) : (
        <div className="space-y-14">
          <Dia locale={locale} item={byKey[`semana${tab}` as ProgramaSemanal]} label={p.monday} userId={userId} inscripcionId={panel.inscripcionId} respuestas={respuestas} setRespuestas={setRespuestas} />
          <Dia locale={locale} item={byKey[`jueves${tab}` as ProgramaSemanal]} label={p.thursday} userId={userId} inscripcionId={panel.inscripcionId} respuestas={respuestas} setRespuestas={setRespuestas}
            checkin={{ semana: tab as number, inicial: panel.checkins[tab as number] ?? null }} />
        </div>
      )}
    </Shell>
  )
}

function Dia({
  locale, item, label, userId, inscripcionId, respuestas, setRespuestas, checkin,
}: {
  locale: string
  item: PanelItem
  label: string
  userId: string
  inscripcionId: string
  respuestas: Record<string, string>
  setRespuestas: (f: (r: Record<string, string>) => Record<string, string>) => void
  checkin?: { semana: number; inicial: ProgramaCheckin | null }
}) {
  const t = getProgramaTexts(locale)
  const fecha = formatProgramaDate(locale, item.date)
  if (!item.abierto || !item.mail) {
    return (
      <section>
        {label && <p className="text-xs tracking-[0.2em] uppercase text-[#272727]/45 mb-2">{label} · {fecha}</p>}
        <p className="text-[#272727]/50">{t.panel.opensOn(fecha)}</p>
      </section>
    )
  }
  const campos = PROGRAMA_LIBRETA[item.key]
  return (
    <section className="space-y-5">
      {label && <p className="text-xs tracking-[0.2em] uppercase text-[#272727]/45">{label} · {fecha}</p>}
      <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{item.mail.subject}</h2>
      {item.mail.blocks.map((b, i) => <Bloque key={i} b={b} locale={locale} />)}
      {campos.length > 0 && (
        <div className="rounded-xl border border-[#272727]/12 bg-white/60 px-5 py-6 space-y-6">
          <p className="text-xs leading-relaxed text-[#272727]/55">{t.libreta.intro}</p>
          {campos.map(c => (
            <Campo
              key={c}
              campo={c}
              locale={locale}
              userId={userId}
              inscripcionId={inscripcionId}
              valor={respuestas[c] ?? ''}
              onSaved={v => setRespuestas(r => ({ ...r, [c]: v }))}
            />
          ))}
        </div>
      )}
      {checkin && semanaDeJueves(item.key) && <Checkin locale={locale} semana={checkin.semana} inicial={checkin.inicial} />}
    </section>
  )
}

function Bloque({ b, locale }: { b: ProgramaBlock; locale: string }) {
  const t = getProgramaTexts(locale)
  const [qo, qc] = t.q
  switch (b.kind) {
    case 'p':
      return <p className={`text-[15px] leading-relaxed ${b.muted ? 'text-[#272727]/55' : 'text-[#272727]/85'}`}>{b.text}</p>
    case 'quote':
      return (
        <blockquote className="border-l-2 border-[#c2866b] pl-4">
          <p className="font-[family-name:var(--font-cormorant)] italic text-xl leading-snug text-[#403b37]">{qo}{b.text}{qc}</p>
          <p className="mt-1 text-xs text-[#8b8179]">{b.cite} · {b.book ?? t.book}</p>
        </blockquote>
      )
    case 'exercise':
      return (
        <div className="rounded-xl bg-[#272727]/[0.04] p-6 space-y-3">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#272727]/50">{b.eyebrow}</p>
          <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{b.title}</h3>
          {b.steps.map(s => <p key={s} className="text-[15px] leading-relaxed text-[#272727]/85">{s}</p>)}
        </div>
      )
    case 'cta': {
      const interno = b.href.startsWith('https://app.ikigaier.com') ? b.href.replace('https://app.ikigaier.com', '') : null
      const cls = 'inline-block px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors'
      return <div>{interno ? <Link href={interno} className={cls}>{b.label}</Link> : <a href={b.href} className={cls}>{b.label}</a>}</div>
    }
    case 'encuentros':
      return (
        <div className="rounded-xl border border-[#c2866b]/30 px-5 py-4 space-y-2">
          <p className="text-[11px] tracking-[0.2em] uppercase text-[#c2866b]">{b.title}</p>
          {b.items.map(e => (
            <p key={e.url + e.when} className="text-sm text-[#403b37]">{e.when} · <a href={e.url} className="text-[#94563b] underline">{b.joinLabel}</a></p>
          ))}
        </div>
      )
    case 'sign':
      return <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">{b.text}</p>
    default:
      return null
  }
}

function Campo({
  campo, locale, userId, inscripcionId, valor, onSaved,
}: {
  campo: ProgramaCampo
  locale: string
  userId: string
  inscripcionId: string
  valor: string
  onSaved: (v: string) => void
}) {
  const t = getProgramaTexts(locale).libreta
  const [texto, setTexto] = useState(valor)
  const [estado, setEstado] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const supabase = useMemo(() => createClient(), [])

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current) }, [])

  async function guardar(v: string) {
    setEstado('saving')
    const limpio = v.slice(0, PROGRAMA_TEXTO_MAX)
    const { error } = limpio.trim()
      ? await supabase.from('programa_respuestas').upsert(
          { inscripcion_id: inscripcionId, user_id: userId, campo, texto: limpio, updated_at: new Date().toISOString() },
          { onConflict: 'inscripcion_id,campo' },
        )
      : await supabase.from('programa_respuestas').delete().eq('inscripcion_id', inscripcionId).eq('campo', campo)
    if (error) {
      setEstado('error')
      return
    }
    setEstado('saved')
    onSaved(limpio.trim() ? limpio : '')
  }

  function cambiar(v: string) {
    setTexto(v)
    setEstado('idle')
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => guardar(v), 900)
  }

  const id = `campo-${campo}`
  return (
    <div className="space-y-2">
      <label htmlFor={id} className="block font-[family-name:var(--font-cormorant)] text-xl text-[#272727]">{t.campos[campo]}</label>
      <textarea
        id={id}
        value={texto}
        onChange={e => cambiar(e.target.value)}
        onBlur={() => { if (timer.current) { clearTimeout(timer.current); timer.current = null; guardar(texto) } }}
        maxLength={PROGRAMA_TEXTO_MAX}
        rows={campo === 'revision' || campo === 'consciente' ? 5 : 2}
        placeholder={t.placeholder}
        className="w-full rounded-lg border border-[#272727]/20 bg-white px-4 py-3 text-[15px] leading-relaxed text-[#272727] focus:border-[#c2866b] focus:outline-none"
      />
      <p className="h-4 text-xs text-[#272727]/45" aria-live="polite">
        {estado === 'saving' ? t.saving : estado === 'saved' ? t.saved : estado === 'error' ? <span className="text-red-700/70">{t.error}</span> : ''}
      </p>
    </div>
  )
}

function Checkin({ locale, semana, inicial }: { locale: string; semana: number; inicial: ProgramaCheckin | null }) {
  const p = getProgramaTexts(locale).panel
  const [valor, setValor] = useState<ProgramaCheckin | null>(inicial)
  const [guardado, setGuardado] = useState(false)
  async function elegir(r: ProgramaCheckin) {
    setValor(r)
    setGuardado(false)
    const res = await fetch('/api/programa/checkin-panel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ semana, respuesta: r }),
    }).catch(() => null)
    setGuardado(Boolean(res?.ok))
  }
  return (
    <div className="border-t border-[#272727]/10 pt-6 space-y-3">
      <p className="text-sm text-[#272727]/75">{p.checkinQuestion}</p>
      <div className="flex flex-wrap gap-2">
        {(['si', 'medias', 'no'] as const).map(r => (
          <button
            key={r}
            onClick={() => elegir(r)}
            aria-pressed={valor === r}
            className={`px-4 py-2 rounded-full border text-sm transition-colors ${valor === r ? 'border-[#c2866b] text-[#94563b] bg-[#c2866b]/[0.07]' : 'border-[#272727]/20 text-[#272727]/80 hover:border-[#c2866b]'}`}
          >
            {p.checkinLabels[r]}
          </button>
        ))}
      </div>
      {guardado && <p className="text-xs text-[#272727]/45">{p.checkinSaved}</p>}
    </div>
  )
}

// Todo lo escrito, en el orden del mes. La excusa de toda la vida, tachada.
function Libreta({ locale, inscripcionId, respuestas, onBorrado }: { locale: string; inscripcionId: string; respuestas: Record<string, string>; onBorrado: () => void }) {
  const t = getProgramaTexts(locale)
  const supabase = useMemo(() => createClient(), [])
  const [borrado, setBorrado] = useState(false)
  const orden = (Object.keys(PROGRAMA_LIBRETA) as ProgramaSemanal[])
  const escritos = orden.flatMap(k => PROGRAMA_LIBRETA[k].filter(c => respuestas[c]?.trim()).map(c => ({ k, c })))

  async function borrarTodo() {
    if (!window.confirm(t.libreta.borrarConfirm)) return
    const { error } = await supabase.from('programa_respuestas').delete().eq('inscripcion_id', inscripcionId)
    if (!error) {
      setBorrado(true)
      onBorrado()
    }
  }

  return (
    <section className="space-y-8">
      {escritos.length === 0 ? (
        <p className="text-[#272727]/55">{borrado ? t.libreta.borrado : t.libreta.empty}</p>
      ) : (
        <ol className="space-y-7">
          {escritos.map(({ k, c }) => (
            <li key={c} className="space-y-1">
              <p className="text-[11px] tracking-[0.2em] uppercase text-[#272727]/45">{t.panel.tabs[k]} · {t.libreta.campos[c]}</p>
              <p className={`font-[family-name:var(--font-cormorant)] text-2xl leading-snug text-[#272727] whitespace-pre-line ${c === 'excusa' ? 'line-through decoration-[#c2866b]/70' : ''}`}>
                {respuestas[c]}
              </p>
            </li>
          ))}
        </ol>
      )}
      {escritos.length > 0 && (
        <button onClick={borrarTodo} className="text-xs text-[#272727]/45 underline underline-offset-4 hover:text-red-700/70">
          {t.libreta.borrar}
        </button>
      )}
    </section>
  )
}

function Shell({ locale, children }: { locale: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8">
      <div className="mx-auto w-full max-w-2xl">
        <Link href={`/${locale}/dashboard`} className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-[0.3em]">
          IKIGAIER
        </Link>
        <div className="mt-10 pb-16">{children}</div>
      </div>
    </div>
  )
}
