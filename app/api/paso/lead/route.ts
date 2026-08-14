import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PASO_PATRONES } from '@/lib/paso-content'
import { sendLeadWelcomeEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'

export const dynamic = 'force-dynamic'

// Captura el email al terminar el test PASO (lead magnet), con o sin cuenta.
// Single opt-in: exige consentimiento explícito del checkbox. Guarda email +
// forma PASO para segmentar el email marketing (herramientas de IKIGAIER).
// El user_id se toma de la SESIÓN (no del body), así queda enlazado si está
// logueado. Upsert por email para no duplicar si repite el test.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const emailRaw = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const codigo = typeof body?.codigo === 'string' ? body.codigo : null
  const locale = body?.locale === 'en' ? 'en' : 'es'
  const consent = body?.consent === true

  if (!EMAIL_RE.test(emailRaw)) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400 })
  }
  // Sin consentimiento no hay base legal para el envío: no se guarda.
  if (!consent) {
    return NextResponse.json({ ok: false, error: 'consent required' }, { status: 400 })
  }
  // El código es opcional, pero si viene, debe ser un patrón real.
  if (codigo && !PASO_PATRONES.some(p => p.codigo === codigo)) {
    return NextResponse.json({ ok: false, error: 'bad pattern' }, { status: 400 })
  }

  // user_id desde la sesión (cookie), no desde el body.
  let userId: string | null = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    // sin sesión válida → lead anónimo
  }

  const admin = createAdminClient()
  const { data: lead, error } = await admin
    .from('paso_leads')
    .upsert(
      { email: emailRaw, user_id: userId, codigo_patron: codigo, locale, source: 'paso', consent: true },
      { onConflict: 'email' },
    )
    .select('id, unsubscribed_at')
    .single()

  if (error) {
    console.error('[paso lead] upsert error:', error.message)
    return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500 })
  }

  // Bienvenida inmediata solo si no se ha dado de baja antes. No bloquea la
  // respuesta: si Resend falla, el lead ya quedó guardado.
  if (lead && !lead.unsubscribed_at) {
    sendLeadWelcomeEmail(emailRaw, locale, unsubUrl(`lead:${lead.id}`, locale)).catch(err => {
      console.error('[paso lead] welcome email error:', err)
    })
  }

  return NextResponse.json({ ok: true })
}
