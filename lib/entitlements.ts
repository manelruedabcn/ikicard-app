// ============================================================
// IKIGAIER — Capa de aplicación: permisos / herramientas
// Único punto de acceso a "qué tiene desbloqueado el usuario".
// El dashboard (y cualquier guard futuro) llama solo a esto.
// ============================================================
import { createClient } from '@/lib/supabase/server'

export interface UnlockedTool {
  id: string
  code: string
  name: string
  description: string | null
  route: string | null
  phase: string | null
  sort_order: number
  expires_at: string | null
}

// Herramientas vigentes del usuario autenticado.
// Delega en la función SQL get_my_tools() (resuelve programas + caducidad).
export async function getMyTools(): Promise<UnlockedTool[]> {
  const supabase = createClient()
  const { data, error } = await supabase.rpc('get_my_tools')
  if (error) {
    console.error('[entitlements] get_my_tools:', error.message)
    return []
  }
  return (data ?? []) as UnlockedTool[]
}

// ¿Tiene el usuario acceso a una herramienta concreta (por code)?
export async function hasAccess(code: string): Promise<boolean> {
  const tools = await getMyTools()
  return tools.some(t => t.code === code)
}
