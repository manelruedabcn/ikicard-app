'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCurrentUserAdmin } from '@/lib/admin'

// Convierte "duración en días" (o vacío = para siempre) a fecha ISO o null.
function expiryFromDays(days: string | null): string | null {
  if (!days) return null
  const n = parseInt(days, 10)
  if (!n || n <= 0) return null
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

// Conceder una herramienta suelta a un usuario.
export async function grantTool(formData: FormData) {
  if (!(await isCurrentUserAdmin())) throw new Error('No autorizado')
  const admin = createAdminClient()

  const user_id = String(formData.get('user_id'))
  const tool_id = String(formData.get('tool_id'))
  const source = String(formData.get('source') || 'manual')
  const expires_at = expiryFromDays(formData.get('days') as string | null)

  await admin.from('entitlements').insert({ user_id, tool_id, source, expires_at })
  revalidatePath('/[locale]/admin', 'page')
}

// Asignar un programa completo a un usuario.
export async function grantProgram(formData: FormData) {
  if (!(await isCurrentUserAdmin())) throw new Error('No autorizado')
  const admin = createAdminClient()

  const user_id = String(formData.get('user_id'))
  const program_id = String(formData.get('program_id'))
  const source = String(formData.get('source') || 'manual')
  const expires_at = expiryFromDays(formData.get('days') as string | null)

  await admin.from('entitlements').insert({ user_id, program_id, source, expires_at })
  revalidatePath('/[locale]/admin', 'page')
}

// Revocar un permiso concreto.
export async function revokeEntitlement(formData: FormData) {
  if (!(await isCurrentUserAdmin())) throw new Error('No autorizado')
  const admin = createAdminClient()

  const entitlement_id = String(formData.get('entitlement_id'))
  await admin.from('entitlements').delete().eq('id', entitlement_id)
  revalidatePath('/[locale]/admin', 'page')
}
