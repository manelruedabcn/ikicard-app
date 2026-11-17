import 'server-only'

import { createAdminClient } from '@/lib/supabase/admin'
import { daysBetween, madridParts, esperaTest } from '@/lib/programa'

// Datos del panel de administración del programa «Un mes conociendo tu ikigai».

export interface ProgramaFila {
  id: string
  email: string
  locale: string
  start_date: string
  status: string
  // Por dónde entró: el test o la página del programa.
  origen: string
  created_at: string
  // 0 = aún no ha empezado · 1-4 = semana en curso · 5 = cierre enviado o pasado
  semana: number
  checkins: Record<number, string>
  esperandoTest: boolean
  envios: number
  ultimoEnvio: string | null
  repitio: boolean
}

export interface ProgramaEncuentro {
  id: string
  starts_at: string
  url: string
  locale: string | null
  nota: string | null
}

export interface ProgramaResumen {
  inventarios: { total: number; semana: number }
  leads: number
  activas: number
  pendientes: number
  esperandoTest: number
  porPagina: number
  completadas: number
  bajas: number
  repitieron: number
  filas: ProgramaFila[]
  proximos: ProgramaEncuentro[]
  pasados: ProgramaEncuentro[]
}

export async function getProgramaResumen(): Promise<ProgramaResumen> {
  const admin = createAdminClient()
  const today = madridParts().date
  const haceSiete = new Date(Date.now() - 7 * 86_400_000).toISOString()
  const nowIso = new Date().toISOString()

  const [totalInv, semanaInv, leads, insc, checks, prox, pas, envios] = await Promise.all([
    admin.from('inventario_attempts').select('id', { count: 'exact', head: true }),
    admin.from('inventario_attempts').select('id', { count: 'exact', head: true }).gte('created_at', haceSiete),
    admin.from('inventario_leads').select('id', { count: 'exact', head: true }),
    admin.from('programa_inscripciones')
      .select('id, email, locale, start_date, status, origen, created_at, final_attempt_id, first_answers')
      .order('created_at', { ascending: false })
      .limit(500),
    admin.from('programa_checkins').select('inscripcion_id, semana, respuesta'),
    admin.from('programa_encuentros').select('id, starts_at, url, locale, nota').gte('starts_at', nowIso).order('starts_at', { ascending: true }),
    admin.from('programa_encuentros').select('id, starts_at, url, locale, nota').lt('starts_at', nowIso).order('starts_at', { ascending: false }).limit(10),
    admin.from('programa_envios').select('inscripcion_id, mensaje, sent_at').not('mensaje', 'like', 'reserva:%'),
  ])

  if (insc.error) throw new Error(insc.error.message)
  if (envios.error) throw new Error(envios.error.message)
  const porInscripcion = new Map<string, Record<number, string>>()
  for (const c of checks.data || []) {
    if (!porInscripcion.has(c.inscripcion_id)) porInscripcion.set(c.inscripcion_id, {})
    porInscripcion.get(c.inscripcion_id)![c.semana] = c.respuesta
  }

  const filas: ProgramaFila[] = (insc.data || []).map(i => {
    const registrados = (envios.data || []).filter(e => e.inscripcion_id === i.id)
    const esperandoTest = i.status === 'activa' && esperaTest(i.first_answers, new Set(registrados.map(e => e.mensaje)))
    const ultimoEnvio = registrados.map(e => e.sent_at as string).filter(Boolean).sort().at(-1) || null
    const d = daysBetween(i.start_date, today)
    const semana = esperandoTest || d < 0 ? 0 : Math.min(5, Math.floor(d / 7) + 1)
    return {
      id: i.id,
      email: i.email,
      locale: i.locale,
      start_date: i.start_date,
      status: i.status,
      origen: i.origen || 'test',
      created_at: i.created_at,
      semana,
      checkins: porInscripcion.get(i.id) || {},
      esperandoTest,
      envios: registrados.length,
      ultimoEnvio,
      repitio: Boolean(i.final_attempt_id),
    }
  })

  return {
    inventarios: { total: totalInv.count || 0, semana: semanaInv.count || 0 },
    leads: leads.count || 0,
    activas: filas.filter(f => f.status === 'activa').length,
    esperandoTest: filas.filter(f => f.esperandoTest).length,
    pendientes: filas.filter(f => f.status === 'pendiente').length,
    porPagina: filas.filter(f => f.origen === 'programa').length,
    completadas: filas.filter(f => f.status === 'completada').length,
    bajas: filas.filter(f => f.status === 'baja').length,
    repitieron: filas.filter(f => f.repitio).length,
    filas,
    proximos: (prox.data || []) as ProgramaEncuentro[],
    pasados: (pas.data || []) as ProgramaEncuentro[],
  }
}

// Fecha y hora escritas en hora de Madrid («2026-11-04T19:30», el formato de
// <input type="datetime-local">) → instante UTC en ISO.
export function madridLocalToIso(local: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(local)) return null
  const asUtc = Date.parse(`${local}:00Z`)
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(new Date(asUtc))
  const get = (t: string) => parts.find(p => p.type === t)?.value || '00'
  const madridAsUtc = Date.parse(`${get('year')}-${get('month')}-${get('day')}T${get('hour') === '24' ? '00' : get('hour')}:${get('minute')}:00Z`)
  return new Date(asUtc - (madridAsUtc - asUtc)).toISOString()
}
