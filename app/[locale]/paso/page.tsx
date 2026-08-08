export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import PasoClient from './PasoClient'

// PASO es la puerta de entrada GRATUITA: funciona sin cuenta.
// Si hay sesión, el resultado se guarda; si no, se muestra igual.
export default async function PasoPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return <PasoClient locale={locale} userId={user?.id ?? null} />
}
