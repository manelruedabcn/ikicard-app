'use server'

import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCurrentUserAdmin } from '@/lib/admin'
import { madridLocalToIso } from '@/lib/programa-admin'

// Dar de alta un encuentro en grupo (fecha y hora de Madrid, enlace, lengua).
export async function crearEncuentro(formData: FormData) {
  if (!(await isCurrentUserAdmin())) throw new Error('No autorizado')
  const startsAt = madridLocalToIso(String(formData.get('starts_at') || ''))
  const url = String(formData.get('url') || '').trim()
  const localeRaw = String(formData.get('locale') || '')
  const locale = ['es', 'ca', 'en'].includes(localeRaw) ? localeRaw : null
  const nota = String(formData.get('nota') || '').trim().slice(0, 200) || null
  if (!startsAt) throw new Error('Fecha y hora no válidas')
  if (!/^https:\/\/\S+$/.test(url)) throw new Error('El enlace debe empezar por https://')

  const admin = createAdminClient()
  const { error } = await admin.from('programa_encuentros').insert({ starts_at: startsAt, url, locale, nota })
  if (error) throw new Error(`No se pudo crear el encuentro: ${error.message}`)
  revalidatePath('/[locale]/admin/programa', 'page')
}

export async function borrarEncuentro(formData: FormData) {
  if (!(await isCurrentUserAdmin())) throw new Error('No autorizado')
  const id = String(formData.get('id') || '')
  const admin = createAdminClient()
  const { error } = await admin.from('programa_encuentros').delete().eq('id', id)
  if (error) throw new Error(`No se pudo borrar el encuentro: ${error.message}`)
  revalidatePath('/[locale]/admin/programa', 'page')
}
