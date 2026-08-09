export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { getMyTools } from '@/lib/entitlements'
import PasoResultSync from './PasoResultSync'

export default async function DashboardPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('dashboard')

  // Nombre para el saludo (perfil → email como reserva)
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name')
    .eq('id', user.id)
    .maybeSingle()
  const name = profile?.display_name || user.email?.split('@')[0] || ''

  // Herramientas desbloqueadas (dinámico, según permisos)
  const tools = await getMyTools()

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-16">
      <PasoResultSync userId={user.id} />
      <div className="w-full max-w-sm">
        <div className="mb-12">
          <p className="font-[family-name:var(--font-cormorant)] text-3xl text-[#272727]">
            {t('greeting', { name })}
          </p>
          <p className="text-[#272727]/60 mt-1">{t('welcome_back')}</p>
          {tools.length > 0 && (
            <p className="text-[#272727]/60 mt-4 text-sm">{t('prepared')}</p>
          )}
        </div>

        {tools.length === 0 ? (
          <p className="text-center text-sm text-[#272727]/50 mt-16">{t('empty')}</p>
        ) : (
          <div className="flex flex-col gap-5">
            {tools.map(tool => (
              <Link
                key={tool.id}
                href={`/${locale}${tool.route ?? ''}`}
                className="block border border-[#272727]/15 rounded-xl px-6 py-8 text-center hover:border-[#c2866b] transition-colors"
              >
                <p className="font-[family-name:var(--font-cormorant)] text-2xl tracking-[0.2em] text-[#272727]">
                  {tool.name.toUpperCase()}
                </p>
                {tool.description && (
                  <p className="text-sm text-[#272727]/60 mt-2">{tool.description}</p>
                )}
                {tool.expires_at && (
                  <p className="text-xs text-[#c2866b] mt-3">
                    {t('expires', { date: new Date(tool.expires_at).toLocaleDateString(locale) })}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
