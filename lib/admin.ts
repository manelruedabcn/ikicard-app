import 'server-only'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

// ¿El usuario autenticado es administrador?
// Verificamos identidad con la sesión y leemos el flag con el cliente admin
// (service_role) para no depender de la RLS al comprobar el propio perfil.
export async function isCurrentUserAdmin(): Promise<boolean> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .maybeSingle()
  return data?.is_admin === true
}

export interface AdminUser {
  id: string
  email: string
  display_name: string | null
  created_at: string
  email_confirmed: boolean
  paso_codigo: string | null
  tools: { entitlement_id: string; tool_id: string; tool_name: string; source: string; expires_at: string | null }[]
}

export interface CatalogTool {
  id: string
  code: string
  name: string
}

export interface CatalogProgram {
  id: string
  code: string
  name: string
}

// Lista de usuarios con sus permisos (vista de administración).
export async function listUsers(): Promise<AdminUser[]> {
  const admin = createAdminClient()

  const { data: authData } = await admin.auth.admin.listUsers({ perPage: 1000 })
  const users = authData?.users ?? []

  const { data: profiles } = await admin.from('profiles').select('id, display_name')
  const nameById = new Map((profiles ?? []).map(p => [p.id, p.display_name]))

  const { data: ents } = await admin
    .from('entitlements')
    .select('id, user_id, tool_id, source, expires_at, tools(name)')

  const entsByUser = new Map<string, AdminUser['tools']>()
  for (const e of ents ?? []) {
    const list = entsByUser.get(e.user_id) ?? []
    // tools(name) llega como objeto o array según relación; normalizamos
    const rel = (e as { tools: { name: string | null } | { name: string | null }[] | null }).tools
    const tool = Array.isArray(rel) ? rel[0] : rel
    list.push({
      entitlement_id: e.id,
      tool_id: e.tool_id,
      tool_name: tool?.name ?? '—',
      source: e.source,
      expires_at: e.expires_at,
    })
    entsByUser.set(e.user_id, list)
  }

  // Estado de PASO por usuario: la fila más reciente si hizo el test
  // logueado (o lo sincronizó al entrar). Usado por el CRM del admin para
  // distinguir "resuelto" de "sin hacer" sin otra consulta.
  const { data: pasoRows } = await admin
    .from('paso_results')
    .select('user_id, codigo_patron, created_at')
    .order('created_at', { ascending: false })
  const pasoByUser = new Map<string, string>()
  for (const r of pasoRows ?? []) {
    if (!pasoByUser.has(r.user_id)) pasoByUser.set(r.user_id, r.codigo_patron)
  }

  return users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    display_name: nameById.get(u.id) ?? null,
    created_at: u.created_at,
    email_confirmed: !!u.email_confirmed_at,
    paso_codigo: pasoByUser.get(u.id) ?? null,
    tools: entsByUser.get(u.id) ?? [],
  }))
}

export interface AdminStats {
  pasoTotal: number
  pasoToday: number
  pasoWeek: number
  journeysStarted: number
  users: number
}

// Métricas globales de uso (vista de dueño). Usa el cliente admin para contar
// TODOS los registros saltándose la RLS. Solo se invoca desde /admin, ya
// protegido por isCurrentUserAdmin().
export async function getAdminStats(): Promise<AdminStats> {
  const admin = createAdminClient()

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  // head:true + count:'exact' devuelve solo el número, sin traer filas.
  const [pasoTotal, pasoToday, pasoWeek, journeys, users] = await Promise.all([
    admin.from('paso_results').select('*', { count: 'exact', head: true }),
    admin.from('paso_results').select('*', { count: 'exact', head: true }).gte('created_at', startOfToday),
    admin.from('paso_results').select('*', { count: 'exact', head: true }).gte('created_at', startOfWeek),
    admin.from('journey_sessions').select('*', { count: 'exact', head: true }),
    admin.from('profiles').select('*', { count: 'exact', head: true }),
  ])

  return {
    pasoTotal: pasoTotal.count ?? 0,
    pasoToday: pasoToday.count ?? 0,
    pasoWeek: pasoWeek.count ?? 0,
    journeysStarted: journeys.count ?? 0,
    users: users.count ?? 0,
  }
}

// Bloque de contadores de una entidad para el reporte horario a Telegram:
// lo creado en la última hora (el incremental) + acumulados rodantes.
export interface StatusCounts {
  lastHour: number
  today: number
  week: number
  month: number
  total: number
}

export interface StatusReport {
  paso: StatusCounts       // todos los tests (con cuenta o sin ella)
  pasoAnon: StatusCounts   // solo anónimos (user_id null) — el lead magnet
  pasoLogged: StatusCounts // solo logueados (user_id no null)
  users: StatusCounts
  from: string // ISO de hace 1 hora (inicio de la ventana incremental)
  to: string   // ISO de ahora
}

type SinceWindows = { hour: string; today: string; week: string; month: string }
// Modificador opcional de la query (p. ej. filtrar anónimos/logueados).
type QueryTweak = (q: PostgrestBuilder) => PostgrestBuilder
type PostgrestBuilder = ReturnType<ReturnType<ReturnType<typeof createAdminClient>['from']>['select']>

// Cuenta una tabla por ventanas de tiempo (rodantes) usando created_at.
// `tweak` permite acotar (p. ej. user_id null) sin duplicar código.
async function countWindows(
  admin: ReturnType<typeof createAdminClient>,
  table: string,
  since: SinceWindows,
  tweak?: QueryTweak,
): Promise<StatusCounts> {
  const base = () => {
    const q = admin.from(table).select('*', { count: 'exact', head: true })
    return tweak ? tweak(q) : q
  }
  const [lastHour, today, week, month, total] = await Promise.all([
    base().gte('created_at', since.hour),
    base().gte('created_at', since.today),
    base().gte('created_at', since.week),
    base().gte('created_at', since.month),
    base(),
  ])
  return {
    lastHour: lastHour.count ?? 0,
    today: today.count ?? 0,
    week: week.count ?? 0,
    month: month.count ?? 0,
    total: total.count ?? 0,
  }
}

// Reporte horario: tests PASO (total + desglose anónimo/logueado) y usuarios,
// con el incremental de la última hora y acumulados rodantes (hoy, 7 días,
// 30 días, total). Los tests salen de paso_attempts (incluye anónimos, que son
// el lead magnet). Lo consume el cron de estado, que solo envía si hubo
// movimiento en la última hora.
export async function getStatusReport(): Promise<StatusReport> {
  const admin = createAdminClient()
  const now = new Date()
  const iso = (ms: number) => new Date(now.getTime() - ms).toISOString()
  const H = 60 * 60 * 1000
  const D = 24 * H

  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const since = {
    hour: iso(H),
    today: startOfToday,
    week: iso(7 * D),
    month: iso(30 * D),
  }

  const [paso, pasoAnon, pasoLogged, users] = await Promise.all([
    countWindows(admin, 'paso_attempts', since),
    countWindows(admin, 'paso_attempts', since, q => q.is('user_id', null)),
    countWindows(admin, 'paso_attempts', since, q => q.not('user_id', 'is', null)),
    countWindows(admin, 'profiles', since),
  ])

  return { paso, pasoAnon, pasoLogged, users, from: since.hour, to: now.toISOString() }
}

export async function listCatalog(): Promise<{ tools: CatalogTool[]; programs: CatalogProgram[] }> {
  const admin = createAdminClient()
  const { data: tools } = await admin.from('tools').select('id, code, name').eq('is_active', true).order('sort_order')
  const { data: programs } = await admin.from('programs').select('id, code, name').eq('is_active', true).order('name')
  return { tools: tools ?? [], programs: programs ?? [] }
}
