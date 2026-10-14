import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanTexto, parseInvAnswers } from '@/lib/inventario'
import { buildDevolucion } from '@/lib/inventario-content'
import { invLocale, invSource, invUuid, sessionUser } from '@/lib/inventario-server'
import { sendInventarioEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'
import { syncCrmContact } from '@/lib/crm-sync'
import { confirmarInscripcion, confirmarUrl, prepararInscripcion } from '@/lib/programa-server'
import { getProgramaTexts } from '@/lib/programa-content'

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
  // Programa «Un mes conociendo tu ikigai»: casilla aparte, también opcional.
  const programa = body?.programa === true

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400 })
  }
  if (!answers) return NextResponse.json({ ok: false, error: 'bad answers' }, { status: 400 })

  const user = await sessionUser()
  const userId = user?.id ?? null
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

  // Programa «Un mes conociendo tu ikigai» (casilla propia, no depende del
  // consentimiento de marketing). Doble confirmación: queda pendiente y el
  // correo de la devolución lleva el botón «Confirmar mi plaza». Si la
  // persona tiene sesión con este mismo correo ya verificado, entra directa.
  // Si algo falla aquí, la devolución se envía igual.
  let programaEstado: 'pendiente' | 'confirmada' | 'ya' | 'error' | null = null
  let programaConfirm: { url: string; texts: ReturnType<typeof getProgramaTexts>['confirmar'] } | null = null
  let autoConfirmToken: string | null = null
  if (programa) {
    try {
      const { inscripcion, estado } = await prepararInscripcion({ email, locale, leadId: lead.id, userId, attemptId, answers })
      programaEstado = estado
      if (estado === 'pendiente') {
        if (user?.verifiedEmail === email) autoConfirmToken = inscripcion.token
        else programaConfirm = { url: confirmarUrl(inscripcion), texts: getProgramaTexts(locale).confirmar }
      }
    } catch (err) {
      console.error('[inventario lead] programa error:', err)
      programaEstado = 'error'
    }
  }

  // Envío transaccional: confirmamos éxito solo cuando Resend acepta el correo.
  const devolucion = buildDevolucion(answers, texto, locale)
  const unsub = finalConsent && !lead.unsubscribed_at ? unsubUrl(`inv:${lead.id}`, locale) : null
  try {
    await sendInventarioEmail(email, locale, devolucion, unsub, programaConfirm)
  } catch (err) {
    console.error('[inventario lead] email error:', err)
    return NextResponse.json({ ok: false, error: 'email failed' }, { status: 502 })
  }

  if (autoConfirmToken) {
    try {
      const { estado } = await confirmarInscripcion(autoConfirmToken)
      programaEstado = estado === 'invalid' ? 'error' : estado
    } catch (err) {
      console.error('[inventario lead] programa confirm error:', err)
      programaEstado = 'error'
    }
  }

  return NextResponse.json({ ok: true, programa: programaEstado })
}
