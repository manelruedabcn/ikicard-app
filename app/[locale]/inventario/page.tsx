export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import InventarioClient from './InventarioClient'

// El Inventario honesto es una puerta de entrada GRATUITA: funciona sin cuenta.
// El origen (?src=blog, libro, taller…) viaja hasta el lead para saber qué
// canal trae a quién. utm_source se acepta como alternativa.
// SEO: la página que debe posicionar «test de ikigai» es la de la web
// (www.ikigaier.com/es/test-de-ikigai/), que enlaza aquí. Esta no se indexa
// para no competir con ella; los enlaces sí se siguen.
export const metadata: Metadata = {
  robots: { index: false, follow: true },
  title: 'Test de ikigai gratuito: Inventario honesto de tu ikigai | IKIGAIER',
  description:
    'Test de ikigai gratuito y sin registro: quince preguntas sobre lo que haces y cómo lo vives, con una devolución personal al instante. Basado en «El Ikigai que no te contaron», de Manel Rueda.',
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
