import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { cleanTexto, parseInvAnswers } from '@/lib/inventario'
import { buildDevolucion } from '@/lib/inventario-content'
import { guardarLead, invLocale, invSource, invUuid, sessionUser } from '@/lib/inventario-server'
import { sendInventarioEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'
import { confirmarInscripcion, confirmarUrl, inscripcionPorToken, prepararInscripcion } from '@/lib/programa-server'
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
  // Con el enlace personal del programa (?prog=), el correo es el de la
  // inscripción: la devolución se le envía sin volver a pedírselo.
  const progToken = invUuid(body?.prog)
  const progInsc = progToken ? await inscripcionPorToken(progToken) : null
  const email = progInsc
    ? progInsc.email
    : typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const answers = parseInvAnswers(body?.answers)
  const texto = cleanTexto(body?.texto)
  const locale = invLocale(body?.locale)
  const source = invSource(body?.source)
  const attemptId = invUuid(body?.attemptId)
  const consent = body?.consent === true
  // Programa «Un mes conociendo tu ikigai»: casilla aparte, también opcional.
  const programa = body?.programa === true && !progInsc

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400 })
  }
  if (!answers) return NextResponse.json({ ok: false, error: 'bad answers' }, { status: 400 })

  const user = await sessionUser()
  const userId = user?.id ?? null
  const admin = createAdminClient()

  const lead = await guardarLead({ email, userId, locale, source, consent }).catch(err => {
    console.error('[inventario lead] upsert error:', err?.message)
    return null
  })
  if (!lead) return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500 })
  const finalConsent = lead.consent
  // Primer test hecho con el enlace personal del programa: la inscripción
  // queda unida a su lead (entró por la página del programa, sin lead aún).
  if (progInsc && !progInsc.lead_id) {
    await admin.from('programa_inscripciones').update({ lead_id: lead.id }).eq('id', progInsc.id)
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
      const { inscripcion, estado } = await prepararInscripcion({ email, locale, leadId: lead.id, userId, attemptId, answers, origen: 'test' })
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
