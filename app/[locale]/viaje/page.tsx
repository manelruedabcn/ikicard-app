export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ViajeClient from './ViajeClient'

export default async function ViajePage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  // Sesión de viaje activa (o pausada) más reciente
  const { data: session } = await supabase
    .from('journey_sessions')
    .select('id, started_at, current_day, status, language')
    .eq('user_id', user.id)
    .in('status', ['active', 'paused'])
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  let cards: { day: number; slot: string; card_code: string; sello: string | null; answered_at: string | null }[] = []
  let gifts: { phase: string; gift_text: string }[] = []

  if (session) {
    const { data: cardsData } = await supabase
      .from('journey_cards')
      .select('day, slot, card_code, sello, answered_at')
      .eq('session_id', session.id)
      .order('day', { ascending: true })
    cards = cardsData || []

    const { data: giftsData } = await supabase
      .from('journey_gifts')
      .select('phase, gift_text')
      .eq('session_id', session.id)
    gifts = giftsData || []
  }

  return (
    <ViajeClient
      userId={user.id}
      locale={locale}
      session={session}
      cards={cards}
      gifts={gifts}
    />
  )
}
