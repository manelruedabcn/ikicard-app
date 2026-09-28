export const dynamic = 'force-dynamic'

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
  // ventana del taller (QR fijo) entra cualquiera, también sin cuenta: en ese
  // caso hace el test sin login y no se guarda (se lo lleva en PDF). Fuera de
  // la ventana, aviso de ir al próximo taller.
  const concedida = user ? await hasAccess('mascaras') : false
  if (!concedida && !tallerAbierto('mascaras')) return <TallerCerrado locale={locale} />

  const volverSinCuenta =
    searchParams.volver && searchParams.volver.startsWith('/') ? searchParams.volver : null
  if (!user) {
    return (
      <MascarasClient
        userId={null}
        locale={locale}
        volver={volverSinCuenta}
        initial={{ scores: {}, dominant: null, top3: [], fear: null, reflection: {} }}
      />
    )
  }

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
