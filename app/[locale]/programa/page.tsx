export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { getProgramaTexts } from '@/lib/programa-content'
import ProgramaClient from './ProgramaClient'

// Página del programa gratuito «Un mes conociendo tu ikigai»: la segunda
// entrada, para quien llega desde redes, un taller o la newsletter y quiere
// apuntarse directamente. La primera tarea del programa es hacer el test.
// El origen (?src=instagram, taller…) viaja hasta el lead.
export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  const t = getProgramaTexts(locale).landing
  return {
    title: t.metaTitle,
    description: t.metaDescription,
    alternates: {
      canonical: `https://app.ikigaier.com/${locale}/programa`,
      languages: {
        es: 'https://app.ikigaier.com/es/programa',
        ca: 'https://app.ikigaier.com/ca/programa',
        en: 'https://app.ikigaier.com/en/programa',
      },
    },
    openGraph: { title: t.metaTitle, description: t.metaDescription, type: 'website' },
  }
}

export default async function ProgramaPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams?: { src?: string; utm_source?: string }
}) {
  const source = searchParams?.src || searchParams?.utm_source || null
  // Para hacer el programa hace falta cuenta: con sesión, el botón inscribe
  // directamente; sin ella, pasa por crear cuenta o entrar.
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return <ProgramaClient locale={locale} source={source} logged={Boolean(user)} />
}
