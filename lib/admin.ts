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
  tools: { entitlement_id: string; tool_name: string; source: string; expires_at: string | null }[]
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
    .select('id, user_id, source, expires_at, tools(name)')

  const entsByUser = new Map<string, AdminUser['tools']>()
  for (const e of ents ?? []) {
    const list = entsByUser.get(e.user_id) ?? []
    // tools(name) llega como objeto o array según relación; normalizamos
    const rel = (e as { tools: { name: string | null } | { name: string | null }[] | null }).tools
    const tool = Array.isArray(rel) ? rel[0] : rel
    list.push({
      entitlement_id: e.id,
      tool_name: tool?.name ?? '—',
      source: e.source,
      expires_at: e.expires_at,
    })
    entsByUser.set(e.user_id, list)
  }

  return users.map(u => ({
    id: u.id,
    email: u.email ?? '',
    display_name: nameById.get(u.id) ?? null,
    created_at: u.created_at,
    tools: entsByUser.get(u.id) ?? [],
  }))
}

export async function listCatalog(): Promise<{ tools: CatalogTool[]; programs: CatalogProgram[] }> {
  const admin = createAdminClient()
  const { data: tools } = await admin.from('tools').select('id, code, name').eq('is_active', true).order('sort_order')
  const { data: programs } = await admin.from('programs').select('id, code, name').eq('is_active', true).order('name')
  return { tools: tools ?? [], programs: programs ?? [] }
}
