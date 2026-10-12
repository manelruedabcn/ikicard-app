import 'server-only'
import { createClient } from '@/lib/supabase/server'

// Utilidades compartidas por los endpoints del Inventario honesto.

export function invLocale(value: unknown): 'es' | 'ca' | 'en' {
  return value === 'en' ? 'en' : value === 'ca' ? 'ca' : 'es'
}

// Origen del contacto (?src=blog, libro, taller…). Solo minúsculas, dígitos,
// guiones y guion bajo, para que la columna no acumule basura.
export function invSource(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const clean = value.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 40)
  return clean || null
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
export function invUuid(value: unknown): string | null {
  return typeof value === 'string' && UUID_RE.test(value) ? value : null
}

// user_id desde la sesión (cookie), nunca desde el body: null = anónimo.
export async function sessionUserId(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data } = await supabase.auth.getUser()
    return data.user?.id ?? null
  } catch {
    return null
  }
}
