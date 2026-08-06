import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

// Webhook que Supabase llama al insertarse una fila en public.profiles
// (es decir, cuando alguien se registra). Envía un aviso a Telegram.
export async function POST(req: Request) {
  // 1) Proteger el endpoint: solo Supabase (que conoce el secreto) puede llamarlo.
  const secret = req.headers.get('x-webhook-secret')
  if (!secret || secret !== process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) {
    return NextResponse.json({ error: 'telegram not configured' }, { status: 500 })
  }

  // 2) Leer el payload del webhook de Supabase.
  const payload = await req.json().catch(() => null)
  const record = payload?.record
  if (!record?.id) {
    return NextResponse.json({ error: 'no record' }, { status: 400 })
  }

  // 3) profiles no guarda el email; lo buscamos en auth por id.
  let email = '—'
  try {
    const admin = createAdminClient()
    const { data } = await admin.auth.admin.getUserById(record.id)
    email = data?.user?.email ?? '—'
  } catch {
    // si falla la búsqueda seguimos: al menos avisamos del registro
  }

  const name = record.display_name || email.split('@')[0]
  const text = `🎉 Nuevo registro en IKIGAIER\n\n👤 ${name}\n✉️ ${email}`

  // 4) Enviar el mensaje a Telegram.
  const res = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    console.error('[new-user hook] telegram error:', res.status, detail)
    return NextResponse.json({ error: 'telegram send failed' }, { status: 502 })
  }

  return NextResponse.json({ ok: true })
}
