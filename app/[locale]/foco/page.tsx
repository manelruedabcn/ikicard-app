export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getFocoCopy } from '@/lib/foco-content'
import { isCompleteFoco } from '@/lib/foco'
import FocoClient from './FocoClient'

// El test FOCO es una puerta de entrada GRATUITA, como PASO: funciona sin
// cuenta. Con sesión, el resultado se guarda en foco_results (RLS) y se
// muestra el último al volver. No se indexa: la página que posiciona es
// la de la web, que enlaza aquí.
export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const copy = getFocoCopy(locale)
  return {
    robots: { index: false, follow: true },
    title: `${copy.title[0]} ${copy.title[1]} · Test FOCO · IKIGAIER`,
    description: copy.lead,
  }
}

export default async function FocoPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let previous: number[] | null = null
  if (user) {
    const { data } = await supabase
      .from('foco_results')
      .select('answers')
      .eq('user_id', user.id)
      .maybeSingle()
    if (isCompleteFoco(data?.answers)) previous = data!.answers as number[]
  }

  return <FocoClient locale={locale} userId={user?.id ?? null} previous={previous} />
}
