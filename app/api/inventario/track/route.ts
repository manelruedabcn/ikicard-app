import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildLectura, parseInvAnswers } from '@/lib/inventario'
import { invLocale, invSource, invUuid, sessionUserId } from '@/lib/inventario-server'
import { inscripcionPorToken } from '@/lib/programa-server'
import { daysBetween, madridParts } from '@/lib/programa'

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
  // Enlace personal del programa (?prog=token). Dos casos:
  //   · Aún no tiene test (entró por la página del programa): este intento es
  //     su punto de partida y de él sale el ejercicio de la semana 1.
  //   · Ya lo tiene: desde la semana 4, este intento es el final y se
  //     devuelven las respuestas del primero para comparar «hace un mes /
  //     hoy». Antes de la semana 4 no se compara nada.
  // Sin token válido, flujo normal.
  const token = invUuid(body?.prog)
  if (token) {
    const insc = await inscripcionPorToken(token)
    if (insc && insc.status !== 'baja') {
      if (insc.lead_id) {
        await admin
          .from('inventario_attempts')
          .update({ lead_id: insc.lead_id })
          .eq('id', data.id)
          .is('lead_id', null)
      }
      const first = parseInvAnswers(insc.first_answers)
      if (!first) {
        await admin
          .from('programa_inscripciones')
          .update({ first_attempt_id: data.id, first_answers: answers, first_exercise: lectura.exercise })
          .eq('id', insc.id)
        return NextResponse.json({ ok: true, id: data.id, programa: true, inicio: true })
      }
      const semana4 = daysBetween(insc.start_date, madridParts().date) >= 21
      if (semana4 && !insc.final_attempt_id) {
        await admin.from('programa_inscripciones').update({ final_attempt_id: data.id }).eq('id', insc.id)
      }
      return NextResponse.json({ ok: true, id: data.id, programa: true, previous: semana4 ? first : null })
    }
  }

  return NextResponse.json({ ok: true, id: data.id })
}
