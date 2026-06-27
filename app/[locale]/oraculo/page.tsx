export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import OraculoClient from './OraculoClient'

export default async function OraculoPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)

  // Cartas jugadas hoy
  const today = new Date().toISOString().split('T')[0]
  const { data: todaySessions } = await supabase
    .from('oracle_sessions')
    .select('card_code, sello, played_at')
    .eq('user_id', user.id)
    .gte('played_at', `${today}T00:00:00`)
    .lte('played_at', `${today}T23:59:59`)
    .order('played_at', { ascending: false })

  // Historial últimas 7 cartas (excluyendo hoy)
  const { data: history } = await supabase
    .from('oracle_sessions')
    .select('card_code, sello, played_at')
    .eq('user_id', user.id)
    .lt('played_at', `${today}T00:00:00`)
    .order('played_at', { ascending: false })
    .limit(7)

  // Todas las cartas jugadas alguna vez
  const { data: allPlayed } = await supabase
    .from('oracle_sessions')
    .select('card_code')
    .eq('user_id', user.id)

  return (
    <OraculoClient
      userId={user.id}
      locale={locale}
      todaySessions={todaySessions || []}
      history={history || []}
      allPlayedCodes={(allPlayed || []).map(s => s.card_code)}
    />
  )
}
