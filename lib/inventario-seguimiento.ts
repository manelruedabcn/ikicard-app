import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendSeguimientoEmail } from '@/lib/email'
import { unsubUrl } from '@/lib/notify'
import { SEGUIMIENTO_RESPUESTAS, type SeguimientoRespuesta } from '@/lib/inventario-seguimiento-content'

// Seguimiento del Inventario honesto: a los 3 días del test, una pregunta
// («¿lo que leíste tenía que ver contigo?») con tres botones. Ver
// docs/inventario.md. Reglas:
//   · solo a quien dio su consentimiento de comunicaciones y no se ha dado
//     de baja (la devolución es transaccional; esto no);
//   · nunca a quien está, terminó o dejó «Un mes conociendo tu ikigai»;
//   · uno por persona, aunque repita el test (índice único en lead_id);
//   · nada retroactivo: solo tests hechos desde SEGUIMIENTO_DESDE, y como
//     mucho SEGUIMIENTO_VENTANA_DIAS atrás, para no escribir semanas después.

const APP_URL = 'https://app.ikigaier.com'
export const SEGUIMIENTO_DIAS = 3
export const SEGUIMIENTO_VENTANA_DIAS = 7
export const SEGUIMIENTO_DESDE = '2026-11-19T00:00:00Z'
const POR_EJECUCION = 50

function lang(locale: string | null): 'es' | 'ca' | 'en' {
  return locale === 'en' ? 'en' : locale === 'ca' ? 'ca' : 'es'
}

export function seguimientoUrl(id: string, r: SeguimientoRespuesta, locale: string): string {
  return `${APP_URL}/api/inventario/seguimiento?t=${id}&r=${r}&l=${lang(locale)}`
}

// Ventana de tests que tocan hoy: hechos hace entre 3 y 7 días, y nunca
// antes de la puesta en marcha.
export function ventanaSeguimiento(now: Date = new Date()): { desde: string; hasta: string } {
  const dia = 24 * 60 * 60 * 1000
  const hasta = new Date(now.getTime() - SEGUIMIENTO_DIAS * dia)
  const limite = new Date(now.getTime() - SEGUIMIENTO_VENTANA_DIAS * dia)
  const inicio = new Date(SEGUIMIENTO_DESDE)
  return { desde: (limite > inicio ? limite : inicio).toISOString(), hasta: hasta.toISOString() }
}

interface Pendiente { leadId: string; attemptId: string; email: string; locale: string }

export async function seguimientosPendientes(now: Date = new Date()): Promise<Pendiente[]> {
  const admin = createAdminClient()
  const { desde, hasta } = ventanaSeguimiento(now)
  if (desde >= hasta) return []

  // Último test de cada contacto dentro de la ventana.
  const { data: intentos, error } = await admin
    .from('inventario_attempts')
    .select('id, lead_id, locale, created_at')
    .not('lead_id', 'is', null)
    .gte('created_at', desde)
    .lte('created_at', hasta)
    .order('created_at', { ascending: false })
  if (error) throw new Error(error.message)
  const porLead = new Map<string, { id: string; locale: string | null }>()
  for (const i of intentos || []) if (!porLead.has(i.lead_id)) porLead.set(i.lead_id, { id: i.id, locale: i.locale })
  if (!porLead.size) return []
  const ids = Array.from(porLead.keys())

  const [{ data: leads, error: leadsError }, { data: hechos, error: hechosError }] = await Promise.all([
    admin.from('inventario_leads').select('id, email, locale, consent, unsubscribed_at').in('id', ids),
    admin.from('inventario_seguimientos').select('lead_id').in('lead_id', ids),
  ])
  if (leadsError) throw new Error(leadsError.message)
  if (hechosError) throw new Error(hechosError.message)
  const yaEnviado = new Set((hechos || []).map(h => h.lead_id))
  const candidatos = (leads || []).filter(l => l.consent && !l.unsubscribed_at && !yaEnviado.has(l.id))
  if (!candidatos.length) return []

  // Fuera quien tiene o tuvo el programa (por correo o por su lead).
  const estados = ['activa', 'completada', 'baja']
  const [porCorreo, porLeadId] = await Promise.all([
    admin.from('programa_inscripciones').select('email').in('status', estados).in('email', candidatos.map(l => l.email)),
    admin.from('programa_inscripciones').select('lead_id').in('status', estados).in('lead_id', candidatos.map(l => l.id)),
  ])
  if (porCorreo.error) throw new Error(porCorreo.error.message)
  if (porLeadId.error) throw new Error(porLeadId.error.message)
  const enPrograma = new Set<string>([
    ...(porCorreo.data || []).map(i => i.email as string),
    ...(porLeadId.data || []).map(i => i.lead_id as string),
  ])

  return candidatos
    .filter(l => !enPrograma.has(l.email) && !enPrograma.has(l.id))
    .map(l => {
      const intento = porLead.get(l.id)!
      return { leadId: l.id, attemptId: intento.id, email: l.email, locale: lang(intento.locale || l.locale) }
    })
}

// Envía los seguimientos que tocan. La fila se crea antes de enviar (el
// índice único impide un segundo correo); si Resend falla, se borra para
// que la siguiente ejecución lo reintente.
export async function enviarSeguimientos(now: Date = new Date()): Promise<{ sent: number; failed: number }> {
  const admin = createAdminClient()
  const pendientes = (await seguimientosPendientes(now)).slice(0, POR_EJECUCION)
  let sent = 0
  let failed = 0
  for (const p of pendientes) {
    const { data: fila, error } = await admin
      .from('inventario_seguimientos')
      .insert({ lead_id: p.leadId, attempt_id: p.attemptId, locale: p.locale })
      .select('id')
      .single()
    if (error || !fila) continue // otra ejecución ya lo tomó
    const links = Object.fromEntries(SEGUIMIENTO_RESPUESTAS.map(r => [r, seguimientoUrl(fila.id, r, p.locale)])) as Record<SeguimientoRespuesta, string>
    try {
      await sendSeguimientoEmail(p.email, p.locale, links, unsubUrl(`inv:${p.leadId}`, p.locale), `inv-seguimiento-${fila.id}`)
      sent++
    } catch (err) {
      console.error('[inventario seguimiento] email error:', err)
      await admin.from('inventario_seguimientos').delete().eq('id', fila.id)
      failed++
    }
  }
  return { sent, failed }
}
