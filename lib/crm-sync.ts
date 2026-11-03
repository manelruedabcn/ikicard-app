import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import { sendTelegram } from '@/lib/telegram'

type SyncInput = {
  userId?: string | null
  firstName?: string | null
  email?: string | null
  phone?: string | null
  sourceType: 'registro' | 'paso' | 'taller' | 'inventario' | 'programa'
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
  inventario: { name: 'Inventario honesto', color: '#9a7b5f' },
  programa: { name: 'Un mes conociendo tu ikigai', color: '#7a8b6f' },
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

  // ¿Es una puerta nueva para este contacto? (contacto nuevo, o uno conocido
  // que entra por otro sitio: p. ej. hizo PASO y ahora el Inventario). Se
  // mira ANTES del upsert para avisar una sola vez por contacto y origen.
  const { data: prevSource } = await admin
    .from('crm_contact_sources')
    .select('contact_id')
    .eq('contact_id', contactId)
    .eq('source_type', input.sourceType)
    .limit(1)
    .maybeSingle()

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

  if (!prevSource && shouldNotify(input)) {
    await sendTelegram(formatNotice({
      contactId,
      isNewContact: !existing,
      sourceType: input.sourceType,
      name: payload.first_name,
      email: payload.email,
      phone: payload.phone,
      marketing: payload.marketing_consent,
    }))
  }
}

const SOURCE_LABEL: Record<SyncInput['sourceType'], string> = {
  registro: 'Registro en la plataforma',
  paso: 'Test PASO',
  taller: 'Inscripción al taller',
  inventario: 'Inventario honesto',
  programa: 'Un mes conociendo tu ikigai',
}

// Los registros ya avisan desde su propio webhook (api/hooks/new-user), y las
// cargas de datos antiguos (sourceCreatedAt de hace más de un día) no son
// novedad: así no se duplica ni se inunda Telegram.
function shouldNotify(input: SyncInput): boolean {
  if (input.sourceType === 'registro') return false
  if (input.sourceCreatedAt) {
    const age = Date.now() - new Date(input.sourceCreatedAt).getTime()
    if (age > 24 * 60 * 60 * 1000) return false
  }
  return true
}

function formatNotice(n: {
  contactId: string
  isNewContact: boolean
  sourceType: SyncInput['sourceType']
  name: string
  email: string | null
  phone: string | null
  marketing: boolean
}): string {
  return [
    n.isNewContact
      ? `🆕 Nuevo contacto · ${SOURCE_LABEL[n.sourceType]}`
      : `🔁 Contacto que vuelve · ${SOURCE_LABEL[n.sourceType]}`,
    '',
    `👤 ${n.name || 'Sin nombre'}`,
    n.email ? `✉️ ${n.email}` : null,
    n.phone ? `📱 ${n.phone}` : null,
    `Acepta comunicaciones: ${n.marketing ? 'sí' : 'no'}`,
    '',
    `Ficha: https://app.ikigaier.com/es/admin/crm/${n.contactId}`,
  ].filter(l => l !== null).join('\n')
}
