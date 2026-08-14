import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PASO_PATRONES } from '@/lib/paso-content'

export const dynamic = 'force-dynamic'

// Registra un test PASO COMPLETADO para métricas del lead magnet, tenga cuenta
// o no. El user_id se toma de la SESIÓN del servidor (no del cliente), así no
// se puede falsear: null = anónimo. Inserta en paso_attempts con service_role.
// No guarda respuestas ni PII, solo el pulso del funnel.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const codigo = typeof body?.codigo === 'string' ? body.codigo : null
  const locale = body?.locale === 'en' ? 'en' : 'es'

  // Validar el patrón contra la lista real: evita basura en la tabla.
  if (!codigo || !PASO_PATRONES.some(p => p.codigo === codigo)) {
    return NextResponse.json({ ok: false, error: 'bad pattern' }, { status: 400 })
  }

  // user_id desde la sesión (cookie), no desde el body.
  let userId: string | null = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    // sin sesión válida → anónimo
  }

  const admin = createAdminClient()
  const { error } = await admin
    .from('paso_attempts')
    .insert({ user_id: userId, codigo_patron: codigo, locale })

  if (error) {
    console.error('[paso track] insert error:', error.message)
    return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, anon: userId === null })
}
