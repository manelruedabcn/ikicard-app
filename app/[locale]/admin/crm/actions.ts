'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isCurrentUserAdmin } from '@/lib/admin'

async function context(form: FormData) {
  if (!(await isCurrentUserAdmin())) throw new Error('No autorizado')
  const contactId = String(form.get('contact_id') || '')
  const locale = String(form.get('locale') || 'es')
  if (!contactId) throw new Error('Contacto no válido')
  return { admin: createAdminClient(), contactId, locale }
}

export async function updateCrmContact(form: FormData) {
  const { admin, contactId, locale } = await context(form)
  const status = String(form.get('status') || 'lead')
  if (!['lead', 'cliente', 'inactivo'].includes(status)) throw new Error('Estado no válido')
  const nextAction = String(form.get('next_action') || '').trim().slice(0, 300) || null
  const nextActionAt = String(form.get('next_action_at') || '') || null
  await admin.from('crm_contacts').update({
    status,
    next_action: nextAction,
    next_action_at: nextActionAt ? new Date(nextActionAt).toISOString() : null,
    updated_at: new Date().toISOString(),
  }).eq('id', contactId)
  revalidatePath(`/${locale}/admin/crm`)
  revalidatePath(`/${locale}/admin/crm/${contactId}`)
}

export async function addCrmNote(form: FormData) {
  const { admin, contactId, locale } = await context(form)
  const body = String(form.get('body') || '').trim().slice(0, 4000)
  if (!body) return
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  await admin.from('crm_notes').insert({ contact_id: contactId, author_id: user?.id ?? null, body })
  revalidatePath(`/${locale}/admin/crm/${contactId}`)
}

export async function addCrmTag(form: FormData) {
  const { admin, contactId, locale } = await context(form)
  let tagId = String(form.get('tag_id') || '')
  const newName = String(form.get('new_tag') || '').trim().slice(0, 50)
  if (!tagId && newName) {
    const { data: existing } = await admin.from('crm_tags').select('id').ilike('name', newName).maybeSingle()
    if (existing) tagId = existing.id
    else {
      const { data } = await admin.from('crm_tags').insert({ name: newName }).select('id').single()
      tagId = data?.id ?? ''
    }
  }
  if (tagId) await admin.from('crm_contact_tags').upsert({ contact_id: contactId, tag_id: tagId }, { onConflict: 'contact_id,tag_id' })
  revalidatePath(`/${locale}/admin/crm`)
  revalidatePath(`/${locale}/admin/crm/${contactId}`)
}

export async function removeCrmTag(form: FormData) {
  const { admin, contactId, locale } = await context(form)
  const tagId = String(form.get('tag_id') || '')
  if (tagId) await admin.from('crm_contact_tags').delete().eq('contact_id', contactId).eq('tag_id', tagId)
  revalidatePath(`/${locale}/admin/crm`)
  revalidatePath(`/${locale}/admin/crm/${contactId}`)
}
