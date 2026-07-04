export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('dashboard')

  const modes = [
    { title: 'ORÁCULO', desc: t('oraculo_desc'), href: `/${locale}/oraculo`, enabled: true },
    { title: 'VIAJE', desc: t('viaje_desc'), href: `/${locale}/viaje`, enabled: true },
    { title: 'CÍRCULO', desc: t('circulo_desc'), href: `/${locale}/circulo`, enabled: false },
  ]

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-12">
      <h1 className="font-[family-name:var(--font-cormorant)] text-3xl text-center text-[#272727] mb-12">
        {t('title')}
      </h1>

      <div className="w-full max-w-sm flex flex-col gap-5">
        {modes.map(mode => {
          const inner = (
            <>
              <p className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.2em] text-[#272727]">
                {mode.title}
              </p>
              <p className="text-sm text-[#272727]/60 mt-2">{mode.desc}</p>
            </>
          )

          return mode.enabled ? (
            <Link
              key={mode.title}
              href={mode.href}
              className="block border border-[#272727]/15 rounded-xl px-6 py-8 text-center hover:border-[#c2866b] transition-colors"
            >
              {inner}
            </Link>
          ) : (
            <div
              key={mode.title}
              className="block border border-[#272727]/15 rounded-xl px-6 py-8 text-center opacity-40 cursor-not-allowed"
            >
              {inner}
            </div>
          )
        })}
      </div>
    </div>
  )
}
