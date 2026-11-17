import { NextResponse } from 'next/server'
import { syncCrmContact } from '@/lib/crm-sync'
import { sendTelegram } from '@/lib/telegram'
import { sendGuiaAdminEmail } from '@/lib/email'

export const dynamic = 'force-dynamic'

// Recibe los formularios de ikigaier.com (aviso del taller, taller gratuito y
// talleres para empresas). Antes iban a Formspree con la dirección de correo
// en la URL, un formato que Formspree ya no acepta: los envíos se perdían.
// Ahora cada envío entra en el CRM (origen «web», con todo lo que escribió la
// persona), avisa a Manel por Telegram y le llega también por correo.
const ALLOWED_ORIGINS = new Set([
  'https://www.ikigaier.com',
  'https://ikigaier.com',
])
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const PHONE_RE = /^[+()\d\s.-]{7,24}$/

// Cada formulario de la web, con su nombre legible y si pide la casilla de
// privacidad (el aviso del taller de pago solo pide el correo).
const FORMULARIOS: Record<string, { label: string; privacidad: boolean; tipoCorreo: 'aviso' | 'escribir' }> = {
  'taller-aviso': { label: 'Aviso de próximas fechas · taller Yo soy ikigaier', privacidad: false, tipoCorreo: 'aviso' },
  'taller-gratuito-aviso': { label: 'Aviso del próximo taller gratuito', privacidad: true, tipoCorreo: 'aviso' },
  'taller-gratuito-organizar': { label: 'Quiere organizar un taller gratuito', privacidad: true, tipoCorreo: 'escribir' },
  'empresas': { label: 'Talleres para empresas y equipos', privacidad: true, tipoCorreo: 'escribir' },
}

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

  const formulario = linea(body?.formulario, 40)
  const def = FORMULARIOS[formulario]
  if (!def) {
    return NextResponse.json({ ok: false, error: 'bad form' }, { status: 400, headers })
  }

  const email = linea(body?.email, 200).toLowerCase()
  const nombre = linea(body?.nombre, 80)
  const telefono = linea(body?.telefono, 24)
  const campos = {
    organizacion: linea(body?.organizacion, 120),
    tipo: linea(body?.tipo, 80),
    formato: linea(body?.formato, 80),
    personas: linea(body?.personas, 40),
    poblacion: linea(body?.poblacion, 80),
  }
  const mensaje = typeof body?.mensaje === 'string' ? body.mensaje.trim().slice(0, 2000) : ''
  const pagina = linea(body?.pagina, 200)
  const lang = ['es', 'ca', 'en'].includes(body?.lang) ? body.lang : 'es'

  if (!EMAIL_RE.test(email)) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400, headers })
  }
  if (telefono && !PHONE_RE.test(telefono)) {
    return NextResponse.json({ ok: false, error: 'bad phone' }, { status: 400, headers })
  }
  if (def.privacidad && body?.privacidad !== true) {
    return NextResponse.json({ ok: false, error: 'privacy required' }, { status: 400, headers })
  }

  const ahora = new Date().toISOString()
  const etiquetas: [string, string][] = [
    ['Organización', campos.organizacion],
    ['Tipo de grupo', campos.tipo],
    ['Formato', campos.formato],
    ['Personas', campos.personas],
    ['Población', campos.poblacion],
  ]
  const detalle = etiquetas.filter(([, v]) => v).map(([k, v]) => `${k}: ${v}`)

  // CRM y correo van a la vez y por separado: si uno falla, el otro sigue. El
  // aviso de Telegram va después para poder enlazar la ficha del CRM. El envío
  // solo se da por perdido si no se guarda ni se avisa por ninguno de los tres.
  const [crm, correo] = await Promise.allSettled([
    syncCrmContact({
      firstName: nombre || null,
      email,
      phone: telefono || null,
      sourceType: 'web',
      sourceId: crypto.randomUUID(),
      sourceDetail: { formulario, ...campos, mensaje, pagina, lang },
      sourceCreatedAt: ahora,
      marketingConsent: false,
      notify: false,
    }),
    sendGuiaAdminEmail({
      tipo: def.tipoCorreo,
      nombre,
      email,
      telefono,
      cuando: '',
      mensaje: [def.label, ...detalle, mensaje].filter(Boolean).join('\n'),
      ruta: [],
      pagina,
      lang,
    }),
  ])

  const contactId = crm.status === 'fulfilled' ? crm.value : undefined
  if (crm.status === 'rejected') console.error('[web contacto] crm:', crm.reason)
  if (correo.status === 'rejected') console.error('[web contacto] correo:', correo.reason)

  const avisado = await sendTelegram([
    `📩 Formulario de la web · ${def.label}`,
    '',
    `👤 ${nombre || 'Sin nombre'}`,
    `✉️ ${email}`,
    telefono ? `📱 ${telefono}` : null,
    ...detalle,
    mensaje ? `\n«${mensaje}»` : null,
    '',
    pagina ? `Página: ${pagina}` : null,
    contactId ? `Ficha: https://app.ikigaier.com/es/admin/crm/${contactId}` : 'No se pudo guardar en el CRM: revisa el correo.',
  ].filter(l => l !== null).join('\n'))

  if (crm.status === 'rejected' && correo.status === 'rejected' && !avisado) {
    return NextResponse.json({ ok: false, error: 'not saved' }, { status: 502, headers })
  }
  return NextResponse.json({ ok: true }, { headers })
}
