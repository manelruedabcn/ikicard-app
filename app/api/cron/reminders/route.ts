import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendReminderEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'
import { computeCurrentDay } from '@/lib/journey'

// Hora local (0-23) a la que se envía el recordatorio.
const SEND_HOUR = 8
const DEFAULT_TZ = 'Europe/Madrid'

// Devuelve { date: 'YYYY-MM-DD', hour: number } en la zona horaria dada.
function localParts(tz: string): { date: string; hour: number } {
  const now = new Date()
  let dtf: Intl.DateTimeFormat
  try {
    dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hour12: false,
    })
  } catch {
    dtf = new Intl.DateTimeFormat('en-CA', {
      timeZone: DEFAULT_TZ,
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', hour12: false,
    })
  }
  const parts = dtf.formatToParts(now)
  const get = (t: string) => parts.find(p => p.type === t)?.value || ''
  const hour = parseInt(get('hour'), 10) % 24
  return { date: `${get('year')}-${get('month')}-${get('day')}`, hour }
}

export async function POST(req: NextRequest) {
  if (req.headers.get('x-cron-secret') !== process.env.CRON_SECRET) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const admin = createAdminClient()

  const { data: sessions } = await admin
    .from('journey_sessions')
    .select('id, user_id, started_at, language, last_reminder_on')
    .eq('status', 'active')

  if (!sessions?.length) return NextResponse.json({ ok: true, sent: 0 })

  // Perfiles (tz + baja) de todos los usuarios con viaje activo.
  const userIds = Array.from(new Set(sessions.map(s => s.user_id)))
  const { data: profiles } = await admin
    .from('profiles')
    .select('id, timezone, notify_opt_out')
    .in('id', userIds)
  const profileById = new Map((profiles || []).map(p => [p.id, p]))

  let sent = 0
  const results: string[] = []

  for (const s of sessions) {
    const profile = profileById.get(s.user_id)
    if (profile?.notify_opt_out) continue

    const tz = profile?.timezone || DEFAULT_TZ
    const { date, hour } = localParts(tz)

    if (hour !== SEND_HOUR) continue
    if (s.last_reminder_on === date) continue

    const day = computeCurrentDay(s.started_at)
    if (day > 20) continue

    const { data: userData } = await admin.auth.admin.getUserById(s.user_id)
    const email = userData?.user?.email
    if (!email) continue

    try {
      await sendReminderEmail(email, s.language || 'es', day, unsubUrl(s.user_id, s.language || 'es'))
      await admin.from('journey_sessions').update({ last_reminder_on: date }).eq('id', s.id)
      sent++
      results.push(`${email} d${day}`)
    } catch (e) {
      console.error('reminder failed', s.user_id, e)
    }
  }

  return NextResponse.json({ ok: true, sent, results })
}
