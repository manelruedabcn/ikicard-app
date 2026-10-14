'use client'

import Link from 'next/link'
import { trackEvent } from '@/lib/analytics'
import { getProgramaTexts } from '@/lib/programa-content'


export default function ProgramaClient({ locale, source, logged }: { locale: string; source: string | null; logged: boolean }) {
  const t = getProgramaTexts(locale)
  const l = t.landing
  const web = `https://www.ikigaier.com/${locale === 'ca' || locale === 'en' ? locale : 'es'}/`

  return (
    <div className="min-h-screen bg-[#FDFBF7] px-4 py-8">
      <div className="mx-auto w-full max-w-xl">
        <a href={web} className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-[0.3em]">
          IKIGAIER
        </a>

        <header className="mt-10 sm:mt-14">
          <p className="text-xs tracking-[0.3em] uppercase text-[#c2866b] mb-5">{l.eyebrow}</p>
          <h1 className="font-[family-name:var(--font-cormorant)] text-5xl sm:text-6xl leading-[1.02] text-[#272727] mb-5">{l.title}</h1>
          <p className="font-[family-name:var(--font-cormorant)] italic text-2xl leading-snug text-[#272727]/80 max-w-md">{l.lead}</p>
        </header>

        <div className="mt-10">
          <Form locale={locale} logged={logged} id="form-top" />
        </div>

        <section className="mt-14 space-y-4">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{l.howTitle}</h2>
          <ol className="space-y-3 border-l border-[#c2866b]/40 pl-5">
            {[t.semanas.antes, ...t.semanas.lista].map(w => {
              const [head, ...rest] = w.split(' · ')
              return (
                <li key={w}>
                  <p className="text-[11px] tracking-[0.2em] uppercase text-[#c2866b]">{head}</p>
                  <p className="text-[15px] leading-relaxed text-[#272727]/80">{rest.join(' · ')}</p>
                </li>
              )
            })}
          </ol>
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{l.needTitle}</h2>
          <ul className="space-y-2 text-[15px] leading-relaxed text-[#272727]/75">
            {l.need.map(n => <li key={n}>{n}</li>)}
          </ul>
        </section>

        <section className="mt-12 space-y-3">
          <h2 className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">{l.whoTitle}</h2>
          <p className="text-[15px] leading-relaxed text-[#272727]/75">{l.who}</p>
        </section>

        <div className="mt-12">
          <Form locale={locale} logged={logged} id="form-bottom" />
        </div>

        <p className="mt-8 pb-10 text-sm text-[#272727]/55">
          {l.testFirst}{' '}
          <Link href={`/${locale}/inventario${source ? `?src=${encodeURIComponent(source)}` : ''}`} className="underline underline-offset-4 hover:text-[#c2866b]">
            {l.testLink}
          </Link>
        </p>
      </div>
    </div>
  )
}

// Para hacer el programa hace falta cuenta (con Google, un clic). El botón
// lleva a /programa/empezar, que pide entrar o registrarse si hace falta.
function Form({ locale, logged, id }: { locale: string; logged: boolean; id: string }) {
  const t = getProgramaTexts(locale)
  return (
    <div id={id} className="rounded-xl border border-[#c2866b]/40 bg-[#c2866b]/[0.06] px-5 py-6 sm:px-7 space-y-4">
      <p className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727]">{t.landing.formTitle}</p>
      <Link
        href={`/${locale}/programa/empezar`}
        onClick={() => trackEvent('programa_empezar', { origen: 'pagina', logged })}
        className="inline-block px-6 py-3 bg-[#272727] text-[#FDFBF7] text-xs tracking-widest hover:bg-[#c2866b] transition-colors"
      >
        {logged ? t.cuenta.logged : t.cuenta.button}
      </Link>
      {!logged && <p className="text-xs leading-relaxed text-[#272727]/55">{t.cuenta.nota}</p>}
    </div>
  )
}
