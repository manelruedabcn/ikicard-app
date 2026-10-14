export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getProgramaTexts } from '@/lib/programa-content'
import { INSCRIPCION_COLS, panelDelPrograma, type Inscripcion } from '@/lib/programa-server'
import MesClient from './MesClient'

// El programa «Un mes conociendo tu ikigai» dentro del panel: calendario de
// las cuatro semanas, el contenido de cada una (el mismo de los correos) y
// su libreta. La inscripción y las respuestas se leen con la sesión de la
// persona: las políticas de RLS solo le dejan ver las suyas.
export function generateMetadata({ params: { locale } }: { params: { locale: string } }): Metadata {
  return { title: `${getProgramaTexts(locale).panel.title} · IKIGAIER`, robots: { index: false } }
}

export default async function MesPage({ params: { locale } }: { params: { locale: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/mes`)}`)

  const { data: insc } = await supabase
    .from('programa_inscripciones')
    .select(INSCRIPCION_COLS)
    .in('status', ['activa', 'completada'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!insc) return <MesClient locale={locale} userId={user.id} panel={null} />

  const inscripcion = insc as Inscripcion
  const { items, today, checkins } = await panelDelPrograma(inscripcion)
  const { data: resp } = await supabase
    .from('programa_respuestas')
    .select('campo, texto')
    .eq('inscripcion_id', inscripcion.id)

  return (
    <MesClient
      locale={locale}
      userId={user.id}
      panel={{
        inscripcionId: inscripcion.id,
        startDate: inscripcion.start_date,
        tieneTest: Boolean(inscripcion.first_answers),
        testUrl: `/${locale}/inventario?prog=${inscripcion.token}`,
        items,
        today,
        checkins,
        respuestas: Object.fromEntries((resp || []).map(r => [r.campo, r.texto as string])),
      }}
    />
  )
}
