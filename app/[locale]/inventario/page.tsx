export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getInvCopy } from '@/lib/inventario-content'
import InventarioClient from './InventarioClient'

// El Inventario honesto es una puerta de entrada GRATUITA: funciona sin cuenta.
// El origen (?src=blog, libro, taller…) viaja hasta el lead para saber qué
// canal trae a quién. utm_source se acepta como alternativa.
// SEO: la página que debe posicionar «test de ikigai» es la de la web
// (www.ikigaier.com/<idioma>/…), que enlaza aquí. Esta no se indexa para no
// competir con ella; los enlaces sí se siguen.
export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const copy = getInvCopy(locale)
  return {
    robots: { index: false, follow: true },
    title: `${copy.title} · IKIGAIER`,
    description: copy.lead,
  }
}

export default async function InventarioPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams?: { src?: string; utm_source?: string }
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const source = searchParams?.src || searchParams?.utm_source || null

  return <InventarioClient locale={locale} userId={user?.id ?? null} source={source} />
}
