import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { PASO_PATRONES } from '@/lib/paso-content'
import { sendResultEmail, sendLeadWelcomeEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'

export const dynamic = 'force-dynamic'

// Captura el email al terminar el test PASO (lead magnet), con o sin cuenta.
// Dos permisos SEPARADOS:
//   · Transaccional: la persona pide su resultado → siempre le enviamos el
//     enlace a su forma (no requiere consent, lo pidió).
//   · Marketing: consent=true (checkbox) → además, bienvenida con la promesa
//     de las herramientas de IKIGAIER. Sin consent NO se hace marketing.
// El código es obligatorio (el email de resultado lo necesita). El user_id se
// toma de la SESIÓN (no del body). Upsert por email para no duplicar.
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
  // El resultado se envía por código de forma: debe ser un patrón real.
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
    // sin sesión válida → lead anónimo
  }

  const admin = createAdminClient()
  const { data: lead, error } = await admin
    .from('paso_leads')
    .upsert(
      { email: emailRaw, user_id: userId, codigo_patron: codigo, locale, source: 'paso', consent },
      { onConflict: 'email' },
    )
    .select('id, unsubscribed_at')
    .single()

  if (error) {
    console.error('[paso lead] upsert error:', error.message)
    return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500 })
  }

  // Envío transaccional: la persona pidió su resultado, siempre se lo mandamos.
  // No bloquea la respuesta: si Resend falla, el lead ya quedó guardado.
  sendResultEmail(emailRaw, locale, codigo).catch(err => {
    console.error('[paso lead] result email error:', err)
  })

  // Marketing: solo con consentimiento explícito y sin baja previa.
  if (consent && lead && !lead.unsubscribed_at) {
    sendLeadWelcomeEmail(emailRaw, locale, unsubUrl(`lead:${lead.id}`, locale)).catch(err => {
      console.error('[paso lead] welcome email error:', err)
    })
  }

  return NextResponse.json({ ok: true })
}
