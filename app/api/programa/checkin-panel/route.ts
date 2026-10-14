import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'
import { PROGRAMA_CHECKINS, type ProgramaCheckin } from '@/lib/programa'

export const dynamic = 'force-dynamic'

// «¿Has hecho el ejercicio de esta semana?» desde el panel del programa.
// Como el del correo del jueves, no bloquea nada.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const semana = Number(body?.semana)
  const respuesta = body?.respuesta as ProgramaCheckin
  if (!Number.isInteger(semana) || semana < 1 || semana > 4 || !PROGRAMA_CHECKINS.includes(respuesta)) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ ok: false }, { status: 401 })

  // Su inscripción (la política de RLS solo deja ver la propia).
  const { data: insc } = await supabase
    .from('programa_inscripciones')
    .select('id')
    .in('status', ['activa', 'completada'])
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (!insc) return NextResponse.json({ ok: false }, { status: 404 })

  const admin = createAdminClient()
  const { error } = await admin
    .from('programa_checkins')
    .upsert({ inscripcion_id: insc.id, semana, respuesta, updated_at: new Date().toISOString() }, { onConflict: 'inscripcion_id,semana' })
  if (error) {
    console.error('[programa checkin panel]', error.message)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
