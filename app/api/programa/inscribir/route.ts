import { NextResponse } from 'next/server'
import { guardarLead, invLocale, invSource, sessionUser } from '@/lib/inventario-server'
import { confirmarInscripcion, enviarConfirmacion, prepararInscripcion } from '@/lib/programa-server'

export const dynamic = 'force-dynamic'

// Entrada directa al programa «Un mes conociendo tu ikigai», desde su página
// (/programa). Sin test todavía: la inscripción queda pendiente y se envía
// «Confirma tu plaza». Al confirmar, la bienvenida le pide hacer el test con
// su enlace personal; ese test será su punto de partida.
// Si tiene sesión con este mismo correo ya verificado, entra directamente.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const locale = invLocale(body?.locale)
  const source = invSource(body?.source) || 'programa'
  const consent = body?.consent === true

  if (!EMAIL_RE.test(email) || email.length > 254) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400 })
  }

  const user = await sessionUser()
  const userId = user?.id ?? null
  try {
    const lead = await guardarLead({ email, userId, locale, source, consent })
    const { inscripcion, estado } = await prepararInscripcion({
      email, locale, leadId: lead.id, userId, attemptId: null, answers: null, origen: 'programa',
    })
    if (estado === 'ya') return NextResponse.json({ ok: true, estado: 'ya' })

    if (user?.verifiedEmail === email) {
      const r = await confirmarInscripcion(inscripcion.token)
      return NextResponse.json({ ok: true, estado: r.estado === 'invalid' ? 'pendiente' : r.estado })
    }
    // Reenvío limitado (ver enviarConfirmacion): la respuesta es la misma
    // aunque no se reenvíe, para no revelar nada sobre ese correo.
    await enviarConfirmacion(inscripcion)
    return NextResponse.json({ ok: true, estado: 'pendiente' })
  } catch (err) {
    console.error('[programa inscribir]', err)
    return NextResponse.json({ ok: false, error: 'failed' }, { status: 500 })
  }
}
