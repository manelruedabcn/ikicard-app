import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { DIMS, PASO_PATRONES, type Dim, type InformePaso } from '@/lib/paso-content'
import { calcularSegmentos, resolverCodigoPorSegmentos } from '@/lib/paso-segments'
import { sendResultEmail, sendLeadWelcomeEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'
import { syncCrmContact } from '@/lib/crm-sync'

export const dynamic = 'force-dynamic'

// Captura el email al terminar el test PASO (lead magnet), con o sin cuenta.
// Dos permisos SEPARADOS:
//   · Transaccional: la persona pide su resultado → siempre le enviamos el
//     enlace a su forma (no requiere consent, lo pidió).
//   · Marketing: consent=true (checkbox) → además, bienvenida con la promesa
//     de las herramientas de IKIGAIER. Sin consent NO se hace marketing.
// El código es obligatorio (el email de resultado lo necesita). El user_id se
// toma de la SESIÓN (no del body). Upsert por email para no duplicar.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function readDims(value: unknown): Record<Dim, number> | null {
  if (!value || typeof value !== 'object') return null
  const input = value as Record<string, unknown>
  const output = {} as Record<Dim, number>
  for (const dim of DIMS) {
    const n = input[dim]
    if (!Number.isInteger(n) || (n as number) < -28 || (n as number) > 28) return null
    output[dim] = n as number
  }
  return output
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const emailRaw = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : ''
  const codigo = typeof body?.codigo === 'string' ? body.codigo : null
  const locale = body?.locale === 'en' ? 'en' : 'es'
  const consent = body?.consent === true
  const mascara = readDims(body?.resultado?.mascara)
  const natural = readDims(body?.resultado?.natural)
  const scores = readDims(body?.resultado?.scores)
  const puntoCiego = DIMS.includes(body?.resultado?.puntoCiego) ? body.resultado.puntoCiego as Dim : null

  if (!EMAIL_RE.test(emailRaw)) {
    return NextResponse.json({ ok: false, error: 'bad email' }, { status: 400 })
  }
  // El resultado se envía por código de forma: debe ser un patrón real.
  if (!codigo || !PASO_PATRONES.some(p => p.codigo === codigo)) {
    return NextResponse.json({ ok: false, error: 'bad pattern' }, { status: 400 })
  }
  if (!mascara || !natural || !scores || !puntoCiego) {
    return NextResponse.json({ ok: false, error: 'bad result' }, { status: 400 })
  }
  const codigoCalculado = resolverCodigoPorSegmentos(calcularSegmentos(scores))
  if (codigoCalculado !== codigo) {
    return NextResponse.json({ ok: false, error: 'result mismatch' }, { status: 400 })
  }
  const brechas = DIMS.map(d => {
    const valor = mascara[d] - natural[d]
    return {
      dimension: d,
      valor,
      direccion: (valor > 0 ? 'exige_de_mas' : valor < 0 ? 'esconde' : 'alineado') as
        'exige_de_mas' | 'esconde' | 'alineado',
    }
  }).sort((a, b) => Math.abs(b.valor) - Math.abs(a.valor))
  const informe: InformePaso = {
    mascara,
    natural,
    scores,
    puntoCiego,
    brechas,
    codigoPatron: codigo,
    contradicciones: [],
  }

  // user_id desde la sesión (cookie), no desde el body.
  let userId: string | null = null
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    userId = data.user?.id ?? null
  } catch {
    // sin sesión válida → lead anónimo
  }

  const admin = createAdminClient()
  const { data: lead, error } = await admin
    .from('paso_leads')
    .upsert(
      {
        email: emailRaw,
        user_id: userId,
        codigo_patron: codigo,
        locale,
        source: 'paso',
        consent,
        resultado: { mascara, natural, scores, puntoCiego },
      },
      { onConflict: 'email' },
    )
    .select('id, unsubscribed_at')
    .single()

  if (error) {
    console.error('[paso lead] upsert error:', error.message)
    return NextResponse.json({ ok: false, error: 'insert failed' }, { status: 500 })
  }

  await syncCrmContact({
    userId,
    email: emailRaw,
    sourceType: 'paso',
    sourceId: lead?.id,
    sourceDetail: { codigo, locale },
    marketingConsent: consent,
    unsubscribedAt: lead?.unsubscribed_at,
  }).catch(err => console.error('[paso lead] crm sync error:', err))

  // Envío transaccional: confirmamos éxito solo cuando Resend acepta el informe.
  try {
    await sendResultEmail(emailRaw, locale, codigo, informe)
  } catch (err) {
    console.error('[paso lead] result email error:', err)
    return NextResponse.json({ ok: false, error: 'email failed' }, { status: 502 })
  }

  // Marketing: solo con consentimiento explícito y sin baja previa.
  if (consent && lead && !lead.unsubscribed_at) {
    sendLeadWelcomeEmail(emailRaw, locale, unsubUrl(`lead:${lead.id}`, locale)).catch(err => {
      console.error('[paso lead] welcome email error:', err)
    })
  }

  return NextResponse.json({ ok: true })
}
