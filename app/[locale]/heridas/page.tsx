export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import HeridasClient from './HeridasClient'

export default async function HeridasPage({
  params: { locale },
  searchParams,
}: {
  params: { locale: string }
  searchParams: { volver?: string }
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect(`/${locale}/login`)
  if (!(await hasAccess('heridas'))) redirect(`/${locale}/dashboard`)

  // Resultado guardado del usuario (privado por RLS). Una fila por usuario.
  const { data: result } = await supabase
    .from('herida_results')
    .select('scores, sums, dominant, reflection')
    .eq('user_id', user.id)
    .maybeSingle()

  // Máscara dominante, si el usuario ya hizo /mascaras. Solo se usa para el
  // cruce (hipótesis herida × máscara), nunca como afirmación cerrada.
  const { data: mask } = await supabase
    .from('mask_results')
    .select('dominant')
    .eq('user_id', user.id)
    .maybeSingle()

  // Enlace de vuelta cuando la herramienta se invoca desde otra (solo rutas
  // internas), igual que /mascaras.
  const volver =
    searchParams.volver && searchParams.volver.startsWith('/') ? searchParams.volver : null

  return (
    <HeridasClient
      userId={user.id}
      locale={locale}
      volver={volver}
      maskDominant={mask?.dominant ?? null}
      initial={{
        scores: (result?.scores as Record<string, number>) ?? {},
        dominant: result?.dominant ?? null,
        reflection: (result?.reflection as Record<string, string>) ?? {},
      }}
    />
  )
}
