'use client'

import { useState, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTranslations } from 'next-intl'
import { createClient } from '@/lib/supabase/client'
import { TALLER_CONTENT, ANSWERABLE_IDS, type Block } from '@/lib/taller-content'

// Enlace del directo del taller (Zoom / YouTube / Meet). Vacío = sin directo.
// En septiembre, pega aquí la URL "embed" del directo.
const LIVE_URL = ''

interface Props {
  userId: string
  locale: string
  answers: Record<string, string>
}

export default function TallerClient({ userId, locale, answers }: Props) {
  const supabase = createClient()
  const t = useTranslations('taller')
  const tn = useTranslations('nav')

  const [section, setSection] = useState(0)
  // Estado local de todas las respuestas (para el contador de progreso)
  const [values, setValues] = useState<Record<string, string>>(answers)

  // Guardado con retardo (autosave). Un temporizador por bloque.
  const timers = useRef<Record<string, ReturnType<typeof setTimeout>>>({})

  const save = useCallback(
    (blockId: string, value: string) => {
      setValues(prev => ({ ...prev, [blockId]: value }))
      clearTimeout(timers.current[blockId])
      timers.current[blockId] = setTimeout(async () => {
        await supabase
          .from('taller_answers')
          .upsert(
            { user_id: userId, block_id: blockId, value, updated_at: new Date().toISOString() },
            { onConflict: 'user_id,block_id' }
          )
      }, 700)
    },
    [supabase, userId]
  )

  const answered = ANSWERABLE_IDS.filter(id => (values[id] ?? '').trim() !== '').length
  const current = TALLER_CONTENT[section]

  return (
    <Shell locale={locale} tn={tn}>
      <div className="w-full max-w-md">
        {/* Directo (facilitador) */}
        {LIVE_URL && (
          <div className="mb-8 aspect-video w-full overflow-hidden rounded-xl bg-black">
            <iframe src={LIVE_URL} className="h-full w-full" allowFullScreen title={t('live')} />
          </div>
        )}

        {/* Progreso */}
        <p className="text-center text-xs tracking-widest uppercase text-[#272727]/40 mb-3">
          {t('progress', { done: answered, total: ANSWERABLE_IDS.length })}
        </p>
        <div className="mb-6 text-center">
          <Link
            href={`/${locale}/taller/pdf`}
            className="text-xs tracking-wide text-[#c2866b] underline-offset-4 hover:underline"
          >
            {t('pdf_link')}
          </Link>
        </div>

        {/* Navegación de secciones */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-8 -mx-1 px-1">
          {TALLER_CONTENT.map((s, i) => (
            <button
              key={s.id}
              onClick={() => {
                setSection(i)
                window.scrollTo({ top: 0 })
              }}
              className={`shrink-0 rounded-full border px-4 py-1.5 text-xs tracking-wide transition-colors ${
                i === section
                  ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
                  : 'border-[#272727]/20 text-[#272727]/50 hover:border-[#c2866b]'
              }`}
            >
              {s.label ? s.label.replace('SECCIÓN ', '') : t('intro_short')}
            </button>
          ))}
        </div>

        {/* Cabecera de sección */}
        <div className="text-center mb-10">
          {current.label && (
            <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-2">{current.label}</p>
          )}
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">
            {current.title}
          </h2>
        </div>

        {/* Bloques */}
        <div className="flex flex-col gap-8">
          {current.blocks.map((b, i) => (
            <BlockView key={i} block={b} value={values} onSave={save} t={t} />
          ))}
        </div>

        {/* Anterior / Siguiente */}
        <div className="flex justify-between mt-14 mb-6">
          <button
            onClick={() => {
              setSection(s => Math.max(0, s - 1))
              window.scrollTo({ top: 0 })
            }}
            disabled={section === 0}
            className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors disabled:opacity-0"
          >
            ← {t('prev')}
          </button>
          <button
            onClick={() => {
              setSection(s => Math.min(TALLER_CONTENT.length - 1, s + 1))
              window.scrollTo({ top: 0 })
            }}
            disabled={section === TALLER_CONTENT.length - 1}
            className="text-xs tracking-widest uppercase text-[#272727]/50 hover:text-[#c2866b] transition-colors disabled:opacity-0"
          >
            {t('next')} →
          </button>
        </div>
      </div>
    </Shell>
  )
}

// ---------- Bloques ----------

function BlockView({
  block,
  value,
  onSave,
  t,
}: {
  block: Block
  value: Record<string, string>
  onSave: (id: string, v: string) => void
  t: (k: string, v?: Record<string, string | number>) => string
}) {
  switch (block.kind) {
    case 'reading':
      return (
        <div className="flex flex-col gap-4">
          {block.paras.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-[#272727]/80">
              {p}
            </p>
          ))}
        </div>
      )

    case 'quote':
      return (
        <div className="py-4 text-center">
          {block.lines.map((l, i) => (
            <p
              key={i}
              className="font-[family-name:var(--font-cormorant)] text-xl italic text-[#c2866b] leading-relaxed"
            >
              {l}
            </p>
          ))}
        </div>
      )

    case 'exercise':
      return (
        <div className="text-center pt-4">
          {block.label && (
            <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-1">{block.label}</p>
          )}
          <h3 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">
            {block.title}
          </h3>
        </div>
      )

    case 'tallernote':
      return (
        <div className="rounded-xl border border-[#c2866b]/30 bg-[#c2866b]/5 px-5 py-4">
          <p className="text-xs tracking-widest uppercase text-[#c2866b] mb-2">{block.title}</p>
          <p className="text-sm leading-relaxed text-[#272727]/80">{block.text}</p>
        </div>
      )

    case 'question':
      return (
        <div>
          {block.label && (
            <p className="text-xs tracking-widest uppercase text-[#272727]/40 mb-2">{block.label}</p>
          )}
          <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727] leading-snug">
            {block.prompt}
          </p>
          {block.hint && <p className="text-sm text-[#272727]/50 mt-1 mb-3">{block.hint}</p>}
          <AnswerField id={block.id} value={value[block.id] ?? ''} onSave={onSave} t={t} />
        </div>
      )

    case 'freewrite':
      return (
        <div>
          {block.title && (
            <p className="font-[family-name:var(--font-cormorant)] text-xl text-[#272727] mb-2">
              {block.title}
            </p>
          )}
          {block.prompt && (
            <p className="text-sm text-[#272727]/60 italic mb-3">{block.prompt}</p>
          )}
          <AnswerField id={block.id} value={value[block.id] ?? ''} onSave={onSave} t={t} rows={8} />
        </div>
      )

    case 'scale':
      return (
        <ScaleField
          id={block.id}
          statement={block.statement}
          value={value[block.id] ?? ''}
          onSave={onSave}
        />
      )
  }
}

function AnswerField({
  id,
  value,
  onSave,
  t,
  rows = 4,
}: {
  id: string
  value: string
  onSave: (id: string, v: string) => void
  t: (k: string, v?: Record<string, string | number>) => string
  rows?: number
}) {
  const [local, setLocal] = useState(value)
  const [saved, setSaved] = useState(false)

  return (
    <div className="mt-3">
      <textarea
        value={local}
        rows={rows}
        onChange={e => {
          setLocal(e.target.value)
          onSave(id, e.target.value)
          setSaved(false)
        }}
        onBlur={() => setSaved(true)}
        placeholder={t('write_here')}
        className="w-full resize-y rounded-lg border border-[#272727]/20 bg-white/50 p-3 text-sm leading-relaxed text-[#272727] outline-none placeholder:text-[#272727]/30 focus:border-[#c2866b] transition-colors"
      />
      <p className="h-4 text-right text-[10px] tracking-widest uppercase text-[#272727]/30">
        {saved && local ? t('saved') : ''}
      </p>
    </div>
  )
}

function ScaleField({
  id,
  statement,
  value,
  onSave,
}: {
  id: string
  statement: string
  value: string
  onSave: (id: string, v: string) => void
}) {
  return (
    <div>
      <p className="text-sm text-[#272727]/80 mb-2">{statement}</p>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map(n => (
          <button
            key={n}
            onClick={() => onSave(id, String(n))}
            className={`h-10 w-10 rounded-full border text-sm transition-colors ${
              value === String(n)
                ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
                : 'border-[#272727]/20 text-[#272727]/50 hover:border-[#c2866b]'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

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
