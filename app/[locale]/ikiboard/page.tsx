export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import IkiboardClient from './IkiboardClient'

export default async function IkiboardPage({
  params: { locale },
}: {
  params: { locale: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)
  if (!(await hasAccess('ikiboard'))) redirect(`/${locale}/dashboard`)

  // El tablero del usuario (privado por RLS). Una fila por persona.
  const { data: board } = await supabase
    .from('ikiboard')
    .select('content, last_reviewed_at')
    .eq('user_id', user.id)
    .maybeSingle()

  // El "freno" (paso 5) y su semilla para el paso 6 viven en la
  // herramienta de máscaras. Se leen aquí para tejerlas en el recorrido;
  // si la persona aún no la ha hecho, vienen vacíos.
  const { data: mask } = await supabase
    .from('mask_results')
    .select('dominant, reflection')
    .eq('user_id', user.id)
    .maybeSingle()

  const reflection = (mask?.reflection as Record<string, string>) ?? {}

  // Los otros dos instrumentos del cruce (Estrellas + CAMINO). Alimentan
  // el borrador determinista y la zona Vocación. Si aún no se han hecho,
  // vienen null y el recorrido invita a hacerlos. Privados por RLS.
  // Se piden también las puntuaciones (no solo la dominante): el asistente
  // de icono de Vocación las necesita para detectar empates entre estrellas.
  const { data: estrella } = await supabase
    .from('estrella_results')
    .select('scores, dominant')
    .eq('user_id', user.id)
    .maybeSingle()

  const { data: camino } = await supabase
    .from('camino_results')
    .select('dominant')
    .eq('user_id', user.id)
    .maybeSingle()

  // PASO guarda un intento por realización. Reutilizamos siempre el último:
  // si la persona ya lo hizo, IKIBOARD no vuelve a pedírselo.
  const { data: paso } = await supabase
    .from('paso_results')
    .select('codigo_patron, mascara_p, mascara_a, mascara_s, mascara_o, natural_p, natural_a, natural_s, natural_o, score_p, score_a, score_s, score_o, punto_ciego, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  // Los deseos del tablero (Fase 2). Privados por RLS.
  const { data: items } = await supabase
    .from('ikiboard_items')
    .select('id, ambito, tipo, ref, frase, doy, estado, is_priority, state_changed_at, sort_order')
    .eq('user_id', user.id)
    .order('sort_order', { ascending: true })

  return (
    <IkiboardClient
      userId={user.id}
      locale={locale}
      initial={{
        content: (board?.content as Record<string, string>) ?? {},
        lastReviewedAt: board?.last_reviewed_at ?? null,
        maskDominant: mask?.dominant ?? null,
        maskPaso: reflection.mask_paso ?? null,
        estrellaDominant: estrella?.dominant ?? null,
        estrellaScores: (estrella?.scores as Record<string, number>) ?? null,
        caminoDominant: camino?.dominant ?? null,
        pasoResult: paso ?? null,
        items: items ?? [],
      }}
    />
  )
}
