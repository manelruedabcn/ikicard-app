import { NextRequest, NextResponse } from 'next/server'
import { getStatusReport, type StatusCounts, type StatusReport } from '@/lib/admin'
import { verifyCronSecret } from '@/lib/secrets'

export const dynamic = 'force-dynamic'

// Reporte horario de estado a Telegram. Lo dispara el cron de GitHub Actions
// (.github/workflows/status.yml) cada hora en punto. Regla de silencio: si en
// la última hora NO hubo tests PASO ni usuarios nuevos, no se envía nada.
export async function POST(req: NextRequest) {
  if (!verifyCronSecret(req.headers.get('x-cron-secret'))) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return NextResponse.json({ ok: false, error: 'telegram not configured' }, { status: 500 })
  }

  const report = await getStatusReport()

  // Silencio si no hubo movimiento en la última hora.
  const movimiento = report.paso.lastHour > 0 || report.users.lastHour > 0
  if (!movimiento) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const text = formatReport(report)

  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[status cron] telegram error:', res.status, detail)
    return NextResponse.json({ ok: false, error: 'telegram send failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true, sent: true })
}

// Resumen incremental: "+N" solo si hubo altas en la última hora.
function delta(n: number): string {
  return n > 0 ? `+${n}` : '±0'
}

function linea(c: StatusCounts): string {
  return `  Hoy: ${c.today}   Semana: ${c.week}   Mes: ${c.month}   Total: ${c.total}`
}

function formatReport(r: StatusReport): string {
  const { paso, pasoAnon, pasoLogged, users } = r
  return [
    `📊 IKIGAIER · última hora`,
    `🆕 ${delta(paso.lastHour)} tests (${delta(pasoAnon.lastHour)} anón · ${delta(pasoLogged.lastHour)} con cuenta) · ${delta(users.lastHour)} usuarios`,
    '',
    '🧭 Tests PASO (todos)',
    linea(paso),
    '  · Anónimos',
    linea(pasoAnon),
    '  · Con cuenta',
    linea(pasoLogged),
    '',
    '👤 Usuarios',
    linea(users),
  ].join('\n')
}
