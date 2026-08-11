export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'

export default async function MapaPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const t = await getTranslations('viaje')

  const { data: session } = await supabase
    .from('journey_sessions')
    .select('id')
    .eq('user_id', user.id)
    .in('status', ['active', 'paused', 'completed'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let cards: { day: number; sello: string | null }[] = []
  if (session) {
    const { data } = await supabase
      .from('journey_cards')
      .select('day, sello')
      .eq('session_id', session.id)
    cards = data || []
  }

  // Un sello representativo por día (el primero respondido)
  const selloByDay: Record<number, string> = {}
  for (const c of cards) {
    if (c.sello && !selloByDay[c.day]) selloByDay[c.day] = c.sello
  }

  const days = Array.from({ length: 20 }, (_, i) => i + 1)

  return (
    <div className="min-h-screen flex flex-col items-center bg-[#FDFBF7] px-4 py-8">
      <div className="w-full max-w-md flex items-center justify-between mb-8">
        <Link
          href={`/${locale}/viaje`}
          className="text-xs text-[#272727]/40 hover:text-[#c2866b] transition-colors tracking-wide"
        >
          ← {t('map_back')}
        </Link>
      </div>

      <h2 className="font-[family-name:var(--font-cormorant)] text-2xl text-[#272727] mb-8">
        {t('map_title')}
      </h2>

      <div className="grid grid-cols-3 gap-3 w-full max-w-md">
        {days.map(day => {
          const sello = selloByDay[day]
          return (
            <div
              key={day}
              className={`aspect-square rounded-lg border flex flex-col items-center justify-center p-2 text-center ${
                sello ? 'border-[#c2866b]/40 bg-[#c2866b]/5' : 'border-[#272727]/10'
              }`}
            >
              <span className="text-[10px] text-[#272727]/30 tracking-widest">{day}</span>
              {sello && (
                <span className="font-[family-name:var(--font-cormorant)] text-sm text-[#c2866b] mt-1 leading-tight break-words">
                  {sello}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
