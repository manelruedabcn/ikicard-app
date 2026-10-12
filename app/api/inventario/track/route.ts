import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { buildLectura, parseInvAnswers } from '@/lib/inventario'
import { invLocale, invSource, sessionUserId } from '@/lib/inventario-server'

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
  return NextResponse.json({ ok: true, id: data.id })
}
