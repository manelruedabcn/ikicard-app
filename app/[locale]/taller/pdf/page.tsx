export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import { TALLER_CONTENT, type Block } from '@/lib/taller-content'
import PrintButton from './PrintButton'

export default async function TallerPdfPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)
  if (!(await hasAccess('taller'))) redirect(`/${locale}/dashboard`)

  const t = await getTranslations('taller')

  const { data: rows } = await supabase
    .from('taller_answers')
    .select('block_id, value')
    .eq('user_id', user.id)

  const answers: Record<string, string> = {}
  for (const r of rows || []) answers[r.block_id] = r.value ?? ''

  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()
  const name = profile?.display_name || user.email?.split('@')[0] || ''

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-6 py-10 print:bg-white print:p-0">
      {/* Reglas de impresión */}
      <style>{`
        @page { margin: 18mm 16mm; }
        @media print {
          .pdf-section { break-before: page; }
          .pdf-section:first-of-type { break-before: auto; }
          .pdf-block { break-inside: avoid; }
        }
      `}</style>

      {/* Barra superior (no se imprime) */}
      <div className="mx-auto mb-10 flex max-w-2xl items-center justify-between print:hidden">
        <Link
          href={`/${locale}/taller`}
          className="text-xs tracking-wide text-[#272727]/40 hover:text-[#c2866b] transition-colors"
        >
          ← {t('back_to_taller')}
        </Link>
        <PrintButton label={t('print')} />
      </div>

      <article className="mx-auto max-w-2xl text-[#272727]">
        {/* Portada */}
        <header className="mb-16 text-center">
          <p className="mb-4 text-sm tracking-[0.3em] uppercase text-[#c2866b]">━ ✦ ━</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-4xl font-light">
            Camina sin separarte de ti
          </h1>
          <p className="mt-2 text-sm text-[#272727]/60">Cuaderno de trabajo</p>
          {name && <p className="mt-8 font-[family-name:var(--font-cormorant)] text-xl">{name}</p>}
        </header>

        {TALLER_CONTENT.map(section => (
          <section key={section.id} className="pdf-section mb-12">
            <div className="mb-10 text-center">
              {section.label && (
                <p className="mb-1 text-xs tracking-[0.3em] uppercase text-[#c2866b]">
                  {section.label}
                </p>
              )}
              <h2 className="font-[family-name:var(--font-cormorant)] text-3xl">{section.title}</h2>
            </div>
            <div className="flex flex-col gap-6">
              {section.blocks.map((b, i) => (
                <PdfBlock key={i} block={b} answers={answers} />
              ))}
            </div>
          </section>
        ))}
      </article>
    </div>
  )
}

function AnswerBox({ value }: { value: string }) {
  if (value.trim()) {
    return (
      <p className="mt-2 whitespace-pre-wrap rounded-lg border border-[#272727]/15 bg-white p-3 text-sm leading-relaxed text-[#272727] print:border-[#272727]/25">
        {value}
      </p>
    )
  }
  // Sin respuesta: espacio en blanco para escribir a mano
  return (
    <div className="mt-2 space-y-4 pt-1">
      {[0, 1, 2].map(n => (
        <div key={n} className="border-b border-[#272727]/20" />
      ))}
    </div>
  )
}

function PdfBlock({ block, answers }: { block: Block; answers: Record<string, string> }) {
  switch (block.kind) {
    case 'reading':
      return (
        <div className="pdf-block flex flex-col gap-3">
          {block.paras.map((p, i) => (
            <p key={i} className="text-sm leading-relaxed text-[#272727]/80">
              {p}
            </p>
          ))}
        </div>
      )

    case 'quote':
      return (
        <div className="pdf-block py-2 text-center">
          {block.lines.map((l, i) => (
            <p
              key={i}
              className="font-[family-name:var(--font-cormorant)] text-lg italic text-[#c2866b]"
            >
              {l}
            </p>
          ))}
        </div>
      )

    case 'exercise':
      return (
        <div className="pdf-block pt-2 text-center">
          {block.label && (
            <p className="mb-1 text-xs tracking-[0.3em] uppercase text-[#c2866b]">{block.label}</p>
          )}
          <h3 className="font-[family-name:var(--font-cormorant)] text-2xl">{block.title}</h3>
        </div>
      )

    case 'tallernote':
      return (
        <div className="pdf-block rounded-lg border border-[#c2866b]/30 px-4 py-3">
          <p className="mb-1 text-xs tracking-widest uppercase text-[#c2866b]">{block.title}</p>
          <p className="text-sm leading-relaxed text-[#272727]/80">{block.text}</p>
        </div>
      )

    case 'question':
      return (
        <div className="pdf-block">
          {block.label && (
            <p className="mb-1 text-xs tracking-widest uppercase text-[#272727]/40">{block.label}</p>
          )}
          <p className="font-[family-name:var(--font-cormorant)] text-xl leading-snug">
            {block.prompt}
          </p>
          {block.hint && <p className="mt-1 text-sm text-[#272727]/50">{block.hint}</p>}
          <AnswerBox value={answers[block.id] ?? ''} />
        </div>
      )

    case 'freewrite':
      return (
        <div className="pdf-block">
          {block.title && (
            <p className="font-[family-name:var(--font-cormorant)] text-xl">{block.title}</p>
          )}
          {block.prompt && <p className="mt-1 text-sm italic text-[#272727]/60">{block.prompt}</p>}
          <AnswerBox value={answers[block.id] ?? ''} />
        </div>
      )

    case 'scale': {
      const v = answers[block.id] ?? ''
      return (
        <div className="pdf-block">
          <p className="text-sm text-[#272727]/80">{block.statement}</p>
          <div className="mt-2 flex gap-2">
            {[1, 2, 3, 4, 5].map(n => (
              <span
                key={n}
                className={`flex h-8 w-8 items-center justify-center rounded-full border text-sm ${
                  v === String(n)
                    ? 'border-[#c2866b] bg-[#c2866b] text-[#FDFBF7]'
                    : 'border-[#272727]/25 text-[#272727]/50'
                }`}
              >
                {n}
              </span>
            ))}
          </div>
        </div>
      )
    }
  }
}
