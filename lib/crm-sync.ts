import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

type SyncInput = {
  userId?: string | null
  firstName?: string | null
  email?: string | null
  phone?: string | null
  sourceType: 'registro' | 'paso' | 'taller'
  sourceId?: string | null
  sourceDetail?: Record<string, unknown>
  sourceCreatedAt?: string
  marketingConsent?: boolean
  unsubscribedAt?: string | null
}

const TAGS: Record<SyncInput['sourceType'], { name: string; color: string }> = {
  registro: { name: 'Usuario plataforma', color: '#b89555' },
  paso: { name: 'PASO', color: '#7a8b6f' },
  taller: { name: 'Taller 29/9', color: '#c2866b' },
}

export async function syncCrmContact(input: SyncInput) {
  const admin = createAdminClient()
  const email = input.email?.trim().toLowerCase() || null
  const phone = input.phone?.replace(/[^+\d]/g, '') || null
  if (!email && !phone && !input.userId) return

  let query = admin.from('crm_contacts').select('*').limit(1)
  if (email) query = query.eq('email', email)
  else if (phone) query = query.eq('phone', phone)
  else query = query.eq('user_id', input.userId!)
  const { data: existing } = await query.maybeSingle()

  const now = new Date().toISOString()
  const payload = {
    user_id: input.userId || existing?.user_id || null,
    first_name: input.firstName?.trim() || existing?.first_name || (email ? email.split('@')[0] : ''),
    email: email || existing?.email || null,
    phone: phone || existing?.phone || null,
    marketing_consent: Boolean(existing?.marketing_consent || input.marketingConsent),
    marketing_consent_at:
      existing?.marketing_consent_at || (input.marketingConsent ? now : null),
    unsubscribed_at: input.unsubscribedAt ?? existing?.unsubscribed_at ?? null,
    updated_at: now,
  }

  const contactResult = existing
    ? await admin.from('crm_contacts').update(payload).eq('id', existing.id).select('id').single()
    : await admin.from('crm_contacts').insert(payload).select('id').single()
  if (contactResult.error || !contactResult.data) throw contactResult.error ?? new Error('CRM contact not saved')
  const contactId = contactResult.data.id

  await admin.from('crm_contact_sources').upsert({
    contact_id: contactId,
    source_type: input.sourceType,
    source_id: input.sourceId || '',
    detail: input.sourceDetail || {},
    created_at: input.sourceCreatedAt || now,
  }, { onConflict: 'contact_id,source_type,source_id' })

  const tagData = TAGS[input.sourceType]
  const { data: foundTag } = await admin.from('crm_tags').select('id').ilike('name', tagData.name).maybeSingle()
  let tagId = foundTag?.id
  if (!tagId) {
    const { data: inserted } = await admin.from('crm_tags').insert(tagData).select('id').single()
    tagId = inserted?.id
  }
  if (tagId) {
    await admin.from('crm_contact_tags').upsert(
      { contact_id: contactId, tag_id: tagId },
      { onConflict: 'contact_id,tag_id' },
    )
  }
}
