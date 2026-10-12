import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanTexto, parseInvAnswers } from '@/lib/inventario'
import { buildDevolucion } from '@/lib/inventario-content'
import { invLocale, invSource, invUuid, sessionUserId } from '@/lib/inventario-server'
import { sendInventarioEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'
import { syncCrmContact } from '@/lib/crm-sync'

export const dynamic = 'force-dynamic'

// Captura el email al terminar el Inventario honesto, con o sin cuenta.
// Dos permisos SEPARADOS, como en PASO:
//   · Transaccional: la persona pide su devolución → siempre se la enviamos.
//   · Marketing: consent=true (checkbox aparte). Sin él no hay marketing.
// La devolución se RECALCULA aquí con las mismas reglas que la página: el
// servidor no se fía de ningún texto llegado del cliente, solo de los códigos.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const answers = parseInvAnswers(body?.answers)
  const texto = cleanTexto(body?.texto)
  const locale = invLocale(body?.locale)
  const source = invSource(body?.source)
  const attemptId = invUuid(body?.attemptId)
  const consent = body?.consent === true

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400 })
  }
  if (!answers) return NextResponse.json({ ok: false, error: 'bad answers' }, { status: 400 })

  const userId = await sessionUserId()
  const admin = createAdminClient()
  const now = new Date().toISOString()

  // El consentimiento no se pierde si la persona repite el test sin marcarlo.
  const { data: existing } = await admin
    .from('inventario_leads')
    .select('id, consent, consent_at, source')
    .eq('email', email)
    .maybeSingle()
  const finalConsent = Boolean(existing?.consent || consent)

  const { data: lead, error } = await admin
    .from('inventario_leads')
    .upsert(
      {
        email,
        user_id: userId,
        locale,
        source: existing?.source || source,
        consent: finalConsent,
        consent_at: existing?.consent_at || (consent ? now : null),
        updated_at: now,
      },
      { onConflict: 'email' },
    )
    .select('id, unsubscribed_at')
    .single()

  if (error || !lead) {
    console.error('[inventario lead] upsert error:', error?.message)
    return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500 })
  }

  // Enlaza el intento con el lead y guarda el texto libre (que la persona ha
  // pedido recibir). Solo intentos aún sin dueño: nadie puede «adoptar» uno ajeno.
  if (attemptId) {
    const { error: linkError } = await admin
      .from('inventario_attempts')
      .update({ lead_id: lead.id, texto: texto || null })
      .eq('id', attemptId)
      .is('lead_id', null)
    if (linkError) console.error('[inventario lead] link error:', linkError.message)
  }

  await syncCrmContact({
    userId,
    email,
    sourceType: 'inventario',
    sourceId: lead.id,
    sourceDetail: { locale, source },
    marketingConsent: consent,
    unsubscribedAt: lead.unsubscribed_at,
  }).catch(err => console.error('[inventario lead] crm sync error:', err))

  // Envío transaccional: confirmamos éxito solo cuando Resend acepta el correo.
  const devolucion = buildDevolucion(answers, texto, locale)
  const unsub = finalConsent && !lead.unsubscribed_at ? unsubUrl(`inv:${lead.id}`, locale) : null
  try {
    await sendInventarioEmail(email, locale, devolucion, unsub)
  } catch (err) {
    console.error('[inventario lead] email error:', err)
    return NextResponse.json({ ok: false, error: 'email failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
