import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'

export type CrmContact = {
  id: string
  user_id: string | null
  first_name: string
  email: string | null
  phone: string | null
  status: 'lead' | 'cliente' | 'inactivo'
  marketing_consent: boolean
  marketing_consent_at: string | null
  unsubscribed_at: string | null
  next_action: string | null
  next_action_at: string | null
  created_at: string
  updated_at: string
  sources: { source_type: string; source_id: string; detail: Record<string, unknown>; created_at: string }[]
  tags: { id: string; name: string; color: string }[]
}

export type CrmNote = { id: string; body: string; created_at: string }
type CrmTag = { id: string; name: string; color: string }
type CrmSource = CrmContact['sources'][number]
type RawCrmContact = Omit<CrmContact, 'sources' | 'tags'> & {
  crm_contact_sources: CrmSource[] | null
  crm_contact_tags: { crm_tags: CrmTag | CrmTag[] | null }[] | null
}

function normalizeContact(row: RawCrmContact): CrmContact {
  const tags = (row.crm_contact_tags ?? []).flatMap(link => {
    if (!link.crm_tags) return []
    return Array.isArray(link.crm_tags) ? link.crm_tags : [link.crm_tags]
  })
  return { ...row, sources: row.crm_contact_sources ?? [], tags }
}

export async function listCrmContacts(filters?: { q?: string; status?: string; source?: string; consent?: string }) {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('crm_contacts')
    .select('*, crm_contact_sources(source_type,source_id,detail,created_at), crm_contact_tags(crm_tags(id,name,color))')
    .order('created_at', { ascending: false })
  if (error) throw error

  let contacts = ((data ?? []) as unknown as RawCrmContact[]).map(normalizeContact)

  const q = filters?.q?.trim().toLocaleLowerCase('es')
  if (q) contacts = contacts.filter(c => [c.first_name, c.email, c.phone].some(v => v?.toLocaleLowerCase('es').includes(q)))
  if (filters?.status) contacts = contacts.filter(c => c.status === filters.status)
  if (filters?.source) contacts = contacts.filter(c => c.sources.some(s => s.source_type === filters.source))
  if (filters?.consent === 'si') contacts = contacts.filter(c => c.marketing_consent && !c.unsubscribed_at)
  if (filters?.consent === 'no') contacts = contacts.filter(c => !c.marketing_consent || Boolean(c.unsubscribed_at))
  return contacts
}

export async function getCrmContact(id: string): Promise<{ contact: CrmContact; notes: CrmNote[]; allTags: { id: string; name: string; color: string }[] } | null> {
  const admin = createAdminClient()
  const [{ data, error }, { data: notes }, { data: allTags }] = await Promise.all([
    admin.from('crm_contacts').select('*, crm_contact_sources(source_type,source_id,detail,created_at), crm_contact_tags(crm_tags(id,name,color))').eq('id', id).maybeSingle(),
    admin.from('crm_notes').select('id,body,created_at').eq('contact_id', id).order('created_at', { ascending: false }),
    admin.from('crm_tags').select('id,name,color').order('name'),
  ])
  if (error || !data) return null
  const row = data as unknown as RawCrmContact
  return {
    contact: normalizeContact(row),
    notes: notes ?? [],
    allTags: allTags ?? [],
  }
}
