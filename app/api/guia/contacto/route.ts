import { NextResponse } from 'next/server'
import { sendGuiaAdminEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Recibe lo que alguien deja en el guía de ikigaier.com (pedir una llamada,
// escribir a Manel o pedir aviso de talleres) y se lo envía a Manel por
// correo. No guarda nada: el correo es el registro y se contesta desde él.
const ALLOWED_ORIGINS = new Set([
  'https://www.ikigaier.com',
  'https://ikigaier.com',
])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+()\d\s.-]{7,24}$/
const TIPOS = new Set(['escribir', 'llamada', 'aviso'])

function cors(origin: string | null) {
  const allowed = origin && ALLOWED_ORIGINS.has(origin) ? origin : 'https://www.ikigaier.com'
  return {
    'Access-Control-Allow-Origin': allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Vary': 'Origin',
  }
}

// Texto de una línea, sin espacios de más y con tope de longitud.
function linea(v: unknown, max: number): string {
  return typeof v === 'string' ? v.trim().replace(/\s+/g, ' ').slice(0, max) : ''
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
  if (linea(body?.website, 200)) return NextResponse.json({ ok: true }, { headers }) // honeypot

  const tipo = linea(body?.tipo, 20)
  const nombre = linea(body?.nombre, 80)
  const email = linea(body?.email, 200).toLowerCase()
  const telefono = linea(body?.telefono, 24)
  const cuando = linea(body?.cuando, 200)
  const mensaje = typeof body?.mensaje === 'string' ? body.mensaje.trim().slice(0, 2000) : ''
  const pagina = linea(body?.pagina, 200)
  const lang = ['es', 'ca', 'en'].includes(body?.lang) ? body.lang : 'es'
  const ruta = Array.isArray(body?.ruta)
    ? body.ruta.slice(0, 20).map((r: unknown) => linea(r, 120)).filter(Boolean)
    : []

  if (!TIPOS.has(tipo)) {
    return NextResponse.json({ ok: false, error: 'bad type' }, { status: 400, headers })
  }
  if (body?.privacidad !== true) {
    return NextResponse.json({ ok: false, error: 'privacy required' }, { status: 400, headers })
  }
  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400, headers })
  }
  if (telefono && !PHONE_RE.test(telefono)) {
    return NextResponse.json({ ok: false, error: 'bad phone' }, { status: 400, headers })
  }
  if (tipo !== 'aviso' && nombre.length < 2) {
    return NextResponse.json({ ok: false, error: 'bad name' }, { status: 400, headers })
  }
  if (tipo === 'escribir' && mensaje.length < 2) {
    return NextResponse.json({ ok: false, error: 'empty message' }, { status: 400, headers })
  }

  try {
    await sendGuiaAdminEmail({
      tipo: tipo as 'escribir' | 'llamada' | 'aviso',
      nombre, email, telefono, cuando, mensaje, ruta, pagina, lang,
    })
  } catch (err) {
    console.error('[guia contacto] envío fallido:', err)
    return NextResponse.json({ ok: false, error: 'send failed' }, { status: 502, headers })
  }

  return NextResponse.json({ ok: true }, { headers })
}
