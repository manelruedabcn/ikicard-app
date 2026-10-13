import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildLectura, parseInvAnswers } from '@/lib/inventario'
import { invLocale, invSource, invUuid, sessionUserId } from '@/lib/inventario-server'
import { inscripcionPorToken } from '@/lib/programa-server'

export const dynamic = 'force-dynamic'

// Registra un Inventario honesto COMPLETADO, tenga cuenta o no. Guarda las
// respuestas cerradas (códigos, sin PII) y el resumen de la lectura, para
// medir el funnel y calibrar las reglas. El texto libre NO viaja aquí.
// Devuelve el id del intento: si después la persona pide su devolución por
// email, /api/inventario/lead enlaza este intento con su lead.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const answers = parseInvAnswers(body?.answers)
  if (!answers) return NextResponse.json({ ok: false, error: 'bad answers' }, { status: 400 })

  const lectura = buildLectura(answers)
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('inventario_attempts')
    .insert({
      user_id: await sessionUserId(),
      answers,
      route: lectura.route,
      principal: lectura.principal,
      exercise: lectura.exercise,
      locale: invLocale(body?.locale),
      source: invSource(body?.source),
    })
    .select('id')
    .single()

  if (error) {
    console.error('[inventario track] insert error:', error.message)
    return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500 })
  }
  // Semana 4 del programa: el enlace lleva el token de la inscripción. Este
  // intento queda como el final y se devuelven las respuestas del primero
  // para comparar «hace un mes / hoy». Sin token válido, flujo normal.
  const token = invUuid(body?.prog)
  if (token) {
    const insc = await inscripcionPorToken(token)
    if (insc) {
      await admin
        .from('inventario_attempts')
        .update({ lead_id: insc.lead_id })
        .eq('id', data.id)
        .is('lead_id', null)
      if (!insc.final_attempt_id) {
        await admin.from('programa_inscripciones').update({ final_attempt_id: data.id }).eq('id', insc.id)
      }
      const previous = parseInvAnswers(insc.first_answers)
      return NextResponse.json({ ok: true, id: data.id, programa: true, previous })
    }
  }

  return NextResponse.json({ ok: true, id: data.id })
}
