import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sendEnrollmentEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'

// Envía el email de bienvenida al comenzar el Viaje.
// Se llama desde el cliente justo después de crear la sesión.
export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}))
  // Solo idiomas soportados; cualquier otra cosa cae a 'es'.
  const locale = body?.locale === 'en' ? 'en' : 'es'

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user?.email) return NextResponse.json({ ok: false }, { status: 401 })

  // Respeta la baja voluntaria.
  const { data: profile } = await supabase
    .from('profiles')
    .select('notify_opt_out')
    .eq('id', user.id)
    .single()
  if (profile?.notify_opt_out) return NextResponse.json({ ok: true, skipped: true })

  try {
    await sendEnrollmentEmail(user.email, locale, unsubUrl(user.id, locale))
  } catch (e) {
    // No bloquear el Viaje si el email falla.
    console.error('enrollment email failed', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
