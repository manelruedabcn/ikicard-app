export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import TallerClient from './TallerClient'

export default async function TallerPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)
  if (!(await hasAccess('taller'))) redirect(`/${locale}/dashboard`)

  // Respuestas guardadas del usuario (privadas por RLS)
  const { data: rows } = await supabase
    .from('taller_answers')
    .select('block_id, value')
    .eq('user_id', user.id)

  const answers: Record<string, string> = {}
  for (const r of rows || []) answers[r.block_id] = r.value ?? ''

  return <TallerClient userId={user.id} locale={locale} answers={answers} />
}
