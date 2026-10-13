import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { verifyCronSecret } from '@/lib/secrets'
import { addDays, encuentroEnVentana, madridParts, PROGRAMA_SEND_HOUR, semanalesPendientes } from '@/lib/programa'
import { enviarAvisoEncuentro, enviarSemanal, INSCRIPCION_COLS, type Inscripcion } from '@/lib/programa-server'

export const dynamic = 'force-dynamic'

// Programa «Un mes conociendo tu ikigai». Lo dispara GitHub Actions cada hora
// (.github/workflows/programa.yml). Desde las 8:00 de Madrid:
//   · envía a cada persona activa el correo semanal que le toque (uno por
//     ejecución, en orden; si alguno quedó atrás por un fallo, se recupera);
//   · avisa la víspera de cada encuentro en grupo a quien lo tiene dentro de
//     su mes.
// programa_envios impide duplicados aunque se ejecute cada hora.
export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get('x-cron-secret'))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const { date: today, hour } = madridParts()
  if (hour < PROGRAMA_SEND_HOUR) return NextResponse.json({ ok: true, skipped: 'early' })

  const admin = createAdminClient()
  const { data: activas, error } = await admin
    .from('programa_inscripciones')
    .select(INSCRIPCION_COLS)
    .eq('status', 'activa')
  if (error) {
    console.error('[programa cron] inscripciones', error.message)
    return NextResponse.json({ ok: false, error: 'query failed' }, { status: 500 })
  }
  const inscripciones = (activas || []) as Inscripcion[]
  if (!inscripciones.length) return NextResponse.json({ ok: true, sent: 0 })

  const { data: envios } = await admin
    .from('programa_envios')
    .select('inscripcion_id, mensaje')
    .in('inscripcion_id', inscripciones.map(i => i.id))
  const enviados = new Map<string, Set<string>>()
  for (const e of envios || []) {
    if (!enviados.has(e.inscripcion_id)) enviados.set(e.inscripcion_id, new Set())
    enviados.get(e.inscripcion_id)!.add(e.mensaje)
  }

  let semanales = 0
  let avisos = 0

  // 1. Correos semanales
  for (const insc of inscripciones) {
    if (insc.start_date > today) continue
    const pendientes = semanalesPendientes(insc.start_date, today, enviados.get(insc.id) || new Set())
    if (!pendientes.length) continue
    const key = pendientes[0]
    try {
      if (await enviarSemanal(insc, key)) semanales++
      if (key === 'cierre') {
        await admin.from('programa_inscripciones').update({ status: 'completada' }).eq('id', insc.id)
      }
    } catch (e) {
      console.error('[programa cron] semanal', insc.id, key, e)
    }
  }

  // 2. Avisos de encuentros de mañana (fecha de Madrid)
  const manana = addDays(today, 1)
  const { data: encuentros } = await admin
    .from('programa_encuentros')
    .select('id, starts_at, url, locale')
    .gte('starts_at', new Date(Date.now() - 86_400_000).toISOString())
    .lte('starts_at', new Date(Date.now() + 3 * 86_400_000).toISOString())
  for (const enc of (encuentros || []).filter(e => madridParts(new Date(e.starts_at)).date === manana)) {
    for (const insc of inscripciones) {
      if (enc.locale && enc.locale !== insc.locale) continue
      if (!encuentroEnVentana(insc.start_date, manana)) continue
      if (enviados.get(insc.id)?.has(`encuentro:${enc.id}`)) continue
      try {
        if (await enviarAvisoEncuentro(insc, enc)) avisos++
      } catch (e) {
        console.error('[programa cron] encuentro', insc.id, enc.id, e)
      }
    }
  }

  // Sin PII en la respuesta: solo recuentos.
  return NextResponse.json({ ok: true, semanales, avisos })
}
