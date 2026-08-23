export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import CaminoClient from './CaminoClient'

export default async function CaminoPage({
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
  if (!(await hasAccess('camino'))) redirect(`/${locale}/dashboard`)

  // Resultado guardado del usuario (privado por RLS). Una fila por usuario.
  const { data: result } = await supabase
    .from('camino_results')
    .select('scores, dominant')
    .eq('user_id', user.id)
    .maybeSingle()

  // Enlace de vuelta cuando el test se invoca desde otra herramienta
  // (p. ej. IKIBOARD: /camino?volver=/ikiboard). Solo rutas internas.
  const volver =
    searchParams.volver && searchParams.volver.startsWith('/') ? searchParams.volver : null

  return (
    <CaminoClient
      userId={user.id}
      locale={locale}
      volver={volver}
      initial={{
        scores: (result?.scores as Record<string, number>) ?? {},
        dominant: result?.dominant ?? null,
      }}
    />
  )
}
