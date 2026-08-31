export const dynamic = 'force-dynamic'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { hasAccess } from '@/lib/entitlements'
import PainsClient from './PainsClient'

export default async function PainsPage({
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
  if (!(await hasAccess('pains'))) redirect(`/${locale}/dashboard`)

  // Resultado guardado del usuario (privado por RLS). Una fila por usuario.
  const { data: result } = await supabase
    .from('pain_results')
    .select('answers, scores, case_kind, dominant, second, reflection, updated_at')
    .eq('user_id', user.id)
    .maybeSingle()

  // Enlace de vuelta cuando se invoca desde otra herramienta
  // (p. ej. IKIBOARD: /pains?volver=/ikiboard). Solo rutas internas.
  const volver =
    searchParams.volver && searchParams.volver.startsWith('/') ? searchParams.volver : null

  return (
    <PainsClient
      userId={user.id}
      locale={locale}
      volver={volver}
      initial={{
        answers: (result?.answers as Record<string, number[]>) ?? {},
        scores: (result?.scores as Record<string, number>) ?? {},
        caseKind: (result?.case_kind as string | null) ?? null,
        dominant: result?.dominant ?? null,
        second: result?.second ?? null,
        reflection: (result?.reflection as Record<string, string>) ?? {},
        updatedAt: result?.updated_at ?? null,
      }}
    />
  )
}
