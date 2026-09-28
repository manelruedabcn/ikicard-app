export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import { tallerAbierto } from '@/lib/taller-acceso'
import MascarasClient from './MascarasClient'
import TallerCerrado from './TallerCerrado'

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

  // Acceso: quien tiene la herramienta concedida entra siempre. Durante la
  // ventana del taller (QR fijo) entra cualquiera con cuenta; sin cuenta, se
  // le manda a entrar y vuelve aquí. Fuera de la ventana, aviso de taller.
  const concedida = user ? await hasAccess('mascaras') : false
  if (!concedida) {
    if (!tallerAbierto('mascaras')) return <TallerCerrado locale={locale} />
    if (!user) redirect(`/${locale}/login?next=${encodeURIComponent(`/${locale}/mascaras`)}`)
  }
  if (!user) redirect(`/${locale}/login`)

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
