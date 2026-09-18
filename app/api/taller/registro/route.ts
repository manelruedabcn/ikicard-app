import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendWorkshopAdminEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

const ALLOWED_ORIGINS = new Set([
  'https://www.ikigaier.com',
  'https://ikigaier.com',
])
const EVENT_CODE = 'taller-2026-09-29-vilanova'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+()\d\s.-]{7,24}$/

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.ikigaier.com'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

export async function OPTIONS(req: Request) {
  return new NextResponse(null, { status: 204, headers: cors(req.headers.get('origin')) })
}

export async function POST(req: Request) {
  const origin = req.headers.get('origin')
  const headers = cors(origin)
  if (!origin || !ALLOWED_ORIGINS.has(origin)) {
    return NextResponse.json({ ok: false, error: 'origin not allowed' }, { status: 403, headers })
  }

  const body = await req.json().catch(() => null)
  const nombre = typeof body?.nombre === 'string' ? body.nombre.trim().replace(/\s+/g, ' ') : ''
  const contacto = typeof body?.contacto === 'string' ? body.contacto.trim() : ''
  const privacidadLeida = body?.privacidad === true
  const website = typeof body?.website === 'string' ? body.website.trim() : '' // honeypot

  if (website) return NextResponse.json({ ok: true }, { headers })
  if (nombre.length < 2 || nombre.length > 80) {
    return NextResponse.json({ ok: false, error: 'bad name' }, { status: 400, headers })
  }
  if (!privacidadLeida) {
    return NextResponse.json({ ok: false, error: 'privacy required' }, { status: 400, headers })
  }

  const isEmail = EMAIL_RE.test(contacto)
  const isPhone = PHONE_RE.test(contacto)
  if (!isEmail && !isPhone) {
    return NextResponse.json({ ok: false, error: 'bad contact' }, { status: 400, headers })
  }

  const tipoContacto = isEmail ? 'email' : 'telefono'
  const contactoNormalizado = isEmail
    ? contacto.toLowerCase()
    : contacto.replace(/[^+\d]/g, '')

  const admin = createAdminClient()
  const { data, error } = await admin
    .from('taller_registros')
    .upsert({
      event_code: EVENT_CODE,
      nombre,
      contacto,
      contacto_normalizado: contactoNormalizado,
      tipo_contacto: tipoContacto,
      privacidad_leida: true,
      source: 'ikigaier-web',
      estado: 'pendiente',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'event_code,contacto_normalizado' })
    .select('id, created_at')
    .single()

  if (error) {
    console.error('[taller registro] upsert error:', error.message)
    return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500, headers })
  }

  await sendWorkshopAdminEmail({ nombre, contacto, tipoContacto, createdAt: data.created_at }).catch(err => {
    console.error('[taller registro] notification error:', err)
  })

  return NextResponse.json({ ok: true, id: data.id }, { headers })
}
