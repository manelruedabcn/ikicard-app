export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import MascarasClient from './MascarasClient'

export default async function MascarasPage({
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
  if (!(await hasAccess('mascaras'))) redirect(`/${locale}/dashboard`)

  // Resultado guardado del usuario (privado por RLS). Una fila por usuario.
  const { data: result } = await supabase
    .from('mask_results')
    .select('scores, dominant, top3, fear, reflection')
    .eq('user_id', user.id)
    .maybeSingle()

  // Enlace de vuelta cuando la brújula se invoca desde otra herramienta
  // (p. ej. IKIBOARD: /mascaras?volver=/ikiboard). Solo rutas internas.
  const volver =
    searchParams.volver && searchParams.volver.startsWith('/') ? searchParams.volver : null

  return (
    <MascarasClient
      userId={user.id}
      locale={locale}
      volver={volver}
      initial={{
        scores: (result?.scores as Record<string, number>) ?? {},
        dominant: result?.dominant ?? null,
        top3: (result?.top3 as string[]) ?? [],
        fear: result?.fear ?? null,
        reflection: (result?.reflection as Record<string, string>) ?? {},
      }}
    />
  )
}
